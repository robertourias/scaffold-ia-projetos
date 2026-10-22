import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const rd = (p) => readFileSync(path.join(root, p), "utf8").replace(/\r\n/g, "\n");
const read = (f) => rd(`.specify/templates/${f}`);
const H = (f) => read(f).split("\n").filter((l) => l.startsWith("#"));
const H2 = (f) => H(f).filter((h) => h.startsWith("## "));
const has = (f, arr) => {
  const hs = H(f);
  for (const h of arr) assert.ok(hs.includes(h), `${f}: falta "${h}"`);
};

test("constitution-template: seções 1–5, sem próximos passos", () => {
  assert.deepEqual(H2("constitution-template.md"), [
    "## 1. Identidade",
    "## 2. Princípios (CN)",
    "## 3. Guardrails (GR) — invioláveis",
    "## 4. Comandos de verificação",
    "## 5. Governança",
  ]);
  assert.ok(!/Próximos passos/i.test(read("constitution-template.md")));
});

test("product-backlog-template: fases 0–4, Descrições e Features", () => {
  has("product-backlog-template.md", [
    "## Fase 0 — Fundação",
    "## Fase 1 — Arquitetura",
    "## Fase 2 — MVP",
    "## Fase 3 — Complementar",
    "## Fase 4 — Polimento",
    "## Descrições",
    "## Features",
  ]);
  assert.ok(
    read("product-backlog-template.md").includes(
      "| ID | Título | Tipo | Escopo | Feature | Depende | Status | Spec |",
    ),
  );
});

test("spec-template: seções do o quê/porquê, sem Arquivos:", () => {
  const t = read("spec-template.md");
  has("spec-template.md", [
    "## Problema", "## User Stories", "## Casos de borda", "## Requisitos funcionais",
    "## Entidades-chave", "## Critérios de sucesso", "## Premissas", "## Fora do escopo",
    "## Clarificações", "## Emendas",
  ]);
  assert.match(t, /^\*\*Status:\*\* review/m);
  assert.ok(!t.includes("Arquivos:"));
});

test("plan-template: Constitution Check e Complexity Tracking", () => {
  has("plan-template.md", [
    "## Resumo técnico", "## Contexto técnico", "## Constitution Check", "## Estrutura",
    "## Modelo de dados", "## Contratos", "## Decisões", "## Riscos técnicos",
    "## Complexity Tracking", "## Emendas",
  ]);
  assert.ok(!/^\*\*Status:\*\*/m.test(read("plan-template.md")));
});

test("tasks-template: ondas, rastreabilidade e linha Arquivos: do hook", () => {
  const t = read("tasks-template.md");
  has("tasks-template.md", [
    "## Ondas", "## Fundacional", "## Polimento", "## Rastreabilidade",
    "## Verificação", "## Pendências Manuais", "## Convergência",
  ]);
  assert.match(t, /^### T001 — /m);
  // regex exata do spec-gate (.claude/hooks/spec-gate.mjs), linha ancorada
  const gate = /^\s*(?:[-*]\s*)?\*{0,2}Arquivos:\*{0,2}[ \t]*(.+)$/gm;
  const nTasks = (t.match(/^### T\d+/gm) || []).length;
  assert.ok(nTasks >= 1);
  assert.ok([...t.matchAll(gate)].length >= nTasks, "cada tarefa precisa de Arquivos: em linha própria");
  assert.ok(!/^\*\*Status:\*\*/m.test(t));
});

test("bug-template: veredito verificado | parcial | falhou", () => {
  assert.ok(read("bug-template.md").includes("verificado | parcial | falhou"));
});

test("checklist-template: três blocos de qualidade", () => {
  has("checklist-template.md", [
    "## Qualidade do conteúdo", "## Completude dos requisitos", "## Prontidão da feature",
  ]);
});

test("product-template: estrutura do product.md 1.x sem o marcador", () => {
  const t = read("product-template.md");
  assert.ok(t.includes("## Business Rules") && t.includes("## Domain Glossary"));
  assert.ok(!t.includes("Status do arquivo"));
});

test("memory stubs apontam para o template", () => {
  for (const n of ["constitution", "product", "product-backlog"]) {
    const t = rd(`.specify/memory/${n}.md`);
    assert.ok(t.includes("**Status do arquivo:** vazio"), `${n}: marcador`);
    assert.ok(t.includes(`.specify/templates/${n}-template.md`), `${n}: ponteiro`);
    assert.ok(t.split("\n").length < 12, `${n}: deve ser stub`);
  }
});

test("conventions e decisions têm marcador de vazio", () => {
  for (const n of ["conventions", "decisions"]) {
    assert.ok(rd(`.specify/memory/${n}.md`).includes("**Status do arquivo:** vazio"), n);
  }
});

test("overview-template: 8 seções na ordem do design e âncora de leitura", () => {
  assert.deepEqual(H2("overview-template.md"), [
    "## 1. Arquitetura",
    "## 2. Stack",
    "## 3. Como rodar",
    "## 4. Onde ficam as regras de negócio",
    "## 5. Features",
    "## 6. Pontos de atenção",
    "## 7. A revisar",
    "## 8. Fonte",
  ]);
  const t = read("overview-template.md");
  assert.ok(t.includes("**Última leitura:**"));
  assert.ok(t.includes("Atualizados nesta leitura"));
  assert.ok(t.includes("<!-- a revisar: specnico-onboard -->"));
});
