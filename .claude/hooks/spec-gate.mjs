#!/usr/bin/env node
/**
 * PreToolUse hook — bloqueia edição de código enquanto a Spec ativa não foi
 * aprovada por um humano.
 *
 * Matcher esperado: Edit|Write|MultiEdit
 *
 * Problema que resolve: o gate "Status: approved" era honra — nada além da
 * instrução no prompt impedia um agente de implementar contra uma Spec em
 * review, ou de editar o próprio campo Status para se autoaprovar. Este hook
 * torna o primeiro caso mecânico. O segundo (editar o campo Status) continua
 * sendo travado apenas pela instrução — um hook não distingue "humano editou
 * a Spec" de "agente editou a Spec" a partir só do path do arquivo.
 *
 * Sinal de qual Spec está ativa: `**Spec ativo:**` em
 * docs/context/current-state.md (ou docs/apps/<app>/context/current-state.md
 * / docs/packages/<pkg>/context/current-state.md em monorepo com escopo),
 * escrito por /checkpoint e lido por /retomar. Sem esse sinal (projeto que
 * ainda não rodou /checkpoint, ou tarefa avulsa sem Spec), o hook não tem o
 * que checar — falha em aberto.
 *
 * Escopo do bloqueio: só código-fonte. Edição dentro de docs/ (o planner
 * escrevendo a própria Spec, checkpoint atualizando current-state.md) e
 * dentro de .claude/ (settings, hooks) nunca é bloqueada por este hook.
 *
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

const file = payload?.tool_input?.file_path;
if (!file) ok();

const root = payload.cwd || process.cwd();
const rel = path.relative(root, path.resolve(root, file)).split(path.sep).join("/");

// Só código. Specs, contexto, changelog e config nunca são bloqueados aqui —
// é exatamente o que o planner/checkpoint/humano precisam poder escrever.
if (
  rel.startsWith("..") ||       // fora do projeto
  rel.startsWith("docs/") ||
  rel.includes("/docs/") ||
  rel.startsWith(".claude/") ||
  rel.includes("/docs/")
) {
  ok();
}

// Acha o current-state.md mais próximo: raiz, ou docs/<apps|packages>/<nome>/
// context/ se a edição for dentro de um apps/<app> ou packages/<pkg> com
// contexto próprio. Documentação de escopo mora sob docs/ na raiz, nunca
// dentro do próprio apps/<app> ou packages/<pkg>.
function findCurrentState(fromRel) {
  const parts = fromRel.split("/");
  const scopeIdx = parts.findIndex((p) => p === "apps" || p === "packages");
  if (scopeIdx !== -1 && parts.length > scopeIdx + 1) {
    const scoped = path.join(
      root,
      "docs",
      parts[scopeIdx],
      parts[scopeIdx + 1],
      "context/current-state.md",
    );
    if (existsSync(scoped)) return scoped;
  }
  const global = path.join(root, "docs/context/current-state.md");
  return existsSync(global) ? global : null;
}

const statePath = findCurrentState(rel);
if (!statePath) ok(); // sem checkpoint ainda — nada a checar

const state = readFileSync(statePath, "utf8");
const specMatch = state.match(/\*\*Spec ativo:\*\*\s*(.+)/);
const specRef = specMatch?.[1]?.trim();

if (!specRef || specRef === "—" || specRef === "-") ok(); // nenhuma Spec ativa declarada

const specPath = path.isAbsolute(specRef)
  ? specRef
  : path.join(root, specRef);

if (!existsSync(specPath)) ok(); // referência quebrada — não é este hook que resolve isso

const specBody = readFileSync(specPath, "utf8");
const statusMatch = specBody.match(/\*\*Status:\*\*\s*(\S+)/);
const status = statusMatch?.[1];

if (status !== "review") ok(); // approved, done, baseline, ou sem status legível — não bloqueia

process.stderr.write(
  `[guardrail] Spec ativa "${specRef}" está em Status: review — ainda não foi ` +
    `aprovada por um humano.\n\n` +
    `Você está tentando editar "${rel}", que parece pertencer a essa Spec. ` +
    `Implementação não começa antes de "Status: approved".\n\n` +
    `Se esta edição não tem relação com a Spec ativa, prossiga normalmente — ` +
    `este bloqueio é heurístico, baseado em qual Spec o current-state.md ` +
    `declara como ativa, não em análise do conteúdo do arquivo.\n`,
);
process.exit(2);
