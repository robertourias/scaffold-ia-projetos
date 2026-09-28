#!/usr/bin/env node
/**
 * PreToolUse hook — gate de Spec. Matcher esperado: Edit|Write|MultiEdit
 *
 * Regra 1 — autoaprovação. Toda edição feita por ferramenta do Claude passa
 * por este hook; edição humana no editor, não. A decisão é sobre o `Status`
 * RESULTANTE da edição, não sobre o texto novo isolado: computa o texto final
 * (Edit: aplica old_string→new_string no arquivo atual via indexOf/slice —
 * NUNCA String#replace(string,string), que interpreta $&/$`/$'/$$ em
 * new_string —, todas as ocorrências se replace_all, senão só a primeira;
 * MultiEdit: aplica edits[] em sequência; Write: content) numa Spec
 * (docs/**\/specs/*.md ou docs/**\/archive/*.md), e compara o Status de antes
 * com o de depois. Quebras de linha são normalizadas (\r\n → \n) em ambos os
 * lados antes de comparar, porque o Claude Code pode normalizar new_string
 * mesmo com arquivo em CRLF. "Antes" é null só quando o ARQUIVO não existe
 * (Spec nova) — um arquivo existente sem linha `**Status:**` legível conta
 * como um Status qualquer (não dispara a regra sozinho, não é tratado como
 * Spec nova). Se depois !== "review" e (antes === "review" ou antes === null)
 * — toda saída de review (approved, Approved, done, aprovado, remoção da
 * linha Status) ou Spec nova já fora de review — devolve permissionDecision
 * "ask", o humano confirma no prompt. Se não dá para computar o resultado
 * (old_string não encontrado), cai no fallback: qualquer texto novo que
 * declare `**Status:**` com valor diferente de review. É o caminho do
 * /approve; tentativa de autoaprovação vira um prompt que o humano nega.
 *
 * Regra 2 — implementação antes da aprovação. Com a Spec ativa
 * (`**Spec ativo:**` em docs/context/current-state.md) em Status review,
 * bloqueia a edição dos arquivos declarados nos campos `Arquivos:` das
 * tarefas. Spec sem nenhum `Arquivos:` → bloqueia qualquer código.
 * docs/ e .claude/ nunca são bloqueados por esta regra. Sem current-state,
 * sem Spec ativa ou referência quebrada → falha em aberto.
 *
 * Regra 3 — emenda em Spec aprovada. Com Status antes = approved, compara o
 * conteúdo normativo antes/depois ignorando checkbox, linhas em branco,
 * blocos de Pendência Manual (🟡 abertos ou ✅ resolvidos pelo /recheck), as
 * seções "## Notas de Review"/"## Emendas" (mesmo numeradas ou com sufixo,
 * ex. "## 9. Emendas") e as linhas Status/Aprovado por/Concluído em.
 * Diferença → "ask" pedindo registro em ## Emendas. Texto não computável →
 * não pede. approved → done passa.
 *
 * Limitação: em modo bypassPermissions o "ask" passa sem prompt.
 * Desligar: SCAFFOLD_VERIFY=0
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const ok = () => process.exit(0);

if (process.env.SCAFFOLD_VERIFY === "0") ok();

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
const isSpec = /(^|\/)docs\/(.+\/)?(specs|archive)\/[^/]+\.md$/.test(rel);
if (isSpec) {
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

  let shouldAsk;
  if (afterText != null) {
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
            "Aprovação de Spec exige confirmação humana (/approve).",
        },
      }),
    );
    ok();
  }

  // --- Regra 3: emenda em Spec aprovada -------------------------------------
  // Numa Spec approved, compara o conteúdo NORMATIVO antes/depois. Não conta
  // como emenda: marcar checkbox, linhas em branco, blocos de Pendência
  // Manual (🟡 aberta ou ✅ resolvida pelo /recheck — mesmo formato de bloco,
  // linha de abertura + continuações ">"), as seções "## Notas de Review" e
  // "## Emendas" (mesmo numeradas ou com sufixo, ex. "## 9. Emendas"), e as
  // linhas Status / Aprovado por / Concluído em (approved → done é
  // permitido). Sem texto computável → não pede.
  if (beforeStatus === "approved" && afterText != null) {
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
if (rel.startsWith("docs/") || rel.includes("/docs/") || rel.startsWith(".claude/")) {
  ok();
}

// current-state da raiz; por escopo só como fallback legado.
function findCurrentState(fromRel) {
  const parts = fromRel.split("/");
  const i = parts.findIndex((p) => p === "apps" || p === "packages");
  if (i !== -1 && parts.length > i + 1) {
    const scoped = path.join(root, "docs", parts[i], parts[i + 1], "context/current-state.md");
    if (existsSync(scoped)) return scoped;
  }
  const global = path.join(root, "docs/context/current-state.md");
  return existsSync(global) ? global : null;
}

const statePath = findCurrentState(rel);
if (!statePath) ok();

const specRef = readFileSync(statePath, "utf8")
  .match(/\*\*Spec ativo:\*\*\s*(.+)/)?.[1]
  ?.trim()
  .replace(/^`|`$/g, "");
if (!specRef || specRef === "—" || specRef === "-") ok();

const specPath = path.resolve(root, specRef);
if (!existsSync(specPath)) ok();

const spec = readFileSync(specPath, "utf8");
if (spec.match(/\*\*Status:\*\*\s*(\S+)/)?.[1] !== "review") ok();

const declared = new Set();
for (const [, line] of spec.matchAll(/^\s*(?:[-*]\s*)?\*{0,2}Arquivos:\*{0,2}[ \t]*(.+)$/gm)) {
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
    `revisar e rodar /approve ${specRef}.\n`,
);
process.exit(2);
