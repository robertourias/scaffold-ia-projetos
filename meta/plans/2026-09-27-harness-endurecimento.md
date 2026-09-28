# Harness: endurecimento (sub-projeto A) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fechar furos de gate/segurança do harness, separar meta do template, remover dependência do Superpowers, corrigir o CLI `npx` (upgrade seguro) e refletir o novo fluxo (`/approve`) no README.

**Architecture:** Harness = Markdown (comandos, skills, agentes) + hooks Node ESM (`.claude/hooks/*.mjs`) + CLI Node CommonJS (`bin/cli.js`). Testes do próprio harness vivem em `meta/tests/` (fora do template publicado) usando `node --test`, sem dependências.

**Tech Stack:** Node ≥ 18 (sem deps), `node:test`, Markdown com frontmatter YAML, Mermaid CLI (via `npx`) só para regerar o diagrama.

**Spec:** `meta/specs/2026-09-27-harness-endurecimento-design.md`

## Global Constraints

- Textos do harness em português, no estilo dos arquivos existentes.
- Zero dependências novas de runtime; testes com `node:test` + `node:assert/strict`.
- Hooks: ESM `.mjs`; CLI: CommonJS (`"use strict"`, `require`) — manter o estilo de cada arquivo.
- Saída JSON exata do ask: `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"Aprovação de Spec exige confirmação humana (/approve)."}}`, exit 0.
- Marcador de template vazio: `**Status do arquivo:** vazio`.
- Linha de aprovação: `**Aprovado por:** <git config user.name> em <YYYY-MM-DD>`, logo abaixo de `**Status:** approved`.
- Listas publicadas pelo CLI = `files` do `package.json`: harness `.claude/{agents,commands,hooks,skills,templates,workflows}`, `.claude/CLAUDE.md`, `.claude/README.md`, `.claude/settings.example.json`; docs `docs/{architecture,context,features,specs,archive}`.
- `meta/` e `CLAUDE.md` da raiz nunca publicados nem copiados.
- Stage só caminhos explícitos (`git add <paths>`, `git mv`, `git rm`) — nunca `git add -A`/`.`; `untitled.md` na raiz nunca entra em commit.
- Commits terminam com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

- `file_path` absoluto com barras invertidas (Windows) e caminhos em `Arquivos:` com anotação (`← ...`, `(novo)`) — o gate deve casar o arquivo certo. Testes na Task 3.
- MultiEdit (`edits[].new_string`) aprovando Spec — deve cair no `ask`. Teste na Task 3.
- `--upgrade` num projeto instalado pela 1.0.0 (sem `.claude/.scaffold-version`) — não pode quebrar; mostra versão anterior como desconhecida. Teste na Task 7.
- `--force` em ambiente não-interativo com contexto preenchido — recusa sem `--yes`, nada sobrescrito. Teste na Task 7.
- `lint-docs` com falso positivo em caminhos de exemplo (`docs/apps/...`, datas, placeholders) — deve ignorá-los. Validado rodando o lint no repo real (Task 2 e Task 9).

## Mapa de arquivos

| Arquivo | Ação | Task |
|---|---|---|
| `docs/superpowers/**`, `docs/changelog/**`, `docs/assets/**` → `meta/{specs,plans,changelog,assets}` | mover | 1 |
| `CLAUDE.md` (raiz) | criar | 1 |
| `meta/tests/lint-docs.mjs` | criar | 2 |
| `meta/tests/hooks.test.mjs`, `.claude/hooks/spec-gate.mjs`, `.claude/hooks/README.md` | criar / reescrever / editar | 3 |
| `.claude/skills/approve/SKILL.md` + guardrails, template, planner, spec, agente planner | criar / editar | 4 |
| `.claude/settings.example.json`, `.claude/commands/init-project.md` | editar | 5 |
| `.claude/CLAUDE.md`, `.claude/README.md`, `.claude/agents/README.md`, `.claude/workflows/playbook-tokens-qualidade.md`, `README.md` | editar | 6 |
| `bin/cli.js`, `meta/tests/cli.test.mjs` | reescrever / criar | 7 |
| `README.md`, `.claude/README.md`, `.claude/CLAUDE.md`, `meta/assets/fluxo-workflow.{mmd,png}` | editar / criar | 8 |

---

### Task 1: Separar meta do template

**Files:**
- Move: `docs/superpowers/specs/*` → `meta/specs/`, `docs/superpowers/plans/*` → `meta/plans/`, `docs/changelog/*` → `meta/changelog/`, `docs/assets/*` → `meta/assets/`
- Create: `CLAUDE.md` (raiz)
- Modify: `README.md` (caminho da imagem), `.claude/workflows/playbook-tokens-qualidade.md:89` (menção a `docs/superpowers/` — só se ainda existir; a Task 6 reescreve o trecho)

**Interfaces:**
- Produces: diretórios `meta/specs`, `meta/plans`, `meta/changelog`, `meta/assets` (com `fluxo-workflow.png`); `CLAUDE.md` raiz. Tasks 2, 7, 8 dependem desses caminhos.

- [ ] **Step 1: Verificar estado atual**

Run: `ls docs/superpowers docs/changelog docs/assets meta`
Expected: as três de `docs/` existem; `meta/` contém `specs/` e `plans/` (spec e este plano).

- [ ] **Step 2: Mover com git**

```bash
git mv docs/superpowers/specs/* meta/specs/
git mv docs/superpowers/plans/* meta/plans/
mkdir -p meta/changelog meta/assets
git mv docs/changelog/* meta/changelog/
git mv docs/assets/* meta/assets/
```
Remova diretórios vazios que sobrarem (`docs/superpowers`, `docs/changelog`, `docs/assets`) com `rmdir`.

- [ ] **Step 3: Criar `CLAUDE.md` na raiz**

