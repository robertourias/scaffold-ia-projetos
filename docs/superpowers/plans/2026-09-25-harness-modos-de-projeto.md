# Harness: modos de projeto — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harness suporta `single | monorepo | microfrontends`; novos `/init-app` e `/init-package`; `/checkpoint` e `/retomar` sem parâmetro; comandos com parâmetro inferem do contexto; `.claude/prompts/` removida.

**Architecture:** Arquivos Markdown de harness (comandos, README, docs). Campo `**Modo:**` em `docs/architecture/overview.md` é fonte única. Regra de fallback de contexto vive num único workflow (`.claude/workflows/context-resolution.md`) referenciado por cada comando — evita copiar o mesmo bloco 8 vezes.

**Tech Stack:** Markdown + frontmatter de slash commands (`description`, `argument-hint`, `allowed-tools`). "Testes" = greps de verificação.

**Spec:** `docs/superpowers/specs/2026-09-25-harness-modos-de-projeto-design.md`

## Global Constraints

- Comandos escritos em português, no estilo dos existentes (frontmatter + `## Seções` + rodapé `Argumento recebido (`$ARGUMENTS`): $ARGUMENTS` quando o comando recebe argumento).
- Documentação com escopo vive em `docs/$SCOPE/` (`docs/apps/<nome>/`, `docs/packages/<nome>/`), **nunca** dentro de `apps/`/`packages/`.
- `docs/context/guardrails.md` vence qualquer outra instrução.
- Valores literais do campo: `**Modo:** single | monorepo | microfrontends`.
- Sem geração de código de app; `init-app`/`init-package` só criam pasta vazia + docs.
- Commits terminam com `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.

## Review Focus

- Projeto sem campo `Modo` (harness antigo/overview não preenchido): comandos devem inferir por `turbo.json`/`apps/` e pedir confirmação, não quebrar.
- `/init-app` chamado em modo `single`: recusa com orientação, não cria nada.
- `/init-app <nome>` com `apps/<nome>` já existente: não sobrescreve; só completa docs faltantes.
- Nome inválido (com `/`, espaços, maiúsculas, prefixo `apps/`): normalizar/rejeitar, sem path traversal.
- `/checkpoint` sem commits nem mudanças: registra a discussão, não falha nem inventa escopo.

## Mapa de arquivos

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `.claude/workflows/context-resolution.md` | criar | Regra única: modo + `current-state` + git → escopo/tarefa quando arg ausente |
| `.claude/commands/init-project.md` | modificar | Detecta modo; blocos globais; stack só p/ single |
| `.claude/commands/init-app.md` | criar | Cria app + docs + questionário |
| `.claude/commands/init-package.md` | criar | Cria package + docs + questionário |
| `.claude/commands/checkpoint.md` | modificar | Sem arg; log + current-state |
| `.claude/commands/retomar.md` | modificar | Sem arg; lê último histórico |
| `.claude/commands/{spec,back,front,review,recheck,hands-on,groom,backlog}.md` | modificar | Seção "Resolução de contexto" |
| `docs/architecture/overview.md` | modificar | Campo `Modo` |
| `.claude/prompts/` | apagar | — |
| `README.md`, `.claude/README.md`, `.claude/CLAUDE.md`, `docs/context/conventions.md` | modificar | Refs e lista de comandos |

---

### Task 1: Campo Modo + workflow de resolução de contexto

**Files:**
- Modify: `docs/architecture/overview.md` (após linha "**Status**")
- Create: `.claude/workflows/context-resolution.md`

**Interfaces:**
- Produces: campo `**Modo:** single | monorepo | microfrontends` em `docs/architecture/overview.md`; arquivo `.claude/workflows/context-resolution.md` com seções `## Modo`, `## Escopo (\$SCOPE)`, `## Tarefa/Spec`, `## Ambiguidade`. Tasks 3-6 citam esse caminho.

- [ ] **Step 1: Verificar ausência (falha esperada)**

Run: `grep -c "Modo:" docs/architecture/overview.md; ls .claude/workflows/context-resolution.md`
Expected: `0` e "No such file".

- [ ] **Step 2: Adicionar o campo Modo ao overview**

Em `docs/architecture/overview.md`, logo após a linha `**Status**: [Desenvolvimento inicial / Ativo / Maduro]`, inserir:

