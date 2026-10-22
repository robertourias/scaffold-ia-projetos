# `.claude/` — o harness

Este diretório guarda só o que o Claude Code carrega: skills (comandos e
papéis), subagentes, hooks e `CLAUDE.md`. O resto do processo vive em
`.specify/` (templates, packs, workflows) e o dado do projeto em
`.specify/memory/` e `specs/`. Instalação, atualização e uso estão no
[`README.md`](../README.md) da raiz; as instruções que o Claude lê a cada
sessão estão em [`CLAUDE.md`](CLAUDE.md).

Este é o harness do Claude Code apenas, sem camada agnóstica de ferramenta.

## Layout

```
.claude/
  CLAUDE.md                 ← carregado em toda sessão: tiers de contexto, papéis, comandos
  README.md                 ← este arquivo
  settings.example.json     ← permissões + hooks (copie para settings.json)
  skills/
    specnico-*/SKILL.md     ← os 10 comandos de fluxo
    backend/ frontend/ planner/ quality/ verification/   ← papéis (sem prefixo)
  agents/                   ← backend, frontend, reviewer, planner (contexto isolado)
  hooks/                    ← spec-gate.mjs, verify-file.mjs, verify-project.mjs

.specify/
  memory/                   ← dado do projeto: constitution, product, product-backlog,
                              architecture, conventions, decisions, domains/, projects/
  templates/                ← spec, plan, tasks, checklist, bug, constitution, backlog, ci/verify.yml
  packs/                    ← typescript, nextjs, nestjs, turborepo
  workflows/                ← sdd, git-flow, context-resolution, release-process, playbook
  state.json                ← Spec ativa e fase (dado do projeto)

specs/
  NNN-slug/                 ← spec.md, plan.md, tasks.md, review.md, checklists/, contracts/
  bugs/  legacy/            ← registros do /specnico-fix; Specs migradas da 1.x
```

`.specify/memory/`, `specs/` e `state.json` são **dado do projeto**: o CLI só cria,
nunca sobrescreve. O restante é harness e o `--upgrade` o atualiza.

## Comandos (`skills/specnico-*`)

Cada comando é uma skill. Todos leem `.specify/state.json` primeiro, mostram a
fase atual em uma linha e terminam com `Próximo:`. Edite a skill para mudar o
comportamento; a skill de papel que ela invoca é a fonte única do papel.

| Skill | Entrada | Saída | Muda |
|---|---|---|---|
| `specnico-constitution` | ajuste opcional (re-executar = emenda; projeto migrado da 1.x = migração) | `constitution.md`, `product.md`, `architecture.md`, `conventions.md`, `decisions.md`, `product-backlog.md`, `settings.json`, CI | `state.json` |
| `specnico-spec` | `Bnn` ou texto livre | branch `spec/NNN-slug`, `spec.md`, `checklists/requirements.md` | spec `review`, backlog `spec`, fase `spec` |
| `specnico-clarify` | Spec ativa ou indicada | até 5 perguntas, uma por vez; `## Clarificações` | fase `clarify` |
| `specnico-plan` | Spec ativa ou indicada | `plan.md` (Constitution Check), `tasks.md` em ondas, `contracts/`, ADRs em `decisions.md` | fase `plan` |
| `specnico-analyze` | Spec ativa ou indicada | relatório de consistência com severidade (somente leitura) | nada |
| `specnico-approve` | Spec ativa ou indicada | aprovação do pacote spec + plan + tasks (só humano, `disable-model-invocation`) | spec `approved`, backlog `approved`, fase `approved` |
| `specnico-implement` | vazio (todas as ondas), `Tnnn[,Tnnn]`, `NNN`/`NNN-slug`/`specs/NNN-slug`, `--dry-run`, `--serial`, `--worktree`, `--no-review` | código, commit por onda, `review.md`, PR oferecido | backlog `in-progress`, fase `implement` |
| `specnico-converge` | Spec e ajuste opcional | fecha Pendências Manuais; tarefas novas em `## Convergência`; ou conclusão | com lacunas: fase `converge`; sem lacunas: spec `done`, backlog `done`, `ativo: null` |
| `specnico-review` | alvo opcional | parecer em dois estágios (Funcional → Qualidade), somente leitura | nada |
| `specnico-fix` | sintoma entre aspas | teste que falha, correção mínima, `specs/bugs/NNN-slug.md` | nada (sem Spec) |

Fluxo: `/specnico-constitution` → por item: `/specnico-spec` →
[`/specnico-clarify`] → `/specnico-plan` → [`/specnico-analyze`] →
`/specnico-approve` → `/specnico-implement` → `/specnico-converge` (repita
implement → converge até `done`).

### Ciclo de vida do Status

