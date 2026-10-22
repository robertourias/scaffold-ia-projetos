# /specnico-onboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar o comando `/specnico-onboard`. Ele lê um projeto existente, preenche a memória do specnico (`.specify/memory/*` e o backlog com features `done`) e grava um resumo de onboarding em `.specify/memory/overview.md`. Sai na versão 2.1.0.

**Architecture:** O comando é uma skill markdown nova, no estilo das 10 existentes, acompanhada de um template novo (`overview-template.md`). O CLI ganha uma dica pós-instalação que escolhe entre onboard e constitution. Os testes são `node:test` sobre o texto das skills e templates e sobre o comportamento do CLI. A documentação e a release vêm por último.

**Tech Stack:** Markdown em português (skill, template, docs); Node ≥ 18 sem dependências (CLI, testes); Mermaid CLI via `npx` (diagrama).

**Spec:** `meta/specs/2026-10-22-specnico-onboard-design.md`

**Decisões do plano (não explícitas na spec):**
- O ajuste no `/specnico-constitution` (§6 do design) entra na mesma task da skill nova (Task 2): são poucas linhas e o mesmo review.
- A heurística de "projeto com código" do CLI fica numa função exportada `hasExistingCode(dir)`, testável sem spawn.
- Branch `feat/specnico-onboard` (já criado, design em `95f75a2`). Um commit por task.

## Global Constraints

- Textos em português, no estilo dos arquivos vizinhos. Zero dependências novas.
- Os quatro checks verdes ao fim de cada task: `node --test "meta/tests/*.test.mjs"`, `node meta/tests/lint-docs.mjs`, `node meta/tests/check-maintenance.mjs` e `node meta/tests/check-eol.mjs`.
- Nome da skill: `specnico-onboard`, em `.claude/skills/specnico-onboard/SKILL.md`.
- Arquivo de resumo: `.specify/memory/overview.md`; template: `.specify/templates/overview-template.md`.
- Marcador de item a revisar, exato: `<!-- a revisar: specnico-onboard -->`.
- Âncora de sincronização, exata: `**Última leitura:** <commit curto> em <data>`; sem git: `**Última leitura:** sem git em <data>`.
- Cabeçalho do backlog gerado: `**Gerado por:** /specnico-onboard em <data> | **Modo:** <modo>`.
- Status da feature concluída: `live`. Status dos itens existentes: `done`; coluna Spec `—`.
- Marcador de stub: `**Status do arquivo:** vazio` (arquivo com ele → pode gravar; sem ele → não sobrescreve).
- Marcador de migração 1.x, exato: `<!-- migrado da 1.x: revise com /specnico-constitution -->`; seção legada: `## Legado (1.x)`.
- A skill escreve **só** em `.specify/memory/`, `.specify/state.json` e `.claude/settings.json` (este só quando não existir). Não faz commit.
- Valores de `.env*`, `*.pem` e `*.key` nunca são lidos. Variáveis são citadas por nome, a partir de `.env.example` ou do código.
- Nunca `git add -A`, `git add .`, `git commit -a` nem `-f`; stage só de caminhos explícitos. Nunca stage de `.superpowers/`.
- Versão do pacote: `2.1.0`.
- Commits terminam com `Co-Authored-By: Claude <modelo> <noreply@anthropic.com>`, com o modelo que de fato escreveu.

## Review Focus

- Constituição no stub com `product.md` escrito à mão: o `product.md` não é tocado e aparece em "A revisar". A skill precisa dizer isso explicitamente (Task 2, teste de texto).
- Projeto migrado da 1.x (marcador ou `## Legado (1.x)`): o onboard para e aponta `/specnico-constitution`. O marcador citado pela skill tem de ser o mesmo do CLI (Task 2, teste contra `MIGRATION_MARKER`).
- Re-execução sem mudança no código: uma linha e nenhuma escrita (Task 2, teste de texto).
- `npx specnico` num diretório com `package.json` sugere `/specnico-onboard`; num diretório vazio, `/specnico-constitution`; com `--upgrade`, nenhuma das duas dicas (Task 3).
- README e docs citando `/specnico-onboard` passam no lint de comando existente; o diagrama traz as duas entradas (Task 4).

## Mapa de arquivos