```markdown
**Modo**: <!-- a definir: single | monorepo | microfrontends — preenchido por /init-project; lido por todos os comandos -->
```

Atualizar também o comentário da seção "Projetos do Monorepo": trocar "Atualizada por /init-project (Bloco 2) ao detectar monorepo, e manualmente quando um app/package novo é criado." por "Atualizada por /init-app e /init-package (uma linha por app/package). Remova a seção se o Modo for `single`."

- [ ] **Step 3: Criar o workflow**

Criar `.claude/workflows/context-resolution.md`:

````markdown
# Resolução de contexto (fallback de parâmetros)

Regra única para comandos que recebem parâmetro (`/spec`, `/back`, `/front`,
`/review`, `/recheck`, `/hands-on`, `/groom`, `/backlog`). Aplique **apenas
quando o parâmetro estiver ausente ou não for reconhecido** — parâmetro válido
sempre vence.

## Modo
Leia `**Modo:**` em `docs/architecture/overview.md`.
- `single` → `$SCOPE` não existe; nunca pergunte por app/package; tudo em `docs/` raiz.
- `monorepo` | `microfrontends` → `$SCOPE` (`apps/<nome>` | `packages/<nome>`) pode existir.
- Campo ausente ou `a definir` → infira: `turbo.json` ou `apps/`+`packages/` na raiz ⇒ `monorepo`; dependência `@module-federation/*` ⇒ `microfrontends`; senão `single`. Diga o que inferiu e peça confirmação antes de seguir.

## Escopo (`$SCOPE`)
Só em `monorepo`/`microfrontends`. Ordem de tentativa (pare no primeiro que resolver para **um** app/package existente em `apps/`/`packages/`):
1. `docs/context/current-state.md` → escopo em "Em progresso" / spec ativo.
2. `git status --short` → arquivos alterados concentrados em um único `apps/<x>`/`packages/<x>`.
3. Commit mais recente (`git log -1 --name-only`) → idem.
Se nenhum resolver ou houver empate → ambiguidade.

## Tarefa/Spec
Comandos que precisam de spec/TASK:
1. Spec ativo em `current-state.md` (`Status: approved`).
2. Única spec `approved` em `docs/specs/` (ou `docs/$SCOPE/specs/`).
3. Próxima TASK `todo` do backlog do escopo resolvido.
Nenhuma → ambiguidade.

## Ambiguidade
Nunca pergunte em aberto. Proponha o melhor palpite e peça confirmação:
"Sem parâmetro. Pelo contexto (`<fonte>`), assumo `<escopo/spec>`. Confirma?"
Sem palpite possível, liste as opções encontradas (máx. 5) e peça escolha.
````

- [ ] **Step 4: Verificar**

Run: `grep -c "Modo" docs/architecture/overview.md; grep -c "^## " .claude/workflows/context-resolution.md`
Expected: `>=2` e `4`.

- [ ] **Step 5: Commit**

```bash
git add docs/architecture/overview.md .claude/workflows/context-resolution.md
git commit -m "feat(harness): add project Modo field and context-resolution workflow

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: `/init-project` só bootstrap + detecção de modo

**Files:**
- Modify: `.claude/commands/init-project.md`

**Interfaces:**
- Consumes: campo `**Modo:**` (Task 1).
- Produces: `/init-project` grava `Modo`; menciona `/init-app` e `/init-package` como próximos passos.

- [ ] **Step 1: Verificar estado atual (falha esperada)**

Run: `grep -c "microfrontends" .claude/commands/init-project.md`
Expected: `0`.

- [ ] **Step 2: Inserir "Bloco 0 — Modo do projeto" antes do Bloco 1**

Antes de `### Bloco 1 — Produto`, inserir:

````markdown
### Bloco 0 — Modo do projeto (grava `**Modo:**` em `docs/architecture/overview.md`)

**Obrigatório e primeiro.** Inspecione o repositório antes de perguntar:
- `turbo.json` ou `apps/` + `packages/` na raiz → sugira `monorepo`
- dependência `@module-federation/*` ou `module-federation.config.*` → sugira `microfrontends` (monorepo Turborepo com host + remotes)
- nenhum sinal → sugira `single`

Pergunte (uma pergunta, já com o palpite): "Este projeto é **single** (um app), **monorepo** (Turborepo, vários apps/packages) ou **microfrontends** (Module Federation)?"

