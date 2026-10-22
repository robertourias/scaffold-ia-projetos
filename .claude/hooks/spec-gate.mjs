#!/usr/bin/env node
/**
 * PreToolUse hook — gate de Spec. Matcher esperado: Edit|Write|MultiEdit
 *
 * Layout: cada Spec é uma pasta `specs/NNN-slug/` com `spec.md` (requisitos +
 * Status), `plan.md` (plano técnico) e `tasks.md` (tarefas, campos `Arquivos:`).
 * A Spec ativa vem de `.specify/state.json` (`ativo.spec`, diretório relativo
 * à raiz do projeto).
 *
 * Regra 1 — autoaprovação. Toda edição feita por ferramenta do Claude passa
 * por este hook; edição humana no editor, não. A decisão é sobre o `Status`
 * RESULTANTE da edição, não sobre o texto novo isolado: computa o texto final
 * (Edit: aplica old_string→new_string no arquivo atual via indexOf/slice —
 * NUNCA String#replace(string,string), que interpreta $&/$`/$'/$$ em
 * new_string —, todas as ocorrências se replace_all, senão só a primeira;
 * MultiEdit: aplica edits[] em sequência; Write: content) em
 * `specs/<pasta>/spec.md`, e compara o Status de antes com o de depois.
 * Quebras de linha são normalizadas (CRLF → LF) em ambos os lados antes de
 * comparar, porque o Claude Code pode normalizar new_string mesmo com arquivo
 * em CRLF. "Antes" é null só quando o ARQUIVO não existe (Spec nova) — um
 * arquivo existente sem linha `**Status:**` legível conta como um Status
 * qualquer (não dispara a regra sozinho, não é tratado como Spec nova). Se
 * depois !== "review" e (antes === "review" ou antes === null) — toda saída
 * de review (approved, Approved, done, aprovado, remoção da linha Status) ou
 * Spec nova já fora de review — devolve permissionDecision "ask", o humano
 * confirma no prompt. Se não dá para computar o resultado (old_string não
 * encontrado), cai no fallback: qualquer texto novo que declare
 * `**Status:**` com valor diferente de review. É o caminho do
 * /specnico-approve; tentativa de autoaprovação vira um prompt que o humano
 * nega.
 *
 * Regra 2 — implementação antes da aprovação. Com a Spec ativa em
 * `.specify/state.json` e o Status de `<spec>/spec.md` em review, bloqueia a
 * edição dos arquivos declarados nos campos `Arquivos:` de
 * `<spec>/tasks.md`. Sem `tasks.md` ou sem nenhum `Arquivos:` → bloqueia
 * qualquer código. `.specify/`, `specs/` e `.claude/` nunca são bloqueados por
 * esta regra. state.json ausente/inválido, ativo null ou Spec sem spec.md →
 * falha em aberto (exit 0, sem stderr).
 *
 * Regra 3 — emenda em Spec aprovada. Vale para `spec.md` e `plan.md`; o
 * Status vem do `spec.md` da mesma pasta. Com Status antes = approved,
 * compara o conteúdo normativo antes/depois ignorando checkbox, linhas em
 * branco, blocos de Pendência Manual (🟡 abertos ou ✅ resolvidos), as seções
 * "## Notas de Review"/"## Emendas" (mesmo numeradas ou com sufixo, ex.
 * "## 9. Emendas") e as linhas Status/Aprovado por/Concluído em. Diferença →
 * "ask" pedindo registro em ## Emendas. Texto não computável → não pede.
 * approved → done passa. `tasks.md` não passa pela Regra 3 (marcar checkbox
 * e anexar Convergência são livres).
 *
 * Limitação: em modo bypassPermissions o "ask" passa sem prompt.
 * Desligar: SPECNICO_VERIFY=0 (alias: SCAFFOLD_VERIFY=0)
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const ok = () => process.exit(0);

if (process.env.SPECNICO_VERIFY === "0" || process.env.SCAFFOLD_VERIFY === "0") ok();

let payload;
try {
  payload = JSON.parse(readFileSync(0, "utf8"));
} catch {
  ok();
}

const input = payload?.tool_input ?? {};
const file = input.file_path;
if (!file) ok();

const root = payload.cwd || process.cwd();
const toRel = (p) =>
  path.relative(root, path.resolve(root, p)).split(path.sep).join("/");
const rel = toRel(file);
if (rel.startsWith("..")) ok(); // fora do projeto

// --- Regra 1: autoaprovação -------------------------------------------------
const isSpec = /^specs\/[^/]+\/spec\.md$/.test(rel);
const isPlan = /^specs\/[^/]+\/plan\.md$/.test(rel);
if (isSpec || isPlan) {
  // \r\n → \n antes de qualquer comparação: Claude Code pode normalizar
  // quebras de linha ao aplicar a edição, então old_string/new_string/content
  // chegam em LF mesmo quando o arquivo em disco está em CRLF.
  const normalizeNL = (s) => s.replace(/\r\n/g, "\n");

  // Aplica uma edição sem NUNCA passar new_string como segundo argumento de
  // String#replace: strings de substituição interpretam padrões especiais
  // ($&, $`, $', $$, $1...) — um new_string literal "$&" reinsere o texto
  // casado em vez do literal "$&". indexOf/slice trata new_string como
  // texto puro. replace_all usa split/join, que já é seguro.
  const applyEdit = (text, oldStr, newStr, replaceAll) => {
    if (replaceAll) return text.split(oldStr).join(newStr);
    const i = text.indexOf(oldStr);
    if (i === -1) return null;
    return text.slice(0, i) + newStr + text.slice(i + oldStr.length);
  };

  const fileAbs = path.resolve(root, file);
  const beforeText = existsSync(fileAbs) ? normalizeNL(readFileSync(fileAbs, "utf8")) : null;
  // beforeStatus: null só quando o ARQUIVO não existe ainda (Spec nova).
  // Arquivo existente sem linha `**Status:**` legível vira "" — não é
  // "review" nem null, então não conta como caso de Spec nova.
  const beforeStatus = beforeText == null ? null : (beforeText.match(/\*\*Status:\*\*\s*(\S+)/)?.[1] ?? "");

  // Computa o texto resultante da edição, quando dá para computar.
  let afterText = null;
  if (typeof input.content === "string") {
    afterText = normalizeNL(input.content); // Write
  } else if (Array.isArray(input.edits)) {
    // MultiEdit: aplica edits[] em sequência sobre o arquivo atual.
    if (beforeText != null) {
      let text = beforeText;
      for (const e of input.edits) {
        if (typeof e?.old_string !== "string" || typeof e?.new_string !== "string") {
          text = null;
          break;
        }
        text = applyEdit(text, normalizeNL(e.old_string), normalizeNL(e.new_string), e.replace_all);
        if (text == null) break;
      }
      afterText = text;
    }
  } else if (typeof input.old_string === "string" && typeof input.new_string === "string") {
    // Edit
    if (beforeText != null) {
      afterText = applyEdit(beforeText, normalizeNL(input.old_string), normalizeNL(input.new_string), input.replace_all);
    }
  }

  let shouldAsk = false;
  if (!isSpec) {
    // plan.md: sem Regra 1 (só a Regra 3 se aplica).
  } else if (afterText != null) {
    const afterStatus = afterText.match(/\*\*Status:\*\*\s*(\S+)/)?.[1] ?? null;
    shouldAsk = afterStatus !== "review" && (beforeStatus === "review" || beforeStatus === null);
  } else {
    // Não dá para computar o resultado (old_string não encontrado, arquivo
    // novo sem content/edits legíveis, etc.) — fallback: qualquer texto novo
    // que declare **Status:** com um valor diferente de review já pede ask.
    const texts = [
      input.new_string,
      input.content,
      ...(Array.isArray(input.edits) ? input.edits.map((e) => e?.new_string) : []),
    ]
      .filter((t) => typeof t === "string")
      .map(normalizeNL);
    shouldAsk = texts.some((t) => {
      const m = t.match(/\*\*Status:\*\*\s*(\S+)/);
      return m != null && m[1] !== "review";
    });
  }

  if (shouldAsk) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "ask",
          permissionDecisionReason:
            "Aprovação de Spec exige confirmação humana (/specnico-approve).",
        },
      }),
    );
    ok();
  }

  // --- Regra 3: emenda em Spec aprovada -------------------------------------
  // Numa Spec approved, compara o conteúdo NORMATIVO antes/depois. Não conta
  // como emenda: marcar checkbox, linhas em branco, blocos de Pendência
  // Manual (🟡 aberta ou ✅ resolvida pelo /specnico-converge — mesmo formato de bloco,
  // linha de abertura + continuações ">"), as seções "## Notas de Review" e
  // "## Emendas" (mesmo numeradas ou com sufixo, ex. "## 9. Emendas"), e as
  // linhas Status / Aprovado por / Concluído em (approved → done é
  // permitido). Sem texto computável → não pede.
  // plan.md não tem Status próprio: vale o do spec.md da mesma pasta.
  let statusRegra3 = beforeStatus;
  if (isPlan) {
    try {
      const specMd = path.resolve(root, path.dirname(rel), "spec.md");
      statusRegra3 = readFileSync(specMd, "utf8").match(/\*\*Status:\*\*\s*(\S+)/)?.[1] ?? "";
    } catch {
      statusRegra3 = null;
    }
  }
  if (statusRegra3 === "approved" && beforeText != null && afterText != null) {
    const normativo = (t) => {
      const out = [];
      let inSecaoLivre = false;
      let inPendencia = false;
      for (const line of t.split("\n")) {
        if (/^## /.test(line)) {
          inSecaoLivre = /^##\s+(?:\d+\.\s*)?(Notas de Review|Emendas)\b/.test(line);
        }
        if (inSecaoLivre) continue;
        if (/^\s*>\s*(🟡|✅) Pendência Manual/.test(line)) {
          inPendencia = true;
          continue;
        }
        if (inPendencia) {
          if (/^\s*>/.test(line)) continue;
          inPendencia = false;
        }
        if (/^\s*\*\*(Status|Aprovado por|Concluído em):\*\*/.test(line)) continue;
        if (!line.trim()) continue; // linha em branco: não conta para o conteúdo normativo
        out.push(line.replace(/^(\s*[-*]\s+)\[[xX ]\]/, "$1[ ]").trimEnd());
      }
      // Sem linhas em branco em `out`, não há mais sequências de \n{3,} a
      // colapsar — a normalização acima já as elimina por completo.
      return out.join("\n").trim();
    };
    if (normativo(beforeText) !== normativo(afterText)) {
      process.stdout.write(
        JSON.stringify({
          hookSpecificOutput: {
            hookEventName: "PreToolUse",
            permissionDecision: "ask",
            permissionDecisionReason:
              "Emenda em Spec aprovada — registre o que mudou e por quê em ## Emendas.",
          },
        }),
      );
      ok();
    }
  }
}

