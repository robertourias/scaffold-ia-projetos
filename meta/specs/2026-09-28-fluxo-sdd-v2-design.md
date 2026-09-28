# Harness: fluxo SDD v2 (sub-projeto B)

**Status:** aguardando revisão
**Data:** 2026-09-28

Parte B de 4 da evolução do harness (A endurecimento ✅ → B fluxo SDD v2 → C
núcleo agnóstico + pacotes de stack → D tokens/manutenção). Depende do A
(`/approve`, `spec-gate.mjs` regras 1 e 2, `meta/tests/`).

## Objetivo

Colocar git, review e ciclo de vida dentro do fluxo spec-driven: cada Spec vive
num branch próprio do `/spec` ao PR, cada onda do `/hands-on` é revisada e
commitada, mudanças numa Spec aprovada ficam registradas, o Status da Spec e do
backlog andam juntos, e o projeto ganha um gate de CI independente da sessão.

## Decisões do usuário

1. Branch nasce no `/spec`; `/approve` e `/hands-on` commitam; `/hands-on` oferece PR no fim.
2. Review por onda + review final dentro do `/hands-on`, loop de correção limitado.
3. Emenda em Spec aprovada: hook pede confirmação e a mudança é registrada em `## Emendas`; Status não volta a `review`.
4. CI: template de workflow que o `/init-project` oferece instalar.
5. `git commit` passa de `ask` para `allow` nas permissões; `push`, `merge`, `rebase` seguem em `ask`.

## Design

### 1. Git no fluxo

**Nomes.** Branch `spec/<slug>`, onde `<slug>` é o nome do arquivo da Spec sem a
data e sem `.md` (ex: `docs/specs/2026-10-01-login-social.md` → `spec/login-social`).
Branch padrão = `main` ou `master` (o que existir; `git symbolic-ref refs/remotes/origin/HEAD` quando houver remoto).

**Stage explícito sempre.** Nenhum comando do harness usa `git add -A`, `git add .`
ou `git commit -a`. Stage = arquivos declarados em `Arquivos:` das tarefas envolvidas
+ arquivos reportados pelos implementadores + a própria Spec (+ backlog/current-state quando alterados).

| Comando | Git |
|---|---|
| `/spec` | No branch padrão → `git switch -c spec/<slug>`. Já em `spec/*` → reaproveita. Em outro branch → pergunta (criar `spec/<slug>` a partir dele, ou ficar). Depois de gerar a Spec: commit `docs(spec): <título> (review)` com Spec + backlog + current-state. |
| `/approve` | Commit `docs(spec): aprova <slug>` com Spec + backlog + current-state. |
| `/hands-on` (início) | Working tree sem mudanças rastreadas pendentes (arquivos não rastreados não bloqueiam e nunca são tocados); se houver mudança rastreada pendente → para e pede para commitar/stash. Se não estiver em `spec/<slug>` e o branch existir → `git switch spec/<slug>`; se não existir → cria a partir do atual e avisa. |
| `/hands-on` (onda) | Depois da review limpa da onda: commit `feat(<escopo>): <slug> — onda N (T1, T2)` com corpo `Spec: <caminho>` e `Cobre: FR-…`. Tipo `fix`/`refactor`/`chore` quando todas as tarefas da onda tiverem esse `Tipo:`. `<escopo>` = app/package, ou omitido em `single`. |
| `/hands-on` (fim) | Commit `docs(spec): conclui <slug>` (Spec `done`, backlog, current-state). Oferece `gh pr create --base <padrão> --head spec/<slug>` com título = título da Spec e corpo gerado (problema, FRs, tabela de verificação com a saída real, Pendências Manuais, notas de review). Sem `gh` → imprime o comando. Push só com confirmação (`ask`). |
| `/back`, `/front` avulsos | Ao concluir: commit `feat|fix(<escopo>): <resumo>` com stage explícito. Se estiverem numa `spec/*`, corpo `Spec: <caminho>`. |
| `/hands-on --worktree` | Branches de tarefa passam a sair de `spec/<slug>` e o merge volta para `spec/<slug>`; mensagem `wip(<task>)` substituída pelo padrão de onda. |