Grave o valor no campo `**Modo:**` do overview. O modo define o resto da entrevista:
- `single` → Blocos 1–8 completos (stack incluída).
- `monorepo`/`microfrontends` → Blocos 2–4 cobrem só o que é **compartilhado** (CI/CD, hospedagem, banco/infra comuns, estilo de código). Stack **por app/package** é coletada depois por `/init-app` e `/init-package`. Este comando **não** cria apps nem packages.
- `microfrontends` acrescenta ao Bloco 2: qual app é o **host**, quais são os **remotes**, libs compartilhadas (singletons: react, react-dom) e como o contrato entre host e remotes é versionado.
````

- [ ] **Step 3: Adaptar Bloco 2 por modo**

No Bloco 2, logo após o parágrafo "Antes de perguntar, leia `package.json`...", inserir:

```markdown
**Modo `monorepo`/`microfrontends`:** pule as perguntas 1–2 e 4–5 (ORM, auth, fila, cache — são por app). Faça apenas 3 (banco compartilhado, se houver), 6 (hospedagem) e 7 (CI/CD). Na tabela de tecnologias do overview, deixe as linhas por-app como `<!-- definido por app: ver /init-app -->`.
```

Substituir o parágrafo "**Sincronize a estrutura do monorepo em `.claude/CLAUDE.md`.**..." inteiro e o parágrafo "**Se for monorepo**, preencha também...", por:

```markdown
**Sincronize a estrutura em `.claude/CLAUDE.md`.** Reescreva a seção "Estrutura do monorepo" conforme o `Modo`: `single` → árvore de alto nível de `src/` (ou remova a seção); `monorepo`/`microfrontends` → liste `apps/` e `packages/` reais (ou "(vazio — use /init-app e /init-package)"). Nunca deixe o exemplo genérico.

**Monorepo/microfrontends:** a tabela "Projetos do Monorepo" do overview começa vazia (apenas cabeçalho) — é preenchida por `/init-app` e `/init-package`. Modo `single`: remova a seção.
```

- [ ] **Step 4: Adaptar Blocos 3 e 4 por modo**

No início do Bloco 3 e do Bloco 4 inserir, respectivamente:

```markdown
**Modo `monorepo`/`microfrontends`:** mantenha aqui só as diretrizes globais (paginação, erros, logging, cobertura). Escolhas de stack por app ficam em `docs/apps/<nome>/context/decisions.md`, via `/init-app`.
```
```markdown
**Modo `monorepo`/`microfrontends`:** pergunte só design tokens compartilhados e defaults de teste (pergunta 7 e 8). Estilização, biblioteca de componentes, estado e forms são por app — `/init-app` — ou por package `ui` — `/init-package`.
```

- [ ] **Step 5: Atualizar Finalização e Descrição**

- `argument-hint` permanece `[descrição do produto]`.
- Em "Próximos passos" do resumo final, trocar por:

```
Próximos passos:
  monorepo/microfrontends → /init-app <nome> e /init-package <nome> para cada unidade
  depois → /backlog para gerar o product backlog (TASK01, TASK02...)
  single → /backlog
```
- Na lista "✅ Arquivos preenchidos" acrescentar `  - docs/architecture/overview.md  (Modo: <valor>)`.
- Em "Regras", acrescentar: "O Bloco 0 é obrigatório e vem antes de todos; sem `Modo` gravado os demais comandos precisam inferir."

- [ ] **Step 5: Verificar**

Run: `grep -c "Bloco 0\|microfrontends\|/init-app" .claude/commands/init-project.md`
Expected: `>=6`.

- [ ] **Step 6: Commit**

```bash
git add .claude/commands/init-project.md
git commit -m "feat(harness): init-project detects project mode, scopes stack by mode

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: `/init-app` e `/init-package`

**Files:**
- Create: `.claude/commands/init-app.md`
- Create: `.claude/commands/init-package.md`

**Interfaces:**
- Consumes: `**Modo:**` (Task 1); template mínimo de `docs/$SCOPE/README.md` em `docs/context/conventions.md#documentação-em-monorepo-appspackages`; tabela "Projetos do Monorepo" (colunas: Path, Tipo, Propósito, Stack, Docs próprios).
- Produces: comandos `/init-app <nome>` e `/init-package <nome>`.