| Momento | `spec.md` | Backlog | `state.json` (`ativo.fase`) |
|---|---|---|---|
| `/specnico-spec` | `review` | `spec` | `spec` |
| `/specnico-clarify` | `review` | `spec` | `clarify` |
| `/specnico-plan` | `review` | `spec` | `plan` |
| `/specnico-approve` | `approved` | `approved` | `approved` |
| `/specnico-implement` | `approved` | `in-progress` | `implement` |
| `/specnico-converge` com lacunas | `approved` | `in-progress` | `converge` |
| `/specnico-converge` sem lacunas | `done` | `done` | `ativo: null` |

O `Status` da Spec existe só no `spec.md`. O `state.json` é conferido contra ele
no início de cada comando; divergência é avisada e só corrigida com sua
confirmação.

## Papéis e subagentes

As skills de papel (`backend`, `frontend`, `planner`, `quality`, `verification`)
definem padrões agnósticos de stack; a stack vem dos packs ativos na
constituição. Os subagentes dão contexto isolado por papel:

| Subagente | Despachado por | Observação |
|---|---|---|
| `planner` | `/specnico-spec`, `/specnico-plan` | nunca aprova: a Spec fica em `review` |
| `backend`, `frontend` | `/specnico-implement` | uma tarefa por subagente; roda a verificação antes de marcar `[x]` |
| `reviewer` | `/specnico-implement` (por onda e final), `/specnico-review`, `/specnico-converge` | sem `Edit`/`Write`, por construção |

Use um subagente genérico só para tarefas independentes em paralelo, buscas
amplas no código ou quando o isolamento por ferramenta é o guardrail. Detalhes
em [`agents/README.md`](agents/README.md).

## Contexto por tiers

O índice vive em [`CLAUDE.md`](CLAUDE.md): **Tier 1** (constituição, `state.json`
e artefatos da Spec ativa) antes de alterar código; **Tier 2** (produto,
backlog, decisões, convenções, arquitetura, packs) quando a tarefa exige
decisão; **Tier 3** (Specs concluídas, `bugs/`, `legacy/`, `git log`) sob
demanda. O implementador recebe só o recorte da sua tarefa.

## Hooks

Ligados por `settings.json` (copiado de `settings.example.json` pelo
`/specnico-constitution`):

| Hook | Evento | Efeito |
|---|---|---|
| `spec-gate.mjs` | `PreToolUse` | `ask` ao autoaprovar uma Spec ou emendar `spec.md`/`plan.md` aprovados; bloqueia os `Arquivos:` do `tasks.md` da Spec ativa em `review` |
| `verify-file.mjs` | `PostToolUse` | ESLint no arquivo editado |
| `verify-project.mjs` | `Stop` | type-check se algum `.ts`/`.tsx` mudou |

Falham em aberto. Desligar: `SPECNICO_VERIFY=0` (alias legado
`SCAFFOLD_VERIFY=0`). Regras, contrato e limites conhecidos em
[`hooks/README.md`](hooks/README.md).

## Packs de stack

`.specify/packs/<id>/` traz regras opt-in de tecnologia (`typescript`, `nextjs`,
`nestjs`, `turborepo`). Os packs ativos ficam no campo `**Packs ativos:**` da
constituição; os comandos carregam apenas o `README.md` dos ativos. Sem pack, o
harness não presume framework. Contrato em
[`.specify/packs/README.md`](../.specify/packs/README.md).

## Monorepo

O **Modo** (`single | monorepo | microfrontends`) e os projetos estão em
`## 1. Identidade` da constituição. `specs/` é plano: o escopo de uma Spec é o
campo `**Escopo:**` do `spec.md` (`raiz`, `apps/api` ou lista). O contexto
local de cada app/package fica em `.specify/memory/projects/<apps-x>.md`, criado
pelo `/specnico-plan` do item de arquitetura daquele projeto. Nunca há
documentação dentro de `apps/<app>/` ou `packages/<pkg>/`.

## Modelo de persistência

- **Specs são flow-forward.** Uma Spec `done` não é reescrita nem arquivada: a
  pasta `specs/NNN-slug/` é o histórico. Como o `state.json` diz o que está
  ativo, agentes nunca varrem `specs/`.
- **Features como documentação viva.** O índice de features do
  `product-backlog.md` (`F-<SIGLA>`, `planejada` → `live`) é reescrito pelo
  `/specnico-converge` quando todos os itens da feature ficam `done`.
- **Decisões** ficam em `decisions.md`; o histórico do trabalho, no `git log`.
- **Nada de estado duplicado:** fase em `state.json`, Status em `spec.md`,
  progresso nos checkboxes do `tasks.md`.

## Adicionar um comando novo

1. Crie `skills/specnico-<nome>/SKILL.md` com frontmatter (`name`, `description`;
   descriptions com `: ` vão entre aspas).
2. Faça o comando ler o `state.json` primeiro e terminar com `Próximo:`.
3. Se muda fase ou Status, atualize a tabela de ciclo de vida acima e em
   `specs/README.md`.
4. Registre o comando em `CLAUDE.md` e rode `node meta/tests/lint-docs.mjs`
   (verifica que todo `/specnico-*` citado existe).
5. Nunca instrua `git add -A`, `git add .` ou `git commit -a`: stage só caminhos
   explícitos.
