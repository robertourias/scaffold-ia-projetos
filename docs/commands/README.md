# Comandos de Agente

Prompts de ativação para os papéis definidos no `docs/`. Esta pasta é a **fonte canônica** — cada arquivo de comando é agnóstico de ferramenta e pode ser usado com qualquer agente de IA.

## Estrutura

```
docs/commands/
  init-project.md  ← inicializa o projeto preenchendo todos os arquivos de contexto
  retomar.md       ← reconstrói contexto da sessão anterior para retomar o trabalho
  checkpoint.md    ← salva estado atual em current-state.md antes de encerrar a sessão
  commit.md        ← atualiza docs e faz commit seguindo o protocolo pré-commit
  back.md          ← agente backend (suporta escopo de app)
  front.md         ← agente frontend (suporta escopo de app)
  spec.md          ← planner em Modo Spec (suporta escopo de app)
  plan.md          ← planner em Modo Plan (infere escopo do caminho do spec)
  review.md        ← reviewer em dois estágios (suporta escopo de app)
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

/commit
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

/commit
```

## Adicionar novos comandos

1. Crie `docs/commands/<nome>.md` com o prompt agnóstico
2. Crie `.claude/commands/<nome>.md` com uma linha de referência:
   ```
   Leia docs/commands/<nome>.md e execute as instruções, substituindo $ARGUMENTS por: $ARGUMENTS
   ```
3. Para outros tools, documente o novo comando neste README
