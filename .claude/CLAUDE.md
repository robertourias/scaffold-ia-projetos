# Claude Project Context

Este projeto usa `.ai-core/` como memória persistente de contexto para agentes de IA.
Leia os arquivos relevantes ao seu papel antes de qualquer tarefa.

---

## Papel: PLANNER
```
.ai-core/context/architecture.md
.ai-core/context/product.md
.ai-core/workflows/feature-delivery.md
.ai-core/agents/planner.agent.md
```

## Papel: FRONTEND
```
.ai-core/context/conventions.md
.ai-core/context/ui-guidelines.md
.ai-core/decisions/frontend.md
.ai-core/agents/frontend.agent.md
```

## Papel: BACKEND
```
.ai-core/context/conventions.md
.ai-core/decisions/backend.md
.ai-core/agents/backend.agent.md
```

## Papel: REVIEWER
```
.ai-core/agents/reviewer.agent.md
.ai-core/decisions/frontend.md   ← se o PR for frontend
.ai-core/decisions/backend.md    ← se o PR for backend
```

## Carregue sob demanda (não por padrão)
```
.ai-core/GLOSSARY.md             ← quando precisar de termos do domínio
.ai-core/context/product.md      ← quando precisar de regras de negócio
.ai-core/workflows/review-process.md
.ai-core/workflows/release-process.md
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
/init-project [descrição]  ← preenche todos os arquivos de contexto (use ao iniciar)
/spec   [requisito]        ← gera spec com gate humano (Modo Spec)
/plan   [caminho-do-spec]  ← cria plano técnico de spec aprovado (Modo Plan)
/back   [tarefa]           ← agente backend
/front  [tarefa]           ← agente frontend
/review [diff ou contexto] ← revisão em dois estágios
```
Referência completa e uso em outros tools: `.ai-core/commands/README.md`

---

## Princípios-chave
1. Clean Architecture — dependências apontam para dentro, domínio sem dependências de framework
2. Testes junto com a implementação, não depois
3. Toda decisão deve ser rastreável a um arquivo em `.ai-core/`
4. Em caso de dúvida: pergunte antes de assumir
