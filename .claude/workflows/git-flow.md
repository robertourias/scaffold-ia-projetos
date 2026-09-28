# Fluxo git do harness

Regra única de branch, stage e commit usada por `/spec`, `/approve`,
`/hands-on`, `/back`, `/front` e `/recheck`. Os comandos citam este arquivo
em vez de repetir as regras.

## Branch padrão

`main` se existir; senão `master`. Com remoto, prefira
`git symbolic-ref --short refs/remotes/origin/HEAD` (sem o prefixo `origin/`).

## Branch da Spec

`spec/<slug>` — `<slug>` é o nome do arquivo da Spec sem a data
`YYYY-MM-DD-` e sem `.md`.
Exemplo: `docs/specs/2026-10-01-login-social.md` → `spec/login-social`.

## Stage explícito

**Nunca** `git add -A`, `git add .` nem `git commit -a`. Faça stage só de:

- arquivos declarados em `Arquivos:` das tarefas envolvidas;
- arquivos que os implementadores reportaram como criados/alterados;
- a própria Spec e, quando alterados, o backlog de origem e
  `docs/context/current-state.md`.

Arquivo não rastreado fora dessa lista nunca é adicionado.

## Mensagens

Conventional Commits:

| Momento | Mensagem |
|---|---|
| `/spec` gerou a Spec | `docs(spec): <título> (review)` |
| `/approve` | `docs(spec): aprova <slug>` |
| Onda do `/hands-on` | `<tipo>(<escopo>): <slug> — onda N (T1, T2)` |
| Spec concluída (`/hands-on`, `/back`, `/front`, `/recheck`) | `docs(spec): conclui <slug>` |
| `/back` ou `/front` avulso | `<tipo>(<escopo>): <resumo>` |

- `<tipo>`: `feat` por padrão; `fix`, `refactor` ou `chore` quando **todas** as tarefas envolvidas tiverem esse `Tipo:`.
- `<escopo>`: app/package (`api`, `web`, `ui`...); em Modo `single`, omita: `feat: <...>`.
- Corpo, quando houver Spec: `Spec: <caminho>` e `Cobre: FR-001, FR-002`.

## Push e PR

`git push` e `gh pr create` só com confirmação humana (ficam em `ask` nas
permissões). PR: base = branch padrão, head = `spec/<slug>`. Sem `gh`
instalado/autenticado, imprima o comando para o humano rodar.

## Working tree

Antes de começar um fluxo que commita, rode `git status --porcelain`:

- mudança **rastreada** pendente (linhas que não começam com `??`) → pare e
  peça ao humano para commitar ou guardar (`git stash`) antes;
- arquivos **não rastreados** (`??`) não bloqueiam e nunca são tocados.