- [ ] **Step 1: Verificar ausência (falha esperada)**

Run: `ls .claude/commands/init-app.md .claude/commands/init-package.md`
Expected: "No such file".

- [ ] **Step 2: Criar `init-app.md`**

````markdown
---
description: "Cria um app no monorepo (apps/<nome>) e conduz o questionário da configuração inicial"
argument-hint: "<nome-do-app>"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(ls:*), Bash(mkdir:*)
---

# Init App — novo app no monorepo

Você registra e configura um **app** em projeto Turborepo. Não gera código do app — cria a pasta, a documentação local e as decisões iniciais.

## Pré-condições

1. Leia `**Modo:**` em `docs/architecture/overview.md` (fallback: `.claude/workflows/context-resolution.md`, seção Modo).
   - `single` → **pare**: "Este projeto é single. `/init-app` só existe em monorepo/microfrontends. Rode `/init-project` para mudar o modo."
2. Leia `docs/context/guardrails.md` e `docs/context/constitution.md`.

## Nome

`$ARGUMENTS` = nome do app. Sem nome → pergunte (proponha nomes a partir de `product.md`).
Normalize: minúsculas, `[a-z0-9-]`; remova prefixo `apps/`. Rejeite (e peça outro) nomes com `/`, `..`, espaços ou vazio. `$SCOPE = apps/<nome>`.

## Criação (sem sobrescrever)

- `apps/<nome>/` — crie **só se não existir** (`ls` antes). Se existir, avise e continue apenas com docs faltantes.
- `docs/apps/<nome>/` com: `README.md` (template mínimo de `docs/context/conventions.md#documentação-em-monorepo-appspackages`), `context/decisions.md`, `specs/`, `archive/`. Não sobrescreva arquivo existente.
- Documentação **nunca** dentro de `apps/<nome>/`.

## Questionário (uma pergunta por vez, com palpite quando houver sinal)

Se `apps/<nome>/package.json` já existir, leia-o e proponha o que encontrar.

1. **Tipo:** web / api / mobile / host (microfrontends) / remote (microfrontends)?
2. **Propósito** em uma frase.
3. **Framework:** (web: Next.js/Vite+React · api: NestJS/Fastify · host/remote: bundler + Module Federation).
4. Conforme o tipo:
   - api → ORM, banco, auth, fila, cache (só o que diferir do global).
   - web → estilização, biblioteca de componentes, estado, forms, data fetching.
   - host/remote (modo `microfrontends`) → módulos expostos/consumidos, singletons compartilhados, porta.
5. **Porta** de desenvolvimento.
6. **Comandos de verificação do app** (test, type-check, lint) — ou "(não configurado)". Nunca invente.
7. **Packages internos que consome** (liste os de `packages/`, se houver).

Preencha apenas ao terminar todas as perguntas.

## Gravação

1. `docs/apps/<nome>/context/decisions.md` — decisões do app (stack, comandos, packages consumidos). Sem `<!-- TODO -->`; "a definir" → `<!-- a definir -->`.
2. `docs/apps/<nome>/README.md` — propósito, tipo, stack, comandos.
3. `docs/architecture/overview.md` — acrescente uma linha em "Projetos do Monorepo": `apps/<nome>` | app (<tipo>) | propósito | stack se diferir | `docs/apps/<nome>/README.md`. Se o app já constar, atualize a linha.
4. `.claude/CLAUDE.md` — atualize a seção "Estrutura do monorepo" incluindo `apps/<nome>`.

## Finalização

```
✅ App configurado: apps/<nome>
  - pasta apps/<nome>/        (criada | já existia)
  - docs/apps/<nome>/         README, context/decisions, specs/, archive/
  - overview.md               linha adicionada
⚠️ Lacunas: [comandos "(não configurado)", campos "a definir"]
Próximo passo: /backlog ou /spec (o contexto atual passa a apontar para apps/<nome>)
```

## Regras

- Uma pergunta por mensagem.
- Nunca sobrescrever conteúdo existente sem confirmar.
- Não instalar dependências nem gerar código do app.

---

Argumento recebido (`$ARGUMENTS`): $ARGUMENTS
````

- [ ] **Step 3: Criar `init-package.md`**

````markdown
---
description: "Cria um package no monorepo (packages/<nome>) e conduz o questionário da configuração inicial"
argument-hint: "<nome-do-package>"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(ls:*), Bash(mkdir:*)
---

