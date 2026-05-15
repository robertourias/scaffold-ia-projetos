# Architecture Context

> **Maintainer**: Update this file whenever a significant architectural decision is made or the system structure changes.
> **Status do arquivo:** vazio — preencha as seções `<!-- TODO -->` com os dados reais do projeto antes de usar com agentes. Agentes que receberem este arquivo sem preenchimento não terão contexto real para trabalhar.

## System Overview

<!-- TODO: Describe what this system does in 2-3 sentences -->
**Product name**: [Your Product Name]
**Purpose**: [Brief description of what the system does]
**Status**: [Early development / Active / Mature]

## Monorepo Structure (Turborepo)

```
apps/
  web/          → Next.js frontend (App Router)
  api/          → NestJS backend
packages/
  ui/           → Shared React component library
  config/       → Shared ESLint, TypeScript, Tailwind configs
  types/        → Shared TypeScript types and interfaces
  utils/        → Shared utility functions
```

## Technology Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Frontend | Next.js | <!-- TODO --> | App Router |
| UI Components | <!-- TODO: shadcn/ui, Radix, etc. --> | | |
| Styling | <!-- TODO: Tailwind CSS, CSS Modules, etc. --> | | |
| Backend | NestJS | <!-- TODO --> | |
| ORM | <!-- TODO: TypeORM, Prisma, Drizzle --> | | |
| Database | <!-- TODO: PostgreSQL, MySQL, etc. --> | | |
| Auth | <!-- TODO: JWT, NextAuth, Clerk, etc. --> | | |
| Queue | <!-- TODO: BullMQ, SQS, etc. --> | | |
| Cache | <!-- TODO: Redis, Memcached, etc. --> | | |
| File Storage | <!-- TODO: S3, local, etc. --> | | |

## Domain Model

<!-- TODO: Describe the core domain entities and their relationships -->

```
[Entity A] ──── [Entity B]
     │
     └──── [Entity C]
```

Key entities:
- **[Entity A]**: [Description]
- **[Entity B]**: [Description]

## API Design

- **Style**: REST <!-- or GraphQL -->
- **Base URL**: `/api/v1`
- **Authentication**: <!-- JWT Bearer / API Key / Session -->
- **API Documentation**: Available at `/api/docs` (Swagger)

## Data Flow

```
User → Next.js (SSR/RSC) → NestJS API → Database
                         ↘ External Services
```

## Bounded Contexts

<!-- TODO: List the main bounded contexts / feature areas -->
- **[Context 1]**: [Description, owns which entities]
- **[Context 2]**: [Description, owns which entities]

## Infrastructure

- **Hosting**: <!-- TODO: Vercel, AWS, Railway, etc. -->
- **CI/CD**: <!-- TODO: GitHub Actions, etc. -->
- **Environments**: development | staging | production
- **Secrets management**: <!-- TODO: .env, Doppler, AWS Secrets Manager -->

## Key Architectural Decisions

| Decision | Choice | Date | Rationale |
|----------|--------|------|-----------|
| Monorepo tool | Turborepo | <!-- date --> | Fast incremental builds, shared packages |
| Backend framework | NestJS | <!-- date --> | DI, modular, TypeScript-first |
| Frontend framework | Next.js | <!-- date --> | SSR, RSC, edge-ready |
| Architecture pattern | Clean Architecture | <!-- date --> | Testable, maintainable business logic |

## Known Constraints & Limitations

<!-- TODO: Document any technical debt, known issues, or non-obvious constraints -->
- [Constraint 1]
- [Constraint 2]

## External Dependencies

| Service | Purpose | Critical? |
|---------|---------|-----------|
| <!-- TODO --> | | |
