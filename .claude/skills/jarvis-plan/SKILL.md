---
name: jarvis-plan
description: "Planeja a Spec ativa: gera plan.md (o como técnico, com Constitution Check, contratos e ADRs). As tarefas em ondas ficam com /jarvis-tasks"
argument-hint: "[specs/NNN-slug]"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(ls:*), Bash(git status:*), Bash(git add:*)
---

# /jarvis-plan — o como: plano técnico

Você é o PLANNER na etapa de **planejamento**: traduz o quê/porquê da Spec em
plano técnico (`plan.md`). A decomposição em tarefas e ondas **não é daqui**:
fica com `/jarvis-tasks`. Escreve apenas em
`specs/`, `.specify/` e `.claude/` — não escreve código de produto. Não mude o
`**Status:**` da Spec.

Entrada do usuário (pasta da Spec, opcional): `$ARGUMENTS`

Invoque a skill `planner` (Etapa 2: plano) e leia
`.specify/memory/constitution.md` (CN/GR/comandos de verificação),
`.specify/memory/architecture.md`, `.specify/memory/conventions.md` e
`.specify/memory/decisions.md`. Modelo: `.specify/templates/plan-template.md`. Siga `.specify/workflows/git-flow.md`.

## Regras gerais

- **Uma pergunta por mensagem**; proponha a melhor interpretação e peça confirmação.
- Nunca `git add -A`, `git add .` nem `git commit -a`: stage só de caminhos explícitos.
- **Commit só com confirmação.** Antes de cada `git commit`, mostre a mensagem e a
  lista exata de arquivos e pergunte **"Posso commitar?"**. Sem um sim explícito,
  não commite: as mudanças ficam no working tree e você diz o que ficou pendente.
  O `settings.json` também pede confirmação (`git commit` em `ask`); as duas valem.
- Nunca invente comando de verificação: use os da constituição (seção 4). Verificação `(não configurado)`: escreva isso e avise que aqueles critérios serão autodeclarados.

## 1. Spec alvo e estado

Leia `.specify/state.json` e mostre a fase atual em uma linha (`Ativo: specs/NNN-slug · fase <fase> · Bnn`, ou `Ativo: nenhum`). Parâmetro ausente: `.specify/workflows/context-resolution.md`.

Normalize o alvo: aceite `NNN`, `NNN-slug` ou `specs/NNN-slug`. `$ARGUMENTS`
informado → essa pasta. Senão leia `.specify/state.json` e use `ativo.spec`. Sem
`ativo` e sem argumento → diga que não há Spec e indique `/jarvis-specify`.

Valide contra a realidade: pasta sem `spec.md`, `state.json` ilegível, ou
`**Status:**` divergente de `fase` (`review` ↔ `spec`/`clarify`/`plan`/`tasks`;
`approved` ↔ `approved`/`implement`/`converge`) → **avise** e proponha corrigir;
só altere com confirmação.

Spec `approved` ou `done`: pare — mudar o plano é **emenda** (`## Emendas`), não replanejamento.

## 2. Pré-condição

Leia `spec.md` e `checklists/requirements.md`. Se houver `[NEEDS CLARIFICATION]`
na Spec: **pare** (não gere nada) e indique `/jarvis-clarify`. Se já existir
`plan.md`, avise e pergunte se substitui (um `tasks.md` existente fica defasado: avise e indique `/jarvis-tasks` de novo).

## 3. plan.md

Packs: leia `**Packs ativos:**` da constituição e carregue só o `README.md` de cada
pack ativo (`.specify/packs/`); sem pack ativo, não invente stack. Gere
`<pasta>/plan.md` a partir do template:

- **Cabeçalho:** `# Plano: <título da Spec>`, `**Data:**` = hoje (`YYYY-MM-DD`) e `**Packs:**` = o valor de `**Packs ativos:**` da constituição (ou `nenhum`). O `/jarvis-implement` reprova placeholder `<...>` ou `YYYY-MM-DD` remanescente.
- **Resumo técnico, Contexto técnico, Estrutura** (árvore real dos diretórios tocados), **Modelo de dados, Contratos** (`METHOD /caminho` — request/response/erros; contratos extensos vão para `<pasta>/contracts/`, opcional), **Riscos técnicos** com mitigação.
- **Constitution Check (obrigatório):** uma linha por CN e GR relevante, com ✅/❌. Violação de CN/GR **não** é apagada nem escondida: vira linha em **Complexity Tracking** (por que é necessária; alternativa simples rejeitada porque) e será decidida pelo humano ao iniciar o `/jarvis-implement`. Violação sem justificativa possível: pare e escale.
- **Decisões:** cada decisão arquitetural relevante vira ADR-NNN (próximo número livre) em `.specify/memory/decisions.md`; no plan, uma linha apontando para ele.
- **Emendas:** só a nota "Nenhuma ainda." (o template traz apenas um comentário).
- **Item de arquitetura em monorepo** (`Tipo: arquitetura` no backlog, para um app/package): crie `.specify/memory/projects/<apps-x>.md` (ex: `apps-api.md`; propósito, stack, packs e comandos próprios do app/package) e acrescente o projeto ao campo `**Projetos:**` da constituição. Isso é uma emenda da constituição: atualize "Última emenda" e a versão (patch) e peça confirmação antes de gravar.

## 4. Estado

`.specify/state.json`: **só se** `ativo` não for nulo **e** a pasta alvo for igual
a `ativo.spec` → `ativo.fase = "plan"`, `atualizado` = agora (ISO 8601); preserve o
resto. Alvo diferente ou `ativo` nulo: avise e **não toque** em `state.json`.

## 5. Commit e handoff

Stage explícito de: `<pasta>/plan.md` e, só se
criados/alterados, `<pasta>/contracts/`, `.specify/memory/decisions.md`,
`.specify/memory/projects/<apps-x>.md`, `.specify/memory/constitution.md` e
`.specify/state.json`. Pergunte "Posso commitar?" (mensagem + arquivos) e, só com
confirmação, commite:

`docs(spec): planeja NNN-slug`

Resuma: ADRs criados, violações em Complexity Tracking.

Próximo: `/jarvis-tasks`
