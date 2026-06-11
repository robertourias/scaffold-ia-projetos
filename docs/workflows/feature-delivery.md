# Feature Delivery Workflow

> Step-by-step process for delivering a new feature from requirement to production. All agents must follow this workflow.

## Overview

```
Requirement → [Fase 0: Spec & Plan] → ⛔ GATE: aprovação humana → Backend → Frontend → Integration → Review → Deploy → Documentation
```

> O gate de aprovação é obrigatório. Nenhuma fase de implementação começa sem uma Spec com `Status: approved` em `docs/specs/`.

## Phase 0: Spec & Planning (Planner Agent)

**Input:** Requisito de produto, user story, ou pedido verbal
**Output:** `docs/specs/YYYY-MM-DD-<topic>.md` com `Status: review` contendo regras de negócio e tarefas técnicas

1. Ler `docs/architecture/overview.md` e `docs/context/product.md`
2. Conduzir levantamento com o solicitante (uma pergunta por vez), se necessário
3. Definir regras de negócio, contratos de API e quebra de tarefas técnicas seguindo `docs/specs/spec-template.md`
4. Salvar o documento consolidado em `docs/specs/YYYY-MM-DD-<nome-do-topico>.md` com status `review`
5. **Parar e aguardar** — informar o caminho do arquivo ao solicitante

**⛔ GATE — Aprovação Humana Obrigatória**

O solicitante deve:
- Revisar a especificação e o plano técnico gerados.
- Corrigir ambiguidades, escopos incorretos ou tarefas faltantes.
- Alterar `Status: review` → `Status: approved` no arquivo.

**Nenhuma fase subsequente começa antes deste gate ser cumprido.**

---

## Phase 1: Backend Implementation (Backend Agent)

**Prerequisite**: API contract and backend tasks defined in the approved Spec.

### Step 1a: Domain & Database
- [ ] Define or update domain entities (`domain/entities/`)
- [ ] Create or update value objects if needed
- [ ] Write migration(s) for schema changes
- [ ] Run migration locally: `npm run migration:run`

### Step 1b: Application Layer
- [ ] Implement use case(s) in `application/use-cases/`
- [ ] Define repository interface in domain layer if new
- [ ] Write unit tests for use cases (mock all dependencies)

### Step 1c: Infrastructure
- [ ] Implement repository in `infrastructure/repositories/`
- [ ] Wire module: providers, imports, exports

### Step 1d: Presentation
- [ ] Create or update controller with DTOs and Swagger decorators
- [ ] Add validation (`class-validator` on all DTOs)
- [ ] Write integration tests against the real HTTP layer

**Gate**: All unit + integration tests pass. `npm run test` is green.

---

## Phase 2: Frontend Implementation (Frontend Agent)

**Prerequisite**: API contract defined and Backend implementation available (or mocked via MSW).

### Step 2a: Data Layer
- [ ] Define TypeScript types for API response shapes
- [ ] Create service/fetch function for the new API calls
- [ ] Set up MSW handler for local development mocking

### Step 2b: Components
- [ ] Build new components following `docs/agents/frontend.agent.md`
- [ ] Apply design tokens from `docs/context/ui-guidelines.md`
- [ ] Handle all states: loading, empty, error, data
- [ ] Write component tests

### Step 2c: Page / Route
- [ ] Create or update Next.js page following `docs/agents/frontend.agent.md` and `docs/context/decisions.md`
- [ ] Set up proper metadata
- [ ] Add `loading.tsx` and `error.tsx` if data-fetching route

**Gate**: All component tests pass. Feature works against MSW mocks.

---

## Phase 3: Integration

- [ ] Point frontend to real backend (remove MSW mock or set flag)
- [ ] Test happy path end-to-end
- [ ] Test error cases end-to-end
- [ ] Verify loading and empty states
- [ ] Check mobile responsiveness (at least 375px and 768px)
- [ ] Check accessibility (keyboard nav, screen reader)

---

## Phase 4: Review (Reviewer Agent)

- [ ] Self-review using `docs/agents/reviewer.agent.md` checklist
- [ ] Open PR with description: what changed, why, how to test
- [ ] Address all BLOCKER and WARNING items
- [ ] Get approval from at least one other agent or team member

**Gate**: No unresolved BLOCKERs. CI passes.

---

## Phase 5: Deploy

Follow `docs/workflows/release-process.md`.

---

## Phase 6: Documentation (pós-merge para `main`)

Execute `/checkpoint` para consolidar o changelog e o estado atual do projeto, em seguida realize o commit manual das alterações de documentação.

Checklist mínimo após cada merge:
- [ ] `docs/features/<feature>.md` criado ou atualizado
- [ ] Mover Specs desta feature concluída para a pasta `docs/archive/` (Arquivamento para economia de tokens)
- [ ] `docs/changelog/YYYY-MM-DD.md` — entrada atualizada com o que foi mergeado
- [ ] `.env.example` atualizado se novas variáveis foram adicionadas

---

## Definition of Done

A feature is done when:
- [ ] All acceptance criteria from the planning phase are met
- [ ] Unit, integration, and (if applicable) E2E tests are passing
- [ ] Code is reviewed and approved
- [ ] Feature is deployed to staging and verified
- [ ] No regressions in existing features
- [ ] `docs/architecture/overview.md` updated if any architectural decision was made
