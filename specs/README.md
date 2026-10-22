# Specs

Uma pasta por Spec, `specs/NNN-slug/` (NNN = 3 dígitos sequenciais), criada
pelo `/specnico-spec`. As pastas concluídas ficam aqui como histórico
(flow-forward: Spec `done` não é reescrita nem arquivada).

## O que vive aqui

```
specs/
  NNN-slug/
    spec.md                  ← o quê e porquê (Status: review | approved | done)
    plan.md                  ← como (Constitution Check, contratos, decisões)
    tasks.md                 ← tarefas em ondas, critérios, Pendências, Convergência
    review.md                ← notas de review do /specnico-implement
    checklists/requirements.md
    contracts/               ← opcional
  bugs/
    NNN-slug.md              ← registro do /specnico-fix (numeração própria)
  legacy/                    ← só em projetos migrados da 1.x (somente leitura)
```

Modelos em `.specify/templates/` (`spec-template.md`, `plan-template.md`,
`tasks-template.md`, `checklist-template.md`, `bug-template.md`).

## Ciclo de vida

| Momento | `spec.md` (`**Status:**`) | Item no backlog | `state.json` (`ativo.fase`) |
|---|---|---|---|
| `/specnico-spec` gera | `review` | `spec` | `spec` |
| `/specnico-clarify` | `review` | `spec` | `clarify` |
| `/specnico-plan` | `review` | `spec` | `plan` |
| `/specnico-approve` (só humano) | `approved` | `approved` | `approved` |
| `/specnico-implement` | `approved` | `in-progress` | `implement` |
| `/specnico-converge` com lacunas ou Pendências | `approved` | `in-progress` | `converge` |
| `/specnico-converge` sem lacunas nem Pendências | `done` | `done` | `ativo: null` |

Cada Spec vive no branch `spec/NNN-slug` do `/specnico-spec` ao PR — ver
`.specify/workflows/git-flow.md`. Mudança normativa em `spec.md` ou `plan.md`
de uma Spec `approved` é registrada em `## Emendas` (o hook `spec-gate.mjs`
pede confirmação); o `tasks.md` é livre.

## Regra de leitura

Os comandos descobrem o trabalho ativo pelo `.specify/state.json`, nunca
varrendo esta pasta. Specs concluídas, `bugs/` e `legacy/` são referência sob
demanda (Tier 3 do índice em `.claude/CLAUDE.md`).
