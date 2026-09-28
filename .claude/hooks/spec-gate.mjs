#!/usr/bin/env node
/**
 * PreToolUse hook — gate de Spec. Matcher esperado: Edit|Write|MultiEdit
 *
 * Regra 1 — autoaprovação. Toda edição feita por ferramenta do Claude passa
 * por este hook; edição humana no editor, não. Então: edição via ferramenta
 * que coloca `**Status:** approved` numa Spec (docs/**\/specs/*.md ou
 * docs/**\/archive/*.md) devolve permissionDecision "ask" — o humano confirma
 * no prompt. É o caminho do /approve; tentativa de autoaprovação vira um
 * prompt que o humano nega.
 *
 * Regra 2 — implementação antes da aprovação. Com a Spec ativa
 * (`**Spec ativo:**` em docs/context/current-state.md) em Status review,
 * bloqueia a edição dos arquivos declarados nos campos `Arquivos:` das
 * tarefas. Spec sem nenhum `Arquivos:` → bloqueia qualquer código.
 * docs/ e .claude/ nunca são bloqueados por esta regra. Sem current-state,
 * sem Spec ativa ou referência quebrada → falha em aberto.
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
  const texts = [
    input.new_string,
    input.content,
    ...(Array.isArray(input.edits) ? input.edits.map((e) => e?.new_string) : []),
  ].filter((t) => typeof t === "string");
  if (texts.some((t) => /\*\*Status:\*\*\s*approved\b/.test(t))) {
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
for (const [, line] of spec.matchAll(/Arquivos:\*{0,2}[ \t]*(.+)/g)) {
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
