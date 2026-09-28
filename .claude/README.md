# `.claude/` — o harness

Este diretório é o harness inteiro: comandos, subagentes, skills de papel,
hooks de verificação, templates e workflows. `docs/` guarda só o conteúdo do
**produto** (regras de negócio, arquitetura, especificações). Ver a árvore
completa e a divisão de responsabilidade no [`README.md`](../README.md) da raiz.

Este é o **scaffold Claude Code apenas** — não há camada agnóstica de
ferramenta nem cópia paralela para outros assistentes.

## Estrutura

```
.claude/
  CLAUDE.md              ← carregado automaticamente em toda sessão
  README.md               ← este arquivo
  settings.example.json  ← guardrails de permissão + hooks (copie para settings.json)
  commands/               ← slash commands (fonte única, sem indireção)
  agents/                 ← subagentes por papel (contexto isolado)
  skills/                 ← skills de papel, formato padrão .claude/skills/<nome>/SKILL.md
  hooks/                  ← verificação automática (PreToolUse, PostToolUse, Stop)
  workflows/              ← processos de várias fases (carregados sob demanda)
    git-flow.md            ← branch, stage e commit do fluxo (spec/<slug>, ondas, PR)
  templates/              ← spec-template.md
    ci/verify.yml          ← template de CI instalado pelo /init-project (Bloco 6d)
```

## Comandos (`commands/`)

```
init-project.md  ← inicializa o projeto: detecta o modo (single | monorepo | microfrontends) e preenche o contexto global
init-app.md      ← (monorepo) cria apps/<nome>, docs locais e conduz o questionário de configuração
init-package.md  ← (monorepo) cria packages/<nome>, docs locais e conduz o questionário de configuração
backlog.md       ← gera product backlog com tarefas numeradas (TASK01, TASK02...)
retomar.md       ← retoma o último histórico salvo (sem parâmetro)
checkpoint.md    ← grava resumo da sessão no log do projeto (sem parâmetro)
groom.md         ← refina uma nova feature isolada adicionando-a ao backlog sem reprocessá-lo inteiro
back.md          ← agente backend (suporta escopo e agrupamento/batching de tarefas)
front.md         ← agente frontend (suporta escopo e agrupamento/batching de tarefas)
spec.md          ← planner em Modo de Planejamento Unificado (gera regras + tarefas técnicas)
hands-on.md      ← orquestrador: executa o Plano de Implementação da Spec em ondas (paralelo)
review.md        ← reviewer em dois estágios (suporta escopo)
recheck.md       ← rechecagem pós-ajuste manual: fecha Pendências Manuais de uma Spec ou lista o que falta
```

Cada arquivo **é** o slash command — sem wrapper, sem `@` apontando para outro
diretório. O conteúdo compartilhado entre um comando e o subagente equivalente
(`back.md` / `agents/backend.md`) vive numa skill própria em `skills/`, não
duplicado nos dois.

### Anatomia de um comando

```markdown
---
description: "Uma linha. Aspas obrigatórias se contiver `:`, senão o YAML quebra
              e a descrição vira o corpo do arquivo."
argument-hint: "[apps/<app>] <tarefa>"
allowed-tools: Read, Grep, Glob, Bash(git diff:*)
model: claude-haiku-4-5-20251001
---

<prompt completo aqui, sem indireção>
```

| Campo | Por quê |
|-------|---------|
| `description` | aparece na lista de comandos e orienta a invocação |
| `argument-hint` | autocomplete do argumento |
| `allowed-tools` | **guardrail executável** — `/review` e `/retomar` são somente leitura por construção, não por promessa no prompt |
| `model` | comandos de leitura/resumo rodam em modelo barato |

## Sintaxe de escopo

Os comandos `back`, `front`, `spec` e `review` suportam um **escopo opcional** como primeiro argumento. Quando informado, o agente carrega o contexto específico do app ou package além do contexto global — e salva o que gerar em `docs/$SCOPE/`, um subdiretório de `docs/` na raiz (nunca dentro de `apps/<app>/` ou `packages/<pkg>/`). Sem escopo, os comandos inferem do contexto atual (`.claude/workflows/context-resolution.md`).