```markdown
# Desenvolvimento do scaffold

Este repositório é o **template** do scaffold — tudo em `.claude/` e `docs/`
é copiado para os projetos via `npx @robertourias/scaffold-ia` — e também o
lugar onde o scaffold é desenvolvido. As instruções do harness para os
projetos estão em `.claude/CLAUDE.md`.

- Specs e planos de evolução do harness: `meta/specs/` e `meta/plans/` — nunca
  em `docs/` (seriam copiados para os projetos).
- Changelog do scaffold: `meta/changelog/`. Imagens e fonte do diagrama do
  README: `meta/assets/`.
- `meta/` e este arquivo não são publicados (`files` do `package.json`) nem
  copiados pelo CLI.
- `docs/` é template: mantenha os arquivos de contexto vazios (marcador
  `**Status do arquivo:** vazio`).
- Antes de commitar: `node --test meta/tests/` e `node meta/tests/lint-docs.mjs`.
```

- [ ] **Step 4: Atualizar a imagem do README**

Em `README.md`, trocar `docs/assets/fluxo-workflow.png` por `meta/assets/fluxo-workflow.png`.

- [ ] **Step 5: Verificar**

Run: `ls docs/superpowers docs/changelog docs/assets 2>&1; ls meta/specs meta/plans meta/changelog meta/assets; grep -rn "docs/assets\|docs/superpowers" README.md .claude docs`
Expected: os três de `docs/` inexistentes; `meta/*` listam os arquivos; grep sem ocorrência em `README.md` (a de `playbook` pode continuar — Task 6).

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md README.md meta
git commit -m "chore(meta): separate scaffold meta from template

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
(`git mv` já deixou as remoções staged.)

---

### Task 2: `lint-docs.mjs`

**Files:**
- Create: `meta/tests/lint-docs.mjs`

**Interfaces:**
- Produces: `node meta/tests/lint-docs.mjs` → exit 0 e `lint-docs: ok`, ou exit 1 listando `arquivo:linha: problema`. Tasks 6 e 9 usam como verificação.

- [ ] **Step 1: Criar o script**

```js
#!/usr/bin/env node
// Lint dos docs do harness: frontmatter de comandos/skills/agentes e
// referências a arquivos (links relativos e caminhos citados em crases).
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SKIP_DIRS = new Set(["node_modules", ".git", "meta", ".superpowers"]);
// Existem só no projeto do usuário (gerados por comandos) ou são exemplos.
const IGNORE_PREFIXES = [
  "docs/apps/",
  "docs/packages/",
  "docs/changelog/",
  ".claude/settings.json",
  ".claude/settings.local.json",
  ".claude/.scaffold-version",
];
const PLACEHOLDER = /[$<*[]|YYYY|\.\.\.|\d{4}-\d{2}-\d{2}/;

const failures = [];
const relOf = (p) => path.relative(root, p).split(path.sep).join("/");
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    if (SKIP_DIRS.has(name)) return [];
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) return walk(p);
    return p.endsWith(".md") ? [p] : [];
  });

// 1. Frontmatter
const mdIn = (dir, filter = () => true) =>
  readdirSync(path.join(root, dir))
    .filter((f) => f.endsWith(".md") && filter(f))
    .map((f) => `${dir}/${f}`);
const fmTargets = [
  ...mdIn(".claude/commands"),
  ...mdIn(".claude/agents", (f) => f !== "README.md"),
  ...readdirSync(path.join(root, ".claude/skills"))
    .map((d) => `.claude/skills/${d}/SKILL.md`)
    .filter((f) => existsSync(path.join(root, f))),
];
for (const f of fmTargets) {
  const text = readFileSync(path.join(root, f), "utf8").replace(/\r\n/g, "\n");
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) {
    failures.push(`${f}: frontmatter ausente ou não fechado`);
    continue;
  }
  const desc = m[1].match(/^description:\s*(.*)$/m);
  if (!desc || !desc[1].trim()) {
    failures.push(`${f}: description ausente`);
    continue;
  }
  const v = desc[1].trim();
  if (!/^["']/.test(v) && /:\s/.test(v)) {
    failures.push(`${f}: description com ": " precisa estar entre aspas`);
  }
}

// 2. Referências
for (const file of walk(root)) {
  const rel = relOf(file);
  let inFence = false;
  readFileSync(file, "utf8")
    .split(/\r?\n/)
    .forEach((line, i) => {
      if (/^\s*```/.test(line)) {
        inFence = !inFence;
        return;
      }
      if (inFence) return;
      for (const [, target] of line.matchAll(/\]\(([^)\s]+)\)/g)) {
        if (/^(https?:|mailto:|#)/.test(target)) continue;
        const clean = decodeURI(target.split("#")[0]);
        if (!clean || PLACEHOLDER.test(clean)) continue;
        if (!existsSync(path.resolve(path.dirname(file), clean))) {
          failures.push(`${rel}:${i + 1}: link quebrado → ${target}`);
        }
      }
      for (const [, p] of line.matchAll(/`((?:\.claude|docs)\/[^`\s]+)`/g)) {
        const clean = p.split("#")[0].replace(/[):,.]+$/, "");
        if (PLACEHOLDER.test(clean)) continue;
        if (IGNORE_PREFIXES.some((x) => clean.startsWith(x))) continue;
        if (!existsSync(path.join(root, clean))) {
          failures.push(`${rel}:${i + 1}: caminho inexistente → ${p}`);
        }
      }
    });
}

if (failures.length) {
  console.error(failures.join("\n"));
  console.error(`\n${failures.length} problema(s).`);
  process.exit(1);
}
console.log("lint-docs: ok");
```

- [ ] **Step 2: Rodar no repo real**

Run: `node meta/tests/lint-docs.mjs`
Expected: exit 1. Entre as falhas, as referências a `comparativo-scaffold-vs-superpowers.md` (em `.claude/CLAUDE.md`, `.claude/README.md`, `playbook-tokens-qualidade.md`, `README.md`) — **não corrija estas** (Task 6).

- [ ] **Step 3: Triar as demais falhas**

Para cada falha que não seja do comparativo/Superpowers:
- caminho de exemplo ou gerado no projeto do usuário (não é para existir no template) → acrescente o prefixo a `IGNORE_PREFIXES` com comentário curto;
- referência realmente quebrada (arquivo renomeado/movido) → corrija a referência no `.md` de origem.
Registre no relatório cada falha e a decisão tomada.

- [ ] **Step 4: Verificar**

Run: `node meta/tests/lint-docs.mjs`
Expected: exit 1 e **somente** falhas relacionadas ao comparativo.

- [ ] **Step 5: Commit**

```bash
git add meta/tests/lint-docs.mjs <arquivos .md corrigidos no Step 3>
git commit -m "test(meta): add docs lint for frontmatter and file references

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: `spec-gate.mjs` — autoaprovação + gate por `Arquivos:`

**Files:**
- Create: `meta/tests/hooks.test.mjs`
- Rewrite: `.claude/hooks/spec-gate.mjs`
- Modify: `.claude/hooks/README.md` (descrição do spec-gate + limitação `bypassPermissions`)

**Interfaces:**
- Produces: hook que (1) imprime o JSON de `ask` e sai 0 quando uma edição introduz `**Status:** approved` numa Spec; (2) sai 2 ao editar arquivo declarado em `Arquivos:` de Spec ativa em `review` (ou qualquer código se nenhum declarado). A Task 4 (`/approve`) depende da regra 1.

- [ ] **Step 1: Escrever os testes**

```js
// meta/tests/hooks.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const HOOK = path.join(root, ".claude/hooks/spec-gate.mjs");

function project({ status = "review", arquivos = ["`src/a.ts`", "`src/b.ts`  ← todos os arquivos"], state = true } = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), "spec-gate-"));
  mkdirSync(path.join(dir, "docs/context"), { recursive: true });
  mkdirSync(path.join(dir, "docs/specs"), { recursive: true });
  const tarefas = arquivos
    .map((a, i) => `### Tarefa ${i + 1}: T${i + 1}\n- **Arquivos:** ${a}\n`)
    .join("\n");
  writeFileSync(
    path.join(dir, "docs/specs/s.md"),
    `# Spec\n\n**Status:** ${status}\n\n## 6. Plano\n\n${tarefas}`,
  );
  if (state) {
    writeFileSync(
      path.join(dir, "docs/context/current-state.md"),
      "# Status\n\n**Spec ativo:** docs/specs/s.md\n",
    );
  }
  return dir;
}

