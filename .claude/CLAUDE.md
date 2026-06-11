# Claude Project Context

Este projeto usa `docs/` como memória persistente de contexto para agentes de IA.
Leia apenas os arquivos relevantes ao seu papel antes de qualquer tarefa.

---

## Papel: PLANNER
```
docs/skills/planner.md
docs/context/product.md
docs/architecture/overview.md
docs/workflows/feature-delivery.md
```

## Papel: FRONTEND
```
docs/skills/frontend.md
docs/context/conventions.md
docs/context/ui-guidelines.md
docs/context/decisions.md
```

## Papel: BACKEND
```
docs/skills/backend.md
docs/skills/supabase.md
docs/context/conventions.md
docs/context/decisions.md
```

## Papel: REVIEWER
```
docs/skills/quality.md
docs/context/conventions.md
docs/context/decisions.md
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
/backlog                    ← gera product backlog (TASK01, TASK02...) a partir do product.md
/retomar                    ← reconstrói contexto da sessão anterior
/checkpoint                 ← atualiza docs e salva estado atual
/spec   [TASKXX | requisito]← gera spec + plano técnico (Status: review)
/back   [tarefa]            ← agente backend
/front  [tarefa]            ← agente frontend
/review [diff ou contexto]  ← revisão em dois estágios
```
Referência completa: `docs/commands/README.md`

---

## Princípios-chave
1. Clean Architecture — dependências apontam para dentro, domínio sem dependências de framework
2. Testes junto com a implementação, não depois
3. Toda decisão deve ser rastreável a um arquivo em `docs/`
4. Em caso de dúvida: pergunte antes de assumir
