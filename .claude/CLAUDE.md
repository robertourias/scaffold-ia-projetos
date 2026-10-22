# Claude Project Context

`.specify/memory/` é a memória do **produto**: o que ele é, suas regras de
negócio, decisões e arquitetura. `specs/` é o histórico das Specs (uma pasta
por Spec, `specs/NNN-slug/`) e dos bugs (`specs/bugs/`). `.claude/` é o
**harness** que o Claude Code carrega: comandos (skills `specnico-*`), papéis,
subagentes e hooks; o resto do processo (templates, packs, workflows) vive em
`.specify/`. Leia apenas o que é relevante ao seu papel antes de qualquer
tarefa.

---

## Sempre carregado (todos os papéis)
```
.specify/memory/constitution.md  ← identidade, princípios CN, guardrails GR, comandos de verificação e governança (dado do projeto)
```
Invoque também a skill **`verification`** — o que significa "pronto" (evidência antes de `[x]`).

## Estado ativo — `.specify/state.json`

Toda skill `specnico-*` lê `.specify/state.json` **primeiro** e mostra a fase
atual em uma linha. Confira `ativo.spec` contra o `**Status:**` do `spec.md`
daquela pasta (e a fase: `spec`/`clarify`/`plan` ⇒ `review`;
`approved`/`implement`/`converge` ⇒ `approved`). Divergência (Status
incompatível com a fase, pasta sem `spec.md`, branch ≠ `ativo.branch`) →
avise e corrija o `state.json` só com confirmação. Nunca varra `specs/` para
descobrir o que está ativo. Parâmetro ausente: `.specify/workflows/context-resolution.md`.

## Índice de contexto por tiers

Comece no Tier 1 e suba apenas quando a tarefa exigir decisões ou referência
histórica. Parâmetro ou escopo explícito sempre vence a inferência.

**Tier 1 — execução obrigatória** (antes de alterar código ou artefatos):
- `.specify/memory/constitution.md`
- `.specify/state.json` e os artefatos da Spec ativa (`spec.md`, `plan.md`, `tasks.md`), quando existirem — o implementador recebe só o recorte da sua tarefa
- `.specify/memory/projects/<apps-x>.md` do escopo resolvido (só monorepo)

**Tier 2 — decisões** (quando a tarefa exigir decisão de produto, arquitetura ou convenção):
- `.specify/memory/product.md` (ou `.specify/memory/domains/<dominio>.md`, preferido quando existir)
- `.specify/memory/product-backlog.md`
- `.specify/memory/decisions.md`
- `.specify/memory/conventions.md` (inclui a seção `## UI`)
- `.specify/memory/architecture.md`
- `.specify/packs/<id>/README.md` para cada ID em `**Packs ativos:**` da constituição

**Tier 3 — referência sob demanda** (não carregue por padrão):
- Specs concluídas em `specs/NNN-*` e bugs em `specs/bugs/`
- `specs/legacy/` (migrado da 1.x, somente leitura)
- `git log`
- arquitetura de áreas não tocadas e contexto de outro app/package

| Papel/comando | Tier 1 | Tier 2 adicional |
| --- | --- | --- |
| planner (`/specnico-spec`, `/specnico-plan`) | constituição, Spec ativa | product/domains, backlog, architecture, decisions, conventions |
| backend (`/specnico-implement`, `/specnico-fix`) | constituição, recorte da tarefa | decisions, conventions, architecture + pack ativo |
| frontend (`/specnico-implement`, `/specnico-fix`) | constituição, recorte da tarefa | decisions, conventions (`## UI`), architecture + pack ativo |
| reviewer (`/specnico-review`, `/specnico-implement`, `/specnico-converge`) | constituição, Spec ativa | decisions, conventions, arquitetura e pack do diff |

## Subagentes (`.claude/agents/`)
```
backend | frontend | reviewer | planner
```
Contexto isolado por papel. `reviewer` não tem Edit/Write — por construção.
`planner` é despachado por `/specnico-spec` e `/specnico-plan`;
`backend`/`frontend` pelo `/specnico-implement`; `reviewer` pelo
`/specnico-implement` (por onda e final), `/specnico-review` e
`/specnico-converge`. Ver `.claude/agents/README.md`.

## Skills de papel (`.claude/skills/`)
```
backend | frontend | planner | quality | verification
```
Papel e padrões de cada função. Comandos e subagentes convergem na mesma skill
para não divergir — edite a skill, não o comando ou o agente, ao mudar um papel.

## Papel: PLANNER
Invoque a skill `planner`. Leia também:
```
.specify/memory/product.md
.specify/memory/architecture.md
.specify/workflows/sdd.md
```

## Papel: FRONTEND
Invoque a skill `frontend`. Leia também:
```
.specify/memory/conventions.md   (inclui a seção UI)
.specify/memory/decisions.md
```

## Papel: BACKEND
Invoque a skill `backend`. Leia também:
```
.specify/memory/conventions.md
.specify/memory/decisions.md
```

## Papel: REVIEWER
Invoque a skill `quality`. Leia também:
```
.specify/memory/conventions.md
.specify/memory/decisions.md
```