# Init Package — novo package no monorepo

Você registra e configura um **package** compartilhado em projeto Turborepo. Não gera código — cria a pasta, a documentação local e as decisões iniciais.

## Pré-condições

1. Leia `**Modo:**` em `docs/architecture/overview.md` (fallback: `.claude/workflows/context-resolution.md`, seção Modo).
   - `single` → **pare**: "Este projeto é single. `/init-package` só existe em monorepo/microfrontends. Rode `/init-project` para mudar o modo."
2. Leia `docs/context/guardrails.md` e `docs/context/constitution.md`.

## Nome

`$ARGUMENTS` = nome do package. Sem nome → pergunte (sugira `ui`, `config`, `types`, `utils` se ainda não existirem).
Normalize: minúsculas, `[a-z0-9-]`; remova prefixo `packages/`. Rejeite nomes com `/`, `..`, espaços ou vazio. `$SCOPE = packages/<nome>`.

## Criação (sem sobrescrever)

- `packages/<nome>/` — crie **só se não existir**. Se existir, avise e complete só os docs faltantes.
- `docs/packages/<nome>/` com: `README.md` (template de `docs/context/conventions.md#documentação-em-monorepo-appspackages`), `context/decisions.md`, `specs/`, `archive/`. Não sobrescreva.
- Documentação **nunca** dentro de `packages/<nome>/`.

## Questionário (uma pergunta por vez, com palpite quando houver sinal)

1. **Tipo:** ui / config (eslint, tsconfig, tailwind) / types / utils / outro?
2. **Propósito** em uma frase.
3. **Consumidores:** quais apps/packages usam? (lista de `apps/` e `packages/` existentes)
4. **Build/publicação:** sem build (fonte TS direta), tsup, tsc, ou outro? Exports (`exports` do package.json)?
5. Conforme o tipo:
   - ui → biblioteca de componentes base, estilização, Storybook sim/não.
   - config → quais ferramentas configura e como apps estendem.
   - types/utils → regra de dependência (sem dependência de framework — constituição).
   - microfrontends → é lib compartilhada singleton (react, design system)?
6. **Comandos de verificação** (test, type-check, lint) — ou "(não configurado)".

Preencha apenas ao terminar todas as perguntas.

## Gravação

1. `docs/packages/<nome>/context/decisions.md` — decisões (tipo, build, exports, consumidores, comandos).
2. `docs/packages/<nome>/README.md` — propósito, tipo, consumidores, comandos.
3. `docs/architecture/overview.md` — linha em "Projetos do Monorepo": `packages/<nome>` | package (<tipo>) | propósito | stack se diferir | `docs/packages/<nome>/README.md`. Já existe → atualize.
4. `.claude/CLAUDE.md` — atualize "Estrutura do monorepo" incluindo `packages/<nome>`.

## Finalização

```
✅ Package configurado: packages/<nome>
  - pasta packages/<nome>/    (criada | já existia)
  - docs/packages/<nome>/     README, context/decisions, specs/, archive/
  - overview.md               linha adicionada
⚠️ Lacunas: [comandos "(não configurado)", campos "a definir"]
Próximo passo: /spec ou /init-app <nome> para os consumidores
```

## Regras

- Uma pergunta por mensagem.
- Nunca sobrescrever conteúdo existente sem confirmar.
- Não instalar dependências nem gerar código.

---

Argumento recebido (`$ARGUMENTS`): $ARGUMENTS
````

- [ ] **Step 4: Verificar**

Run: `head -5 .claude/commands/init-app.md .claude/commands/init-package.md; grep -c "single" .claude/commands/init-app.md .claude/commands/init-package.md`
Expected: frontmatter válido nos dois; `>=1` de "single" em cada.

- [ ] **Step 5: Commit**