Isso existe para separar dois níveis de documentação num monorepo, sem misturar documentação com código-fonte: `docs/` na raiz, sem subpasta de escopo, guarda o que é do **monorepo inteiro** (produto, decisões cross-cutting, infra, lista de apps/packages em `docs/architecture/overview.md`); `docs/$SCOPE/` (ex: `docs/apps/api/`) guarda o que é local a **um** app/package (suas próprias decisões e specs) — mas sempre dentro de `docs/` na raiz. Convenção completa: [`docs/context/conventions.md`](../docs/context/conventions.md#documentação-em-monorepo-appspackages).

```
/comando [apps/<app> | packages/<pkg>] tarefa
```

**Com escopo** — lê `docs/$SCOPE/context/` além do global, salva artefatos em `docs/$SCOPE/`:
```
/front apps/metronome implementar o metrônomo com Web Audio API
/front apps/web-nico.dev.br criar página de projetos
/back apps/api implementar endpoint de criação de pedido
/spec apps/tools nova ferramenta: conversor de unidades
/review apps/challenges [cole o diff aqui]
```

**Sem escopo** — o escopo é inferido do contexto atual (em `single`, sempre `docs/`):
```
/back implementar módulo de autenticação
/front criar componente Button no design system
/spec fluxo de onboarding
/review [cole o diff aqui]
```

## Playbook

Antes de escolher batch vs `/hands-on`, veja:

- [Playbook — tokens × qualidade](workflows/playbook-tokens-qualidade.md) (modos econômico / rigor / emergência)

## Fluxo completo com backlog (recomendado)

```
# 1. Inicializar o projeto
/init-project sistema de gestão de pedidos

# 2. Gerar o backlog do produto
/backlog
  → planner analisa product.md e propõe tarefas TASK01..TASKNN
  → gera docs/context/product-backlog.md
  → em monorepo com $SCOPE (ex: /backlog apps/api), gera docs/apps/api/context/backlog.md

# 3. Especificar Requisitos e Plano (Tudo junto!)
/spec TASK01
  → planner lê a descrição de TASK01 no backlog
  → conduz levantamento (se necessário), gera spec + quebra de tarefas técnicas
  → atualiza backlog: Status → spec-review, link da spec

/approve docs/specs/YYYY-MM-DD-<topic>.md
  → (só humano) valida a Spec e grava Status: review → approved
  → alternativa: editar a linha Status no editor (spec-gate.mjs pede confirmação mesmo assim)

# 4. Implementar
#    Opção A (orquestrado) — executa o plano de tarefas em ondas, paralelizando:
/hands-on docs/specs/YYYY-MM-DD-<topic>.md
#    Opção B (manual) — use batching p/ economizar tokens em tarefas pequenas:
/back implementar use case X, tarefa 1 e 2 da Spec
/front criar página Y, tarefa 3 e 4 da Spec

# 5. Revisar e commitar (git commit é manual — nenhum comando faz isso por você)
/review [diff]
/checkpoint
git commit -m "feat: ..."

# 6. Próxima tarefa do backlog
/spec TASK02
```

## Fluxo típico de uma feature em app específico

```
/spec apps/metronome metrônomo com BPM, beats e timer
  → planner gera docs/apps/metronome/specs/YYYY-MM-DD-metronome.md (Status: review)

/approve docs/apps/metronome/specs/YYYY-MM-DD-metronome.md
  → (só humano) revisa as tarefas e regras, valida e grava Status: review → approved
  → alternativa: editar a linha Status no editor (spec-gate.mjs pede confirmação mesmo assim)

/front apps/metronome implementar controle de BPM da Spec metronome
/front apps/metronome implementar Web Audio API da Spec metronome

/review apps/metronome [cole o diff aqui]

# Ao final, salve o checkpoint e comite
/checkpoint
git commit -m "feat(metronome): ..."
```

## Fluxo típico de uma feature global (monorepo)

```
/spec notificações por email
  → planner gera docs/specs/YYYY-MM-DD-email-notifications.md (Status: review)

/approve docs/specs/YYYY-MM-DD-email-notifications.md
  → (só humano) valida a Spec e grava Status: review → approved
  → alternativa: editar a linha Status no editor (spec-gate.mjs pede confirmação mesmo assim)

/back implementar use case de envio de email da Spec
/front criar página de preferências de notificação da Spec

/review [diff do backend]
/review [diff do frontend]

# Ao final, salve o checkpoint e comite
/checkpoint
git commit -m "feat: ..."
```

## Adicionar um comando novo

1. Crie `.claude/commands/<nome>.md` com frontmatter + prompt completo (sem indireção).
2. Se o comando compartilha papel com um subagente existente, extraia o conteúdo comum para uma skill em `skills/<papel>/SKILL.md` e referencie-a dos dois lados — não duplique.
3. Documente o comando neste arquivo e adicione-o à lista de `.claude/CLAUDE.md`.

## Subagentes (`agents/`)

Os papéis existem também como subagentes: `backend`, `frontend`, `reviewer`,
`planner`. Contexto isolado por papel, e ferramentas como guardrail — o
`reviewer` não tem `Edit`/`Write`.

`/hands-on` despacha `backend` e `frontend` por tarefa (Passo 3). Para tarefa
pequena e avulsa, `/back` e `/front` inline continuam mais baratos.

Cada onda do `/hands-on` passa pelo `reviewer` antes do commit (até 3 rodadas
de correção); a Spec fecha com uma review final sobre o branch inteiro e a
oferta de abrir o PR `spec/<slug>` → branch padrão.

Detalhes: [`.claude/agents/README.md`](agents/README.md).

## Skills (`skills/`)

Formato padrão do Claude Code: `.claude/skills/<nome>/SKILL.md` com
frontmatter `name` + `description`. São o conteúdo de papel compartilhado
entre comando e subagente (`backend`, `frontend`, `planner`, `quality`) mais
`verification` — o que significa "pronto", citado por todos os papéis — e
`approve`, o gate humano da Spec (`disable-model-invocation: true`): não tem
comando nem subagente equivalente, só existe como skill, e só o humano invoca
com `/approve [caminho-da-spec]`.

```
skills/
  backend/SKILL.md       ← papel backend (comando /back e subagente backend)
  frontend/SKILL.md      ← papel frontend (comando /front e subagente frontend)
  planner/SKILL.md       ← papel planner (comando /spec e subagente planner)
  quality/SKILL.md       ← revisão em dois estágios (comando /review e subagente reviewer)
  verification/SKILL.md  ← o que significa "pronto" (citado por todos os papéis)
  approve/SKILL.md       ← gate humano da Spec — só humano, sem comando/subagente equivalente
```

Skills são invocáveis pela ferramenta `Skill` (comandos rodam na thread
principal, que já a tem; subagentes precisam de `Skill` na própria lista de
`tools`). Edite a skill, não o comando nem o agente, para mudar um papel —
evita os dois ficarem dessincronizados.

Para evitar contexto desnecessário, consulte [`context-index.md`](context-index.md):
ele define os tiers mínimos por papel e comando.

Manutenção do pacote: `npm run check` valida packs, docs, EOL e testes. Em um
projeto consumidor, `npx @robertourias/scaffold-ia --check` diagnostica a
versão instalada e alterações locais; use `--upgrade` somente após revisar o
drift reportado.

Para atualizar um projeto em andamento sem perder a documentação mapeada:

```bash
npx --yes @robertourias/scaffold-ia@latest --upgrade
```

Esse comando atualiza `.claude/`, preserva `docs/` e `.claude/settings.json`,
e atualiza `.claude/.scaffold-version`. Não use `--force` para esse caso, pois
ele pode sobrescrever `docs/`. Customizações locais dentro de `.claude/` podem
ser substituídas; confira `git diff -- .claude` antes e depois.

## Packs de stack (`packs/`)

O harness separa processo de tecnologia. O núcleo é composto por comandos,
workflows, hooks e skills de papel; regras de framework ficam em packs opt-in.
Veja [`packs/README.md`](packs/README.md). `/init-project` inspeciona os packs
distribuídos, propõe os compatíveis e registra a escolha em
`docs/architecture/overview.md`. Packs não instalam dependências nem
sobrescrevem decisões do projeto.

## Verificação automática (`hooks/`)

`.claude/hooks/` roda **fora do controle do agente**:

| Hook | Evento | O que roda |
|------|--------|------------|
| `spec-gate.mjs` | `PreToolUse` (antes de editar) | bloqueia código se a Spec ativa estiver `Status: review` |
| `verify-file.mjs` | `PostToolUse` (a cada `Edit`/`Write`) | ESLint no arquivo alterado |
| `verify-project.mjs` | `Stop` (fim do turno) | type-check, se algum `.ts`/`.tsx` mudou |

Falha devolve `exit 2` + `stderr` ao agente, que corrige antes de seguir.
Testes **não** rodam em hook — são o Passo 1 da Finalização de `/back` e
`/front`. Detalhes e invariante de fail-open:
[`.claude/hooks/README.md`](hooks/README.md).

## Guardrails e constituição (dado do projeto, não do harness)

`docs/context/guardrails.md` e `docs/context/constitution.md` são carregados
por **todos** os papéis em **toda** tarefa, mas o conteúdo é específico deste
produto — por isso vivem em `docs/`, não aqui. Guardrails define comandos de
verificação obrigatórios, caminhos protegidos, operações proibidas e o gate
de Spec; constituição define princípios arquiteturais não-negociáveis
(`CN-XXX`). Gerados pelo `/init-project` (Blocos 6 e 7), inclusive em projeto existente.

Em caso de conflito, guardrails vence qualquer outra instrução — inclusive as
deste diretório.
