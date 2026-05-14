# Agent Context

Este repositório usa `.ai-core/` como contexto persistente para agentes de IA.
Carregue os arquivos correspondentes ao seu papel antes de escrever qualquer código.

---

## Papel: PLANNER
- `.ai-core/context/architecture.md`
- `.ai-core/context/product.md`
- `.ai-core/workflows/feature-delivery.md`
- `.ai-core/agents/planner.agent.md`

## Papel: FRONTEND
- `.ai-core/context/conventions.md`
- `.ai-core/context/ui-guidelines.md`
- `.ai-core/decisions/frontend.md`
- `.ai-core/agents/frontend.agent.md`

## Papel: BACKEND
- `.ai-core/context/conventions.md`
- `.ai-core/decisions/backend.md`
- `.ai-core/agents/backend.agent.md`

## Papel: REVIEWER
- `.ai-core/agents/reviewer.agent.md`
- `decisions/frontend.md` ou `decisions/backend.md` conforme o PR

## Sob demanda (não carregar por padrão)
- `.ai-core/GLOSSARY.md` — termos do domínio
- `.ai-core/context/product.md` — regras de negócio
- `.ai-core/workflows/review-process.md`
- `.ai-core/workflows/release-process.md`

---

## Regras que se aplicam a todos os papéis
1. TypeScript `strict: true` — sem `any`
2. Nenhum segredo no código — apenas variáveis de ambiente
3. Toda entrada de usuário é validada
4. Testes para toda lógica não-trivial
5. Sem breaking changes em contratos de API — versionar ou adicionar
6. Em dúvida: declare a ambiguidade, não assuma

---

## Estrutura do monorepo
```
apps/web      → Next.js 14+ (App Router)
apps/api      → NestJS
packages/ui   → Componentes compartilhados
packages/config, types, utils
```