```bash
git add .claude/commands/init-app.md .claude/commands/init-package.md
git commit -m "feat(harness): add /init-app and /init-package commands

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: `/checkpoint` e `/retomar` sem parâmetro

**Files:**
- Modify: `.claude/commands/checkpoint.md`
- Modify: `.claude/commands/retomar.md`

**Interfaces:**
- Consumes: `.claude/workflows/context-resolution.md` seção Escopo (Task 1).

- [ ] **Step 1: Verificar estado atual (falha esperada)**

Run: `grep -c "argument-hint" .claude/commands/checkpoint.md .claude/commands/retomar.md`
Expected: `1` em cada (deve virar `0`).

- [ ] **Step 2: Reescrever cabeçalho e escopo do checkpoint**

Em `checkpoint.md`:
- Remover a linha `argument-hint: ...` do frontmatter.
- Trocar `description` por: `"Grava resumo da sessão no log do projeto (changelog + current-state) e arquiva Specs concluídas. Sem parâmetro"`.
- Substituir a seção "## Resolução de escopo" inteira (até antes de "## Passo 1") por:

```markdown
## Sem parâmetro

Este comando **não recebe argumento**. Ele registra o que foi feito na sessão.

Escopo é inferido: leia `**Modo:**` em `docs/architecture/overview.md`. Em `single`, não há escopo. Em `monorepo`/`microfrontends`, descubra os apps/packages tocados pela sessão via `git status --short` e `git log --name-only -15` (regra: `.claude/workflows/context-resolution.md`, seção Escopo). A sessão pode ter tocado **vários** — registre cada um separadamente; nada a perguntar. Sem commits nem mudanças → registre o que foi discutido, sem escopo.

Estado e log ficam **sempre na raiz**: `docs/context/current-state.md` e `docs/changelog/YYYY-MM-DD.md`. Cada linha de progresso/changelog é prefixada com o escopo (`**apps/api:** ...`). Specs concluídas de um escopo são arquivadas em `docs/$SCOPE/archive/` (raiz → `docs/archive/`). Documentação com escopo vive sob `docs/$SCOPE/`, nunca dentro de `apps/`/`packages/`.
```
- Nos Passos 1–5: onde houver "`$SCOPE` informado"/"se `$SCOPE`" trocar por "escopo(s) inferido(s)"; `current-state.md` é sempre o da raiz (remover a variante `docs/$SCOPE/context/current-state.md` e a criação de `docs/$SCOPE/README.md`).
- Passo 2.5, item 3: trocar a referência `(.claude/prompts/retroactive-documentation.md)` por "e sugira ao usuário reconciliar `decisions.md` e `architecture/` com o código real em uma sessão dedicada".
- Passo 5: trocar `⏭ Próxima sessão: /retomar [$SCOPE]` por `⏭ Próxima sessão: /retomar`.

- [ ] **Step 3: Reescrever retomar**

Em `retomar.md`:
- Remover `argument-hint`.
- Substituir "## Resolução de escopo" por:

```markdown
## Sem parâmetro

Este comando **não recebe argumento**. Ele retoma o último histórico salvo, sempre a partir da raiz. Não filtre por escopo: apresente tudo que estava em andamento, agrupado por app/package quando o estado citar mais de um.
```
- Passo 1: lista de leitura passa a ser (1) `docs/context/current-state.md`, (2) `docs/changelog/` — arquivo mais recente por nome, (3) `git log --oneline -15`, (4) spec ativo referenciado em `current-state.md`. Remover o bloco "Se $SCOPE específico informado". Manter o fallback (current-state vazio → reconstruir de git log e specs `approved` em `docs/specs/`, `docs/apps/*/specs/`, `docs/packages/*/specs/`).
- Passo 2: título do bloco: `Retomando projeto`; "comando sugerido: `/back` ou `/front`" sem `$SCOPE` (o contexto atual resolve).
- Caso especial "Sem commits recentes...": manter.
- Remover o rodapé `Argumento recebido...`.

- [ ] **Step 4: Verificar**

Run: `grep -n "argument-hint\|ARGUMENTS\|prompts/" .claude/commands/checkpoint.md .claude/commands/retomar.md`
Expected: nenhuma linha.

- [ ] **Step 5: Commit**

```bash
git add .claude/commands/checkpoint.md .claude/commands/retomar.md
git commit -m "refactor(harness): checkpoint and retomar take no parameters

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Resolução de contexto nos comandos com parâmetro

**Files:**
- Modify: `.claude/commands/{spec,back,front,review,recheck,hands-on,groom,backlog}.md`

**Interfaces:**
- Consumes: `.claude/workflows/context-resolution.md` (Task 1).

- [ ] **Step 1: Verificar estado atual (falha esperada)**