### 2. Loop de review no `/hands-on`

Por onda, depois da verificação dos implementadores passar:

1. Despacha `reviewer` com: caminho da Spec, tarefas da onda, e o diff da onda = `git diff HEAD` + arquivos novos não rastreados declarados nas tarefas (a onda ainda não foi commitada; `HEAD` é a onda anterior).
2. Achados 🔴 BLOCKER / 🟡 WARNING → mapeados à tarefa dona do arquivo (campo `Arquivos:`; arquivo sem dono → tarefa da onda mais próxima pelo diretório, ou escalado). Novo implementador (`backend`/`frontend`, conforme a tarefa) recebe tarefa + achados, corrige, roda a verificação.
3. Re-review escopada: o `reviewer` verifica só os achados abertos + quebra nova no diff da correção.
4. Máximo **3 rodadas** por onda. Estourou → para o `/hands-on`, não commita a onda, reporta ao humano os achados abertos com `arquivo:linha`.
5. 🟢 SUGGESTION / 💡 NOTE → anotados na Spec em `## Notas de Review` (`- [onda N] arquivo:linha — texto`), sem loop.
6. Onda limpa → commit (seção 1).

Review final, depois da última onda: `reviewer` sobre `git diff <merge-base com o padrão>..HEAD` + verificação completa do projeto. Uma rodada de correção (mesma mecânica). Restando 🔴 → Spec não vira `done`; resumo final lista os achados e o PR não é oferecido. 🟡/🟢 restantes → `## Notas de Review` e seguem.

`--serial` e `--dry-run` continuam valendo. Novo `--no-review` pula as reviews por onda (a final continua) e é registrado nas Notas de Review.

### 3. Emendas — regra 3 do `spec-gate.mjs`

Alvo: edição via ferramenta em Spec (mesmo casamento de caminho da regra 1) cujo Status **antes** é `approved`.

1. Calcula texto antes/depois (mesma mecânica da regra 1; se não calculável → fallback: não pede).
2. Normaliza os dois textos removendo:
   - marcação de checkbox (`- [x]` → `- [ ]`);
   - linhas em branco;
   - blocos de Pendência Manual (🟡 abertos ou ✅ resolvidos pelo /recheck) — linha de abertura e as linhas `>` seguintes do mesmo bloco;
   - o conteúdo das seções `## Notas de Review` e `## Emendas`, mesmo numeradas ou com sufixo (ex. `## 9. Emendas`) (até o próximo `## ` ou fim);
   - as linhas `**Status:**`, `**Aprovado por:**`, `**Concluído em:**`.
3. Normalizados diferentes → `ask` com `permissionDecisionReason: "Emenda em Spec aprovada — registre o que mudou e por quê em ## Emendas."`. Iguais → libera.

- A transição `approved → done` não passa pela regra 1 (antes ≠ `review`) e é permitida pela regra 3 (linha de Status é ignorada).
- Template (`.claude/templates/spec-template.md`) ganha ao final as seções vazias `## Notas de Review` e `## Emendas` (formato: `- YYYY-MM-DD — <o que mudou> — <por quê> — <quem>`).
- Skill `verification` e agentes `backend`/`frontend`/`planner`: mudança normativa em Spec aprovada exige entrada em `## Emendas` na mesma edição; se a mudança altera escopo (FR novo/removido), parar e escalar ao humano em vez de emendar.

### 4. Ciclo de Status

