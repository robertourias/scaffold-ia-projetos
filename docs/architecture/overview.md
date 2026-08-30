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

## Projetos do Monorepo

<!-- Preencha apenas se este projeto for monorepo (apps/ e/ou packages/ na raiz). Se não for, remova esta seção. -->
<!-- Atualizada por /init-project (Bloco 2) ao detectar monorepo, e manualmente quando um app/package novo é criado. -->

| Path | Tipo | Propósito | Stack (se diferir da tabela acima) | Docs próprios |
|------|------|-----------|--------------------------------------|---------------|
| `apps/[nome]` | app | [uma frase] | [ex: usa Redis só aqui] | `apps/[nome]/docs/` |
| `packages/[nome]` | package compartilhado | [uma frase] | | `packages/[nome]/docs/` |

Cada app/package só ganha `docs/` próprio quando `/spec`, `/back`, `/front` ou
`/checkpoint` rodam com esse escopo (ver
`docs/context/conventions.md#documentação-em-monorepo-appspackages`) — não
precisa ser criado antecipadamente.

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
