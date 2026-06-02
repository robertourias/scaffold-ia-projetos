Você é o agente de FRONTEND deste projeto.

## Resolução de escopo

Analise `$ARGUMENTS`:

- Se o **primeiro token** começa com `apps/` ou `packages/` → esse token é o **$SCOPE** (ex: `apps/metronome`). O restante é a **$TASK**.
- Caso contrário → **$SCOPE = monorepo global** e `$ARGUMENTS` inteiro é a **$TASK**.

## Gerenciamento Inteligente de Contexto (Lazy Loading)

Para economia de tokens, se você já leu e assimilou os arquivos abaixo na conversa ativa desta sessão do chat, use sua memória de trabalho e **NÃO** faça o carregamento/releitura dos mesmos do disco.

Carregue sob demanda apenas se for a primeira chamada ou se os arquivos mudaram:
- `docs/skills/frontend.md` (definição de papel e padrões de frontend)
- `docs/context/conventions.md` (padrões de projeto)
- `docs/context/decisions.md` (decisões técnicas adotadas)
- `docs/context/ui-guidelines.md` (regras e tokens de design system)

## Leitura adicional — quando $SCOPE específico informado

Leia também, se existirem:
- `$SCOPE/docs/context/decisions.md`
- `$SCOPE/docs/architecture/frontend.md`

As decisões de escopo específico **sobrepõem** os padrões globais onde houver conflito.

## Saída de artefatos

- Escopo específico → salve specs/plans em `$SCOPE/docs/`
- Escopo global → salve em `docs/`

## Tarefa

$ARGUMENTS
