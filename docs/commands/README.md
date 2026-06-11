# Comandos de Agente

Prompts de ativação para os papéis definidos no `docs/`. Esta pasta é a **fonte canônica** — cada arquivo de comando é agnóstico de ferramenta e pode ser usado com qualquer agente de IA.

## Estrutura

```
docs/commands/
  init-project.md  ← inicializa o projeto preenchendo todos os arquivos de contexto
  backlog.md       ← gera product backlog com tarefas numeradas (TASK01, TASK02...)
  retomar.md       ← reconstrói contexto da sessão anterior para retomar o trabalho
  checkpoint.md    ← salva estado atual e changelog de forma comprimida
  groom.md         ← refina uma nova feature isolada adicionando-a ao backlog sem reprocessá-lo inteiro
  back.md          ← agente backend (suporta escopo e agrupamento/batching de tarefas)
  front.md         ← agente frontend (suporta escopo e agrupamento/batching de tarefas)
  spec.md          ← planner em Modo Spec (suporta escopo e ID de tarefa)
  plan.md          ← planner em Modo Plan (infere escopo do caminho do spec)
  review.md        ← reviewer em dois estágios (suporta escopo)
```

O diretório `.claude/commands/` contém arquivos que referenciam esta pasta — são os adaptadores para o Claude Code (slash commands via `/`). Para outros tools, use os arquivos aqui diretamente.

## Sintaxe de escopo

Os comandos `back`, `front`, `spec`, `review` e `retomar` suportam um **escopo opcional** como primeiro argumento. Quando informado, o agente carrega o contexto específico do app ou package além do contexto global.

```
/comando [apps/<app> | packages/<pkg>] tarefa
```

**Com escopo** — lê `$SCOPE/docs/context/` além do global, salva artefatos em `$SCOPE/docs/`:
```
/front apps/metronome implementar o metrônomo com Web Audio API
/front apps/web-nico.dev.br criar página de projetos
/back apps/api implementar endpoint de criação de pedido
/spec apps/tools nova ferramenta: conversor de unidades
/review apps/challenges [cole o diff aqui]
/retomar apps/metronome
```

**Sem escopo** — trabalha no contexto global do monorepo, salva em `docs/`:
```
/back implementar módulo de autenticação
/front criar componente Button no design system
/spec fluxo de onboarding
/review [cole o diff aqui]
/retomar
```

O comando `plan` infere o escopo automaticamente do caminho do spec:
```
/plan apps/tools/docs/specs/2026-05-30-conversor.md   → salva em apps/tools/docs/plans/
/plan docs/specs/2026-05-30-onboarding.md             → salva em docs/plans/
```

## Como usar

### Claude Code (slash commands)
Disponível automaticamente via `/comando`. O Claude Code lê `.claude/commands/`, que delega para este diretório.

### Cursor / Copilot / outros
Abra o arquivo do comando desejado, copie o conteúdo e cole no chat da ferramenta. Substitua `$ARGUMENTS` pela sua tarefa (incluindo o escopo se necessário).

## Fluxo completo com backlog (recomendado)

```
# 1. Inicializar o projeto
/init-project sistema de gestão de pedidos

# 2. Gerar o backlog do produto
/backlog
  → planner analisa product.md e propõe tarefas TASK01..TASKNN
  → você revisa e aprova
  → gera docs/context/product-backlog.md

# 3. Especificar cada tarefa pelo ID
/spec TASK01
  → planner lê a descrição de TASK01 no backlog
  → conduz levantamento, gera spec draft
  → atualiza backlog: Status → spec-draft, link do spec
  → você edita: Status: draft → Status: approved no spec

# 4. Criar plano técnico
/plan docs/specs/YYYY-MM-DD-<topic>.md

# 5. Implementar (Use Batching para economizar tokens se as tarefas forem pequenas)
/back implementar use case X, tarefa 1 e 2
/front criar página Y, tarefa 3 e 4

# 6. Revisar e commitar
/review [diff]
/checkpoint
git commit -m "feat: ..."

# 7. Próxima tarefa do backlog
/spec TASK02
```

## Fluxo típico de uma feature em app específico

```
/spec apps/metronome metrônomo com BPM, beats e timer
  → planner gera apps/metronome/docs/specs/YYYY-MM-DD-metronome.md (Status: draft)
  → você edita: Status: draft → Status: approved

/plan apps/metronome/docs/specs/YYYY-MM-DD-metronome.md
  → planner gera apps/metronome/docs/plans/YYYY-MM-DD-metronome.md

/front apps/metronome implementar controle de BPM
/front apps/metronome implementar Web Audio API

/review apps/metronome [cole o diff aqui]

# Ao final, salve o checkpoint e comite manualmente no Git
/checkpoint
git commit -m "feat(metronome): ..."
```

## Fluxo típico de uma feature global (monorepo)

```
/spec notificações por email
  → planner gera docs/specs/YYYY-MM-DD-email-notifications.md (Status: draft)
  → você edita: Status: draft → Status: approved

/plan docs/specs/YYYY-MM-DD-email-notifications.md
  → planner gera docs/plans/YYYY-MM-DD-email-notifications.md

/back implementar use case de envio de email
/front criar página de preferências de notificação

/review [diff do backend]
/review [diff do frontend]

# Ao final, salve o checkpoint e comite manualmente no Git
/checkpoint
git commit -m "feat: ..."
```

## Adicionar novos comandos

1. Crie `docs/commands/<nome>.md` com o prompt agnóstico
2. Crie `.claude/commands/<nome>.md` com uma linha de referência:
   ```
   Leia docs/commands/<nome>.md e execute as instruções, substituindo $ARGUMENTS por: $ARGUMENTS
   ```
3. Para outros tools, documente o novo comando neste README