| Arquivo | Task |
|---|---|
| `.specify/templates/overview-template.md` (novo), `meta/tests/templates.test.mjs` | 1 |
| `.claude/skills/specnico-onboard/SKILL.md` (novo), `.claude/skills/specnico-constitution/SKILL.md`, `meta/tests/skills.test.mjs` | 2 |
| `bin/cli.js`, `meta/tests/cli.test.mjs`, `package.json` | 3 |
| `README.md`, `.claude/README.md`, `.claude/CLAUDE.md`, `.specify/workflows/sdd.md`, `meta/assets/fluxo-workflow.{mmd,png}`, `meta/changelog/2026-10-22.md` (novo), `meta/changelog/releases.md`, `meta/specs/2026-10-22-specnico-onboard-design.md` | 4 |

---

### Task 1: Template do `overview.md`

**Files:**
- Create: `.specify/templates/overview-template.md`
- Test: `meta/tests/templates.test.mjs`

**Interfaces:**
- Produces: as 8 seções `##` abaixo, nesta ordem. A Task 2 manda a skill preencher este template.

- [ ] **Step 1: Teste que falha** em `meta/tests/templates.test.mjs`, no estilo dos vizinhos (helper `H2`):

```js
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
```

- [ ] **Step 2:** `node --test meta/tests/templates.test.mjs` → FAIL (arquivo ausente).
- [ ] **Step 3: Escrever o template.** Título `# Onboarding — <Projeto>`; linha `**Gerado por:** /specnico-onboard`. Cada seção traz 1–3 linhas de instrução em comentário HTML, no estilo dos outros templates, com o conteúdo de §4.3.2 do design. "A revisar" tem a subseção `### Atualizados nesta leitura` (campo, valor antigo → novo). "Fonte" traz `**Última leitura:** <commit curto> em <data>` e uma tabela `| Campo | Arquivo | Evidências |`, que é o mapa campo → evidência usado na sincronização.
- [ ] **Step 4:** os quatro checks verdes. Se o lint de placeholders reclamar de algo, use a mesma notação dos outros templates.
- [ ] **Step 5: Commit** `feat(templates): overview-template do /specnico-onboard`, com `git add -- .specify/templates/overview-template.md meta/tests/templates.test.mjs`.

---

### Task 2: Skill `specnico-onboard` e ajuste no constitution

**Files:**
- Create: `.claude/skills/specnico-onboard/SKILL.md`
- Modify: `.claude/skills/specnico-constitution/SKILL.md` (modo emenda, §6)
- Test: `meta/tests/skills.test.mjs`

**Interfaces:**
- Consumes: `overview-template.md` (Task 1); `MIGRATION_MARKER` e `LEGACY_BACKLOG_SECTION` exportados por `bin/cli.js`.
- Produces: a skill citada pelos docs (Task 4) e pela dica do CLI (Task 3).

- [ ] **Step 1: Testes que falham** em `meta/tests/skills.test.mjs`:
  - acrescentar `"specnico-onboard"` a `ESPERADAS` e renomear o teste para `existem exatamente as 11 skills specnico-*`;
  - novo teste `specnico-onboard: contrato do design`. O texto da skill contém:
    - `MIGRATION_MARKER` e `LEGACY_BACKLOG_SECTION` (importados do CLI, como no teste de migração existente);
    - `<!-- a revisar: specnico-onboard -->`, `**Última leitura:**`, `overview-template.md`, `.specify/memory/overview.md`;
    - `**Gerado por:** /specnico-onboard`, `**Status do arquivo:** vazio` e `.env.example`;
  - mesmo teste, `allowed-tools`:
    - não contém `Bash(git add:*)`, `Bash(git commit:*)` nem nenhum `Bash(git push`;
    - contém `Agent`;
    - todo `Bash(...)` é um destes prefixos: `ls`, `git log`, `git diff`, `git rev-parse`, `git status`, `git ls-files`;
  - novo teste: `specnico-constitution` cita `<!-- a revisar: specnico-onboard -->`.
