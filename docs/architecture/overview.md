# Visão Arquitetural

> Atualize sempre que uma decisão arquitetural significativa for tomada.

## Sistema

**Produto**: [Nome do produto]
**Status**: [Desenvolvimento inicial / Ativo / Maduro]
**Modo:** <!-- a definir: single | monorepo | microfrontends — preenchido por /init-project; lido por todos os comandos -->

**Packs de stack:** <!-- a definir: ids separados por vírgula; preenchido por /init-project -->

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

<!-- Atualizada por /init-app e /init-package (uma linha por app/package). Remova a seção se o Modo for `single`. -->

| Path | Tipo | Propósito | Stack (se diferir da tabela acima) | Docs próprios |
|------|------|-----------|--------------------------------------|---------------|
| `apps/[nome]` | app | [uma frase] | [ex: usa Redis só aqui] | `docs/apps/[nome]/README.md` |
| `packages/[nome]` | package compartilhado | [uma frase] | | `docs/packages/[nome]/README.md` |

Cada app/package ganha `docs/apps/[nome]/` (ou `docs/packages/[nome]/`),
com seu `README.md` de índice, criado por `/init-app` e `/init-package`;
`/spec`, `/back` e `/front` criam o que faltar como fallback (ver
`docs/context/conventions.md#documentação-em-monorepo-appspackages`).
`/checkpoint` e `/retomar` operam só na raiz. Toda a documentação gerada fica sob
`docs/` na raiz — nunca dentro de `apps/[nome]/` ou `packages/[nome]/`. O
`README.md` é o resumo (propósito, stack, link); detalhe completo (specs,
decisions, arquitetura) mora nas subpastas de `docs/apps/[nome]/` (ou
`docs/packages/[nome]/`).

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
