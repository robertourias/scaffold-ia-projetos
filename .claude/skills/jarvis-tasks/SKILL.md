---
name: jarvis-tasks
description: "Quebra o plano da Spec ativa em tasks.md: tarefas em ondas (Fundacional → US1 MVP → … → Polimento), com propriedade de arquivos, rastreabilidade FR → tarefa → teste e critérios verificáveis"
argument-hint: "[specs/NNN-slug]"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(ls:*), Bash(git status:*), Bash(git add:*)
---

# /jarvis-tasks — tarefas em ondas

Você é o PLANNER na etapa de **tarefas**: traduz `spec.md` + `plan.md` em
`tasks.md`, a lista executável que o `/jarvis-implement` despacha. Escreve apenas
em `specs/`, `.specify/` e `.claude/` — não escreve código de produto. Não mude o
`**Status:**` da Spec.

Entrada do usuário (pasta da Spec, opcional): `$ARGUMENTS`

Invoque a skill `planner` (Etapa 2: decomposição, ondas, rastreabilidade) e leia
`.specify/memory/constitution.md` (CN/GR/comandos de verificação) e
`.specify/memory/conventions.md`. Modelo: `.specify/templates/tasks-template.md`.
Siga `.specify/workflows/git-flow.md`.

## Regras gerais

- **Uma pergunta por mensagem**; proponha a melhor interpretação e peça confirmação.
- Nunca `git add -A`, `git add .` nem `git commit -a`: stage só de caminhos explícitos.
- **Commit só com confirmação.** Antes de cada `git commit`, mostre a mensagem e a
  lista exata de arquivos e pergunte **"Posso commitar?"**. Sem um sim explícito,
  não commite: as mudanças ficam no working tree e você diz o que ficou pendente.
  O `settings.json` também pede confirmação (`git commit` em `ask`); as duas valem.
- Nunca invente comando de verificação: use os da constituição (seção 4). Verificação `(não configurado)`: escreva isso e avise que aqueles critérios serão autodeclarados.
- Não altere `spec.md` nem `plan.md`. Lacuna ou erro neles → aponte e indique `/jarvis-clarify` ou `/jarvis-plan`.

## 1. Spec alvo e estado

Leia `.specify/state.json` e mostre a fase atual em uma linha (`Ativo: specs/NNN-slug · fase <fase> · Bnn`, ou `Ativo: nenhum`). Parâmetro ausente: `.specify/workflows/context-resolution.md`.

Normalize o alvo: aceite `NNN`, `NNN-slug` ou `specs/NNN-slug`. `$ARGUMENTS`
informado → essa pasta. Senão use `ativo.spec`. Sem `ativo` e sem argumento →
diga que não há Spec e indique `/jarvis-specify`.

Valide contra a realidade: pasta sem `spec.md`, `state.json` ilegível, ou
`**Status:**` divergente de `fase` (`review` ↔ `spec`/`clarify`/`plan`/`tasks`;
`approved` ↔ `approved`/`implement`/`converge`) → **avise** e proponha corrigir;
só altere com confirmação.

Spec `approved` ou `done`: pare — mudar as tarefas é **emenda** (`## Emendas`) ou
`## Convergência`, não replanejamento.

## 2. Pré-condição

Leia `spec.md`, `plan.md` e `checklists/requirements.md`. Falta `plan.md` →
**pare** e indique `/jarvis-plan`. `[NEEDS CLARIFICATION]` na Spec → **pare** e
indique `/jarvis-clarify`. Se já existir `tasks.md`, avise e pergunte se substitui.

## 3. tasks.md

Gere `<pasta>/tasks.md` a partir do template. Ondas na ordem **Fundacional →
US1 🎯 MVP → US2 … → Polimento**; dentro de uma story, as ondas seguem o grafo
real de dependência (não a ordem da lista). Ordem lógica sugerida por story:
schema/migração → domínio → serviços e casos de uso → transporte → frontend → integração/E2E.

Cada tarefa é `### Tnnn — título` (ou `### Tnnn [P] — título`) e traz, **cada
campo em sua própria linha**:

```
- **Story:** US1 | **Agente:** backend | **Tipo:** feature
- **Depende de:** — | T001
- **Arquivos:** `caminho/a.ts`, `caminho/b.ts`
- **Cobre:** FR-001, CN-001
- **Critérios de Aceite:**
  - [ ] Dado …, quando …, então … — verificado por `<comando ou arquivo de teste>`
```

`Agente:` ∈ backend | frontend | ambos; `Tipo:` ∈ feature | fix | refactor | chore.

Regras:

- **A linha `Arquivos:` é exatamente `- **Arquivos:** ` seguido de caminhos entre crases separados por vírgula**, sozinha na linha, abaixo do `### Tnnn`: o hook `spec-gate` lê esse formato (regex ancorada na linha) e libera a escrita só nesses caminhos. Nunca no meio de outra linha. Cada arquivo que a tarefa cria ou modifica entra aqui, inclusive testes.
- **Propriedade de arquivos:** duas tarefas da **mesma onda** nunca declaram o mesmo caminho (rodam em paralelo na mesma working tree e se sobrescrevem em silêncio). Colisão → serialize (mova uma para a onda seguinte) ou extraia a edição comum para uma tarefa própria em onda anterior. Colisões típicas: wiring de módulo, barrel exports (`index.ts`), tipos compartilhados, schema, rotas, `package.json`.
- **`Cobre:`** lista os FR (e CN/GR relevantes) que a tarefa satisfaz. Todo FR da Spec é coberto por ao menos uma tarefa; tarefa sem FR é escopo não declarado — remova-a ou volte à Spec.
- **Critérios** em Dado/Quando/Então, cada um com o comando ou teste que o verifica. Critério que alguém de fora da conversa não consegue checar está mal escrito. Critério que exige ação humana → seção **Pendências Manuais** (ver skill `verification`).
- Maximize o paralelismo: backend e frontend sem contrato compartilhado caem na mesma onda; serialize só com dependência real.
- Cada story termina com **Checkpoint USn** (o teste independente da story, tirado da Spec).
- Preencha **Ondas**, **Rastreabilidade** (todo FR, com tarefas e verificação) e **Verificação** (comandos reais da constituição; sem `<comando>` remanescente). Em `## Convergência` mantenha só o comentário.
- Sem placeholders `<...>` do template no corpo.

## 4. Estado

`.specify/state.json`: **só se** `ativo` não for nulo **e** a pasta alvo for igual
a `ativo.spec` → `ativo.fase = "tasks"`, `atualizado` = agora (ISO 8601); preserve o
resto. Alvo diferente ou `ativo` nulo: avise e **não toque** em `state.json`.

## 5. Commit e handoff

Stage explícito de: `<pasta>/tasks.md` e, só se alterado, `.specify/state.json`.
Pergunte "Posso commitar?" (mensagem + arquivos) e, só com confirmação, commite:

`docs(spec): tarefas de NNN-slug`

Resuma: ondas, nº de tarefas, FR cobertos, tarefas serializadas por colisão de arquivo.

Próximo: `/jarvis-analyze` (recomendado) ou `/jarvis-implement`