Run: `grep -L "Resolução de contexto" .claude/commands/{spec,back,front,review,recheck,hands-on,groom,backlog}.md | wc -l`
Expected: `8`.

- [ ] **Step 2: Inserir a seção em cada comando**

Inserir a seção abaixo **imediatamente antes** do primeiro `## Resolução de escopo` / `## Resolução de Escopo` / `## Resolução de $SCOPE` (em `recheck` e `hands-on`, antes de `## Argumento`). O sufixo por comando está na tabela.

```markdown
## Resolução de contexto (parâmetro ausente)

Parâmetro ausente ou não reconhecido **não é erro**: siga `.claude/workflows/context-resolution.md` (Modo → Escopo → Tarefa/Spec → Ambiguidade) e atue no contexto atual do projeto. Parâmetro válido sempre vence. <SUFIXO>
```

| Comando | `<SUFIXO>` |
|---|---|
| spec | Sem TASK/requisito: use o spec ativo/próxima TASK `todo` do backlog do escopo resolvido. |
| back | Sem `$TASK`: continue a tarefa "Em progresso" do `current-state.md`. |
| front | Sem `$TASK`: continue a tarefa "Em progresso" do `current-state.md`. |
| review | Sem diff/contexto: revise `git diff HEAD` do escopo resolvido (já previsto em "Obtenção do diff"). |
| recheck | Sem caminho da spec: use a spec `approved` com Pendências Manuais abertas (única) do escopo resolvido. |
| hands-on | Sem caminho da spec: use o spec ativo em `approved` (seção Tarefa/Spec do workflow). |
| groom | Sem descrição: pergunte a funcionalidade (proposta a partir do backlog e `product.md`); escopo por contexto. |
| backlog | Sem `$SCOPE`: siga o critério já descrito abaixo de 1 projeto vs cross-project; em `single` não há escopo. |

- [ ] **Step 3: Alinhar `argument-hint` (tudo opcional)**

Trocar os `argument-hint` por versões com tudo opcional e sem exigir prefixo de escopo:
- spec: `"[TASKXX | requisito] (opcional: apps/<app> | packages/<pkg>)"`
- back / front: `"[tarefa(s)] (opcional: apps/<app>)"`
- review: `"[diff ou contexto] (opcional: apps/<app>)"`
- recheck: `"[caminho-da-spec] [o que foi ajustado]"`
- hands-on: `"[caminho-da-spec] [T2,T3 | --dry-run | --worktree | --serial]"`
- groom / backlog: `"[descrição | contexto] (opcional: apps/<nome> | packages/<nome>)"`

- [ ] **Step 4: Ajustar comandos que exigiam argumento**

Em `recheck.md` e `hands-on.md`, na seção "## Argumento" e em "Tratamento de Ambiguidade": trocar "sem caminho, peça o caminho" (ou equivalente — leia o trecho exato) por "sem caminho, aplique a Resolução de contexto acima".

- [ ] **Step 5: Verificar**

Run: `grep -L "Resolução de contexto" .claude/commands/{spec,back,front,review,recheck,hands-on,groom,backlog}.md | wc -l`
Expected: `0`.

- [ ] **Step 6: Commit**

