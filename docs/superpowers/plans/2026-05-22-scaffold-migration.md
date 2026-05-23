# Scaffold Migration: .ai-core/ → docs/ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Renomear `.ai-core/` para `docs/`, criar `docs/skills/` com comportamentos reutilizáveis, reescrever `docs/agents/` para definir apenas papel, consolidar decisions, e atualizar todas as referências.

**Architecture:** Migração de estrutura de diretórios + reescrita de conteúdo. Nenhum código de aplicação é afetado — apenas arquivos de contexto de agente. Commits frequentes por grupo lógico de mudanças.

**Tech Stack:** Git (mv + rm), PowerShell, Markdown

---

## File Map

### Migrados (git mv)
- `.ai-core/context/product.md` → `docs/context/product.md`
- `.ai-core/context/conventions.md` → `docs/context/conventions.md`
- `.ai-core/context/ui-guidelines.md` → `docs/context/ui-guidelines.md`
- `.ai-core/STATUS.md` → `docs/context/current-state.md`
- `.ai-core/specs/spec-template.md` → `docs/specs/spec-template.md`
- `.ai-core/workflows/feature-delivery.md` → `docs/workflows/feature-delivery.md`
- `.ai-core/workflows/release-process.md` → `docs/workflows/release-process.md`
- `.ai-core/commands/README.md` → `docs/commands/README.md`
- `.ai-core/commands/init-project.md` → `docs/commands/init-project.md`
- `.ai-core/commands/retomar.md` → `docs/commands/retomar.md`
- `.ai-core/commands/checkpoint.md` → `docs/commands/checkpoint.md`
- `.ai-core/commands/spec.md` → `docs/commands/spec.md`
- `.ai-core/commands/plan.md` → `docs/commands/plan.md`
- `.ai-core/commands/back.md` → `docs/commands/back.md`
- `.ai-core/commands/front.md` → `docs/commands/front.md`
- `.ai-core/commands/review.md` → `docs/commands/review.md`
- `.ai-core/agents/planner.agent.md` → `docs/agents/planner.agent.md`

### Reescritos (conteúdo novo em novo local)
- `docs/agents/backend.agent.md` (de `.ai-core/agents/backend.agent.md`)
- `docs/agents/frontend.agent.md` (de `.ai-core/agents/frontend.agent.md`)
- `docs/agents/reviewer.agent.md` (de `.ai-core/agents/reviewer.agent.md`)
- `docs/context/decisions.md` (consolida `decisions/frontend.md` + `decisions/backend.md`)
- `docs/context/conventions.md` (update do protocolo pré-commit)
- `docs/architecture/overview.md` (de `context/architecture.md`, enxugado)

### Criados do zero
- `docs/skills/backend.md`
- `docs/skills/frontend.md`
- `docs/skills/quality.md`
- `docs/skills/architecture.md`
- `docs/architecture/backend.md`
- `docs/architecture/frontend.md`
- `docs/architecture/infra.md`
- `docs/changelog/2026-05-22.md`
- `docs/changelog/releases.md`
- `docs/commands/commit.md`
- `AGENTS.md` (raiz)

### Atualizados (paths internos)
- `.claude/CLAUDE.md`
- `.claude/commands/back.md`, `front.md`, `spec.md`, `plan.md`, `review.md`, `init-project.md`, `checkpoint.md`, `retomar.md`
- `docs/commands/back.md`, `front.md`, `spec.md`, `review.md`, `checkpoint.md`, `retomar.md`, `init-project.md`
- `docs/workflows/feature-delivery.md`
- `docs/agents/planner.agent.md`

### Removidos
- `.ai-core/` (inteiro, após migração completa)

---

## Task 1: Migrar estrutura de diretórios com git mv

**Files:**
- Create dirs: `docs/context/`, `docs/specs/`, `docs/agents/`, `docs/workflows/`, `docs/commands/`
- git mv: todos os arquivos listados em "Migrados" acima

