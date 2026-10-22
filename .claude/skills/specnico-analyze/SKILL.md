---
name: specnico-analyze
description: "Análise somente leitura de consistência entre spec.md, plan.md, tasks.md e a constituição: relatório compacto com severidade e a skill dona de cada correção"
argument-hint: "[specs/NNN-slug]"
allowed-tools: Read, Grep, Glob
disallowed-tools: Edit, Write, MultiEdit, NotebookEdit
---

# /specnico-analyze — consistência spec ↔ plan ↔ tasks ↔ constituição

Você **só lê**: `Edit`, `Write`, `MultiEdit` e `NotebookEdit` saem do conjunto
de ferramentas enquanto esta skill roda (`disallowed-tools`); não faça commit
nem altere `state.json` por outro meio. A saída é um relatório; as correções
são feitas na origem pela skill dona.

Entrada do usuário (pasta da Spec, opcional): `$ARGUMENTS`

## 1. Alvo

Leia `.specify/state.json` e mostre a fase atual em uma linha (`Ativo: specs/NNN-slug · fase <fase> · Bnn`, ou `Ativo: nenhum`). Parâmetro ausente: `.specify/workflows/context-resolution.md`.

Normalize: aceite `NNN`, `NNN-slug` ou `specs/NNN-slug`. Sem argumento, use
`ativo.spec` de `.specify/state.json`; sem Spec ativa, diga isso e indique
`/specnico-spec`. Leia `spec.md`, `plan.md`, `tasks.md`,
`checklists/requirements.md` (se houver) e `.specify/memory/constitution.md`.
Falta `plan.md` ou `tasks.md`: pare e indique `/specnico-plan`.

## 2. Passes

1. **Duplicação** — FR, tarefas ou critérios que dizem a mesma coisa.
2. **Ambiguidade** — termo vago sem métrica ("rápido", "seguro"), `[NEEDS CLARIFICATION]` remanescente, placeholder `<...>` do template.
3. **Subespecificação** — FR sem critério testável; story sem Checkpoint; tarefa sem `Arquivos:`/`Cobre:`/critério com comando; Verificação com `<comando>`; entidade ou contrato citado e não definido.
4. **Constituição** — cada CN/GR vs `plan.md`: Constitution Check ausente ou incompleto; violação fora de Complexity Tracking. Violação de CN/GR é sempre 🔴.
5. **Cobertura** — FR sem tarefa; tarefa sem FR em `Cobre:` (escopo não declarado); SC sem verificação; FR ausente da tabela de Rastreabilidade.
6. **Inconsistência** — plan × spec (entidades, contratos, escopo divergentes); tasks × plan (arquivos fora da Estrutura, contrato diferente); duas tarefas da mesma onda com o mesmo caminho em `Arquivos:`; dependência de onda posterior ou circular; ordem das ondas incoerente com as stories.

## 3. Relatório

Severidade: 🔴 bloqueia (violação de CN/GR, FR sem tarefa, colisão de arquivos,
dependência circular) · 🟡 corrigir antes de implementar · 🟢 sugestão.

**Máximo 50 linhas.** Uma tabela, ordenada por severidade; agrupe achados
repetidos numa linha só:

| # | Sev | Pass | Onde | Achado | Corrigir com |
|---|---|---|---|---|---|

Coluna **Corrigir com** = a skill dona da origem: `/specnico-spec` ou
`/specnico-clarify` (problema na Spec), `/specnico-plan` (plan/tasks),
`/specnico-constitution` (emenda de CN/GR). Termine com uma linha de totais
(🔴 n · 🟡 n · 🟢 n). Sem achados: diga que o pacote está consistente.

Próximo: corrigir na origem e rodar `/specnico-analyze` de novo, ou `/specnico-approve` se não há 🔴
