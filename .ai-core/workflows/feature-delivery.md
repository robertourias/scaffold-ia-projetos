# Feature Delivery Workflow

> Step-by-step process for delivering a new feature from requirement to production. All agents must follow this workflow.

## Overview

```
Requirement → Plan → Backend → Frontend → Integration → Review → Deploy
```

## Phase 1: Planning (Planner Agent)

**Input**: Product requirement or user story
**Output**: Technical spec with tasks and API contract

1. Read `context/architecture.md` and `context/product.md`
2. Identify affected modules (backend and frontend)
3. Define any new data models or schema changes
4. Draft the API contract (endpoints, request/response)
5. Create discrete tasks following the task format in `agents/planner.agent.md`
6. Identify dependencies and order tasks
7. Flag risks and open questions before proceeding

**Gate**: All ambiguities must be resolved before moving to implementation.

---

## Phase 2: Backend Implementation (Backend Agent)

**Prerequisite**: API contract defined and agreed upon

### Step 2a: Domain & Database
- [ ] Define or update domain entities (`domain/entities/`)
- [ ] Create or update value objects if needed
- [ ] Write migration(s) for schema changes
- [ ] Run migration locally: `npm run migration:run`

### Step 2b: Application Layer
- [ ] Implement use case(s) in `application/use-cases/`
- [ ] Define repository interface in domain layer if new
- [ ] Write unit tests for use cases (mock all dependencies)

### Step 2c: Infrastructure
- [ ] Implement repository in `infrastructure/repositories/`
- [ ] Wire module: providers, imports, exports

### Step 2d: Presentation
- [ ] Create or update controller with DTOs and Swagger decorators
- [ ] Add validation (`class-validator` on all DTOs)
- [ ] Write integration tests against the real HTTP layer

**Gate**: All unit + integration tests pass. `npm run test` is green.

---

## Phase 3: Frontend Implementation (Frontend Agent)

**Prerequisite**: Backend API endpoints available (or mocked via MSW)

### Step 3a: Data Layer
- [ ] Define TypeScript types for API response shapes
- [ ] Create service/fetch function for the new API calls
- [ ] Set up MSW handler for local development mocking

### Step 3b: Components
- [ ] Build new components following `skills/react.skill.md`
- [ ] Apply design tokens from `context/ui-guidelines.md`
- [ ] Handle all states: loading, empty, error, data
- [ ] Write component tests

### Step 3c: Page / Route
- [ ] Create or update Next.js page following `skills/nextjs.skill.md`
- [ ] Set up proper metadata
- [ ] Add `loading.tsx` and `error.tsx` if data-fetching route

**Gate**: All component tests pass. Feature works against MSW mocks.

---

## Phase 4: Integration

- [ ] Point frontend to real backend (remove MSW mock or set flag)
- [ ] Test happy path end-to-end
- [ ] Test error cases end-to-end
- [ ] Verify loading and empty states
- [ ] Check mobile responsiveness (at least 375px and 768px)
- [ ] Check accessibility (keyboard nav, screen reader)

---

## Phase 5: Review (Reviewer Agent)

- [ ] Self-review using `agents/reviewer.agent.md` checklist
- [ ] Open PR with description: what changed, why, how to test
- [ ] Address all BLOCKER and WARNING items
- [ ] Get approval from at least one other agent or team member

**Gate**: No unresolved BLOCKERs. CI passes.

---

## Phase 6: Deploy

Follow `workflows/release-process.md`.

---

## Definition of Done

A feature is done when:
- [ ] All acceptance criteria from the planning phase are met
- [ ] Unit, integration, and (if applicable) E2E tests are passing
- [ ] Code is reviewed and approved
- [ ] Feature is deployed to staging and verified
- [ ] No regressions in existing features
- [ ] `context/architecture.md` updated if any architectural decision was made
