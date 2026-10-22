---
name: specnico-approve
description: "Gate humano do pacote spec + plan + tasks: roda a análise e as checagens sintáticas e aprova (Status review → approved). Só o humano invoca"
disable-model-invocation: true
argument-hint: "[specs/NNN-slug]"
allowed-tools: Read, Edit, Grep, Glob, Bash(git config:*), Bash(git status:*), Bash(git add:*)
---

# /specnico-approve — gate humano da Spec

Você executa a aprovação que o **humano** pediu ao invocar `/specnico-approve`.
Este comando nunca é disparado pelo modelo por conta própria
(`disable-model-invocation`), e a edição do Status ainda passa por confirmação no
hook `spec-gate.mjs` (reason: "Aprovação de Spec exige confirmação humana
(/specnico-approve).") — é esperado aparecer um prompt: é o humano confirmando.

Entrada do usuário (pasta da Spec, opcional): `$ARGUMENTS`

## Regras gerais

- Nunca `git add -A`, `git add .` nem `git commit -a`: stage só de caminhos explícitos.
- **Commit só com confirmação.** Antes de cada `git commit`, mostre a mensagem e a
  lista exata de arquivos e pergunte **"Posso commitar?"**. Sem um sim explícito,
  não commite: as mudanças ficam no working tree e você diz o que ficou pendente.
  O `settings.json` também pede confirmação (`git commit` em `ask`); as duas valem.
- Nunca corrija a Spec, o plano ou as tarefas você mesmo; só aponte.

## 1. Resolver a Spec

Leia `.specify/state.json` e mostre a fase atual em uma linha (`Ativo: specs/NNN-slug · fase <fase> · Bnn`, ou `Ativo: nenhum`). Parâmetro ausente: `.specify/workflows/context-resolution.md`.

Normalize: aceite `NNN`, `NNN-slug` ou `specs/NNN-slug`. Com argumento → essa
pasta. Sem argumento → `ativo.spec` de `.specify/state.json`. Sem Spec ativa ou
ambíguo → liste as Specs em `Status: review` e pergunte qual.

Leia `spec.md`, `plan.md`, `tasks.md` e `.specify/memory/constitution.md`. Falta
`plan.md` ou `tasks.md` → pare e indique `/specnico-plan`. `**Status:**` já
`approved` ou `done` → avise e pare.

## 2. Validar (dois grupos)

**A. Análise** — execute as checagens do `/specnico-analyze` (duplicação,
ambiguidade, subespecificação, constituição, cobertura, inconsistência) sobre o
pacote. 🔴 = violação de CN/GR, FR sem tarefa, colisão de `Arquivos:` na mesma
onda, dependência circular.

**B. Sintáticas** (sobre os três arquivos):

| Checagem | Regra |
|---|---|
| Status | `spec.md` está em `review` |
| Marcadores | nenhum `[NEEDS CLARIFICATION]` na Spec |
| Placeholders | sem `<...>` nem `YYYY-MM-DD` do template no corpo (ignore comentários HTML `<!-- -->` e sintaxe de código) |
| Rastreabilidade | todo `FR-NNN` da Spec aparece na tabela de Rastreabilidade do `tasks.md` |
| Arquivos | toda tarefa tem `Arquivos:` preenchido (sem `caminho/a.ts` do template) |
| Verificação | a seção Verificação e os critérios não têm `<comando>` |
| Complexity Tracking | toda violação de CN do Constitution Check tem linha justificada |

Mostre ✅/❌ (grupo B) e a tabela de achados 🔴/🟡 (grupo A, resumida). Se houver
❌ ou 🔴, pergunte **"Aprovar mesmo assim? (s/N)"** e **espere** a resposta. N → pare e
sugira o que corrigir e com qual skill. Violação de CN justificada em Complexity
Tracking: mostre-a ao humano — a aprovação é a decisão dele.

## 3. Aprovar

1. `git config user.name` (vazio → `humano`) e a data de hoje (`YYYY-MM-DD`).
2. Edite **somente** a linha do Status do `spec.md`: `**Status:** review` →
   `**Status:** approved`, seguida da linha `**Aprovado por:** <nome> em <data>`.
3. Backlog (`.specify/memory/product-backlog.md`): o item `Item:` da Spec passa a `approved`. Spec sem `**Item:**` ou sem linha no backlog: avise e pule este item.
4. `.specify/state.json`: **só se** `ativo` não for nulo **e** a pasta alvo for igual a `ativo.spec` → `ativo.fase = "approved"`, `atualizado` = agora (ISO 8601); preserve o resto. Alvo diferente: avise e não toque.
5. Pergunte "Posso commitar?" (mensagem + arquivos) e, só com confirmação, commite (stage explícito: `<pasta>/spec.md` — incluindo edições manuais do humano feitas na review —, `plan.md` e `tasks.md` se tiverem edições pendentes, backlog e `state.json` se mudaram): `docs(spec): aprova NNN-slug`.

## 4. Confirmar

```
✅ Spec aprovada: <pasta>
   Aprovado por: <nome> em <data>
Commit: <hash curto> docs(spec): aprova NNN-slug   (ou: commit pendente — não autorizado)
```

Se o hook pedir confirmação e o humano negar, pare e reporte — não tente outro caminho.

Próximo: `/specnico-implement`

Argumento recebido (`$ARGUMENTS`): $ARGUMENTS
