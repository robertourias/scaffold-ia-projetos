# Claude Project Context

Este projeto usa `docs/` como memória persistente de contexto para agentes de IA.
Leia apenas os arquivos relevantes ao seu papel antes de qualquer tarefa.

---

## Papel: PLANNER
```
docs/context/product.md
docs/architecture/overview.md
docs/skills/architecture.md
docs/agents/planner.agent.md
docs/workflows/feature-delivery.md
```

## Papel: FRONTEND
```
docs/skills/frontend.md
docs/context/conventions.md
docs/context/ui-guidelines.md
docs/context/decisions.md
docs/agents/frontend.agent.md
```

## Papel: BACKEND
```
docs/skills/backend.md
docs/context/conventions.md
docs/context/decisions.md
docs/agents/backend.agent.md
```

## Papel: REVIEWER
```
docs/skills/quality.md
docs/context/conventions.md
docs/context/decisions.md
docs/agents/reviewer.agent.md
```

## Carregue sob demanda (não por padrão)
```
docs/context/current-state.md    ← estado atual do projeto (use /retomar)
docs/context/product.md          ← regras de negócio (se não for PLANNER)
docs/workflows/release-process.md
```

---

## Estrutura do monorepo
```
apps/
  web/        → Next.js (App Router)
  api/        → NestJS
packages/
  ui/         → Biblioteca de componentes compartilhada
  config/     → ESLint, TypeScript, Tailwind configs
  types/      → Tipos TypeScript compartilhados
  utils/      → Funções utilitárias compartilhadas
```

## Slash commands disponíveis
```
/init-project [descrição]   ← preenche todos os arquivos de contexto
/retomar                    ← reconstrói contexto da sessão anterior
/checkpoint                 ← salva estado atual antes de encerrar
/spec   [requisito]         ← gera spec com gate humano (Modo Spec)
/plan   [caminho-do-spec]   ← cria plano técnico de spec aprovado
/back   [tarefa]            ← agente backend
/front  [tarefa]            ← agente frontend
/review [diff ou contexto]  ← revisão em dois estágios
/commit                     ← atualiza docs e faz commit
```
Referência completa: `docs/commands/README.md`

---

## Princípios-chave
1. Clean Architecture — dependências apontam para dentro, domínio sem dependências de framework
2. Testes junto com a implementação, não depois
3. Toda decisão deve ser rastreável a um arquivo em `docs/`
4. Em caso de dúvida: pergunte antes de assumir
