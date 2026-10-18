---
description: "Abre PR da branch atual gerando título e descrição a partir dos commits e do diff. Sem parâmetro"
allowed-tools: Read, Grep, Glob, Write, Bash(git status:*), Bash(git branch:*), Bash(git log:*), Bash(git diff:*), Bash(git symbolic-ref:*), Bash(git rev-parse:*), Bash(git push:*), Bash(gh pr:*), Bash(gh auth:*)
---

# PR Open — Abrir PR da branch atual

Este comando **não recebe argumento**. Regras de branch padrão, mensagens e
confirmação de push/PR: `.claude/workflows/git-flow.md`.

## Passo 1 — Validar

1. `git branch --show-current` → `<head>`. Descubra a branch padrão (`<base>`)
   conforme `git-flow.md` (seção Branch padrão).
2. `<head>` == `<base>` ou detached → pare: "Troque para a branch de trabalho
   antes de abrir o PR."
3. `git status --porcelain`: mudança **rastreada** pendente (linhas que não
   começam com `??`) → pare e peça ao humano para commitar ou guardar. Este
   comando nunca commita nem faz stage.
4. `gh auth status` falhou ou `gh` ausente → siga até o Passo 3 e, no Passo 4,
   imprima os comandos para o humano rodar.
5. `gh pr list --head <head> --state open --json number,url` — PR já aberto
   → informe a URL e pare (se houver commits novos, lembre `git push`).

## Passo 2 — Coletar

```
git log <base>..HEAD --format="%h %s%n%b"
git diff <base>...HEAD --stat
```

Sem commits à frente de `<base>` → pare: "Nada para abrir PR."

Se `<head>` for `spec/<slug>`, leia a Spec correspondente em `docs/specs/`
(ou `docs/archive/`, `docs/$SCOPE/...`) e use seu título, seção 1 (problema) e
FRs.

## Passo 3 — Gerar título e descrição

**Título** (≤ 70 caracteres, Conventional Commits):

- um único commit → use a mensagem dele;
- `spec/<slug>` → título da Spec;
- vários commits → `<tipo>(<escopo>): <resumo do conjunto>`.

**Descrição** (Markdown, em pt-BR, só o que os commits/diff/Spec sustentam —
nunca invente):

```markdown
## Resumo
<1-3 frases: o que muda e por quê>

## Mudanças
- <agrupadas por tema, não commit a commit>

## Verificação
<comandos de verificação do projeto e resultado real, se rodados nesta
sessão; senão "(não executado nesta sessão)">

Spec: <caminho>   ← só se houver
Cobre: FR-001, FR-002   ← só se houver
```

Grave o corpo em `.git/PR_BODY.md` (dentro de `.git`, nunca rastreado).

## Passo 4 — Confirmar e abrir

Exiba título e descrição e peça confirmação humana (push e `gh pr create` ficam
em `ask`). Confirmado:

```
git push -u origin <head>
gh pr create --base <base> --head <head> --title "<título>" --body-file .git/PR_BODY.md
```

Sem `gh` → imprima esses comandos. Nunca `--force`.

## Passo 5 — Confirmar

```
✅ PR aberto: <url>
🌿 <head> → <base>
⏭ Após o merge: /pr-merged
```
