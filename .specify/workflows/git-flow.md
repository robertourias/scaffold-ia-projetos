# Fluxo git do harness

Regra única de branch, stage e commit usada por todos os comandos
`jarvis-*` que commitam (`/jarvis-constitution`, `/jarvis-specify`,
`/jarvis-clarify`, `/jarvis-plan`, `/jarvis-tasks`,
`/jarvis-implement`, `/jarvis-converge` e `/jarvis-fix`). Os comandos
citam este arquivo em vez de repetir as regras. `/jarvis-analyze` e
`/jarvis-review` são somente leitura: não fazem stage nem commit.

## Commit só com confirmação

**Nenhum commit sem perguntar.** Antes de cada `git commit` — inclusive o
commit de cada onda do `/jarvis-implement` e os `wip` no modo `--worktree` —
o comando mostra a mensagem e a lista exata de arquivos e pergunta
**"Posso commitar?"**. Sem um sim explícito, não commita: as mudanças ficam no
working tree e o comando diz o que ficou pendente (no `/jarvis-implement`,
a execução para na onda não commitada).

A regra tem duas camadas: a pergunta, nas skills, e a trava do harness — o
`.claude/settings.example.json` põe `Bash(git commit:*)` em `permissions.ask`
e nenhuma skill pré-aprova `git commit` em `allowed-tools`, então o Claude Code
também pede a permissão. Em modo `bypassPermissions` só a primeira camada vale.

## Branch padrão

`main` se existir; senão `master`. Com remoto, prefira
`git symbolic-ref --short refs/remotes/origin/HEAD` (sem o prefixo `origin/`).

## Branch da Spec

`spec/NNN-slug` — o mesmo nome da pasta `specs/NNN-slug/` (NNN = 3 dígitos
sequenciais, ignorando `specs/bugs/` e `specs/legacy/`). Criada pelo
`/jarvis-specify` a partir da branch padrão e registrada em `ativo.branch` de
`.specify/state.json`.
Exemplo: pasta specs/005-cadastro-login → branch spec/005-cadastro-login.

O `/jarvis-fix` não cria branch: commita no branch atual.

## Stage explícito

**Nunca** `git add -A`, `git add .` nem `git commit -a`. Faça stage só de:

- arquivos declarados em `Arquivos:` das tarefas envolvidas;
- arquivos que os implementadores reportaram como criados/alterados;
- os artefatos da Spec (`spec.md`, `plan.md`, `tasks.md`, `review.md`,
  `checklists/`, `contracts/`) e, quando alterados,
  `.specify/memory/product-backlog.md`, `.specify/memory/decisions.md` e
  `.specify/state.json`.

Arquivo não rastreado fora dessa lista nunca é adicionado.

Nunca `--no-verify` (bloqueado em `permissions.deny`).

## Mensagens

Conventional Commits:

| Momento | Mensagem |
|---|---|
| `/jarvis-constitution` — criação | `docs(constitution): criação` |
| `/jarvis-constitution` — emenda | `docs(constitution): emenda vX.Y.Z` |
| `/jarvis-constitution` — migração da 1.x | `docs(constitution): migração 1.x` |
| `/jarvis-specify` gerou a Spec | `docs(spec): <título> (review)` |
| `/jarvis-clarify` | `docs(spec): clarifica NNN-slug` |
| `/jarvis-plan` | `docs(spec): planeja NNN-slug` |
| `/jarvis-tasks` | `docs(spec): tarefas de NNN-slug` |
| Onda do `/jarvis-implement` | `<tipo>(<escopo>): NNN-slug — onda N (T001, T002)` |
| Correções da review final (`/jarvis-implement`) | `fix(<escopo>): NNN-slug — review final` |
| `/jarvis-implement` com notas/Pendências sem commit | `docs(spec): notas de review NNN-slug` |
| `/jarvis-converge` — ajuste manual do humano fora dos artefatos | `fix(<escopo>): <slug> — pendência manual` |
| `/jarvis-converge` — lacunas viraram tarefas | `docs(spec): converge NNN-slug — lacunas (Tnnn…)` |
| `/jarvis-converge` — Spec concluída | `docs(spec): conclui NNN-slug` |
| `/jarvis-fix` | `fix(<escopo>): <slug>` |

- `<tipo>`: `feat` por padrão; `fix`, `refactor` ou `chore` quando **todas** as tarefas envolvidas tiverem esse `Tipo:`.
- `<escopo>`: app/package (`api`, `web`, `ui`...); em Modo `single`, omita: `feat: <...>`.
- Corpo, quando houver Spec: `Spec: specs/NNN-slug` e `Cobre: FR-001, FR-002`. No `/jarvis-fix`: `Bug: specs/bugs/NNN-slug.md`.

## Push e PR

`git push` e `gh pr create` só com confirmação humana (ficam em `ask` nas
permissões). O PR é o passo final do `/jarvis-implement`: base = branch
padrão, head = `spec/NNN-slug`. Sem `gh` instalado/autenticado, imprima o
comando para o humano rodar.

Depois do merge (manual, sem comando dedicado):

```bash
git switch <branch-padrão> && git pull --ff-only && git branch -d spec/NNN-slug
```

## Working tree

Antes de começar um fluxo que commita, rode `git status --porcelain`:

- mudança **rastreada** pendente em arquivo que o próprio fluxo vai
  commitar (os artefatos da Spec tratada, o backlog,
  `.specify/state.json`) → **não bloqueia**; essa mudança entra no commit do
  próprio fluxo. Cobre, por exemplo, o `/jarvis-implement` quando o humano
  editou a Spec durante a review, e o `spec.md` aprovado, o backlog e o `state.json` que o
  `/jarvis-implement` (Passo 3) e o `/jarvis-converge` (passo 1) gravam
  antes do guard — inclusive numa execução anterior interrompida.
- qualquer outra mudança **rastreada** pendente (linhas que não começam com
  `??`, fora dos arquivos acima) → pare e peça ao humano para commitar ou
  guardar (`git stash`) antes;
- arquivos **não rastreados** (`??`) não bloqueiam e nunca são tocados.
