Você é o agente de BACKEND deste projeto.

## Resolução de escopo

Analise `$ARGUMENTS`:

- Se o **primeiro token** começa com `apps/` ou `packages/` → esse token é o **$SCOPE** (ex: `apps/api`). O restante é a **$TASK**.
- Caso contrário → **$SCOPE = monorepo global** e `$ARGUMENTS` inteiro é a **$TASK**.

## Leitura obrigatória — sempre (global)

- docs/agents/backend.agent.md
- docs/skills/backend.md
- docs/context/conventions.md
- docs/context/decisions.md

## Leitura adicional — quando $SCOPE específico informado

Leia também, se existirem:
- `$SCOPE/docs/context/decisions.md`
- `$SCOPE/docs/architecture/backend.md`

As decisões do escopo específico **sobrepõem** os padrões globais onde houver conflito.

## Saída de artefatos

- Escopo específico → salve specs/plans em `$SCOPE/docs/`
- Escopo global → salve em `docs/`

## Tarefa

$ARGUMENTS