```bash
git add .claude/commands
git commit -m "feat(harness): commands fall back to project context when param is missing

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: Remover `.claude/prompts/` e atualizar docs

**Files:**
- Delete: `.claude/prompts/` (2 arquivos)
- Modify: `README.md`, `.claude/README.md`, `.claude/CLAUDE.md`, `docs/context/conventions.md:73`

- [ ] **Step 1: Verificar referências (falha esperada = há referências)**

Run: `grep -rn "prompts/" --include=*.md . | grep -v "docs/superpowers"`
Expected: linhas em `README.md` (42, 67, 121, 184, 265, 267, 437, 484, 506, 511), `.claude/README.md:24`, `docs/context/conventions.md:73`.

- [ ] **Step 2: Apagar a pasta**

```bash
git rm -r .claude/prompts
```

- [ ] **Step 3: Limpar referências**

- `README.md`: remover as seções/blocos que instruem `cat .claude/prompts/upgrade-harness.md` (l.42) e `retroactive-documentation.md` (l.67), a linha da árvore `prompts/` (l.121), a linha da tabela (l.184), os links (l.265, 267), a linha da tabela de pastas (l.484) e as frases em l.506/l.511 (remover a menção ao prompt; manter o restante). Em l.437, manter a menção a `docs/prompts/` legado só se ainda fizer sentido como "remova pastas antigas"; senão remover. Leia cada trecho antes de editar, para não deixar parágrafo órfão.
- `.claude/README.md`: remover l.24 (`prompts/`).
- `docs/context/conventions.md:73`: trocar "Se encontrar uma dessas pastas (harness antigo), veja `.claude/prompts/upgrade-harness.md` para migrar o conteúdo para `docs/$SCOPE/`." por "Se encontrar uma dessas pastas (harness antigo), migre o conteúdo manualmente para `docs/$SCOPE/`."

- [ ] **Step 4: Atualizar lista de comandos e descrição de escopo**

- `.claude/CLAUDE.md` seção "Slash commands disponíveis":

```
/init-project [descrição]   ← inicializa projeto: detecta modo (single | monorepo | microfrontends) e preenche contexto global
/init-app <nome>            ← (monorepo) cria app + docs locais + questionário de configuração
/init-package <nome>        ← (monorepo) cria package + docs locais + questionário de configuração
/retomar                    ← retoma o último histórico salvo (sem parâmetro)
/checkpoint                 ← grava resumo da sessão no log do projeto (sem parâmetro)
```
  (manter as demais linhas). Na seção "Estrutura do monorepo", trocar o exemplo fixo por: "Estrutura depende do **Modo** em `docs/architecture/overview.md` — atualizada por `/init-project`, `/init-app` e `/init-package`." e, em l.98, remover `retomar`/`checkpoint` da lista de comandos com `$SCOPE`. Acrescentar em "Carregue sob demanda": `.claude/workflows/context-resolution.md ← fallback quando um comando não recebe parâmetro`.
- `README.md` l.31-34 (lista de commands): adicionar `init-app.md`, `init-package.md`; ajustar descrição de `init-project.md`, `retomar.md`, `checkpoint.md`. L.72: remover `retomar` e `checkpoint` da frase de escopo opcional e acrescentar: "Sem escopo, os comandos inferem do contexto atual (`.claude/workflows/context-resolution.md`)". L.87-88: `/retomar apps/metronome` e `/checkpoint apps/metronome` → `/retomar` e `/checkpoint`.

- [ ] **Step 5: Verificar**

Run: `grep -rn "prompts/" --include=*.md . | grep -v "docs/superpowers"; ls .claude/prompts 2>&1 | head -1; grep -c "init-app\|init-package" README.md .claude/CLAUDE.md; grep -n "retomar apps\|checkpoint apps\|checkpoint \[" README.md .claude/README.md .claude/CLAUDE.md`
Expected: nenhum `prompts/`; "No such file"; contagens `>=1`; última grep sem linhas.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore(harness): remove .claude/prompts and update command docs

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: Verificação final contra o spec

**Files:** nenhum (leitura).

- [ ] **Step 1: Rodar todas as verificações do spec**

```bash
grep -rn "prompts/" --include=*.md . | grep -v "docs/superpowers"           # vazio
grep -n "argument-hint\|ARGUMENTS" .claude/commands/checkpoint.md .claude/commands/retomar.md   # vazio
head -4 .claude/commands/init-app.md .claude/commands/init-package.md       # frontmatter ok
grep -L "Resolução de contexto" .claude/commands/{spec,back,front,review,recheck,hands-on,groom,backlog}.md  # vazio
grep -c "init-app" README.md .claude/CLAUDE.md .claude/README.md
git status --short                                                          # limpo
```
Expected: conforme comentários. Qualquer desvio → corrigir na task de origem e re-commitar.

- [ ] **Step 2: Review Focus — checagem manual por leitura**

Confirmar por leitura: (a) `init-app.md`/`init-package.md` recusam `single`; (b) `ls` antes de criar pasta; (c) rejeição de `/`, `..`; (d) `context-resolution.md` cobre `Modo` ausente; (e) `checkpoint.md` cobre "sem commits nem mudanças".

- [ ] **Step 3: Marcar spec como implementado**

Em `docs/superpowers/specs/2026-09-25-harness-modos-de-projeto-design.md` trocar `**Status:** aguardando revisão` por `**Status:** implementado`.

```bash
git add docs/superpowers && git commit -m "docs(spec): mark project-modes spec implemented

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```
