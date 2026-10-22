# Product Backlog — <Projeto>

**Gerado por:** /specnico-constitution em YYYY-MM-DD | **Modo:** <modo>
**Status:** backlog → spec → approved → in-progress → done | descartado
**Tipo:** fundação | arquitetura | feature

## Fase 0 — Fundação
| ID | Título | Tipo | Escopo | Feature | Depende | Status | Spec |
|----|--------|------|--------|---------|---------|--------|------|
| B01 | Monorepo base | fundação | raiz | — | — | backlog | — |
| B02 | Config compartilhada | fundação | packages/config | — | B01 | backlog | — |

## Fase 1 — Arquitetura
| ID | Título | Tipo | Escopo | Feature | Depende | Status | Spec |
|----|--------|------|--------|---------|---------|--------|------|
| B03 | API base em camadas | arquitetura | apps/api | — | B02 | backlog | — |
| B04 | Web base | arquitetura | apps/web | — | B02 | backlog | — |

## Fase 2 — MVP
| ID | Título | Tipo | Escopo | Feature | Depende | Status | Spec |
|----|--------|------|--------|---------|---------|--------|------|
| B05 | Cadastro e login | feature | apps/api, apps/web | F-AUTH | B03, B04 | backlog | — |

## Fase 3 — Complementar
| ID | Título | Tipo | Escopo | Feature | Depende | Status | Spec |
|----|--------|------|--------|---------|---------|--------|------|

## Fase 4 — Polimento
| ID | Título | Tipo | Escopo | Feature | Depende | Status | Spec |
|----|--------|------|--------|---------|---------|--------|------|

---

## Descrições

Entrada do `/specnico-spec Bnn`. O quê e porquê — nunca o como.

### B01 — Monorepo base
<descrição em 2-5 linhas>
**Pronto quando:** <resultado observável>

---

## Features

Índice do que o produto faz. Base da documentação de features.

| Feature | Nome | Itens | Status | Resumo |
|---------|------|-------|--------|--------|
| F-AUTH | Autenticação | B05 | planejada | <1 linha> |