function run(cwd, tool_input) {
  const r = spawnSync(process.execPath, [HOOK], {
    input: JSON.stringify({ cwd, tool_name: "Edit", tool_input }),
    encoding: "utf8",
    env: { ...process.env, SCAFFOLD_VERIFY: "1" },
  });
  return { code: r.status, out: r.stdout, err: r.stderr };
}

test("review + arquivo declarado → bloqueia", () => {
  const cwd = project();
  const r = run(cwd, { file_path: "src/a.ts", new_string: "x" });
  assert.equal(r.code, 2);
  assert.match(r.err, /\/approve/);
  assert.doesNotMatch(r.err, /prossiga normalmente/);
});

test("review + arquivo declarado com anotação ← → bloqueia", () => {
  const cwd = project();
  assert.equal(run(cwd, { file_path: "src/b.ts", new_string: "x" }).code, 2);
});

test("review + file_path absoluto → bloqueia", () => {
  const cwd = project();
  assert.equal(run(cwd, { file_path: path.join(cwd, "src", "a.ts"), new_string: "x" }).code, 2);
});

test("review + arquivo não declarado → libera", () => {
  const cwd = project();
  assert.equal(run(cwd, { file_path: "src/outro.ts", new_string: "x" }).code, 0);
});

test("review + Spec sem Arquivos → bloqueia qualquer código", () => {
  const cwd = project({ arquivos: [] });
  assert.equal(run(cwd, { file_path: "src/qualquer.ts", new_string: "x" }).code, 2);
});

test("approved → libera", () => {
  const cwd = project({ status: "approved" });
  assert.equal(run(cwd, { file_path: "src/a.ts", new_string: "x" }).code, 0);
});

test("docs/ e .claude/ → sempre libera", () => {
  const cwd = project();
  assert.equal(run(cwd, { file_path: "docs/context/decisions.md", new_string: "x" }).code, 0);
  assert.equal(run(cwd, { file_path: ".claude/hooks/x.mjs", new_string: "x" }).code, 0);
});

test("sem current-state.md → libera", () => {
  const cwd = project({ state: false });
  assert.equal(run(cwd, { file_path: "src/a.ts", new_string: "x" }).code, 0);
});

for (const [nome, input] of [
  ["Edit", { new_string: "**Status:** approved" }],
  ["Write", { content: "# S\n\n**Status:** approved\n" }],
  ["MultiEdit", { edits: [{ old_string: "a", new_string: "b" }, { old_string: "review", new_string: "**Status:** approved" }] }],
]) {
  test(`${nome} aprovando Spec → ask`, () => {
    const cwd = project();
    const r = run(cwd, { file_path: "docs/specs/s.md", ...input });
    assert.equal(r.code, 0);
    const json = JSON.parse(r.out);
    assert.equal(json.hookSpecificOutput.hookEventName, "PreToolUse");
    assert.equal(json.hookSpecificOutput.permissionDecision, "ask");
  });
}

test("edição de Spec sem aprovar → libera sem ask", () => {
  const cwd = project();
  const r = run(cwd, { file_path: "docs/specs/s.md", new_string: "- [x] critério" });
  assert.equal(r.code, 0);
  assert.equal(r.out.trim(), "");
});

