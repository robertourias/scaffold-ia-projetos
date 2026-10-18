---
description: "Pós-merge: volta para a branch padrão, atualiza do remoto e remove a branch do PR mergeado. Sem parâmetro"
allowed-tools: Read, Bash(git status:*), Bash(git branch:*), Bash(git switch:*), Bash(git pull:*), Bash(git fetch:*), Bash(git symbolic-ref:*), Bash(git log:*), Bash(git push origin --delete:*), Bash(gh pr:*), Bash(gh auth:*)
---

# PR Merged — Limpeza pós-merge

Este comando **não recebe argumento**. Branch padrão: `.claude/workflows/git-flow.md`.

## Passo 1 — Validar

1. `git branch --show-current` → `<head>`; descubra `<base>` (branch padrão).
2. `<head>` == `<base>` → não há branch de PR atual. Pare e informe; para
   limpar outra branch, o humano deve trocar para ela antes.
3. `git status --porcelain`: mudança **rastreada** pendente → pare e peça ao
   humano para commitar ou guardar (`git stash`). Arquivos `??` não bloqueiam.

## Passo 2 — Confirmar que o PR foi mergeado

```
gh pr list --head <head> --state merged --json number,url,mergedAt
```

- Vazio → verifique `--state open`: PR ainda aberto ou inexistente → **pare**
  ("PR não mergeado — nada removido"). Nunca delete branch não mergeada.
- Sem `gh` autenticado → peça confirmação humana explícita de que o PR foi
  mergeado antes de seguir.

## Passo 3 — Voltar e atualizar

```
git switch <base>
git pull --ff-only
```

`pull` falhou (divergência) → pare e relate; não use merge/rebase/reset.

## Passo 4 — Remover a branch

1. Local: `git branch -d <head>`. Se recusar (squash/rebase merge deixa a
   branch "não mergeada" para o git), como o Passo 2 já confirmou o merge pelo
   PR, use `git branch -D <head>` — só para essa branch.
2. Remota: se `git ls-remote --heads origin <head>` ainda listar a branch
   (o GitHub pode já ter apagado no merge), `git push origin --delete <head>`
   (pede confirmação). `git fetch --prune` ao final.

## Passo 5 — Confirmar

```
✅ Em <base>, atualizada (<hash curto>)
🗑 Removida: <head> (local, remota ou "remota já apagada")
⏭ Próxima: /spec, /retomar ou /checkpoint
```

## Regras

- Nunca apague `<base>`, nem branch cujo PR não esteja confirmado como mergeado.
- Nunca `--force`, `reset --hard` nem `checkout --`.
