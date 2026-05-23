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