test("SCAFFOLD_VERIFY=0 → libera", () => {
  const cwd = project();
  const r = spawnSync(process.execPath, [HOOK], {
    input: JSON.stringify({ cwd, tool_input: { file_path: "src/a.ts" } }),
    encoding: "utf8",
    env: { ...process.env, SCAFFOLD_VERIFY: "0" },
  });
  assert.equal(r.status, 0);
});
```

- [ ] **Step 2: Rodar — falha esperada**

Run: `node --test meta/tests/hooks.test.mjs`
Expected: FAIL — "review + arquivo não declarado → libera" (hoje bloqueia tudo), os três "aprovando Spec → ask" (saída vazia) e a checagem de "prossiga normalmente".

- [ ] **Step 3: Reescrever o hook**

```js
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
```

- [ ] **Step 4: Rodar — deve passar**

Run: `node --test meta/tests/hooks.test.mjs`
Expected: PASS em todos os testes, sem warnings.

- [ ] **Step 5: Atualizar `.claude/hooks/README.md`**

Leia a seção do `spec-gate.mjs` e reescreva-a para descrever as duas regras (autoaprovação → `ask`; bloqueio restrito a `Arquivos:` da Spec ativa em review, todo código se nenhum declarado), e acrescente: "Limitação: em modo `bypassPermissions` o `ask` da regra 1 passa sem prompt." Remova qualquer frase dizendo que o hook não distingue humano de agente.

- [ ] **Step 6: Commit**

```bash
git add meta/tests/hooks.test.mjs .claude/hooks/spec-gate.mjs .claude/hooks/README.md
git commit -m "feat(hooks): spec-gate asks on self-approval, blocks only declared files

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: `/approve` e instruções de aprovação

**Files:**
- Create: `.claude/skills/approve/SKILL.md`
- Modify: `docs/context/guardrails.md` (seção 6), `.claude/templates/spec-template.md` (comentário final), `.claude/skills/planner/SKILL.md:70`, `.claude/agents/planner.md` (~104), `.claude/commands/spec.md` (onde instrui aprovação manual)

**Interfaces:**
- Consumes: regra 1 do `spec-gate.mjs` (Task 3) — a edição do `/approve` dispara o `ask`.
- Produces: comando `/approve [caminho-da-spec]`. Task 8 documenta no README.

- [ ] **Step 1: Criar a skill**

````markdown
---
name: approve
description: "Gate humano da Spec: valida e aprova (Status review → approved). Só o humano invoca, com /approve [caminho-da-spec]"
disable-model-invocation: true
argument-hint: "[caminho-da-spec]"
allowed-tools: Read, Edit, Grep, Glob, Bash(git config:*)
---

# Approve — gate humano da Spec

Você executa a aprovação que o **humano** pediu ao invocar `/approve`. Este
comando nunca é disparado pelo modelo por conta própria
(`disable-model-invocation`), e a edição do Status ainda passa por
confirmação no hook `spec-gate.mjs` — é esperado aparecer um prompt pedindo
confirmação: é o humano confirmando.

## Passo 1 — Resolver a Spec

- `$ARGUMENTS` com caminho → essa Spec.
- Sem argumento → `**Spec ativo:**` de `docs/context/current-state.md`.
- Sem Spec ativa → siga a seção Tarefa/Spec de `.claude/workflows/context-resolution.md`; se ainda ambíguo, liste as Specs em `Status: review` e pergunte qual.

## Passo 2 — Validar

Leia a Spec e verifique:

| Checagem | Regra |
|---|---|
| Status | é `review` (se `approved` ou `done`: avise e pare) |
| Rastreabilidade | todo `FR-XXX` da seção 3 aparece na tabela da seção de Rastreabilidade |
| Arquivos | toda tarefa tem `Arquivos:` preenchido (sem `caminho/a.ts` do template) |
| Verificação | a seção Verificação não tem `<comando>` |
| Placeholders | não sobrou `<...>` do template no corpo |

Mostre o resultado como lista ✅/❌. Se houver ❌, pergunte:
"Aprovar mesmo assim? (s/N)" e **espere** a resposta. N → pare e sugira o que
corrigir. Não corrija a Spec você mesmo.

## Passo 3 — Aprovar

1. `git config user.name` (vazio → `humano`) e a data de hoje (`YYYY-MM-DD`).
2. Edite **somente** a linha do Status:
   `**Status:** review` → `**Status:** approved` seguida da linha
   `**Aprovado por:** <nome> em <data>`.
3. Se `**Spec ativo:**` em `docs/context/current-state.md` apontar para outra
   Spec (ou estiver `—`), atualize para esta.

## Passo 4 — Confirmar

```
✅ Spec aprovada: <caminho>
   Aprovado por: <nome> em <data>
Próximo: /hands-on <caminho>  (ou /back, /front para tarefas avulsas)
```

## Regras

- Nunca altere nada na Spec além do Status e da linha de aprovação.
- Se o hook pedir confirmação e o humano negar, pare e reporte — não tente outro caminho.

---

Argumento recebido (`$ARGUMENTS`): $ARGUMENTS
````

- [ ] **Step 2: Atualizar referências de aprovação**

- `docs/context/guardrails.md` seção 6: a linha "**Somente humano** altera `review` → `approved`..." passa a: "**Somente humano** aprova: via `/approve <spec>` (valida e grava `Status: approved` + `Aprovado por`) ou editando o Status no editor. Agente que tentar aprovar via ferramenta cai em confirmação obrigatória do `spec-gate.mjs`." Mantenha o restante da seção, ajustando o bullet "Mecânico" para citar as duas regras do hook.
- `.claude/templates/spec-template.md`, comentário GATE DE APROVAÇÃO: "Se tudo estiver correto, rode `/approve <caminho-desta-spec>` para liberar a implementação (ou altere o Status para approved no editor)."
- `.claude/skills/planner/SKILL.md:70`: trocar "mudar para `Status: approved` e iniciar..." por "rodar `/approve <caminho-da-spec>` e iniciar a execução com `/hands-on` (ou `/back` e `/front`)".
- `.claude/agents/planner.md` (~104) e `.claude/commands/spec.md`: onde instruírem o humano a mudar o Status manualmente, trocar por `/approve <spec>`. Manter a proibição de o agente aprovar.

- [ ] **Step 3: Verificar**

Run: `node meta/tests/lint-docs.mjs; grep -rn "altere o Status\|mudar para \`Status: approved\`" .claude docs`
Expected: lint sem falhas novas envolvendo `approve`; grep vazio.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/approve/SKILL.md docs/context/guardrails.md .claude/templates/spec-template.md .claude/skills/planner/SKILL.md .claude/agents/planner.md .claude/commands/spec.md
git commit -m "feat(harness): add human-only /approve command for Spec gate

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Permissões

**Files:**
- Modify: `.claude/settings.example.json`, `.claude/commands/init-project.md` (Bloco 6b)