- [ ] **Step 1: Criar subdiretórios de docs/**

```powershell
New-Item -ItemType Directory -Force -Path docs\context, docs\specs, docs\agents, docs\workflows, docs\commands, docs\skills, docs\architecture, docs\changelog
```

Esperado: diretórios criados sem erro.

- [ ] **Step 2: git mv dos arquivos de context/**

```bash
git mv .ai-core/context/product.md docs/context/product.md
git mv .ai-core/context/conventions.md docs/context/conventions.md
git mv .ai-core/context/ui-guidelines.md docs/context/ui-guidelines.md
git mv .ai-core/STATUS.md docs/context/current-state.md
```

- [ ] **Step 3: git mv de specs/ e agents/**

```bash
git mv .ai-core/specs/spec-template.md docs/specs/spec-template.md
git mv .ai-core/agents/planner.agent.md docs/agents/planner.agent.md
```

- [ ] **Step 4: git mv de workflows/**

```bash
git mv .ai-core/workflows/feature-delivery.md docs/workflows/feature-delivery.md
git mv .ai-core/workflows/release-process.md docs/workflows/release-process.md
```

- [ ] **Step 5: git mv de commands/**

```bash
git mv .ai-core/commands/README.md docs/commands/README.md
git mv .ai-core/commands/init-project.md docs/commands/init-project.md
git mv .ai-core/commands/retomar.md docs/commands/retomar.md
git mv .ai-core/commands/checkpoint.md docs/commands/checkpoint.md
git mv .ai-core/commands/spec.md docs/commands/spec.md
git mv .ai-core/commands/plan.md docs/commands/plan.md
git mv .ai-core/commands/back.md docs/commands/back.md
git mv .ai-core/commands/front.md docs/commands/front.md
git mv .ai-core/commands/review.md docs/commands/review.md
```

- [ ] **Step 6: Verificar estrutura migrada**

```bash
git status --short | head -30
```

Esperado: linhas `R  .ai-core/... -> docs/...` para cada arquivo movido.

- [ ] **Step 7: Commit da migração de estrutura**

```bash
git commit -m "chore: migrate .ai-core/ structure to docs/"
```

---

## Task 2: Criar docs/skills/backend.md

**Files:**
- Create: `docs/skills/backend.md`

- [ ] **Step 1: Criar o arquivo**

Conteúdo de `docs/skills/backend.md`:

```markdown
# Skill: Backend

Padrões técnicos para implementação de backend. Carregue junto com `docs/agents/backend.agent.md`.

## Camadas (sem exceções)

```
Controller / Resolver   → boundary HTTP apenas, zero lógica
Use Cases / Services    → regras de negócio, sem imports de framework
Domain Entities         → zero dependências de framework
Infrastructure          → ORM, APIs externas, implementações
```

## Código

- Tipos de retorno explícitos em métodos públicos
- Controllers delegam imediatamente — zero lógica de negócio
- Services retornam DTOs — nunca entidades brutas
- Todo endpoint público tem decorators Swagger
- `process.env` apenas via `ConfigService` — nunca diretamente em services

## Validação

- `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` global
- `class-validator` em todos os DTOs de entrada
- Apenas queries parametrizadas — sem interpolação de string em SQL

## Segurança

- Senhas com bcrypt (cost ≥ 12) — nunca armazenar plaintext
- JWT: access token 15min, refresh token 7d em cookie `httpOnly Secure SameSite=Strict`
- Rate limiting em todos os endpoints de autenticação
- Autorização verificada no service (ownership), não só no guard
- Nenhum segredo no código — tudo via variáveis de ambiente

## Banco de dados

- Migration para toda mudança de schema — sem `synchronize: true` em produção
- Sem queries N+1 — usar eager loading ou DataLoader
- Transações para escritas em múltiplas tabelas
- Paginação em todos os endpoints de listagem

## Decisões deste projeto

- DI baseado em tokens: `{ provide: IUsersRepository, useClass: TypeOrmUsersRepository }`
- Entidades de domínio: classes TypeScript puras — zero imports NestJS na camada de domínio
- REST com Swagger (`@nestjs/swagger`), versionamento via `/api/v1/`
- Filtro global de exceções — shape consistente de resposta de erro
- Log com contexto: `this.logger.error('msg', { entityId, error })`
- Operações pesadas (email, PDF, imagem) vão para fila — nunca bloqueiam HTTP

## Testes

- Unit: mockar todas as dependências via interface
- Integration: camada HTTP real com banco de teste
- Cobertura mínima: use cases 90%, controllers 80%, repos 60%
```

- [ ] **Step 2: Verificar arquivo criado**

```bash
git diff --stat
```

Esperado: `docs/skills/backend.md` listado como novo arquivo.

---

## Task 3: Criar docs/skills/frontend.md

**Files:**
- Create: `docs/skills/frontend.md`

- [ ] **Step 1: Criar o arquivo**

Conteúdo de `docs/skills/frontend.md`:

```markdown
# Skill: Frontend

Padrões técnicos para implementação de frontend. Carregue junto com `docs/agents/frontend.agent.md`.

## TypeScript

- Props sempre tipadas com interface explícita
- Sem `!` (non-null assertion) sem comentário justificando
- Named exports preferred — default exports apenas para pages e layouts Next.js

## Componentes

- Apenas componentes funcionais — sem class components
- Um componente por arquivo, nome igual ao arquivo
- Nenhuma lógica de negócio em componentes — extrair para hooks
- Sem estilos inline exceto valores dinâmicos
- Sem importar de `app/` dentro de componentes compartilhados
- Sem `console.log` no código commitado

## Estrutura de arquivos

```
features/[nome]/
  components/     ← componentes do feature
  hooks/          ← lógica extraída
  services/       ← chamadas de API
  index.ts        ← barrel export público
```

Testes co-locados: `UserCard.tsx` → `UserCard.test.tsx`

## Hierarquia de estado

`useState` → `useReducer` → Context → store externo (justificar se chegar aqui)

## Renderização (Next.js App Router)

- Server Components por padrão; `'use client'` apenas para interatividade ou browser APIs
- Server Actions para mutações internas — não API routes
- Dados em Server Components sempre que possível — evitar `useEffect` para fetch

## Performance

- `next/image` para todas as imagens (com `width` e `height` explícitos)
- `next/font` para fontes — sem `@import` em CSS
- LCP < 2.5s, CLS < 0.1, TBT < 200ms
- Bundle por rota < 150kB gzipped
- Rodar `npm run analyze` antes de adicionar dependência > 10kB

## Acessibilidade

- Todo elemento interativo: navegável por teclado + ARIA label quando necessário
- `dangerouslySetInnerHTML` apenas com sanitização (DOMPurify)
- WCAG 2.1 AA

## Testes

- React Testing Library — testar comportamento, não implementação
- Cobrir: happy path, estado vazio, estado de erro, interações principais
- Mock na camada de rede (MSW), não dentro dos componentes
- Cobertura mínima: componentes 70%, hooks e utils 90%, fluxos P0 (E2E) 100%
```

---

## Task 4: Criar docs/skills/quality.md

**Files:**
- Create: `docs/skills/quality.md`

- [ ] **Step 1: Criar o arquivo**

Conteúdo de `docs/skills/quality.md`:

```markdown
# Skill: Quality

Critérios de revisão aplicáveis a qualquer agente.

## Severidade

- 🔴 **BLOCKER** — obrigatório corrigir antes do merge (falha de segurança, lógica quebrada, teste crítico faltando)
- 🟡 **WARNING** — deve corrigir (anti-pattern, risco de performance, edge case descoberto)
- 🟢 **SUGGESTION** — melhoria opcional
- 💡 **NOTE** — informativo, sem ação necessária

## Estágio 1 — Funcional

Se houver 🔴 BLOCKER aqui, encerre a revisão. Não passe para o Estágio 2.

- [ ] Atende a todos os requisitos do spec aprovado (ou da task declarada)
- [ ] Lógica de negócio correta — sem inversões de condição, sem side effects não intencionais
- [ ] Segurança: sem secrets hardcoded, sem SQL injection ou XSS, autorização checada no service
- [ ] Testes cobrem happy path e ao menos um caminho de falha
- [ ] Migrations incluídas para toda mudança de schema
- [ ] Auth/authz correto e testado (quando aplicável)
- [ ] Sem regressões em fluxos existentes

## Estágio 2 — Qualidade

Execute apenas após Estágio 1 passar sem BLOCKERs.

**Geral**
- [ ] Sem `any`, sem regras de lint desabilitadas sem justificativa
- [ ] Edge cases tratados (null, vazio, timeout, erro de rede)
- [ ] Naming e estrutura seguem `docs/context/conventions.md`

**Frontend**
- [ ] Sem re-renders desnecessários onde importa
- [ ] Acessibilidade mantida (ARIA, teclado, WCAG 2.1 AA)
- [ ] Impacto no bundle avaliado para imports grandes

**Backend**
- [ ] Zero lógica de negócio em controllers
- [ ] Todos os inputs validados via DTO
- [ ] Sem queries N+1
- [ ] Sem CVEs críticos em dependências novas
- [ ] Operações pesadas enviadas para fila (nunca bloqueiam HTTP)

## Não bloquear por

- Formatação (o linter trata)
- Preferências pessoais de estilo sem impacto objetivo
- Requisitos futuros especulativos fora do escopo

## Formato de saída

```
## Verdict: APPROVED | CHANGES REQUESTED | NEEDS DISCUSSION

### Issues
[🔴/🟡/🟢 arquivo:linha — descrição e sugestão de correção]

### Notes
[💡 observações informativas]
```
```

---

## Task 5: Criar docs/skills/architecture.md

**Files:**
- Create: `docs/skills/architecture.md`

- [ ] **Step 1: Criar o arquivo**

Conteúdo de `docs/skills/architecture.md`:

```markdown
# Skill: Architecture

Padrões arquiteturais do projeto. Carregue ao tomar decisões estruturais ou revisar design de sistema.

## Clean Architecture — Camadas

```
Controller / Resolver   → boundary HTTP apenas
Use Cases / Services    → regras de negócio (sem imports de framework)
Domain Entities         → modelo de domínio puro
Infrastructure          → ORM, APIs externas, cache, fila
```

Dependências apontam para dentro. Domain não conhece Infrastructure.

## Monorepo (Turborepo)

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

## Registrar decisões

Toda decisão arquitetural significativa deve ser adicionada à tabela em `docs/architecture/overview.md` com data e justificativa.

## Checklist para novas features

- [ ] Qual bounded context ela pertence?
- [ ] Quais entidades de domínio são afetadas ou criadas?
- [ ] Há mudança de schema? → migration obrigatória
- [ ] Breaking change em contrato de API existente? → escalate
- [ ] Nova dependência externa? → avaliar alternativas, justificar
```

- [ ] **Step 2: Commit das skills**

```bash
git add docs/skills/
git commit -m "feat: add docs/skills/ with backend, frontend, quality, architecture"
```

---

## Task 6: Reescrever docs/agents/ para definir apenas papel

**Files:**
- Modify: `docs/agents/backend.agent.md`
- Modify: `docs/agents/frontend.agent.md`
- Modify: `docs/agents/reviewer.agent.md`
- Modify: `docs/agents/planner.agent.md`

- [ ] **Step 1: Reescrever docs/agents/backend.agent.md**

Substituir conteúdo completo por:

```markdown
# Agente: Backend

## Papel
Senior backend engineer — NestJS, Node.js, TypeScript. Implementa a API e é responsável por integridade de dados e segurança.

## Leia antes de começar
- `docs/skills/backend.md` — padrões técnicos e regras de implementação
- `docs/context/conventions.md` — convenções do projeto
- `docs/context/decisions.md` — decisões de ORM, auth, banco

## Responsabilidades
- Implementar APIs REST (NestJS)
- Escrever e executar migrations de banco
- Implementar autenticação e autorização
- Escrever testes unitários e de integração

## Escalar imediatamente se
- Breaking changes em contratos de API existentes
- Migrations em tabelas grandes (> 1M registros)
- Mudanças em lógica de auth/autorização
- Nova dependência de serviço externo
```

- [ ] **Step 2: Reescrever docs/agents/frontend.agent.md**

Substituir conteúdo completo por:

```markdown
# Agente: Frontend

## Papel
Senior frontend engineer — React, Next.js, TypeScript. Implementa UI e garante performance e acessibilidade.

## Leia antes de começar
- `docs/skills/frontend.md` — padrões técnicos e regras de implementação
- `docs/context/conventions.md` — convenções do projeto
- `docs/context/ui-guidelines.md` — design system e padrões de componente
- `docs/context/decisions.md` — decisões de estilização, componentes, estado

## Responsabilidades
- Implementar páginas e componentes (Next.js App Router)
- Garantir acessibilidade (WCAG 2.1 AA)
- Otimizar Core Web Vitals e bundle size
- Escrever testes junto com a implementação

## Escalar imediatamente se
- Mudança de biblioteca core (ex: trocar Tailwind, trocar componente library)
- Regressão em fluxo P0
- Impacto de bundle > 50kB em uma rota
```

- [ ] **Step 3: Reescrever docs/agents/reviewer.agent.md**

Substituir conteúdo completo por:

```markdown
# Agente: Reviewer

## Papel
Revisor de código — corretude, segurança, performance e aderência aos padrões.

## Leia antes de começar
- `docs/skills/quality.md` — critérios completos de revisão (checklist + severidade + formato)
- `docs/context/conventions.md` — convenções do projeto
- `docs/context/decisions.md` — decisões frontend e backend (quando aplicável)

## Processo
1. Estágio 1 (Funcional) — se houver 🔴 BLOCKER, encerre e informe. Não passe para o Estágio 2.
2. Estágio 2 (Qualidade) — somente após Estágio 1 limpo.

Checklist completo em `docs/skills/quality.md`.
```

- [ ] **Step 4: Atualizar paths em docs/agents/planner.agent.md**

Substituir todas as ocorrências de `.ai-core/` por `docs/` no arquivo `docs/agents/planner.agent.md`.

Linhas a atualizar (find/replace):
- `.ai-core/specs/` → `docs/specs/`
- `.ai-core/agents/planner.agent.md` → `docs/agents/planner.agent.md`
- `.ai-core/context/architecture.md` → `docs/architecture/overview.md`
- `.ai-core/context/product.md` → `docs/context/product.md`
- `.ai-core/workflows/feature-delivery.md` → `docs/workflows/feature-delivery.md`
- `.ai-core/specs/spec-template.md` → `docs/specs/spec-template.md`

- [ ] **Step 5: Commit dos agents**

```bash
git add docs/agents/
git commit -m "refactor: rewrite agents to define role only, referencing skills"
```

---

## Task 7: Criar docs/context/decisions.md (consolidado)

**Files:**
- Create: `docs/context/decisions.md`

- [ ] **Step 1: Criar o arquivo consolidado**

Conteúdo de `docs/context/decisions.md`:

```markdown
# Decisões do Projeto

Escolhas técnicas que substituem padrões gerais. Separadas por domínio.
Registradas aqui para que agentes não inventem convenções não acordadas.

## Backend

### Arquitetura
- Clean Architecture com limites de camada estritos
- DI baseado em tokens: `{ provide: IUsersRepository, useClass: TypeOrmUsersRepository }`
- Entidades de domínio: classes TypeScript puras — zero imports NestJS
- Exceções de domínio tipadas que estendem as built-ins do NestJS

### ORM e banco
- `synchronize: false` em produção — migrations obrigatórias para toda mudança de schema
- <!-- a definir: ORM específico (TypeORM / Prisma / Drizzle) -->
- <!-- a definir: banco de dados (PostgreSQL / MySQL) -->

### API
- REST com Swagger (`@nestjs/swagger`)
- Versionamento via prefixo: `/api/v1/`
- Paginação cursor-based preferida sobre offset em tabelas grandes

### Erros e logs
- Filtro global de exceções para erros inesperados — shape consistente de resposta
- Log sempre com contexto: `this.logger.error('msg', { entityId, error })`

### Fila
- Operações pesadas (email, PDF, imagem) vão para fila — nunca bloqueiam HTTP
- <!-- a definir: solução de fila (BullMQ / SQS / EventEmitter2) -->

### Auth
- <!-- a definir: solução de autenticação (JWT+Passport / Clerk / Auth0) -->

### Cache
- <!-- a definir: solução de cache (Redis / sem cache) -->

### Testes backend
- Unit: Jest com interfaces de repositório mockadas
- Integration: Supertest contra app NestJS real com banco de teste
- Cobertura mínima: use cases 90%, controllers 80%, repos 60%

---

## Frontend

### Renderização
- App Router (Next.js) — sem Pages Router
- Server Components por padrão; `'use client'` apenas para interatividade ou browser APIs
- Server Actions para mutações internas — não API routes
- Dados em Server Components sempre que possível — evitar `useEffect` para fetch

### Estilização
- <!-- a definir: ex: "Tailwind CSS — sem CSS Modules, sem styled-components" -->

### Componentes
- <!-- a definir: ex: "shadcn/ui sobre Radix UI — sem MUI, sem Chakra" -->

### Estado global
- <!-- a definir: ex: "Zustand — sem Redux, sem Jotai" -->

### Formulários
- <!-- a definir: ex: "React Hook Form + Zod — sem Formik" -->

### Data fetching no cliente
- <!-- a definir: ex: "TanStack Query — sem SWR" -->

### Ícones
- <!-- a definir: ex: "Lucide React" -->

### Testes frontend
- React Testing Library + Jest — sem Enzyme
- MSW para mock de rede — sem mocks manuais de fetch
- Playwright para E2E
- Cobertura mínima: componentes 70%, hooks e utils 90%, fluxos P0 (E2E) 100%
```

- [ ] **Step 2: Commit**

```bash
git add docs/context/decisions.md
git commit -m "feat: add docs/context/decisions.md consolidating frontend and backend decisions"
```

---

## Task 8: Criar docs/architecture/ files

**Files:**
- Create: `docs/architecture/overview.md`
- Create: `docs/architecture/backend.md`
- Create: `docs/architecture/frontend.md`
- Create: `docs/architecture/infra.md`

- [ ] **Step 1: Criar docs/architecture/overview.md**

```markdown
# Visão Arquitetural

> Atualize sempre que uma decisão arquitetural significativa for tomada.

## Sistema

**Produto**: [Nome do produto]
**Status**: [Desenvolvimento inicial / Ativo / Maduro]

## Stack

| Camada | Tecnologia | Notas |
|--------|-----------|-------|
| Frontend | Next.js (App Router) | |
| Backend | NestJS | |
| Monorepo | Turborepo | Builds incrementais, pacotes compartilhados |
| ORM | <!-- a definir --> | |
| Banco | <!-- a definir --> | |
| Auth | <!-- a definir --> | |
| Fila | <!-- a definir --> | |
| Cache | <!-- a definir --> | |

## Fluxo de dados

```
User → Next.js (SSR/RSC) → NestJS API → Database
                         ↘ External Services
```

## Bounded Contexts

<!-- Adicione ao longo do projeto -->
- [Contexto 1]: [Descrição, quais entidades ele possui]

## Decisões registradas

| Decisão | Escolha | Data | Justificativa |
|---------|---------|------|---------------|
| Monorepo | Turborepo | — | Builds incrementais, pacotes compartilhados |
| Backend | NestJS | — | DI, modular, TypeScript-first |
| Frontend | Next.js | — | SSR, RSC, edge-ready |
| Arquitetura | Clean Architecture | — | Domínio testável sem dependência de framework |

## Constraints conhecidos

<!-- Documente débito técnico, limitações ou não-óbvios aqui -->
```

- [ ] **Step 2: Criar docs/architecture/backend.md**

```markdown
# Backend Architecture

> Detalhe aqui as decisões específicas de arquitetura do servidor.

## Módulos NestJS

<!-- Adicione módulos ao longo do projeto -->
| Módulo | Responsabilidade |
|--------|-----------------|
| [Módulo] | [O que ele faz] |

## Domain Entities

<!-- Adicione entidades ao longo do projeto -->
| Entidade | Descrição |
|----------|-----------|
| [Entidade] | [Definição precisa] |

## API Endpoints mapeados

<!-- Adicione ao longo do projeto -->
| Método | Path | Use Case |
|--------|------|----------|
| GET | /api/v1/... | ... |
```

- [ ] **Step 3: Criar docs/architecture/frontend.md**

```markdown
# Frontend Architecture

> Detalhe aqui as decisões específicas de arquitetura do cliente.

## Estrutura de rotas

<!-- Adicione ao longo do projeto -->
| Rota | Componente de página | Descrição |
|------|---------------------|-----------|
| / | HomePage | |

## Features mapeados

<!-- Features no padrão features/[nome]/ -->
| Feature | Componentes principais | Status |
|---------|----------------------|--------|
| [feature] | [lista] | Planejado / Em andamento / Live |
```

- [ ] **Step 4: Criar docs/architecture/infra.md**

```markdown
# Infrastructure

> Ambiente, deploy e dependências externas.

## Ambientes

| Ambiente | URL | Deploy trigger |
|----------|-----|---------------|
| Development | localhost | manual |
| Staging | <!-- a definir --> | push to main |
| Production | <!-- a definir --> | tag release |

## Hosting

- Frontend: <!-- a definir: Vercel / AWS / Railway -->
- Backend: <!-- a definir -->
- Banco: <!-- a definir -->

## CI/CD

<!-- a definir: GitHub Actions / outro -->

## Variáveis de ambiente obrigatórias

| Variável | Descrição | Ambientes |
|----------|-----------|-----------|
| DATABASE_URL | Connection string | staging, prod |
| <!-- a definir --> | | |

## Serviços externos

| Serviço | Propósito | Crítico? |
|---------|-----------|----------|
| <!-- a definir --> | | |
```

- [ ] **Step 5: Commit**

```bash
git add docs/architecture/
git commit -m "feat: add docs/architecture/ with overview, backend, frontend, infra"
```

---

## Task 9: Criar docs/changelog/

**Files:**
- Create: `docs/changelog/2026-05-22.md`
- Create: `docs/changelog/releases.md`

- [ ] **Step 1: Criar docs/changelog/2026-05-22.md**

```markdown
# 2026-05-22

- chore: migração de .ai-core/ para docs/
- feat: adicionado docs/skills/ com backend, frontend, quality, architecture
- feat: adicionado docs/architecture/ com overview, backend, frontend, infra
- feat: adicionado docs/changelog/ com formato baseado em data
- feat: adicionado docs/commands/commit.md
- feat: criado AGENTS.md na raiz para suporte agnóstico de agente
- refactor: agents/ reescritos para definir apenas papel (regras técnicas movidas para skills/)
- refactor: decisions/ consolidado em docs/context/decisions.md
- refactor: context/architecture.md expandido para docs/architecture/ (4 arquivos)
- refactor: STATUS.md renomeado para docs/context/current-state.md
```

- [ ] **Step 2: Criar docs/changelog/releases.md**

```markdown
# Releases

## [Unreleased]

Ver [2026-05-22](2026-05-22.md) para mudanças desta versão.

---

<!--
Formato ao criar uma release:

## [1.0.0] - YYYY-MM-DD

### Added
- feat: ...

### Fixed
- fix: ...

### Changed
- refactor: ...
-->
```

- [ ] **Step 3: Commit**

```bash
git add docs/changelog/
git commit -m "feat: add docs/changelog/ with date-based format"
```

---

## Task 10: Criar docs/commands/commit.md

**Files:**
- Create: `docs/commands/commit.md`

- [ ] **Step 1: Criar o arquivo**

```markdown
# Commit

Execute este protocolo antes de todo commit. Não pule etapas mesmo para commits pequenos.

## Passo 1 — Atualizar estado atual

Atualize `docs/context/current-state.md`:
- O que foi feito nesta sessão
- O que está em progresso
- Próximos passos

## Passo 2 — Atualizar changelog

Adicione entrada em `docs/changelog/YYYY-MM-DD.md` (crie o arquivo se não existir para a data de hoje):

```markdown
# YYYY-MM-DD

- [tipo] descrição do que foi feito
```

Tipos válidos: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`.

## Passo 3 — Atualizar arquitetura (se aplicável)

Se houve decisão arquitetural nova ou mudança de stack, adicione uma linha na tabela "Decisões registradas" em `docs/architecture/overview.md`:

```markdown
| Decisão | Escolha | YYYY-MM-DD | Justificativa |
```

## Passo 4 — Commit

```bash
git add <arquivos-da-feature>
git add docs/context/current-state.md
git add docs/changelog/YYYY-MM-DD.md
# se houve decisão arquitetural:
git add docs/architecture/overview.md
git commit -m "tipo: descrição concisa da mudança"
```

Prefixos Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`

## Regras

- Nunca comite sem atualizar current-state.md e changelog.
- Se não houve nada relevante para o changelog, registre igualmente (ex: "chore: ajuste de configuração").
- Commits devem ter menos de 72 caracteres na primeira linha.
```

- [ ] **Step 2: Commit**

```bash
git add docs/commands/commit.md
git commit -m "feat: add docs/commands/commit.md"
```

---

## Task 11: Criar AGENTS.md na raiz

**Files:**
- Create: `AGENTS.md`

- [ ] **Step 1: Criar o arquivo**

```markdown
# Contexto para Agentes de IA

Este projeto usa `docs/` como memória persistente de contexto.
Leia apenas os arquivos do seu papel antes de qualquer tarefa.

---

## BACKEND

```
docs/skills/backend.md
docs/context/conventions.md
docs/context/decisions.md
docs/agents/backend.agent.md
```

## FRONTEND

```
docs/skills/frontend.md
docs/context/conventions.md
docs/context/ui-guidelines.md
docs/context/decisions.md
docs/agents/frontend.agent.md
```

## PLANNER

```
docs/context/product.md
docs/architecture/overview.md
docs/skills/architecture.md
docs/agents/planner.agent.md
docs/workflows/feature-delivery.md
```

## REVIEWER

```
docs/skills/quality.md
docs/context/conventions.md
docs/context/decisions.md
docs/agents/reviewer.agent.md
```

---

## Carregue sob demanda (não por padrão)

```
docs/context/current-state.md    ← estado atual do projeto (use /retomar)
docs/context/product.md          ← regras de negócio (se não for PLANNER)
docs/workflows/release-process.md
```

---

## Comandos

```
/init-project [descrição]   ← preenche todos os arquivos de contexto
/retomar                    ← reconstrói contexto da sessão anterior
/checkpoint                 ← salva estado antes de encerrar
/spec   [requisito]         ← gera spec com gate humano
/plan   [caminho-do-spec]   ← cria plano técnico de spec aprovado
/back   [tarefa]            ← agente backend
/front  [tarefa]            ← agente frontend
/review [diff ou contexto]  ← revisão em dois estágios
/commit                     ← atualiza docs e faz commit
```

Referência completa: `docs/commands/README.md`

---

## Princípios

1. Clean Architecture — dependências apontam para dentro, domínio sem framework
2. Testes junto com a implementação, não depois
3. Toda decisão rastreável a um arquivo em `docs/`
4. Em caso de dúvida: pergunte antes de assumir
```

- [ ] **Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "feat: add AGENTS.md at root for tool-agnostic context loading"
```

---

## Task 12: Atualizar .claude/CLAUDE.md

**Files:**
- Modify: `.claude/CLAUDE.md`

- [ ] **Step 1: Substituir conteúdo completo de .claude/CLAUDE.md**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add .claude/CLAUDE.md
git commit -m "refactor: update CLAUDE.md to reference docs/ with selective role loading"
```

---

## Task 13: Atualizar referências internas de .ai-core/ para docs/

**Files:**
- Modify: `.claude/commands/back.md`, `front.md`, `spec.md`, `plan.md`, `review.md`, `init-project.md`, `checkpoint.md`, `retomar.md`
- Modify: `docs/commands/back.md`, `front.md`, `spec.md`, `review.md`, `retomar.md`, `checkpoint.md`, `plan.md`, `init-project.md`, `README.md`
- Modify: `docs/workflows/feature-delivery.md`
- Modify: `docs/context/conventions.md`

- [ ] **Step 1: Atualizar .claude/commands/ (adapters)**

Cada arquivo em `.claude/commands/` tem uma linha `Leia .ai-core/commands/<nome>.md...`.
Substitua `.ai-core/commands/` por `docs/commands/` em todos eles.

Arquivos e conteúdo final:

`.claude/commands/back.md`:
```
Leia docs/commands/back.md e execute as instruções, substituindo $ARGUMENTS por: $ARGUMENTS
```

`.claude/commands/front.md`:
```
Leia docs/commands/front.md e execute as instruções, substituindo $ARGUMENTS por: $ARGUMENTS
```

`.claude/commands/spec.md`:
```
Leia docs/commands/spec.md e execute as instruções, substituindo $ARGUMENTS por: $ARGUMENTS
```

`.claude/commands/plan.md`:
```
Leia docs/commands/plan.md e execute as instruções, substituindo $ARGUMENTS por: $ARGUMENTS
```

`.claude/commands/review.md`:
```
Leia docs/commands/review.md e execute as instruções, substituindo $ARGUMENTS por: $ARGUMENTS
```

`.claude/commands/init-project.md`:
```
Leia docs/commands/init-project.md e execute as instruções, substituindo $ARGUMENTS por: $ARGUMENTS
```

`.claude/commands/checkpoint.md`:
```
Leia docs/commands/checkpoint.md e execute as instruções.
```

`.claude/commands/retomar.md`:
```
Leia docs/commands/retomar.md e execute as instruções.
```

Criar também `.claude/commands/commit.md`:
```
Leia docs/commands/commit.md e execute as instruções.
```

- [ ] **Step 2: Atualizar docs/commands/back.md**

```markdown
Você é o agente de BACKEND deste projeto.

Leia obrigatoriamente antes de começar:
- docs/agents/backend.agent.md
- docs/skills/backend.md
- docs/context/conventions.md
- docs/context/decisions.md

Tarefa: $ARGUMENTS
```

- [ ] **Step 3: Atualizar docs/commands/front.md**

```markdown
Você é o agente de FRONTEND deste projeto.

Leia obrigatoriamente antes de começar:
- docs/agents/frontend.agent.md
- docs/skills/frontend.md
- docs/context/conventions.md
- docs/context/ui-guidelines.md
- docs/context/decisions.md

Tarefa: $ARGUMENTS
```

- [ ] **Step 4: Atualizar docs/commands/spec.md**

```markdown
Você é o PLANNER deste projeto em Modo Spec.

Leia obrigatoriamente antes de começar:
- docs/agents/planner.agent.md
- docs/architecture/overview.md
- docs/context/product.md
- docs/specs/spec-template.md

Feature ou requisito a especificar: $ARGUMENTS

Siga o Modo Spec definido em planner.agent.md: conduza o levantamento com uma pergunta por vez, gere o arquivo em docs/specs/YYYY-MM-DD-<topic>.md com Status: draft e aguarde aprovação humana antes de qualquer decomposição técnica.
```

- [ ] **Step 5: Atualizar docs/commands/review.md**

```markdown
Você é o REVIEWER deste projeto.

Leia obrigatoriamente antes de começar:
- docs/agents/reviewer.agent.md
- docs/skills/quality.md

Se o diff/PR contiver código backend (NestJS, controllers, use cases, migrations, DTOs), leia também:
- docs/context/decisions.md (seção Backend)

Se o diff/PR contiver código frontend (React, Next.js, componentes, hooks, páginas), leia também:
- docs/context/decisions.md (seção Frontend)

$ARGUMENTS

Aplique o checklist em dois estágios (em docs/skills/quality.md): Estágio 1 (Funcional) primeiro — se houver 🔴 BLOCKER, encerre a revisão e não passe para o Estágio 2.
```

- [ ] **Step 6: Atualizar docs/commands/retomar.md**

Substituir todas as referências:
- `.ai-core/STATUS.md` → `docs/context/current-state.md`
- `.ai-core/specs/` → `docs/specs/`

- [ ] **Step 7: Atualizar docs/commands/checkpoint.md**

Substituir todas as referências:
- `.ai-core/STATUS.md` → `docs/context/current-state.md`
- `.ai-core/specs/` → `docs/specs/`
- `docs/CHANGELOG.md` → `docs/changelog/YYYY-MM-DD.md`

Na mensagem de saída final, atualizar:
- `✅ Checkpoint salvo em .ai-core/STATUS.md` → `✅ Checkpoint salvo em docs/context/current-state.md`

- [ ] **Step 8: Atualizar docs/commands/init-project.md**

Substituir todas as referências `.ai-core/` por `docs/`. Paths específicos:
- `.ai-core/context/product.md` → `docs/context/product.md`
- `.ai-core/context/architecture.md` → `docs/architecture/overview.md`
- `.ai-core/decisions/backend.md` → `docs/context/decisions.md` (seção Backend)
- `.ai-core/decisions/frontend.md` → `docs/context/decisions.md` (seção Frontend)
- `.ai-core/context/ui-guidelines.md` → `docs/context/ui-guidelines.md`
- `.ai-core/GLOSSARY.md` → `docs/context/conventions.md` (seção Glossário)

No resumo final do init-project, atualizar a lista de arquivos preenchidos para os novos paths.

- [ ] **Step 9: Atualizar docs/commands/plan.md**

Substituir todas as referências:
- `.ai-core/` → `docs/`

- [ ] **Step 10: Atualizar docs/commands/README.md**

Substituir todas as referências:
- `.ai-core/commands/` → `docs/commands/`
- Adicionar entrada para `commit.md`

- [ ] **Step 11: Atualizar docs/workflows/feature-delivery.md**

Substituir todas as referências:
- `.ai-core/specs/` → `docs/specs/`
- `.ai-core/context/architecture.md` → `docs/architecture/overview.md`
- `.ai-core/context/product.md` → `docs/context/product.md`
- `workflows/documentation.md` → `docs/commands/commit.md` (referência ao pós-deploy)

- [ ] **Step 12: Atualizar protocolo pré-commit em docs/context/conventions.md**

Localizar a seção `## Git & PRs` > `### Protocolo pré-commit` e substituir:

```markdown
### Protocolo pré-commit (obrigatório)

Antes de qualquer commit, sempre nesta ordem:

1. **Atualizar `docs/context/current-state.md`** — refletir o que foi feito, o que está em progresso, próximos passos
2. **Atualizar `docs/changelog/YYYY-MM-DD.md`** — adicionar entrada com o que está sendo commitado
3. **Incluir ambos no commit** junto com os demais arquivos

Não pule este protocolo mesmo para commits pequenos ou de chore.
Use `/commit` para executar o protocolo completo com auxílio do agente.
```

- [ ] **Step 13: Commit de todas as atualizações de path**

```bash
git add .claude/commands/ docs/commands/ docs/workflows/ docs/context/conventions.md
git commit -m "refactor: update all .ai-core/ path references to docs/"
```

---

## Task 14: Remover .ai-core/ e verificação final

**Files:**
- Delete: `.ai-core/decisions/frontend.md`
- Delete: `.ai-core/decisions/backend.md`
- Delete: `.ai-core/GLOSSARY.md`
- Delete: `.ai-core/agents/backend.agent.md`
- Delete: `.ai-core/agents/frontend.agent.md`
- Delete: `.ai-core/agents/reviewer.agent.md`
- Delete: `.ai-core/` (diretório, se vazio após remoções)

- [ ] **Step 1: Remover arquivos restantes de .ai-core/**

```bash
git rm .ai-core/decisions/frontend.md
git rm .ai-core/decisions/backend.md
git rm .ai-core/GLOSSARY.md
git rm .ai-core/agents/backend.agent.md
git rm .ai-core/agents/frontend.agent.md
git rm .ai-core/agents/reviewer.agent.md
```

- [ ] **Step 2: Verificar que .ai-core/ está vazio**

```bash
git status --short
```

Esperado: apenas arquivos staged para delete, nenhum arquivo restante em `.ai-core/`.

```bash
Get-ChildItem -Path .ai-core -Recurse -ErrorAction SilentlyContinue
```

Esperado: output vazio (diretório removido pelo git rm).

- [ ] **Step 3: Verificar ausência de referências a .ai-core/**

```bash
git grep -l "\.ai-core/" -- "*.md" "*.txt"
```

Esperado: nenhuma linha de output (zero arquivos com referência a `.ai-core/`).

Se houver arquivos listados, abri-los e corrigir as referências antes de continuar.

- [ ] **Step 4: Verificar que docs/ tem todos os arquivos esperados**

```bash
Get-ChildItem -Path docs -Recurse -Filter "*.md" | Select-Object FullName
```

Verificar que a lista inclui:
- `docs/context/current-state.md`
- `docs/context/decisions.md`
- `docs/context/conventions.md`
- `docs/context/product.md`
- `docs/context/ui-guidelines.md`
- `docs/skills/backend.md`
- `docs/skills/frontend.md`
- `docs/skills/quality.md`
- `docs/skills/architecture.md`
- `docs/agents/backend.agent.md`
- `docs/agents/frontend.agent.md`
- `docs/agents/reviewer.agent.md`
- `docs/agents/planner.agent.md`
- `docs/architecture/overview.md`
- `docs/architecture/backend.md`
- `docs/architecture/frontend.md`
- `docs/architecture/infra.md`
- `docs/specs/spec-template.md`
- `docs/workflows/feature-delivery.md`
- `docs/workflows/release-process.md`
- `docs/commands/commit.md`
- `docs/commands/README.md`
- `docs/changelog/2026-05-22.md`
- `docs/changelog/releases.md`

- [ ] **Step 5: Commit final**

```bash
git add -A
git commit -m "chore: remove .ai-core/ — migration to docs/ complete"
```

- [ ] **Step 6: Verificação final de critérios de sucesso**

```bash
# Nenhuma referência a .ai-core/ deve existir
git grep "\.ai-core" -- "*.md"
# Esperado: sem output

# AGENTS.md existe na raiz
Test-Path AGENTS.md
# Esperado: True

# docs/skills/ tem 4 arquivos
(Get-ChildItem docs\skills -Filter "*.md").Count
# Esperado: 4

# docs/commands/commit.md existe
Test-Path docs\commands\commit.md
# Esperado: True
```

---

## Critérios de conclusão

- [ ] Nenhuma referência a `.ai-core/` permanece em arquivos rastreados
- [ ] `docs/` pode ser aberto como vault no Obsidian (apenas .md, sem sintaxe proprietária)
- [ ] CLAUDE.md lista explicitamente quais arquivos cada papel carrega, referenciando `docs/`
- [ ] `docs/skills/` tem 4 arquivos com conteúdo real
- [ ] `docs/agents/*.md` não duplica regras que estão em skills
- [ ] `docs/commands/commit.md` existe e descreve o fluxo completo
- [ ] `AGENTS.md` existe na raiz
