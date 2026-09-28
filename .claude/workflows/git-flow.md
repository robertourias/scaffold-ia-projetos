# Fluxo git do harness

Regra única de branch, stage e commit usada por `/spec`, `/approve`,
`/hands-on`, `/back`, `/front`, `/recheck`, `/checkpoint`, `/groom`,
`/backlog` e `/init-project`. Os comandos citam este arquivo em vez de
repetir as regras.

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

Nunca `--no-verify` (bloqueado em `permissions.deny`).

## Mensagens

Conventional Commits:

| Momento | Mensagem |
|---|---|
| `/spec` gerou a Spec | `docs(spec): <título> (review)` |
| `/approve` | `docs(spec): aprova <slug>` |
| Onda do `/hands-on` | `<tipo>(<escopo>): <slug> — onda N (T1, T2)` |
| Correções da review final (`/hands-on`) | `fix(<escopo>): <slug> — review final` |
| `/hands-on` sem fechar a Spec (Pendência Manual, execução parcial, 🔴 na review final) | `docs(spec): notas de review <slug>` |
| Spec concluída (`/hands-on`, `/back`, `/front`, `/recheck`) | `docs(spec): conclui <slug>` |
| `/back` ou `/front` — trabalho da tarefa | `<tipo>(<escopo>): <resumo>` |
| `/recheck` sem fechar a Spec | `docs(spec): recheck <slug>` |
| `/recheck` — ajuste manual fora da Spec/backlog | `fix(<escopo>): <slug> — pendência manual` |
| `/groom` ou `/backlog` | `docs(backlog): <resumo>` |
| `/init-project` | `docs: inicializa contexto do projeto` |
| `/checkpoint` | `docs(checkpoint): <YYYY-MM-DD>` |

- `<tipo>`: `feat` por padrão; `fix`, `refactor` ou `chore` quando **todas** as tarefas envolvidas tiverem esse `Tipo:`.
- `<escopo>`: app/package (`api`, `web`, `ui`...); em Modo `single`, omita: `feat: <...>`.
- Corpo, quando houver Spec: `Spec: <caminho>` e `Cobre: FR-001, FR-002`.

## Push e PR

`git push` e `gh pr create` só com confirmação humana (ficam em `ask` nas
permissões). PR: base = branch padrão, head = `spec/<slug>`. Sem `gh`
instalado/autenticado, imprima o comando para o humano rodar.

## Working tree

Antes de começar um fluxo que commita, rode `git status --porcelain`:

- mudança **rastreada** pendente em arquivo que o próprio fluxo vai
  commitar (a Spec sendo tratada, o backlog de origem,
  `docs/context/current-state.md`) → **não bloqueia**; essa mudança entra no
  commit do próprio fluxo. Cobre, por exemplo, o `/approve` quando o humano
  editou a Spec durante a review, e o `/groom`/`/backlog` seguido de `/spec`
  sobre o mesmo backlog.
- qualquer outra mudança **rastreada** pendente (linhas que não começam com
  `??`, fora dos arquivos acima) → pare e peça ao humano para commitar ou
  guardar (`git stash`) antes;
- arquivos **não rastreados** (`??`) não bloqueiam e nunca são tocados.
