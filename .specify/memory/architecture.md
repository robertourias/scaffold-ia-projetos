# Arquitetura

> **Status do arquivo:** vazio — preenchido pelo `/specnico-constitution`. Atualize sempre que uma decisão arquitetural significativa for tomada.

## Visão Arquitetural

> Atualize sempre que uma decisão arquitetural significativa for tomada.

### Sistema

**Produto**: [Nome do produto]
**Status**: [Desenvolvimento inicial / Ativo / Maduro]
**Modo:** <!-- a definir: single | monorepo | microfrontends — preenchido por /specnico-constitution (espelha a constituição) -->

**Packs de stack:** <!-- a definir: ids separados por vírgula; preenchido por /specnico-constitution (espelha **Packs ativos:** da constituição) -->

### Stack

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

### Projetos do Monorepo

<!-- Uma linha por app/package, acrescentada pelo /specnico-plan do item de arquitetura daquele projeto. Remova a seção se o Modo for `single`. -->

| Path | Tipo | Propósito | Stack (se diferir da tabela acima) | Contexto próprio |
|------|------|-----------|--------------------------------------|------------------|
| `apps/[nome]` | app | [uma frase] | [ex: usa Redis só aqui] | `.specify/memory/projects/apps-[nome].md` |
| `packages/[nome]` | package compartilhado | [uma frase] | | `.specify/memory/projects/packages-[nome].md` |

Cada app/package ganha um arquivo em `.specify/memory/projects/` (propósito,
stack e packs que diferem do global, comandos de verificação próprios,
decisões locais), criado pelo `/specnico-plan` do item de arquitetura do
backlog que introduz o projeto. Toda a documentação fica em `.specify/` e
`specs/` na raiz — nunca dentro de `apps/[nome]/` ou `packages/[nome]/`
(ver `.specify/memory/conventions.md#monorepo-appspackages`).

### Fluxo de dados

```
User → Next.js (SSR/RSC) → NestJS API → Database
                         ↘ External Services
```

### Bounded Contexts

<!-- Adicione ao longo do projeto -->
- [Contexto 1]: [Descrição, quais entidades ele possui]

### Decisões registradas

| Decisão | Escolha | Data | Justificativa |
|---------|---------|------|---------------|
| Monorepo | Turborepo | — | Builds incrementais, pacotes compartilhados |
| Backend | NestJS | — | DI, modular, TypeScript-first |
| Frontend | Next.js | — | SSR, RSC, edge-ready |
| Arquitetura | Clean Architecture | — | Domínio testável sem dependência de framework |

### Constraints conhecidos

<!-- Documente débito técnico, limitações ou não-óbvios aqui -->

## Backend

> Detalhe aqui as decisões específicas de arquitetura do servidor.

### Módulos NestJS

<!-- Adicione módulos ao longo do projeto -->
| Módulo | Responsabilidade |
|--------|-----------------|
| [Módulo] | [O que ele faz] |

### Domain Entities

<!-- Adicione entidades ao longo do projeto -->
| Entidade | Descrição |
|----------|-----------|
| [Entidade] | [Definição precisa] |

### API Endpoints mapeados

<!-- Adicione ao longo do projeto -->
| Método | Path | Use Case |
|--------|------|----------|
| GET | /api/v1/... | ... |

## Frontend

> Detalhe aqui as decisões específicas de arquitetura do cliente.

### Estrutura de rotas

<!-- Adicione ao longo do projeto -->
| Rota | Componente de página | Descrição |
|------|---------------------|-----------|
| / | HomePage | |

### Features mapeados

<!-- Features no padrão features/[nome]/ -->
| Feature | Componentes principais | Status |
|---------|----------------------|--------|
| [feature] | [lista] | Planejado / Em andamento / Live |

## Infraestrutura

> Ambiente, deploy e dependências externas.

### Ambientes

| Ambiente | URL | Deploy trigger |
|----------|-----|---------------|
| Development | localhost | manual |
| Staging | <!-- a definir --> | push to main |
| Production | <!-- a definir --> | tag release |

### Hosting

- Frontend: <!-- a definir: Vercel / AWS / Railway -->
- Backend: <!-- a definir -->
- Banco: <!-- a definir -->

### CI/CD

<!-- a definir: GitHub Actions / outro -->

### Variáveis de ambiente obrigatórias

| Variável | Descrição | Ambientes |
|----------|-----------|-----------|
| DATABASE_URL | Connection string | staging, prod |
| <!-- a definir --> | | |

### Serviços externos

| Serviço | Propósito | Crítico? |
|---------|-----------|----------|
| <!-- a definir --> | | |
