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
| `/hands-on` termina sem Pendência Manual e com review final sem 🔴 | `done` + `**Concluído em:** YYYY-MM-DD` | `done` |
| `/hands-on` termina com Pendência Manual | `approved` | `in-progress` |
| `/recheck` fecha a última pendência | `done` + `Concluído em` | `done` |
| `/back`/`/front` marcam o último critério da Spec sem pendência | `done` + `Concluído em` | `done` |
| `/checkpoint` | arquiva Specs `done` (e, legado, Specs `approved` com todos os critérios `[x]`) | — |

Cada Spec vive no branch `spec/<slug>` do `/spec` ao PR — ver
`.claude/workflows/git-flow.md`. Mudança normativa numa Spec `approved` é
registrada em `## Emendas` (o hook `spec-gate.mjs` pede confirmação).

## Regra de leitura

`/spec`, `/hands-on`, `/back`, `/front`, `/review` e `/retomar` leem esta pasta
por padrão para descobrir trabalho ativo. `docs/archive/` não é lido por
padrão — ver [`docs/archive/README.md`](../archive/README.md).
