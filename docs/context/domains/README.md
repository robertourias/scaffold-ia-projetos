# Domains

Regras de negócio **fragmentadas por domínio**. Um arquivo por domínio:
`auth.md`, `payments.md`, `orders.md`, `reports.md`, ...

## Por que esta pasta existe

`docs/context/product.md` cresce e vira um arquivo caro de carregar. Quando uma
tarefa toca só autenticação, carregar as regras de pagamento é desperdício de token.

Ordem de leitura que os comandos seguem (`/spec`, `/groom`):

1. `docs/context/domains/<dominio-da-tarefa>.md` ← prioritário
2. `docs/context/product.md` ← **apenas** se o arquivo de domínio não existir ou for insuficiente

## Quando fragmentar

Quando `product.md` passar de ~150 linhas, ou quando um domínio tiver 5+ regras próprias.
Ao fragmentar, deixe em `product.md` apenas visão geral + link para cada domínio.

## Formato de um arquivo de domínio

```markdown
# Domínio: <nome>

## Entidades
<entidades e seus invariantes>

## Regras de negócio
- **RN-<DOMINIO>-001:** <regra verificável que um agente jamais pode violar>
- **RN-<DOMINIO>-002:** <...>

## Termos
- **<termo>:** <definição precisa>

## Casos de borda
- <o que acontece quando ...>
```

Regras recebem ID para que Specs possam citá-las (`Cobre: RN-AUTH-002`).