- [ ] **Step 1: Verificar estado atual**

Run: `node -e "const s=require('./.claude/settings.example.json');console.log(s.permissions.allow.filter(x=>/cat|head|tail|grep|find|Edit\(/.test(x)))"`
Expected: lista contendo os 5 Bash e os 3 `Edit(...)`.

- [ ] **Step 2: Editar `settings.example.json`**

- Remover de `permissions.allow`: `"Bash(cat:*)"`, `"Bash(head:*)"`, `"Bash(tail:*)"`, `"Bash(grep:*)"`, `"Bash(find:*)"`, `"Edit(./apps/**)"`, `"Edit(./packages/**)"`, `"Edit(./docs/**)"`.
- Acrescentar em `permissions.ask` (após `"Write(./.claude/settings.json)"`):
```json
      "Edit(./.claude/settings.json)",
      "Edit(./.claude/settings.local.json)",
      "Write(./.claude/settings.local.json)",
      "Edit(./.claude/hooks/**)",
      "Write(./.claude/hooks/**)",
      "Edit(./.claude/skills/approve/**)",
      "Write(./.claude/skills/approve/**)"
```

- [ ] **Step 3: Bloco 6b do `/init-project`**

Leia o Bloco 6b de `.claude/commands/init-project.md`. Se houver instrução de manter/adicionar `cat`, `head`, `tail`, `grep` ou `find` em `permissions.allow`, remova-a e acrescente: "Não adicione `cat`/`head`/`tail`/`grep`/`find` ao `allow` — as ferramentas Read/Grep/Glob já cobrem e respeitam o `deny` de segredos." Se não houver, acrescente apenas essa frase ao 6b. Não mexa no `allowed-tools` do frontmatter.

- [ ] **Step 4: Verificar**

Run: `node -e "const s=require('./.claude/settings.example.json');const a=s.permissions.allow,k=s.permissions.ask;if(a.some(x=>/Bash\((cat|head|tail|grep|find):/.test(x)||/^Edit\(/.test(x)))throw 'allow';for(const x of ['Edit(./.claude/settings.json)','Edit(./.claude/hooks/**)','Edit(./.claude/skills/approve/**)'])if(!k.includes(x))throw x;console.log('ok')"`
Expected: `ok`.

- [ ] **Step 5: Commit**

```bash
git add .claude/settings.example.json .claude/commands/init-project.md
git commit -m "fix(settings): close secret-read bypass, guard harness config edits

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Remover Superpowers e comparativo do template

**Files:**
- Modify: `.claude/CLAUDE.md`, `.claude/README.md`, `.claude/agents/README.md`, `.claude/workflows/playbook-tokens-qualidade.md`, `README.md`

- [ ] **Step 1: Verificar estado atual**

Run: `grep -rnic "superpowers\|comparativo" .claude docs README.md | grep -v ":0$"`
Expected: ocorrências nos 5 arquivos acima.

- [ ] **Step 2: Editar cada arquivo**

Leia cada trecho antes de editar, para não deixar parágrafo, lista ou tabela órfã:
- `.claude/CLAUDE.md`: remover a linha do comparativo em "Carregue sob demanda" e a frase sobre `superpowers:subagent-driven-development`/`dispatching-parallel-agents` em "Quando usar subagentes".
- `.claude/agents/README.md`: remover o parágrafo que recomenda as skills do Superpowers.
- `.claude/README.md`: remover o comparativo da árvore e da lista de links, e qualquer outra menção.
- `README.md`: remover linhas de árvore, linhas de tabela, links e a "Regra prática" que citam Superpowers/comparativo; reescrever frases que dependiam disso para citar só o playbook.
- `playbook-tokens-qualidade.md`: remover o link do comparativo no topo e a seção "Superpowers — quando puxar (e quando não)"; reescrever "Modo Rigor" (e o exemplo de rigor) usando só recursos do scaffold — entrevista do `/spec` (uma pergunta por vez) para ambiguidade, `/hands-on --serial` para execução controlada, `/review` antes do merge; remover o bullet sobre `docs/superpowers/`; ajustar "Mapa rápido", "Anti-padrões" e "Decisão em 10 segundos" se citarem Superpowers.

- [ ] **Step 3: Verificar**

Run: `grep -rni "superpowers\|comparativo" .claude docs README.md; node meta/tests/lint-docs.mjs`
Expected: grep vazio; lint `lint-docs: ok` (exit 0).

- [ ] **Step 4: Commit**

```bash
git add .claude/CLAUDE.md .claude/README.md .claude/agents/README.md .claude/workflows/playbook-tokens-qualidade.md README.md
git commit -m "docs(harness): make template self-sufficient, drop Superpowers refs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: CLI — `--upgrade`, `--force` seguro, versão instalada

**Files:**
- Create: `meta/tests/cli.test.mjs`
- Rewrite: `bin/cli.js`

**Interfaces:**
- Produces: `npx @robertourias/scaffold-ia [--upgrade | --force [--yes]] [--help]`; grava `.claude/.scaffold-version`. Task 8 documenta.

- [ ] **Step 1: Escrever os testes**

