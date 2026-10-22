# Tarefas: <título>

**Spec:** ./spec.md | **Plano:** ./plan.md

## Ondas
| Onda | Fase | Tarefas (paralelas) | Pré-requisito |
|------|------|---------------------|---------------|
| 1 | Fundacional | T001 | — |
| 2 | US1 🎯 MVP | T002, T003 | T001 |
| 3 | US1 🎯 MVP | T004 | T002, T003 |

> Duas tarefas da mesma onda nunca declaram o mesmo caminho em `Arquivos:`.
> Ondas agrupam por story (Fundacional → US1 → US2 → … → Polimento); dentro de
> uma story, seguem o grafo de dependência.

## Fundacional
### T001 — <identificador>
- **Story:** — | **Agente:** backend | **Tipo:** feature
- **Depende de:** —
- **Arquivos:** `caminho/a.ts`
- **Cobre:** FR-001, CN-001
- **Critérios de Aceite:**
  - [ ] Dado …, quando …, então … — verificado por `<comando|teste>`

## US1 — <título> (P1) 🎯 MVP
### T002 [P] — <identificador>
- **Story:** US1 | **Agente:** backend | **Tipo:** feature
- **Depende de:** T001
- **Arquivos:** `caminho/b.ts`
- **Cobre:** FR-001
- **Critérios de Aceite:**
  - [ ] Dado …, quando …, então … — verificado por `<comando|teste>`

**Checkpoint US1:** <teste independente da story>

## Polimento
<tarefas transversais: docs, limpeza, desempenho, endurecimento>

## Rastreabilidade
| FR | Tarefas | Verificado por |
|----|---------|----------------|
| FR-001 | T001, T002 | `<comando|teste>` |

## Verificação
| O quê | Comando | Saída esperada |
|-------|---------|----------------|
| Testes | `<comando>` | <saída esperada> |

## Pendências Manuais
<!-- Critério que exige ação humana: ver skill `verification`. -->

## Convergência
<!-- append-only, escrito pelo /specnico-converge -->
