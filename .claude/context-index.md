# Índice de contexto

Use este índice para carregar apenas o contexto necessário. O estado do
projeto é `docs/context/current-state.md`; este arquivo descreve o harness.

## Tier 1 — execução obrigatória

Leia antes de alterar código ou documentação de produto:

- `docs/context/guardrails.md`
- `docs/context/constitution.md`
- Spec aprovada e plano da tarefa, quando existirem
- `docs/$SCOPE/context/` quando o escopo estiver resolvido

## Tier 2 — decisões

Leia quando a tarefa exigir decisão de produto, arquitetura ou convenção:

- `docs/context/product.md`
- `docs/context/decisions.md`
- `docs/context/conventions.md`
- `docs/architecture/overview.md`
- `.claude/packs/<id>/README.md` para cada ID em `**Packs de stack:**`
- equivalentes em `docs/$SCOPE/`, quando existirem

## Tier 3 — referência sob demanda

Não carregue por padrão:

- `docs/changelog/`
- `docs/archive/`
- `docs/features/`
- arquitetura de áreas não tocadas
- contexto de outro app/package

## Por papel

| Papel/comando | Tier 1 | Tier 2 adicional |
| --- | --- | --- |
| planner/spec | product, overview | decisions, conventions |
| backend/back | decisions, conventions | architecture/backend + pack ativo |
| frontend/front | decisions, conventions | ui-guidelines, architecture/frontend + pack ativo |
| reviewer/review | decisions, conventions | arquitetura e pack do diff |
| checkpoint | current-state | changelog do dia e Specs candidatas a archive |
| retomar | current-state | último changelog e Spec ativa |

Parâmetro ou escopo explícito sempre vence a inferência. Não leia
`docs/<outro-scope>/` apenas para completar contexto.