```js
// meta/tests/cli.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CLI = path.join(root, "bin/cli.js");
const VERSION = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")).version;
const SRC_SPEC = readFileSync(path.join(root, ".claude/commands/spec.md"), "utf8");

const run = (cwd, ...args) =>
  spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: "utf8", input: "" });
const tmp = () => mkdtempSync(path.join(tmpdir(), "scaffold-cli-"));
const read = (dir, p) => readFileSync(path.join(dir, p), "utf8");
const fill = (dir) => writeFileSync(path.join(dir, "docs/context/product.md"), "# Produto\nPREENCHIDO\n");

test("instalação limpa copia harness e docs e grava versão", () => {
  const dir = tmp();
  const r = run(dir);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(existsSync(path.join(dir, ".claude/commands/spec.md")));
  assert.ok(existsSync(path.join(dir, ".claude/skills/approve/SKILL.md")));
  assert.ok(existsSync(path.join(dir, "docs/context/product.md")));
  assert.equal(read(dir, ".claude/.scaffold-version").trim(), VERSION);
  assert.ok(!existsSync(path.join(dir, ".claude/settings.local.json")));
  assert.ok(!existsSync(path.join(dir, "meta")));
  assert.ok(!existsSync(path.join(dir, "CLAUDE.md")));
});

test("reinstalação sem flag não sobrescreve", () => {
  const dir = tmp();
  run(dir);
  writeFileSync(path.join(dir, ".claude/commands/spec.md"), "LOCAL");
  assert.equal(run(dir).status, 0);
  assert.equal(read(dir, ".claude/commands/spec.md"), "LOCAL");
});

test("--upgrade atualiza harness e preserva contexto e settings", () => {
  const dir = tmp();
  run(dir);
  writeFileSync(path.join(dir, ".claude/commands/spec.md"), "VELHO");
  fill(dir);
  writeFileSync(path.join(dir, ".claude/settings.json"), "{}");
  writeFileSync(path.join(dir, ".claude/.scaffold-version"), "0.9.0\n");
  rmSync(path.join(dir, "docs/context/decisions.md"));
  const r = run(dir, "--upgrade");
  assert.equal(r.status, 0, r.stderr);
  assert.equal(read(dir, ".claude/commands/spec.md"), SRC_SPEC);
  assert.equal(read(dir, "docs/context/product.md"), "# Produto\nPREENCHIDO\n");
  assert.equal(read(dir, ".claude/settings.json"), "{}");
  assert.ok(existsSync(path.join(dir, "docs/context/decisions.md")));
  assert.match(r.stdout, /0\.9\.0/);
  assert.match(r.stdout, new RegExp(VERSION.replace(/\./g, "\\.")));
  assert.equal(read(dir, ".claude/.scaffold-version").trim(), VERSION);
});

test("--upgrade em instalação sem .scaffold-version (1.0.0) funciona", () => {
  const dir = tmp();
  run(dir);
  rmSync(path.join(dir, ".claude/.scaffold-version"));
  const r = run(dir, "--upgrade");
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /desconhecida/);
});

test("--force não interativo com contexto preenchido recusa sem --yes", () => {
  const dir = tmp();
  run(dir);
  fill(dir);
  const r = run(dir, "--force");
  assert.equal(r.status, 1);
  assert.equal(read(dir, "docs/context/product.md"), "# Produto\nPREENCHIDO\n");
});

test("--force --yes sobrescreve contexto", () => {
  const dir = tmp();
  run(dir);
  fill(dir);
  assert.equal(run(dir, "--force", "--yes").status, 0);
  assert.match(read(dir, "docs/context/product.md"), /Status do arquivo:\*\* vazio/);
});

test("--upgrade e --force juntos → erro", () => {
  const dir = tmp();
  mkdirSync(path.join(dir, "x"));
  assert.equal(run(dir, "--upgrade", "--force").status, 1);
});
```

- [ ] **Step 2: Rodar — falha esperada**

Run: `node --test meta/tests/cli.test.mjs`
Expected: FAIL — sem `.scaffold-version`, `--upgrade` desconhecido (hoje ignora e não sobrescreve), `--force` sobrescreve sem confirmação. (A instalação limpa pode falhar também em `approve/SKILL.md` se a Task 4 não tiver rodado — ela roda antes.)

- [ ] **Step 3: Reescrever `bin/cli.js`**

```js
#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const args = process.argv.slice(2);
const has = (...f) => f.some((x) => args.includes(x));
const upgrade = has("--upgrade", "-u");
const force = has("--force", "-f");
const yes = has("--yes", "-y");

if (has("--help", "-h")) {
  console.log(`
@robertourias/scaffold-ia

Instala o harness (.claude/) e os docs de contexto (docs/) do scaffold
no diretorio atual.

Uso:
  npx @robertourias/scaffold-ia              instala; nunca sobrescreve
  npx @robertourias/scaffold-ia --upgrade    atualiza o harness (.claude/);
                                             em docs/ so cria o que faltar
  npx @robertourias/scaffold-ia --force      sobrescreve tudo, inclusive docs/

Opcoes:
  --upgrade, -u  Atualiza o harness preservando docs/ e settings.json
  --force,   -f  Sobrescreve tudo (pede confirmacao se docs/ ja foi preenchido)
  --yes,     -y  Confirma o --force sem perguntar
  --help,    -h  Mostra esta ajuda