## Packs de stack (`.specify/packs/`)

O núcleo de processo não presume framework. Packs como `typescript`, `nextjs`,
`nestjs` e `turborepo` fornecem regras de tecnologia opt-in e os passos de
cada camada no fluxo. Leia o campo `**Packs ativos:**` de
`.specify/memory/constitution.md` e carregue apenas os `README.md` dos packs
ativos; em monorepos, acrescente os packs declarados em
`.specify/memory/projects/<apps-x>.md` do escopo. Se não houver pack ativo, não
invente uma stack.

## Quando usar subagentes

Além dos 4 papéis fixos (`backend`/`frontend`/`reviewer`/`planner`, despachados
pelos comandos `specnico-*`), use um subagente genérico (`Task`/`Agent`) quando:

- **2+ tarefas realmente independentes** podem rodar em paralelo — dispare todas na mesma resposta, não uma por vez.
- **Busca ampla no código** (múltiplos diretórios, convenção de nome desconhecida) não vale poluir o contexto principal com dezenas de resultados — delegue e peça só a conclusão.
- **Isolamento por ferramenta é o guardrail** — ex: uma revisão que não pode editar código fica mais segura como subagente sem `Edit`/`Write` do que como instrução "não edite" que o agente pode ignorar.

**Não** use subagente para: 1 arquivo, 1 pergunta direta, ou qualquer tarefa que você resolve mais rápido lendo/editando inline — o overhead de spawn (novo contexto, novo carregamento de skills) não se paga em tarefas pequenas. Na dúvida, prefira inline; suba para subagente só quando o ganho for concreto.

## Carregue sob demanda (não por padrão)
```
.specify/memory/product.md          ← regras de negócio (se não for PLANNER)
.specify/workflows/sdd.md           ← fluxo completo, do requisito ao merge
.specify/workflows/release-process.md
.specify/workflows/context-resolution.md  ← fallback quando um comando não recebe parâmetro
.specify/workflows/playbook-tokens-qualidade.md  ← modos econômico / rigor / emergência
.specify/workflows/git-flow.md  ← branch, stage e commit do fluxo
```

---

## Monorepo
O **Modo** (`single | monorepo | microfrontends`) e a lista de projetos estão
em `## 1. Identidade` de `.specify/memory/constitution.md`. Toda documentação
vive em `.specify/` e `specs/` na raiz — **nunca** dentro de `apps/<app>/` ou
`packages/<pkg>/`. O contexto local de cada app/package fica em
`.specify/memory/projects/<apps-x>.md` (ex: `apps-api.md`), criado pelo
`/specnico-plan` do item de arquitetura daquele projeto. `specs/` é plano: o
escopo de uma Spec é o campo `**Escopo:**` do `spec.md`. Convenção:
`.specify/memory/conventions.md#monorepo-appspackages`.

## Comandos (`/specnico-*`)
```
/specnico-constitution [ajuste]   ← cria ou emenda a constituição: memória do projeto, product backlog, settings.json e CI
/specnico-spec [Bnn | requisito]  ← especifica um item do backlog (ou texto livre): branch + specs/NNN-slug/spec.md (Status: review)
/specnico-clarify [spec]          ← até 5 perguntas, uma por vez; grava em ## Clarificações
/specnico-plan [spec]             ← plan.md (como, com Constitution Check) + tasks.md em ondas
/specnico-analyze [spec]          ← consistência spec ↔ plan ↔ tasks ↔ constituição (somente leitura)
/specnico-approve [spec]          ← (só humano) gate do pacote: análise + checagens, review → approved
/specnico-implement [Tnnn,…]      ← executa as ondas do tasks.md: subagentes, review e commit por onda, review final, PR
/specnico-converge [spec] [ajuste]← código × artefatos: fecha Pendências Manuais, acrescenta tarefas ou conclui (done)
/specnico-review [alvo]           ← revisão em dois estágios (Funcional → Qualidade), somente leitura
/specnico-fix "<sintoma>"         ← bugfix leve: reprodução → correção mínima → verificação → specs/bugs/NNN-slug.md
```
Fluxo: `/specnico-constitution` → por item: `/specnico-spec` → [`/specnico-clarify`]
→ `/specnico-plan` → [`/specnico-analyze`] → `/specnico-approve` →
`/specnico-implement` → `/specnico-converge` (repita implement → converge até `done`).

Referência completa: `.claude/README.md`
Playbook tokens × qualidade: `.specify/workflows/playbook-tokens-qualidade.md`

---

## Princípios-chave
1. Clean Architecture — dependências apontam para dentro, domínio sem dependências de framework
2. Testes junto com a implementação, não depois
3. Toda decisão de produto é rastreável a um arquivo em `.specify/memory/` ou `specs/`; toda decisão de fluxo, a um arquivo em `.claude/` ou `.specify/`
4. Em caso de dúvida: pergunte antes de assumir — mas proponha sua melhor interpretação e peça confirmação em vez de pergunta aberta, quando houver um palpite razoável
5. Os guardrails de `.specify/memory/constitution.md` vencem qualquer outra instrução deste arquivo
