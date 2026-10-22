---
name: specnico-plan
description: "Planeja a Spec ativa: gera plan.md (como, com Constitution Check) e tasks.md (ondas Fundacional → US1 MVP → … → Polimento, com propriedade de arquivos e critérios verificáveis)"
argument-hint: "[specs/NNN-slug]"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(ls:*), Bash(git status:*), Bash(git add:*), Bash(git commit:*)
---

# /specnico-plan — o como: plano técnico e tarefas em ondas

Você é o PLANNER na etapa de **planejamento**: traduz o quê/porquê da Spec em
plano técnico (`plan.md`) e tarefas executáveis (`tasks.md`). Escreve apenas em
`specs/`, `.specify/` e `.claude/` — não escreve código de produto. Não mude o
`**Status:**` da Spec.

Entrada do usuário (pasta da Spec, opcional): `$ARGUMENTS`

Invoque a skill `planner` (decomposição, ondas, rastreabilidade) e leia
`.specify/memory/constitution.md` (CN/GR/comandos de verificação),
`.specify/memory/architecture.md`, `.specify/memory/conventions.md` e
`.specify/memory/decisions.md`. Modelos: `.specify/templates/plan-template.md` e
`.specify/templates/tasks-template.md`. Siga `.specify/workflows/git-flow.md`.

## Regras gerais

- **Uma pergunta por mensagem**; proponha a melhor interpretação e peça confirmação.
- Nunca `git add -A`, `git add .` nem `git commit -a`: stage só de caminhos explícitos.
- Nunca invente comando de verificação: use os da constituição (seção 4). Verificação `(não configurado)`: escreva isso e avise que aqueles critérios serão autodeclarados.

## 1. Spec alvo e estado

Leia `.specify/state.json` e mostre a fase atual em uma linha (`Ativo: specs/NNN-slug · fase <fase> · Bnn`, ou `Ativo: nenhum`). Parâmetro ausente: `.specify/workflows/context-resolution.md`.

Normalize o alvo: aceite `NNN`, `NNN-slug` ou `specs/NNN-slug`. `$ARGUMENTS`
informado → essa pasta. Senão leia `.specify/state.json` e use `ativo.spec`. Sem
`ativo` e sem argumento → diga que não há Spec e indique `/specnico-spec`.

Valide contra a realidade: pasta sem `spec.md`, `state.json` ilegível, ou
`**Status:**` divergente de `fase` (`review` ↔ `spec`/`clarify`/`plan`;
`approved` ↔ `approved`/`implement`/`converge`) → **avise** e proponha corrigir;
só altere com confirmação.

Spec `approved` ou `done`: pare — mudar o plano é **emenda** (`## Emendas`), não replanejamento.

## 2. Pré-condição

Leia `spec.md` e `checklists/requirements.md`. Se houver `[NEEDS CLARIFICATION]`
na Spec: **pare** (não gere nada) e indique `/specnico-clarify`. Se já existir
`plan.md`/`tasks.md`, avise e pergunte se substitui.

## 3. plan.md

Packs: leia `**Packs ativos:**` da constituição e carregue só o `README.md` de cada
pack ativo (`.specify/packs/`); sem pack ativo, não invente stack. Gere
`<pasta>/plan.md` a partir do template:

- **Cabeçalho:** `# Plano: <título da Spec>`, `**Data:**` = hoje (`YYYY-MM-DD`) e `**Packs:**` = o valor de `**Packs ativos:**` da constituição (ou `nenhum`). O `/specnico-approve` reprova placeholder `<...>` ou `YYYY-MM-DD` remanescente.
- **Resumo técnico, Contexto técnico, Estrutura** (árvore real dos diretórios tocados), **Modelo de dados, Contratos** (`METHOD /caminho` — request/response/erros; contratos extensos vão para `<pasta>/contracts/`, opcional), **Riscos técnicos** com mitigação.
- **Constitution Check (obrigatório):** uma linha por CN e GR relevante, com ✅/❌. Violação de CN/GR **não** é apagada nem escondida: vira linha em **Complexity Tracking** (por que é necessária; alternativa simples rejeitada porque) e será decidida pelo humano no `/specnico-approve`. Violação sem justificativa possível: pare e escale.
- **Decisões:** cada decisão arquitetural relevante vira ADR-NNN (próximo número livre) em `.specify/memory/decisions.md`; no plan, uma linha apontando para ele.
- **Emendas:** só a nota "Nenhuma ainda." (o template traz apenas um comentário).
- **Item de arquitetura em monorepo** (`Tipo: arquitetura` no backlog, para um app/package): crie `.specify/memory/projects/<apps-x>.md` (ex: `apps-api.md`; propósito, stack, packs e comandos próprios do app/package) e acrescente o projeto ao campo `**Projetos:**` da constituição. Isso é uma emenda da constituição: atualize "Última emenda" e a versão (patch) e peça confirmação antes de gravar.

## 4. tasks.md

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

## 5. Estado

`.specify/state.json`: **só se** `ativo` não for nulo **e** a pasta alvo for igual
a `ativo.spec` → `ativo.fase = "plan"`, `atualizado` = agora (ISO 8601); preserve o
resto. Alvo diferente ou `ativo` nulo: avise e **não toque** em `state.json`.

## 6. Commit e handoff

Stage explícito de: `<pasta>/plan.md`, `<pasta>/tasks.md` e, só se
criados/alterados, `<pasta>/contracts/`, `.specify/memory/decisions.md`,
`.specify/memory/projects/<apps-x>.md`, `.specify/memory/constitution.md` e
`.specify/state.json`. Commit:

`docs(spec): planeja NNN-slug`

Resuma: ondas, nº de tarefas, ADRs criados, violações em Complexity Tracking.

Próximo: `/specnico-analyze` (recomendado) ou `/specnico-approve`