`);
  process.exit(0);
}

if (upgrade && force) {
  console.error("Use --upgrade ou --force, nao os dois.");
  process.exit(1);
}

const pkgRoot = path.join(__dirname, "..");
const cwd = process.cwd();
const version = require(path.join(pkgRoot, "package.json")).version;

// Espelha o "files" do package.json.
const HARNESS = [
  ".claude/agents",
  ".claude/commands",
  ".claude/hooks",
  ".claude/skills",
  ".claude/templates",
  ".claude/workflows",
  ".claude/CLAUDE.md",
  ".claude/README.md",
  ".claude/settings.example.json",
];
const DOCS = [
  "docs/architecture",
  "docs/context",
  "docs/features",
  "docs/specs",
  "docs/archive",
];
const VERSION_FILE = ".claude/.scaffold-version";
const EMPTY_MARKER = "**Status do arquivo:** vazio";

const stats = { created: 0, overwritten: 0, skipped: 0 };

function copyRecursive(src, dest, overwrite) {
  if (fs.statSync(src).isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name), overwrite);
    }
    return;
  }
  const existed = fs.existsSync(dest);
  if (existed && !overwrite) {
    stats.skipped++;
    console.log(`  skip       ${path.relative(cwd, dest)} (ja existe)`);
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  if (existed) {
    stats.overwritten++;
    console.log(`  overwrite  ${path.relative(cwd, dest)}`);
  } else {
    stats.created++;
    console.log(`  create     ${path.relative(cwd, dest)}`);
  }
}

function contextFilled() {
  const product = path.join(cwd, "docs/context/product.md");
  return (
    fs.existsSync(product) &&
    !fs.readFileSync(product, "utf8").includes(EMPTY_MARKER)
  );
}

function confirm(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(/^(s|sim|y|yes)$/i.test(answer.trim()));
    });
  });
}

function readFileOrNull(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
}

async function main() {
  if (force && !yes && contextFilled()) {
    const msg =
      "--force vai sobrescrever docs/ (contexto ja preenchido, incluindo docs/context/).";
    if (!process.stdin.isTTY) {
      console.error(`${msg}\nAmbiente nao interativo: use --yes para confirmar, ou --upgrade para atualizar so o harness.`);
      process.exit(1);
    }
    if (!(await confirm(`${msg}\nContinuar? (s/N) `))) {
      console.log("Cancelado. Para atualizar so o harness use --upgrade.");
      process.exit(1);
    }
  }

  const previous = readFileOrNull(path.join(cwd, VERSION_FILE));
  const exampleBefore = readFileOrNull(path.join(cwd, ".claude/settings.example.json"));

  console.log(`@robertourias/scaffold-ia ${version} -> ${cwd}\n`);

  for (const rel of HARNESS) {
    const src = path.join(pkgRoot, rel);
    if (fs.existsSync(src)) copyRecursive(src, path.join(cwd, rel), upgrade || force);
  }
  for (const rel of DOCS) {
    const src = path.join(pkgRoot, rel);
    if (fs.existsSync(src)) copyRecursive(src, path.join(cwd, rel), force);
  }

  fs.mkdirSync(path.join(cwd, ".claude"), { recursive: true });
  fs.writeFileSync(path.join(cwd, VERSION_FILE), `${version}\n`);

  console.log(
    `\n${stats.created} criado(s), ${stats.overwritten} sobrescrito(s), ${stats.skipped} ignorado(s).`,
  );

  if (upgrade) {
    console.log(`Harness atualizado de ${previous ? previous.trim() : "(versao desconhecida)"} para ${version}.`);
    const exampleAfter = readFileOrNull(path.join(cwd, ".claude/settings.example.json"));
    if (exampleBefore !== null && exampleBefore !== exampleAfter) {
      console.log(
        "`.claude/settings.example.json` mudou: revise e faca o merge manual no seu `.claude/settings.json` (ele nao foi alterado).",
      );
    }
  } else if (stats.skipped > 0 && !force) {
    console.log("Para atualizar o harness de uma instalacao anterior use --upgrade.");
  }
}

main();
```

Nota: a mensagem de versão desconhecida contém a palavra `desconhecida` (teste da Review Focus).

- [ ] **Step 4: Rodar — deve passar**

Run: `node --test meta/tests/`
Expected: PASS em `cli.test.mjs` e `hooks.test.mjs`.

- [ ] **Step 5: Conferir o pacote**

Run: `npm pack --dry-run 2>&1 | grep -E " meta/| CLAUDE.md$|\.scaffold-version|settings.local" ; npm pack --dry-run 2>&1 | grep -c "skills/approve"`
Expected: primeira grep sem `meta/`, sem `CLAUDE.md` da raiz (só `.claude/CLAUDE.md`), sem `settings.local`; segunda ≥ 1.

- [ ] **Step 6: Commit**

```bash
git add bin/cli.js meta/tests/cli.test.mjs
git commit -m "feat(cli): add safe --upgrade, confirm --force, record installed version

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: README com o novo fluxo + diagrama

**Files:**
- Modify: `README.md`, `.claude/README.md`, `.claude/CLAUDE.md`
- Create: `meta/assets/fluxo-workflow.mmd`; regenerate `meta/assets/fluxo-workflow.png`

**Interfaces:**
- Consumes: `/approve` (Task 4), flags do CLI (Task 7), imagem em `meta/assets/` (Task 1).

- [ ] **Step 1: Fonte do diagrama**

Criar `meta/assets/fluxo-workflow.mmd`:

```
graph TD
  Start(("Ideia / requisito"))
  Init["1  /init-project<br/>Detecta o Modo (single | monorepo | microfrontends) e<br/>conduz entrevista em 9 blocos (0-8): preenche<br/>docs/context/, gera .claude/settings.json"]
  Modo{"Modo?"}
  InitUnits["2  /init-app &lt;nome&gt;<br/>/init-package &lt;nome&gt;<br/>Um por app/package: cria a pasta (se faltar)<br/>+ docs/apps|packages/&lt;nome&gt;/"]
  Backlog["3  /backlog<br/>Gera TASK01..TASKNN a partir de<br/>product.md (root ou por escopo)"]
  Spec["4  /spec TASK01<br/>Levantamento → gera Spec + plano<br/>técnico  (Status: review)"]
  Gate{{"⛔ GATE HUMANO — /approve &lt;spec&gt;<br/>valida FR, Arquivos e Verificação,<br/>grava Status: approved + Aprovado por<br/>(spec-gate.mjs bloqueia antes e pede confirmação)"}}
  Back["5  /back tarefa1, tarefa2...<br/>(ou /hands-on em ondas<br/>via subagente backend)"]
  Front["/front tela1, tela2...<br/>(ou /hands-on em ondas<br/>via subagente frontend)"]
  Pend{{"Pendência Manual anotada na Spec<br/>(critério fora do alcance do agente:<br/>device real, credencial, decisão de negócio)"}}
  Resolve["Você resolve manualmente<br/>e descreve o que ajustou"]
  Recheck["/recheck &lt;spec&gt; &lt;o que foi ajustado&gt;<br/>Fecha o(s) critério(s) confirmado(s),<br/>relê a Spec inteira"]
  Review["6  /review [diff]<br/>Revisão em 2 estágios: Funcional → Qualidade<br/>(subagente reviewer — sem Edit/Write)"]
  Checkpoint["7  /checkpoint (sem parâmetro)<br/>Salva current-state.md, gera changelog,<br/>arquiva Specs concluídas → git commit"]
  Archive(("8  docs/archive/<br/>Spec concluída"))
  Retomar["/retomar (sem parâmetro)<br/>Reconstrói contexto após interrupção<br/>(lê current-state.md + changelog + git log)"]

  Start --> Init --> Modo
  Modo -->|single| Backlog
  Modo -->|monorepo / microfrontends| InitUnits --> Backlog
  Backlog --> Spec --> Gate
  Gate --> Back
  Gate --> Front
  Back --> Review
  Front --> Review
  Back -.-> Pend
  Front -.-> Pend
  Pend --> Resolve --> Recheck
  Recheck -. ainda falta algo .-> Back
  Review --> Checkpoint
  Recheck -->|tudo fechado| Checkpoint
  Checkpoint --> Archive
  Checkpoint -. "próxima tarefa (/spec TASK02)" .-> Spec
  Checkpoint -. após interrupção .-> Retomar

  classDef start fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a8a;
  classDef initStyle fill:#9333ea,stroke:#6b21a8,stroke-width:2px,color:#ffffff;
  classDef flowStyle fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#ffffff;
  classDef gateStyle fill:#f97316,stroke:#c2410c,stroke-width:2px,color:#ffffff;
  classDef workStyle fill:#22c55e,stroke:#15803d,stroke-width:2px,color:#ffffff;
  classDef reviewStyle fill:#ef4444,stroke:#b91c1c,stroke-width:2px,color:#ffffff;
  classDef noteStyle fill:#facc15,stroke:#a16207,stroke-width:2px,color:#1f2937;

  class Start,Archive start;
  class Init,Checkpoint initStyle;
  class Modo,Gate,Pend gateStyle;
  class InitUnits,Backlog,Spec flowStyle;
  class Back,Front,Recheck workStyle;
  class Review reviewStyle;
  class Resolve,Retomar noteStyle;
