# Claude Project Context

Este projeto usa `docs/` como memória persistente de contexto para agentes de IA.
Leia apenas os arquivos relevantes ao seu papel antes de qualquer tarefa.

---

## Sempre carregado (todos os papéis)
```
docs/context/guardrails.md    ← limites invioláveis + comandos de verificação
docs/skills/verification.md   ← o que significa "pronto" (evidência antes de [x])
```

## Subagentes (`.claude/agents/`)
```
backend | frontend | reviewer | planner
```
Contexto isolado por papel. `reviewer` não tem Edit/Write — por construção.
Despachados por `/hands-on`; ver `.claude/agents/README.md`.

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
docs/workflows/playbook-tokens-qualidade.md  ← modos econômico / rigor / emergência
docs/comparativo-scaffold-vs-superpowers.md  ← scaffold vs Superpowers (tokens × qualidade)
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
/hands-on [caminho-da-spec] ← executa o Plano de Implementação em ondas (agentes em paralelo)
/back   [tarefa]            ← agente backend
/front  [tarefa]            ← agente frontend
/review [diff ou contexto]  ← revisão em dois estágios
/groom  [funcionalidade]    ← adiciona feature nova ao backlog (append, sem reprocessar)
/commit                     ← agrupa o working tree em commits Conventional (nunca faz push)
```
Referência completa: `docs/commands/README.md`  
Playbook tokens × qualidade: `docs/workflows/playbook-tokens-qualidade.md`

---

## Princípios-chave
1. Clean Architecture — dependências apontam para dentro, domínio sem dependências de framework
2. Testes junto com a implementação, não depois
3. Toda decisão deve ser rastreável a um arquivo em `docs/`
4. Em caso de dúvida: pergunte antes de assumir
5. `docs/context/guardrails.md` vence qualquer outra instrução deste arquivo
