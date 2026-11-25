---
name: jarvis-review
description: "REVIEWER: revisão em dois estágios (Funcional → Qualidade) do diff do branch ativo contra o padrão, ou do alvo informado, com verificação isolada via runner. Somente leitura — não edita código"
---

# /jarvis-review — revisão em dois estágios (somente leitura)

Você coordena uma revisão e **não edita nada**: ferramentas de edição saem do
conjunto disponível enquanto esta skill roda; não faça stage, commit nem altere
`state.json`. Quem julga é o subagente `reviewer` (sem edição por construção) e,
quando ainda não houver evidência recente na sessão, quem roda a verificação da
constituição é o subagente `runner` (modelo econômico, sem edição).

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

## 2. Despachar `reviewer` (e `runner` em paralelo, se sem evidência)

- Se **ainda não houver** relatório de verificação nesta sessão → dispare
  **em paralelo na mesma rodada**:
  1. **`runner`**: rode os comandos da seção 4 de `.specify/memory/constitution.md`
     (para o escopo alvo) e devolva o relatório condensado.
  2. **`reviewer`**: revise o pacote abaixo sem re-executar a suíte inteira.
- Se **já houver** relatório de verificação recente → despache apenas o `reviewer`
  passando o relatório condensado.

Prompt do `reviewer`:

```
Modo: final
Spec: specs/NNN-slug   ← omita se não houver; leia spec.md, plan.md e tasks.md
Diff: <comando git escolhido no passo 1> + estes arquivos novos: <git status ??, só os relevantes>
Escopo: <apps/<app> | raiz>
Verificação: <relatório condensado do runner ou "rodando em paralelo no runner">
Revise em dois estágios (skill quality): Estágio 1 (Funcional) primeiro; com
🔴 BLOCKER, encerre sem passar ao Estágio 2.
```

Ele carrega sozinho a constituição, as skills `quality` e `verification` e as
convenções conforme o diff; não repita esse contexto.

## 3. Relatar

Consolide o resultado do `runner` (se rodado) com o parecer do `reviewer` sem
suavizar: `Verdict`, achados 🔴/🟡/🟢 com `arquivo:linha` e correção, e notas 💡.
Se o `runner` reportou falha de verificação não apontada pelo `reviewer`, eleve
como 🔴 BLOCKER. Acrescente a lista de arquivos revisados e o intervalo do diff.
Não corrija, não grave `review.md` (isso é do `/jarvis-implement`) e não mude
Status de Spec nem do backlog.

Próximo: corrigir 🔴/🟡 com `/jarvis-implement Tnnn` (tarefa da Spec) ou `/jarvis-fix` (bug avulso); sem bloqueantes, `/jarvis-converge`
