# Specs

Specs **ativas** desta feature em diante — geradas por `/spec`, executadas por
`/hands-on` ou por `/back`/`/front`, e movidas para `docs/archive/` quando
`Status: done`.

## O que vive aqui

Um arquivo por feature em andamento: `YYYY-MM-DD-<topic>.md`, no formato de
`.claude/templates/spec-template.md`.

## Ciclo de vida

| Momento | Spec (`**Status:**`) | TASK no backlog |
|---|---|---|
| `/spec` gera | `review` | `spec-review` |
| `/approve` | `approved` (+ `Aprovado por`) | `spec-approved` |
| `/hands-on` inicia | `approved` | `in-progress` |
| fim sem Pendência Manual e review final sem 🔴 | `done` + `**Concluído em:**` | `done` |
| fim com Pendência Manual | `approved` | `in-progress` |
| `/recheck` fecha a última pendência | `done` + `Concluído em` | `done` |
| `/back`/`/front` marcam o último critério sem pendência | `done` + `Concluído em` | `done` |
| `/checkpoint` | move Specs `done` para `docs/archive/` | — |

Cada Spec vive no branch `spec/<slug>` do `/spec` ao PR — ver
`.claude/workflows/git-flow.md`. Mudança normativa numa Spec `approved` é
registrada em `## Emendas` (o hook `spec-gate.mjs` pede confirmação).

## Regra de leitura

`/spec`, `/hands-on`, `/back`, `/front`, `/review` e `/retomar` leem esta pasta
por padrão para descobrir trabalho ativo. `docs/archive/` não é lido por
padrão — ver [`docs/archive/README.md`](../archive/README.md).
