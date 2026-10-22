# Pack `nestjs`

Regras específicas para serviços NestJS:

- controllers fazem apenas transporte; regras ficam em use cases/services;
- use `ValidationPipe` global com `whitelist`, `forbidNonWhitelisted` e
  `transform`;
- acesse configuração via `ConfigService`, não diretamente por `process.env`;
- migrations são obrigatórias e `synchronize` fica desativado;
- endpoints de lista precisam de paginação e contratos de erro consistentes.

ORM, banco, autenticação e filas continuam escolhas do projeto e devem estar
registrados em `.specify/memory/decisions.md`.

## Passos no fluxo SDD

Ao planejar (`/specnico-plan`) e implementar (`/specnico-implement`) tarefas
de backend NestJS, cubra, nesta ordem de dependência:

1. **Domínio e banco** — entidades e value objects puros; migration para toda
   mudança de schema, rodada localmente (ex: `npm run migration:run`).
2. **Aplicação** — use cases com interface de repositório no domínio; testes
   unitários com todas as dependências mockadas.
3. **Infraestrutura** — repositório concreto; módulo com providers, imports e
   exports ligados.
4. **Apresentação** — controller com DTOs validados por `class-validator` e
   decorators do Swagger (`@nestjs/swagger`); testes de integração contra a
   camada HTTP real.

Gate da onda: testes unitários e de integração verdes.