```

- [ ] **Step 2: Regerar a imagem**

Crie `<scratchpad>/mermaid.config.json` com
`{"theme":"base","themeVariables":{"fontFamily":"Segoe UI, Arial, sans-serif","fontSize":"16px","lineColor":"#64748b","edgeLabelBackground":"#ffffff"}}`
e rode (a partir da raiz):
`npx -y -p @mermaid-js/mermaid-cli mmdc -i meta/assets/fluxo-workflow.mmd -o meta/assets/fluxo-workflow.png -c <scratchpad>/mermaid.config.json -b white --size 2200 -s 2`
Expected: `Generating single mermaid chart`; PNG atualizado. Abra a imagem e confira que o nó do gate mostra `/approve`.

- [ ] **Step 3: README — fluxo e comandos**

Leia o `README.md` atual inteiro antes de editar.
- Fluxo ASCII: a linha `⛔ GATE: você edita spec/plano → Status: approved (...)` passa a `⛔ GATE: /approve <spec> — valida e grava Status: approved + Aprovado por (mecânico: .claude/hooks/spec-gate.mjs)`.
- Legenda do diagrama: acrescentar "gate `/approve`".
- "Por que o gate importa": acrescentar uma frase — a aprovação é feita pelo `/approve` (só o humano invoca) e qualquer tentativa de aprovar via ferramenta pede confirmação.
- Tabela de Slash Commands: nova linha logo após `/spec`: `| /approve | /approve docs/specs/….md | (só humano) Valida a Spec e aprova: Status review → approved |`.
- Onde o README descreve `spec-gate.mjs`: citar as duas regras (autoaprovação → confirmação; bloqueio só dos `Arquivos:` da Spec ativa).

- [ ] **Step 4: README — instalação e upgrade**

- Quick Start "projeto novo": manter `npx @robertourias/scaffold-ia`; o parágrafo abaixo descreve: padrão nunca sobrescreve; `--upgrade` atualiza só o harness; `--force` sobrescreve tudo e pede confirmação se `docs/` já foi preenchido. Manter a alternativa `cp -r` listando só `.claude/` e `docs/` (sem `meta/`).
- "Para um projeto existente" e "Migração": trocar `npx @robertourias/scaffold-ia --force` por `npx @robertourias/scaffold-ia --upgrade`, explicando que `docs/context/` e `.claude/settings.json` são preservados e que mudanças em `settings.example.json` são sinalizadas para merge manual.
- Mencionar `.claude/.scaffold-version` (versão instalada).

- [ ] **Step 5: Listas de comandos no harness**

- `.claude/CLAUDE.md` bloco "Slash commands disponíveis": após `/spec`, `/approve [spec]              ← (só humano) valida e aprova a Spec (review → approved)`.
- `.claude/README.md`: acrescentar `approve` onde lista comandos/skills (e na árvore de `skills/`).

- [ ] **Step 6: Verificar**

Run: `grep -n "/approve" README.md .claude/CLAUDE.md .claude/README.md; grep -n "scaffold-ia --force" README.md; node meta/tests/lint-docs.mjs`
Expected: `/approve` nos três; `--force` só na descrição da flag (não como comando de upgrade/migração); lint ok.

- [ ] **Step 7: Commit**

```bash
git add README.md .claude/README.md .claude/CLAUDE.md meta/assets/fluxo-workflow.mmd meta/assets/fluxo-workflow.png
git commit -m "docs(readme): document /approve flow and safe npx upgrade

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Verificação final contra a spec

**Files:** nenhum (leitura), exceto marcar a spec.

- [ ] **Step 1: Rodar a verificação da spec**

```bash
node --test meta/tests/
node meta/tests/lint-docs.mjs
grep -rni "superpowers\|comparativo" .claude docs README.md
ls docs/superpowers docs/changelog docs/assets 2>&1
ls meta/specs meta/plans meta/changelog meta/assets meta/tests
npm pack --dry-run 2>&1 | grep -E " meta/| CLAUDE.md$"
git status --short
```
Expected: testes PASS; lint ok; grep vazio; `docs/*` inexistentes; `meta/*` existem; `npm pack` sem `meta/` e sem `CLAUDE.md` da raiz; status só com `untitled.md` (se ainda existir) não rastreado.

- [ ] **Step 2: Marcar a spec**

Em `meta/specs/2026-09-27-harness-endurecimento-design.md`: `**Status:** aguardando revisão` → `**Status:** implementado`.

```bash
git add meta/specs/2026-09-27-harness-endurecimento-design.md
git commit -m "docs(spec): mark harness hardening spec implemented

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