- [ ] **Step 2:** `node --test meta/tests/skills.test.mjs` → FAIL.
- [ ] **Step 3: Escrever `SKILL.md`.**
  - Frontmatter:
    - `name: specnico-onboard`;
    - `description` em uma linha: "Lê um projeto existente e preenche a memória do specnico (constituição, produto, arquitetura, convenções, decisões, backlog com features done) e o resumo de onboarding em .specify/memory/overview.md. Re-executar = sincroniza o que mudou no código";
    - `argument-hint: "[área ou caminho para focar]"`;
    - `allowed-tools: Read, Write, Edit, Grep, Glob, Agent`, mais os prefixos Bash do Step 1.
  - Estrutura no padrão do constitution ("Regras gerais" e seções numeradas "leia só ao chegar aqui"). Cobrir, nesta ordem, §4.1–4.5 do design:
    - detecção de modo, com os 4 casos e o aviso de Spec ativa;
    - leitura, com a ordem de fontes, os subagentes `Explore` somente leitura para repositório grande e a proibição de ler `.env*`, `*.pem` e `*.key`;
    - gravação, com a tabela de §4.3 e a regra "arquivo sem o marcador de stub não é sobrescrito → vai para A revisar". GR-001..004 e CN-001..003: copie o texto do constitution §2 (Blocos 4–5), marcado a revisar;
    - backlog, com `done`/`live`, a chave de deduplicação e nenhum item `backlog`;
    - sincronização, com base no commit, o recálculo só quando a evidência muda, a sobrescrita com antigo → novo em "Atualizados nesta leitura", a base inexistente, o caso sem git e "nada mudou → uma linha, nenhuma escrita";
    - saída no chat, exatamente as 3 linhas de §4.5;
    - sem commit.
  - Última linha: `Próximo: revise os itens "a revisar" em .specify/memory/overview.md; ajuste com /specnico-constitution (emenda); depois /specnico-spec <requisito>`.
- [ ] **Step 4: Constitution §6 (modo emenda).** Um parágrafo:
  - memória gerada pelo `/specnico-onboard` é emenda normal (tem `**Versão:**`);
  - campo com `<!-- a revisar: specnico-onboard -->` que o usuário confirma ou altera perde o marcador;
  - a seção "A revisar" do `overview.md` é atualizada.
  - Na seção 1 (detecção de modo), nada muda.
- [ ] **Step 5:** os quatro checks verdes. O `lint-docs` exige que `/specnico-onboard` exista; a partir daqui ele existe.
- [ ] **Step 6: Commit** `feat(skills): /specnico-onboard para projetos existentes`, com stage explícito dos 3 arquivos.

---

### Task 3: Dica pós-instalação no CLI e versão 2.1.0

**Files:**
- Modify: `bin/cli.js`, `package.json`
- Test: `meta/tests/cli.test.mjs`

**Interfaces:**
- Produces: `hasExistingCode(dir: string): boolean`, exportada junto das demais no `module.exports`.

- [ ] **Step 1: Testes que falham** em `meta/tests/cli.test.mjs`:

```js
test("hasExistingCode: manifesto ou src/ → true; diretório vazio ou só .claude/.specify → false", () => {
  const { hasExistingCode } = createRequire(import.meta.url)(CLI);
  const a = tmp(); assert.equal(hasExistingCode(a), false);
  mkdirSync(path.join(a, ".claude")); mkdirSync(path.join(a, ".specify"));
  assert.equal(hasExistingCode(a), false);
  for (const f of ["package.json", "pyproject.toml", "go.mod", "Cargo.toml", "pom.xml", "composer.json", "Gemfile"]) {
    const d = tmp(); writeFileSync(path.join(d, f), "{}"); assert.equal(hasExistingCode(d), true, f);
  }
  const s = tmp(); mkdirSync(path.join(s, "src")); assert.equal(hasExistingCode(s), true);
});

test("instalação sugere /specnico-onboard em projeto existente e /specnico-constitution em vazio", () => {
  const novo = tmp();
  const r1 = run(novo);
  assert.equal(r1.status, 0, r1.stderr);
  assert.match(r1.stdout, /Próximo: \/specnico-constitution/);
  assert.doesNotMatch(r1.stdout, /specnico-onboard/);
  const existente = tmp(); writeFileSync(path.join(existente, "package.json"), "{}");
  const r2 = run(existente);
  assert.match(r2.stdout, /Próximo: \/specnico-onboard/);
  const up = run(existente, "--upgrade");
  assert.doesNotMatch(up.stdout, /Próximo:/);
});
```

  Os testes de `package.json` e `.specnico-version` já leem `VERSION` do `package.json`; não fixe "2.1.0" neles.
