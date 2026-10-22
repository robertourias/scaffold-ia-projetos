---
name: specnico-spec
description: "Especifica um item do backlog (Bnn) ou um requisito novo em texto livre: cria a branch, gera specs/NNN-slug/spec.md (Status review, só o quê e porquê) e o checklist de qualidade"
argument-hint: "[Bnn | requisito em texto livre]"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(ls:*), Bash(git status:*), Bash(git branch --show-current), Bash(git switch:*), Bash(git symbolic-ref --short refs/remotes/origin/HEAD), Bash(git rev-parse:*), Bash(git add:*), Bash(git commit:*)
---

# /specnico-spec — o quê e porquê de um item

Você é o PLANNER na etapa de **especificação**: descreve o que será construído e
por que, **sem stack, sem caminho de arquivo, sem o como** (o como é do
`/specnico-plan`). Escreve apenas em `specs/`, `.specify/` e `.claude/` — o
`spec-gate` bloqueia código enquanto a Spec está em `review`.

Entrada do usuário (`Bnn` ou texto livre): `$ARGUMENTS`

Leia `.specify/memory/constitution.md` (CN/GR; Spec que exija violar um CN não é
especificada — escale ao humano) e, se existir, `.specify/memory/product.md`.
Modelo: `.specify/templates/spec-template.md`. Siga `.specify/workflows/git-flow.md`.

## Regras gerais

- **Uma pergunta por mensagem.** Proponha a melhor interpretação e peça
  confirmação em vez de pergunta aberta, quando houver palpite razoável.
- Nunca `git add -A`, `git add .` nem `git commit -a`: stage só de caminhos explícitos.

## 1. Estado

Leia `.specify/state.json` e mostre a fase atual em uma linha (`Ativo: specs/NNN-slug · fase <fase> · Bnn`, ou `Ativo: nenhum`). Parâmetro ausente: `.specify/workflows/context-resolution.md`. Se não existir, crie-o com
`{ "versao": 1, "ativo": null, "atualizado": "<ISO 8601 de agora>" }`.

Valide-o contra a realidade: se `ativo` for não nulo e a pasta `ativo.spec` não
existir (ou não tiver `spec.md`), ou o `**Status:**` do `spec.md` divergir de
`fase` (`review` ↔ `spec`/`clarify`/`plan`; `approved` ↔ `approved`/`implement`/`converge`),
**avise** e proponha corrigir `state.json`; só altere com confirmação.

Se `ativo` for não nulo e a Spec apontada não estiver `done`, avise ("há a Spec
`<ativo.spec>` em `<fase>`") e **pergunte** antes de abrir outra. Uma Spec por
vez é o padrão.

## 2. Item do backlog

Leia `.specify/memory/product-backlog.md`.

- **Argumento `Bnn`:** localize a linha e a entrada em `## Descrições` (descrição
  + `Pronto quando`). Se algum ID de `Depende` não estiver `done`, **avise** (não
  bloqueia) e siga se o humano confirmar. Item `descartado` ou já com Spec: pare e diga.
- **Texto livre:** crie um item novo: próximo `Bnn` livre (nunca renumere);
  **fase proposta** = a primeira fase com item do mesmo tipo ainda não `done`;
  **feature proposta** por similaridade com o índice `## Features` (ou nova
  `F-<SIGLA>`). Apresente fase, feature, tipo, escopo e depende e **só grave
  após confirmação**.
- **Sem argumento:** proponha o primeiro item `backlog` cujas dependências estão `done`.

Requisito vago, regra de negócio ou contrato desconhecido: faça 2–3 perguntas
(uma por vez). O resultado deve ser uma Spec que o planner execute sem voltar a perguntar.

## 3. NNN e slug

Liste `specs/` ignorando `bugs/` e `legacy/`: NNN = maior número + 1, com 3
dígitos (`001` se vazio). Slug = 2–4 palavras do título, kebab-case, sem
acentos. Pasta: `specs/NNN-slug/`; branch: `spec/NNN-slug`.

## 4. Branch

`git status --porcelain`:

- mudança **rastreada** pendente → **pare** e peça ao humano para commitar ou guardar (não rastreados não bloqueiam);
- branch atual = branch padrão → `git switch -c spec/NNN-slug`;
- já em `spec/NNN-slug` → reaproveite;
- qualquer outro branch → pergunte: "Você está em `<branch>`. Crio `spec/NNN-slug` a partir dele, ou gero a Spec aqui mesmo?" — não decida sozinho.

## 5. Spec

Crie `specs/NNN-slug/spec.md` a partir do template, com `**Status:** review`,
`**Item:**`, `**Escopo:**`, `**Feature:**` do backlog e `**Criada:**` = hoje.
Preencha Problema, User Stories (priorizadas P1/P2/P3, cada uma testável
sozinha e com cenários Dado/quando/então), Casos de borda, FR-NNN ("O sistema
DEVE …", testáveis), Entidades-chave (sem esquema de banco), SC-NNN (mensuráveis,
agnósticos de tecnologia), Premissas e Fora do escopo. Em `## Clarificações` e
`## Emendas` **não deixe entradas de exemplo do template**: escreva só a nota
"Nenhuma ainda." (o `/specnico-clarify` a remove ao criar a primeira sessão).

**`[NEEDS CLARIFICATION: pergunta]`:** no máximo **3**, só para o que muda o
escopo ou o resultado, na prioridade **escopo > segurança > UX > técnica**. Todo
o resto vira **Premissa** documentada — não pergunte o que tem default razoável.

## 6. Checklist de qualidade

Gere `specs/NNN-slug/checklists/requirements.md` a partir de
`.specify/templates/checklist-template.md` (título, data). Valide a Spec item a
item, marcando `[x]` só o que de fato passa (o item "Nenhum `[NEEDS
CLARIFICATION]` restante" fica `[ ]` enquanto houver marcador — é esperado).
Item falho: corrija a Spec e revalide, **até 3 iterações**. Se sobrar falha
(exceto marcadores), liste-a ao humano em vez de fingir que passou.

## 7. Backlog e estado

- Backlog: Status do item → `spec`; coluna Spec → `specs/NNN-slug/`. Item novo entra na tabela da fase confirmada, com entrada em `## Descrições` (2–5 linhas do quê/porquê + `**Pronto quando:**`) e, se feature nova, linha em `## Features`.
- `.specify/state.json`: `ativo = { "spec": "specs/NNN-slug", "item": "Bnn", "fase": "spec", "branch": "spec/NNN-slug" }`, `atualizado` = agora (ISO 8601). Preserve `versao`.

## 8. Commit e handoff

Stage explícito de: `specs/NNN-slug/spec.md`, `specs/NNN-slug/checklists/requirements.md`,
`.specify/memory/product-backlog.md`, `.specify/state.json`. Commit:

`docs(spec): <título> (review)`

Informe branch, commit e quantos marcadores ficaram. Não aprove a Spec — isso é do humano.

Próximo: `/specnico-clarify` se a Spec tem `[NEEDS CLARIFICATION]`; senão `/specnico-plan`
