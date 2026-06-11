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
  spec.md          ← planner em Modo de Planejamento Unificado (gera regras + tarefas técnicas)
  review.md        ← reviewer em dois estágios (suporta escopo)
```

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
  → gera docs/context/product-backlog.md

# 3. Especificar Requisitos e Plano (Tudo junto!)
/spec TASK01
  → planner lê a descrição de TASK01 no backlog
  → conduz levantamento (se necessário), gera spec + quebra de tarefas técnicas
  → atualiza backlog: Status → spec-review, link da spec
  → você edita: Status: review → Status: approved no documento

# 4. Implementar (Use Batching para economizar tokens se as tarefas forem pequenas)
/back implementar use case X, tarefa 1 e 2 da Spec
/front criar página Y, tarefa 3 e 4 da Spec

# 5. Revisar e commitar
/review [diff]
/checkpoint
git commit -m "feat: ..."

# 6. Próxima tarefa do backlog
/spec TASK02
```

## Fluxo típico de uma feature em app específico

```
/spec apps/metronome metrônomo com BPM, beats e timer
  → planner gera apps/metronome/docs/specs/YYYY-MM-DD-metronome.md (Status: review)
  → você revisa as tarefas e regras, e edita: Status: review → Status: approved

/front apps/metronome implementar controle de BPM da Spec metronome
/front apps/metronome implementar Web Audio API da Spec metronome

/review apps/metronome [cole o diff aqui]

# Ao final, salve o checkpoint e comite manualmente no Git
/checkpoint
git commit -m "feat(metronome): ..."
```

## Fluxo típico de uma feature global (monorepo)

```
/spec notificações por email
  → planner gera docs/specs/YYYY-MM-DD-email-notifications.md (Status: review)
  → você edita: Status: review → Status: approved

/back implementar use case de envio de email da Spec
/front criar página de preferências de notificação da Spec

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