- [ ] **Step 2:** `node --test meta/tests/cli.test.mjs` → FAIL.
- [ ] **Step 3: Implementar.**
  - `hasExistingCode(dir)` é true se existir no diretório algum dos manifestos do teste, ou `build.gradle`, `requirements.txt`, `*.csproj`, `deno.json`, ou a pasta `src/` ou `app/`.
  - No fluxo de instalação, em `main()` depois do resumo de contagem, e só quando não for `--upgrade`, `--force`, `--check` ou `--migrate`, imprima uma linha:
    - `Próximo: /specnico-onboard (projeto existente: lê o código e preenche a memória)`;
    - ou `Próximo: /specnico-constitution (projeto novo: entrevista e memória)`.
  - Mantenha o estilo das mensagens existentes; as outras mensagens do CLI evitam acento, mas o teste usa `Próximo:` com acento, igual às skills.
- [ ] **Step 4:** `package.json` `"version": "2.1.0"`.
- [ ] **Step 5:** os quatro checks verdes.
- [ ] **Step 6: Commit** `feat(cli): sugere /specnico-onboard em projeto existente`, com `git add -- bin/cli.js meta/tests/cli.test.mjs package.json`.

---

### Task 4: Documentação, diagrama e release 2.1.0

**Files:**
- Modify: `README.md`, `.claude/README.md`, `.claude/CLAUDE.md`, `.specify/workflows/sdd.md`, `meta/assets/fluxo-workflow.mmd`, `meta/assets/fluxo-workflow.png`, `meta/changelog/releases.md`, `meta/specs/2026-10-22-specnico-onboard-design.md`
- Create: `meta/changelog/2026-10-22.md`

- [ ] **Step 1: `README.md`.**
  - Na Utilização, as duas entradas: projeto novo → `/specnico-constitution`; projeto existente → `/specnico-onboard` → revisar `overview.md` → `/specnico-constitution` (emenda, opcional) → `/specnico-spec`.
  - Uma linha na tabela de comandos: quando usar e o que gera.
  - Um parágrafo curto: o que o `overview.md` contém e que re-executar sincroniza.
- [ ] **Step 2: `.claude/README.md`.** Linha da skill na tabela, com entrada, saída e o que muda (memória, backlog, `state.json`; não muda Spec). Atualizar o fluxo.
- [ ] **Step 3: `.claude/CLAUDE.md`.**
  - Linha `/specnico-onboard [área]          ← projeto existente: lê o código, preenche a memória e o backlog (done) e grava .specify/memory/overview.md`, alinhada às vizinhas.
  - Fluxo com as duas entradas.
  - `overview.md` no Tier 2, como resumo de onboarding.
- [ ] **Step 4: `.specify/workflows/sdd.md`.** A entrada alternativa na abertura do fluxo.
- [ ] **Step 5: Diagrama.** Em `fluxo-workflow.mmd`, `/specnico-onboard` entra como ramo paralelo ao constitution até `/specnico-spec`. Gere com `npx -y @mermaid-js/mermaid-cli -i meta/assets/fluxo-workflow.mmd -o meta/assets/fluxo-workflow.png` e confira a imagem. Se o mermaid-cli falhar (rede ou puppeteer), mantenha o `.mmd`, deixe o PNG antigo e registre isso no relatório.
- [ ] **Step 6: Release.**
  - `meta/changelog/2026-10-22.md`: o que é o comando, os arquivos novos e a dica do CLI.
  - Em `releases.md`, a seção `## [2.1.0] - 2026-10-22` acima da 2.0.0, no mesmo formato.
  - No design, `**Status:** implementado`.
- [ ] **Step 7: Verificação final.**
  - Os quatro checks verdes.
  - `npm pack --dry-run` lista `.claude/skills/specnico-onboard/SKILL.md` e `.specify/templates/overview-template.md`.
  - `node bin/cli.js` num diretório temporário com `package.json` imprime a dica do onboard.
- [ ] **Step 8: Commit** `docs: /specnico-onboard no README, referência e release 2.1.0`, com stage explícito dos arquivos da lista. `npm publish` fica com o mantenedor.
