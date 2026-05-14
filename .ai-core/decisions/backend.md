# Decisões Backend

Escolhas específicas deste projeto que substituem padrões gerais.
Carregue junto com `agents/backend.agent.md`.

## Arquitetura
- Clean Architecture com limites de camada estritos (ver `agents/backend.agent.md`)
- DI baseado em tokens para interfaces de repositório:
  `{ provide: IUsersRepository, useClass: TypeOrmUsersRepository }`
- Entidades de domínio são classes TypeScript puras — zero imports de NestJS na camada de domínio
- Exceções de domínio tipadas que estendem as built-ins do NestJS

## ORM e banco
<!-- TODO: ex: "TypeORM com PostgreSQL" ou "Prisma com PostgreSQL" -->
- `synchronize: false` em produção — migrations obrigatórias para toda mudança de schema

## Autenticação
<!-- TODO: ex: "JWT com Passport.js + rotação de refresh token" ou "Clerk" -->

## Eventos e filas
<!-- TODO: ex: "EventEmitter2 para eventos in-process" ou "BullMQ para jobs assíncronos" -->
- Operações pesadas (email, PDF, imagem) vão para fila — nunca bloqueiam a resposta HTTP

## Cache
<!-- TODO: ex: "Redis via NestJS CacheModule" -->

## API
- REST com Swagger (`@nestjs/swagger`)
- Versionamento via prefixo de URL: `/api/v1/`
- Paginação cursor-based preferida sobre offset em tabelas grandes

## Tratamento de erros
- Filtro global de exceções para erros inesperados — shape consistente de resposta
- Log sempre com contexto: `this.logger.error('msg', { entityId, error })`

## Testes
- Unit: Jest com interfaces de repositório mockadas
- Integration: Supertest contra app NestJS real com banco de teste
- Cobertura mínima: use cases 90%, controllers 80%, repos 60%