// --- Regra 2: implementação antes da aprovação ------------------------------
if (
  rel.startsWith(".specify/") ||
  rel.startsWith("specs/") ||
  rel.startsWith(".claude/")
) {
  ok();
}

// Spec ativa: .specify/state.json → ativo.spec (diretório relativo à raiz).
// Qualquer falha de leitura/parse → null (falha em aberto).
function readActiveSpec() {
  try {
    const state = JSON.parse(readFileSync(path.join(root, ".specify/state.json"), "utf8"));
    const spec = state?.ativo?.spec;
    if (typeof spec !== "string") return null;
    const ref = spec.trim().replace(/\\/g, "/").replace(/\/+$/, "");
    // Só pastas sob specs/: caminho absoluto, outra pasta ou ".." → falha em aberto.
    if (!ref.startsWith("specs/") || ref.split("/").includes("..")) return null;
    return ref;
  } catch {
    return null;
  }
}

const specRef = readActiveSpec();
if (!specRef) ok();

const specDir = path.resolve(root, specRef);
let specStatus;
try {
  specStatus = readFileSync(path.join(specDir, "spec.md"), "utf8").match(/\*\*Status:\*\*\s*(\S+)/)?.[1];
} catch {
  ok(); // pasta sem spec.md
}
if (specStatus !== "review") ok();

