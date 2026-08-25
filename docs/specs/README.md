# Specs

Specs **ativas** desta feature em diante — geradas por `/spec`, executadas por
`/hands-on` ou por `/back`/`/front`, e movidas para `docs/archive/` quando
concluídas (todos os Critérios de Aceite `[x]` e `Status: approved`).

## O que vive aqui

Um arquivo por feature em andamento: `YYYY-MM-DD-<topic>.md`, no formato de
`.claude/templates/spec-template.md`.

## Ciclo de vida

```
/spec  → Status: review   (aqui, aguardando aprovação humana)
       → Status: approved (aqui, agente pode implementar)
       → Status: done     (todos os critérios [x] → /checkpoint move para docs/archive/)
```

## Regra de leitura

`/spec`, `/hands-on`, `/back`, `/front`, `/review` e `/retomar` leem esta pasta
por padrão para descobrir trabalho ativo. `docs/archive/` não é lido por
padrão — ver [`docs/archive/README.md`](../archive/README.md).
