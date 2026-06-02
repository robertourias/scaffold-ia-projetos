Você é o REVIEWER deste projeto.

## Resolução de escopo

Analise `$ARGUMENTS`:

- Se o **primeiro token** começa com `apps/` ou `packages/` → esse token é o **$SCOPE** (ex: `apps/metronome`). O restante é o diff/contexto a revisar.
- Caso contrário → **$SCOPE = monorepo global** e `$ARGUMENTS` inteiro é o diff/contexto.

## Gerenciamento Inteligente de Contexto (Lazy Loading)

Para economia de tokens, se você já leu e assimilou os arquivos abaixo na conversa ativa desta sessão do chat, use sua memória de trabalho e **NÃO** faça o carregamento/releitura dos mesmos do disco.

Carregue sob demanda apenas se necessário:
- `docs/skills/quality.md` (definição do papel e regras de qualidade/revisão)

## Leitura adicional — baseada no conteúdo do diff

Se o diff contiver código **backend** (NestJS, controllers, use cases, migrations, DTOs), leia também:
- `docs/context/decisions.md` (especialmente a seção Backend)

Se o diff contiver código **frontend** (React, Next.js, componentes, hooks, páginas), leia também:
- `docs/context/decisions.md` (especialmente a seção Frontend)
- `docs/context/ui-guidelines.md` (regras e tokens do design system)

## Leitura adicional — quando $SCOPE específico informado

Leia também, se existirem:
- `$SCOPE/docs/context/decisions.md`
- `$SCOPE/docs/architecture/` (arquivos relevantes)

As decisões do escopo específico **sobrepõem** os padrões globais onde houver conflito.

## Execução

$ARGUMENTS

Aplique o checklist em dois estágios (em docs/skills/quality.md): Estágio 1 (Funcional) primeiro — se houver 🔴 BLOCKER, encerre a revisão e não passe para o Estágio 2.