// Sem tasks.md → nada declarado → todo código bloqueado.
let tasks = "";
try {
  tasks = readFileSync(path.join(specDir, "tasks.md"), "utf8");
} catch {
  tasks = "";
}

const declared = new Set();
for (const [, line] of tasks.matchAll(/^\s*(?:[-*]\s*)?\*{0,2}Arquivos:\*{0,2}[ \t]*(.+)$/gm)) {
  const ticked = [...line.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
  const items = ticked.length ? ticked : line.replace(/←.*$/, "").split(",");
  for (const raw of items) {
    const p = raw.trim().replace(/\s*\(.*\)$/, "");
    if (p && !p.startsWith("<") && p !== "—" && p !== "-") declared.add(toRel(p));
  }
}

if (declared.size > 0 && !declared.has(rel)) ok(); // arquivo fora da Spec

process.stderr.write(
  `[guardrail] Spec ativa "${specRef}" está em Status: review — ainda não ` +
    `foi aprovada por um humano.\n\n` +
    (declared.size > 0
      ? `"${rel}" está declarado no campo Arquivos: dessa Spec. `
      : `Essa Spec não declara Arquivos:, então todo código fica bloqueado. `) +
    `Implementação não começa antes da aprovação: peça ao humano para ` +
    `revisar e rodar /specnico-approve ${specRef}.\n`,
);
process.exit(2);
