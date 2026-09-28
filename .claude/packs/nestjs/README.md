# Pack `nestjs`

Regras específicas para serviços NestJS:

- controllers fazem apenas transporte; regras ficam em use cases/services;
- use `ValidationPipe` global com `whitelist`, `forbidNonWhitelisted` e
  `transform`;
- acesse configuração via `ConfigService`, não diretamente por `process.env`;
- migrations são obrigatórias e `synchronize` fica desativado;
- endpoints de lista precisam de paginação e contratos de erro consistentes.

ORM, banco, autenticação e filas continuam escolhas do projeto e devem estar
registrados em `docs/context/decisions.md`.
