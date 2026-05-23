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
