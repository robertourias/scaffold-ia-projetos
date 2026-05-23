# Comandos de Agente

Prompts de ativação para os papéis definidos no `docs/`. Esta pasta é a **fonte canônica** — cada arquivo de comando é agnóstico de ferramenta e pode ser usado com qualquer agente de IA.

## Estrutura

```
docs/commands/
  init-project.md  ← inicializa o projeto preenchendo todos os arquivos de contexto
  retomar.md       ← reconstrói contexto da sessão anterior para retomar o trabalho
  checkpoint.md    ← salva estado atual em current-state.md antes de encerrar a sessão
  commit.md        ← atualiza docs e faz commit seguindo o protocolo pré-commit
  back.md          ← agente backend
  front.md         ← agente frontend
  spec.md          ← planner em Modo Spec (gera spec + aguarda aprovação)
  plan.md          ← planner em Modo Plan (cria plano a partir de spec aprovado)
  review.md        ← reviewer em dois estágios
```

O diretório `.claude/commands/` contém arquivos que referenciam esta pasta — são os adaptadores para o Claude Code (slash commands via `/`). Para outros tools, use os arquivos aqui diretamente.

## Como usar

### Claude Code (slash commands)
Disponível automaticamente via `/comando`. O Claude Code lê `.claude/commands/`, que delega para este diretório.

```
/init-project [descrição do produto]   ← use ao iniciar um projeto novo
/back implementar endpoint de criação de pedido
/front criar página de listagem de pedidos
/spec notificações por email
/plan docs/specs/2026-05-20-email-notifications.md
/review [cole o diff aqui]
/commit
```

### Cursor / Copilot / outros
Abra o arquivo do comando desejado, copie o conteúdo e cole no chat da ferramenta. Substitua `$ARGUMENTS` pela sua tarefa.

## Fluxo típico de uma feature

```
/spec notificações por email
  → planner gera docs/specs/YYYY-MM-DD-email-notifications.md (Status: draft)
  → você edita o arquivo: Status: draft → Status: approved

/plan docs/specs/YYYY-MM-DD-email-notifications.md
  → planner verifica Status: approved e decompõe em tarefas técnicas

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
