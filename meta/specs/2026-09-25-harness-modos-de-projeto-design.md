# Harness: modos de projeto (single | monorepo | microfrontends)

**Status:** implementado

## Objetivo
O scaffold atende três modos de projeto. Comandos do harness passam a operar
conforme o modo e o contexto atual, sem depender de parâmetros obrigatórios.

## Requisitos (do usuário)
- `/init-project`: só inicialização + detecção de estrutura (única ou monorepo Turborepo; microfrontends Module Federation como terceiro modo).
- `/init-app <nome>` e `/init-package <nome>` (novos): só em monorepo; nome como parâmetro, depois questionário de configuração inicial.
- `/checkpoint` e `/retomar`: sem parâmetro. Checkpoint guarda resumo (log do projeto); retomar recupera o último histórico.
- Comandos com parâmetro: se ausente/não reconhecido, atuar conforme o contexto atual do projeto.
- Remover `.claude/prompts/` (conteúdo apagado, sem substituto).

## Premissas
1. `$SCOPE` sai dos args de `checkpoint`/`retomar`; é inferido do contexto e registrado no log.
2. Modo gravado por `/init-project` em `docs/architecture/overview.md` (`**Modo:** single | monorepo | microfrontends`); fonte única lida por todos os comandos.
3. Entrevista de stack por app/package migra de `/init-project` para `/init-app`/`/init-package`.

## Design

### 1. Campo Modo
`docs/architecture/overview.md` ganha `**Modo:**`. Detecção em `/init-project`: `turbo.json`, `apps/`, `packages/`, dependências `@module-federation/*`; sempre confirmada com o usuário.

### 2. `/init-project [descrição]`
- Blocos globais mantidos: produto, guardrails, constituição, convenções, README, `.claude/settings.json`.
- `single`: preenche também stack (Blocos 2-4 atuais).
- `monorepo`/`microfrontends`: preenche só stack compartilhada (CI/CD, hospedagem, banco); stack por unidade vai para init-app/init-package. Microfrontends adiciona: host/remotes, libs compartilhadas, versionamento de contrato.
- Remove sincronização manual de "Estrutura do monorepo" em `.claude/CLAUDE.md`; a seção passa a ser gerada a partir do modo.

### 3. `/init-app <nome>` e `/init-package <nome>`
- Recusam em `single` (orienta rodar `/init-project`). Sem nome → perguntam.
- Criam `apps/<nome>` / `packages/<nome>` só se não existirem (pasta vazia; sem geração de código) e sempre `docs/apps|packages/<nome>/{README.md,context/decisions.md,specs/,archive/}`.
- Questionário init-app: tipo (web/api/mobile/host/remote), framework, ORM/auth/estilo conforme tipo, porta, comandos de verificação.
- Questionário init-package: tipo (ui/config/types/utils), consumidores, build (tsup/tsc), exports.
- Registram linha em "Projetos do Monorepo" no overview.

### 4. `/checkpoint` e `/retomar` sem argumento
- `checkpoint`: append em `docs/changelog/YYYY-MM-DD.md` + reescreve `current-state.md`. Escopo inferido de `git status`/commits; entrada prefixada por app/package. Arquivamento de specs mantido. Remove referência ao prompt retroativo no Passo 2.5.
- `retomar`: lê `current-state.md` + último changelog + git log; somente leitura; agrupa por app/package quando houver.

### 5. Comandos com parâmetro
Alvo: `spec`, `back`, `front`, `review`, `recheck`, `hands-on`, `groom`, `backlog`. Bloco padrão "Resolução de contexto": parâmetro ausente/não reconhecido → `Modo` + `current-state.md` (spec ativo, escopo em progresso) + `git status`; se ainda ambíguo, propõe palpite e pede confirmação. Em `single`, `$SCOPE` não existe.

### 6. Limpeza
Apagar `.claude/prompts/`; ajustar `README.md`, `.claude/README.md`, `.claude/CLAUDE.md` (lista de comandos), `docs/context/conventions.md` (linha 73, referência a prompts/upgrade-harness).

## Fora de escopo
Geração de código/scaffold real de apps; migração automática de harness antigo.

## Verificação
- `grep -r "prompts/"` (fora de `.git` e deste spec) sem resultados.
- `checkpoint.md`/`retomar.md` sem `$ARGUMENTS`/`argument-hint`.
- `init-app.md` e `init-package.md` existem com frontmatter válido; README e `.claude/CLAUDE.md` listam ambos.
- Todos os comandos do item 5 contêm o bloco "Resolução de contexto".
