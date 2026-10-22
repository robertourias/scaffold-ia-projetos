---
name: specnico-review
description: "REVIEWER: revisão em dois estágios (Funcional → Qualidade) do diff do branch ativo contra o padrão, ou do alvo informado. Somente leitura — não edita código"
argument-hint: "[diff, arquivo ou ref] [specs/NNN-slug] (opcional: apps/<app>)"
allowed-tools: Read, Grep, Glob, Agent, Bash(git diff:*), Bash(git log:*), Bash(git status:*), Bash(git show:*), Bash(git merge-base:*), Bash(git symbolic-ref --short refs/remotes/origin/HEAD), Bash(git branch --show-current), Bash(git rev-parse:*)
disallowed-tools: Edit, Write, MultiEdit, NotebookEdit
---

# /specnico-review — revisão em dois estágios (somente leitura)

Você coordena uma revisão e **não edita nada**: enquanto esta skill roda,
`Edit`, `Write`, `MultiEdit` e `NotebookEdit` saem do conjunto de ferramentas
(`disallowed-tools`); não faça stage, commit nem altere `state.json` — o Bash
pré-aprovado é só git de leitura, e qualquer outro comando pede permissão. Quem
julga é o subagente `reviewer` (`.claude/agents/reviewer.md`), sem
`Edit`/`Write` por construção. Substitui o `review` da 1.x.

Entrada do usuário: `$ARGUMENTS`

## 1. Alvo

Leia `.specify/state.json` e mostre a fase atual em uma linha (`Ativo: specs/NNN-slug · fase <fase> · Bnn`, ou `Ativo: nenhum`). Sem alvo informado: `.specify/workflows/context-resolution.md`.

- **Padrão (sem argumento):** o diff do branch ativo contra a branch padrão:
  `git diff $(git merge-base <padrão> HEAD)..HEAD`, mais as mudanças ainda não
  commitadas (`git diff HEAD`) e `git status --short`. Branch padrão: `main` se
  existir, senão `master`; com remoto, `git symbolic-ref --short
  refs/remotes/origin/HEAD` (sem `origin/`). Se o branch ativo **é** o padrão,
  revise só `git diff HEAD`.
- Um ref, intervalo ou caminho em `$ARGUMENTS` vence o padrão.
- Primeiro token `apps/…` ou `packages/…` → escopo: restrinja o diff com `-- <escopo>`.
- Token `NNN`, `NNN-slug` ou `specs/NNN-slug` → Spec associada. Sem token, use
  `ativo.spec` de `.specify/state.json` se existir (ilegível ou inexistente:
  revise sem Spec e avise).
- Nunca peça para colar o diff: obtenha-o você mesmo. Diff vazio → diga isso e pare.

## 2. Despachar o reviewer

Um único subagente `reviewer` com o pacote completo:

```
Modo: final
Spec: specs/NNN-slug   ← omita se não houver; leia spec.md, plan.md e tasks.md
Diff: <comando git escolhido no passo 1> + estes arquivos novos: <git status ??, só os relevantes>
Escopo: <apps/<app> | raiz>
Verificação: <saída real se já houver; senão ele roda os comandos da constituição>
Revise em dois estágios (skill quality): Estágio 1 (Funcional) primeiro; com
🔴 BLOCKER, encerre sem passar ao Estágio 2.
```

Ele carrega sozinho a constituição, as skills `quality` e `verification` e as
convenções conforme o diff; não repita esse contexto.

## 3. Relatar

Repasse o parecer do `reviewer` sem suavizar: `Verdict`, achados 🔴/🟡/🟢 com
`arquivo:linha` e correção, e notas 💡. Acrescente a lista de arquivos revisados
e o intervalo do diff. Não corrija, não grave `review.md` (isso é do
`/specnico-implement`) e não mude Status de Spec nem do backlog.

Próximo: corrigir 🔴/🟡 com `/specnico-implement Tnnn` (tarefa da Spec) ou `/specnico-fix` (bug avulso); sem bloqueantes, `/specnico-converge`
