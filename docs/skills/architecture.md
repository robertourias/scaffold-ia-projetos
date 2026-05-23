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
