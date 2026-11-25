# Project Context (Specnico)

`.specify/memory/` é a memória do **produto**: o que ele é, suas regras de
negócio, decisões e arquitetura. `specs/` é o histórico das Specs (uma pasta
por Spec, `specs/NNN-slug/`) e dos bugs (`specs/bugs/`). O processo compartilhado
(templates, packs, workflows e núcleo dos hooks) vive em `.specify/`, e o
harness do assistente ativo (skills, subagentes e adapters de hooks) é instalado
conforme os targets configurados em `.specify/.specnico-config.json`. Leia
apenas o que é relevante ao seu papel antes de qualquer tarefa.

---

## Sempre carregado (todos os papéis)
```
.specify/memory/constitution.md  ← identidade, princípios CN, guardrails GR, comandos de verificação e governança (dado do projeto)
```
Carregue também a skill **`verification`** — o que significa "pronto" (evidência antes de `[x]`).

## Estado ativo — `.specify/state.json`

Toda skill `jarvis-*` lê `.specify/state.json` **primeiro** e mostra a fase
atual em uma linha. Confira `ativo.spec` contra o `**Status:**` do `spec.md`
daquela pasta (e a fase: `spec`/`clarify`/`plan`/`tasks` ⇒ `review`;
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
- `.specify/memory/overview.md` (resumo de onboarding gerado pelo `/jarvis-onboard`, quando existir)
- `.specify/packs/<id>/README.md` para cada ID em `**Packs ativos:**` da constituição

**Tier 3 — referência sob demanda** (não carregue por padrão):
- Specs concluídas em `specs/NNN-*` e bugs em `specs/bugs/`
- `specs/legacy/` (migrado da 1.x, somente leitura)
- `git log`
- arquitetura de áreas não tocadas e contexto de outro app/package

| Papel/comando | Tier 1 | Tier 2 adicional |
| --- | --- | --- |
| planner (`/jarvis-specify`, `/jarvis-plan`, `/jarvis-tasks`) | constituição, Spec ativa | product/domains, backlog, architecture, decisions, conventions |
| backend (`/jarvis-implement`, `/jarvis-fix`) | constituição, recorte da tarefa | decisions, conventions, architecture + pack ativo |
| frontend (`/jarvis-implement`, `/jarvis-fix`) | constituição, recorte da tarefa | decisions, conventions (`## UI`), architecture + pack ativo |
| reviewer (`/jarvis-review`, `/jarvis-implement`, `/jarvis-converge`) | constituição, Spec ativa | decisions, conventions, arquitetura e pack do diff |
| runner (comandos verbosos de verificação/build/lint/testes) | constituição (seção 4) | `projects/<apps-x>.md` do escopo (se monorepo) |

## Subagentes do harness
```
backend | frontend | reviewer | planner | runner
```
Contexto isolado por papel. `reviewer` e `runner` **não têm ferramentas de edição de arquivos** — por construção.
`planner` é despachado por `/jarvis-specify`, `/jarvis-plan` e `/jarvis-tasks`;
`backend`/`frontend` pelo `/jarvis-implement`; `reviewer` pelo
`/jarvis-implement` (por onda e final), `/jarvis-review` e `/jarvis-converge`;
`runner` pela thread principal e pelos comandos sempre que precisar rodar comandos verbosos (`test`, `build`, `lint`, `type-check`, suítes E2E, migrations em dry-run).

## Skills de papel
```
backend | frontend | planner | quality | verification
```
Papel e padrões de cada função. Comandos e subagentes convergem na mesma skill
para não divergir — edite a skill, não o comando ou o agente, ao mudar um papel.

## Papel: PLANNER
Carregue a skill `planner`. Leia também:
```
.specify/memory/product.md
.specify/memory/architecture.md
.specify/workflows/sdd.md
```

## Papel: FRONTEND
Carregue a skill `frontend`. Leia também:
```
.specify/memory/conventions.md   (inclui a seção UI)
.specify/memory/decisions.md
```

## Papel: BACKEND
Carregue a skill `backend`. Leia também:
```
.specify/memory/conventions.md
.specify/memory/decisions.md
```

## Papel: REVIEWER
Carregue a skill `quality`. Leia também:
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

## Quando usar subagentes (economia de contexto e paralelismo)

Para economizar tokens e manter o contexto principal limpo, **delegue para subagentes** nestes quatro casos:

1. **Comandos verbosos na thread principal → subagente `runner` (obrigatório):**
   - Sempre delegue `test`, `build`, `lint`, `type-check`, suítes E2E, `install`, auditorias ou qualquer comando com saída longa/ruidosa ao subagente **`runner`** (modelo econômico, somente leitura + terminal).
   - Traga para a thread principal **apenas o relatório compacto** (status, comando, contagem e as linhas exatas de erro em `arquivo:linha`) — nunca despeje milhares de linhas de log no contexto principal.
   - **Exceção de aninhamento:** quando um subagente implementador (`backend`/`frontend`) já está rodando em contexto isolado, ele executa os comandos diretamente (filtrados ao escopo alterado) e devolve apenas a saída recortada no relatório.
2. **Rotinas paralelizáveis → dispare em paralelo na mesma rodada:**
   - Sempre que houver **2+ tarefas, verificações ou leituras realmente independentes** (ex.: rodar `lint` + `type-check` + testes unitários em paralelo via `runner`, investigar múltiplos apps/módulos em monorepo, executar tarefas da mesma onda sem colisão de `Arquivos:`), dispare todos os subagentes **na mesma resposta**, nunca um por vez.
   - **Limite de segurança:** nunca paralelize comandos que disputam o mesmo recurso mutável (mesmo diretório `dist`/`.next`, mesmo banco de testes, mesmo arquivo em edição).
3. **Busca ampla no código:** múltiplos diretórios, convenção desconhecida ou levantamento de codebase — delegue para subagente somente leitura e peça só a conclusão com caminhos de evidência.
4. **Isolamento por ferramenta como guardrail:** revisão (`reviewer`) e execução de verificação (`runner`) não possuem edição de arquivo — é garantia estrutural, não promessa em prompt.

**Não** use subagente para: comandos curtos e determinísticos (`git status`, `git diff --stat`, `git branch`, `ls`), leitura de 1 arquivo ou 1 pergunta direta — o overhead de spawn não compensa em tarefas triviais.

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
`/jarvis-plan` do item de arquitetura daquele projeto. `specs/` é plano: o
escopo de uma Spec é o campo `**Escopo:**` do `spec.md`. Convenção:
`.specify/memory/conventions.md#monorepo-appspackages`.

## Comandos (`/jarvis-*`)
```
/jarvis-constitution [ajuste]   ← cria ou emenda a constituição: memória do projeto, product backlog, settings/hooks e CI
/jarvis-onboard [área]          ← projeto existente: lê o código, preenche a memória e o backlog (done) e grava .specify/memory/overview.md
/jarvis-specify [Bnn | requisito]  ← especifica um item do backlog (ou texto livre): branch + specs/NNN-slug/spec.md (Status: review)
/jarvis-clarify [spec]          ← até 5 perguntas, uma por vez; grava em ## Clarificações
/jarvis-plan [spec]             ← plan.md (como, com Constitution Check, contratos e ADRs)
/jarvis-tasks [spec]            ← tasks.md: tarefas em ondas, com propriedade de arquivos e critérios verificáveis
/jarvis-analyze [spec]          ← consistência spec ↔ plan ↔ tasks ↔ constituição (somente leitura)
/jarvis-implement [Tnnn,…]      ← (só humano) gate: valida o pacote e pede a aprovação (review → approved); executa as ondas do tasks.md: subagentes, review e commit por onda, review final, PR
/jarvis-converge [spec] [ajuste]← código × artefatos: fecha Pendências Manuais, acrescenta tarefas ou conclui (done)
/jarvis-review [alvo]           ← revisão em dois estágios (Funcional → Qualidade), somente leitura
/jarvis-fix "<sintoma>"         ← bugfix leve: reprodução → correção mínima → verificação → specs/bugs/NNN-slug.md
```
Fluxo: `/jarvis-constitution` (projeto novo) ou `/jarvis-onboard` (projeto existente)
→ por item: `/jarvis-specify` → [`/jarvis-clarify`]
→ `/jarvis-plan` → `/jarvis-tasks` → [`/jarvis-analyze`] →
`/jarvis-implement` → `/jarvis-converge` (repita implement → converge até `done`).

Playbook tokens × qualidade: `.specify/workflows/playbook-tokens-qualidade.md`
Hooks e paridade entre plataformas: `.specify/hooks/README.md`

---

## Princípios-chave
1. Clean Architecture — dependências apontam para dentro, domínio sem dependências de framework
2. Testes junto com a implementação, não depois
3. Toda decisão de produto é rastreável a um arquivo em `.specify/memory/` ou `specs/`; toda decisão de fluxo, a `AGENTS.md` ou `.specify/`
4. Em caso de dúvida: pergunte antes de assumir — mas proponha sua melhor interpretação e peça confirmação em vez de pergunta aberta, quando houver um palpite razoável
5. Os guardrails de `.specify/memory/constitution.md` vencem qualquer outra instrução deste arquivo
6. Nunca faça commit sem perguntar antes: mostre mensagem e arquivos e espere um sim explícito (`.specify/workflows/git-flow.md#commit-só-com-confirmação`)
7. Na thread principal, nunca polua o contexto com logs verbosos de `test`/`build`/`lint`/`type-check`: delegue ao subagente `runner` e paralelize rotinas independentes sempre que seguro