| Momento | Spec (`**Status:**`) | TASK no backlog |
|---|---|---|
| `/spec` gera | `review` | `spec-review` |
| `/approve` | `approved` (+ `Aprovado por`) | `spec-approved` |
| `/hands-on` inicia | `approved` | `in-progress` |
| `/hands-on` termina sem Pendência Manual e com review final sem 🔴 | `done` + `**Concluído em:** YYYY-MM-DD` | `done` |
| `/hands-on` termina com Pendência Manual | `approved` | `in-progress` |
| `/recheck` fecha a última pendência | `done` + `Concluído em` | `done` |
| `/back`/`/front` marcam o último critério da Spec sem pendência | `done` + `Concluído em` | `done` |
| `/checkpoint` | arquiva Specs `done` (e, legado, Specs `approved` com todos os critérios `[x]`) | — |

- Backlog de origem: root (`docs/context/product-backlog.md`) para ID sem prefixo, `docs/$SCOPE/context/backlog.md` para ID prefixado (regra existente).
- Spec sem TASK de origem (requisito avulso) → só a Spec muda.
- `docs/specs/README.md` e `docs/archive/README.md` descrevem o ciclo.

### 5. CI

- Novo `.claude/templates/ci/verify.yml` (GitHub Actions):
  - gatilhos: `pull_request` e `push` no branch padrão;
  - `actions/checkout`, `actions/setup-node` (versão de `.nvmrc`/`engines` se houver, senão LTS), `pnpm/action-setup` quando `pnpm-lock.yaml`;
  - instalação pelo lockfile (`npm ci` / `pnpm install --frozen-lockfile` / `yarn install --frozen-lockfile`);
  - um passo por verificação com marcadores `# scaffold:type-check`, `# scaffold:lint`, `# scaffold:test`, `# scaffold:build` e comando placeholder.
- `/init-project` Bloco 6: novo item 6d — substitui cada placeholder pelo comando do `guardrails.md`; verificação `(não configurado)` → remove o passo; pergunta se instala em `.github/workflows/verify.yml` (não sobrescreve arquivo existente sem confirmar).
- Instalação cai em `ask` (`Write(./.github/workflows/**)` já está em `ask`).

### 6. Permissões

`.claude/settings.example.json`: `Bash(git commit:*)` sai de `ask` e entra em `allow`; `Bash(git switch:*)` entra em `allow`. `push`, `merge`, `rebase`, `gh pr` seguem em `ask`. Nenhum `deny` muda.

### 7. Testes e docs

- `meta/tests/hooks.test.mjs`, regra 3:
  - Spec approved + marcar checkbox → sem ask;
  - Spec approved + adicionar bloco de Pendência Manual → sem ask;
  - Spec approved + escrever em `## Notas de Review` ou `## Emendas` → sem ask;
  - Spec approved + `approved → done` com `**Concluído em:**` → sem ask;
  - Spec approved + mudar texto de um FR → ask com o reason de emenda;
  - Spec approved + adicionar tarefa → ask;
  - Spec approved + CRLF só-checkbox → sem ask.
- `meta/tests/lint-docs.mjs` passa (inclui o novo template de CI referenciado).
- README, `.claude/README.md`, `.claude/CLAUDE.md`, `feature-delivery.md`, `playbook-tokens-qualidade.md`: fluxo com branch `spec/<slug>`, commit por onda, loop de review, PR, emendas, ciclo de Status, CI. Diagrama (`meta/assets/fluxo-workflow.mmd` + `.png`) regerado com branch/review por onda/PR.

## Fora de escopo

Minors deixadas do sub-projeto A (vão para o D), review automática do Claude no PR (`claude-code-action`), `.bak` no `--upgrade`, merge automático do PR.

## Verificação

- `node --test "meta/tests/*.test.mjs"` passa (inclui os casos da regra 3).
- `node meta/tests/lint-docs.mjs` e `node meta/tests/check-eol.mjs` saem 0.
- `grep -rnE "git add -A|git add \.|commit -a" .claude` sem instrução de uso (só proibições).
- `.claude/templates/ci/verify.yml` é YAML válido (`npx -y js-yaml .claude/templates/ci/verify.yml` sai 0) e contém os 4 marcadores.
- `npm pack --dry-run` inclui `.claude/templates/ci/verify.yml`.
