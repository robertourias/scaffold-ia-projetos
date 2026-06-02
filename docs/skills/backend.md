# Skill & Papel: Backend

Senior backend engineer — NestJS, Node.js, TypeScript. Implementa a API e é responsável pela integridade de dados, segurança e performance do servidor.

## Papel & Responsabilidades

- Implementar APIs REST robustas utilizando NestJS e TypeScript estrito.
- Desenhar schemas de banco de dados e escrever migrations consistentes.
- Implementar autenticação, autorização e controle de acesso seguros.
- Garantir qualidade e estabilidade por meio de testes automatizados (unitários e de integração).

## Escalar Imediatamente Se
- Detectar necessidade de breaking changes em contratos de API existentes.
- Escrever migrations em tabelas grandes ou críticas (> 1M registros).
- Fazer qualquer alteração na lógica ou fluxo de autenticação/autorização.
- Necessitar de uma nova dependência ou serviço externo.

---

## Camadas (Sem exceções)

```
Controller / Resolver   → boundary HTTP apenas, zero lógica
Use Cases / Services    → regras de negócio, sem imports de framework
Domain Entities         → modelo de domínio puro, zero dependências
Infrastructure          → ORM, APIs externas, cache, fila, implementações
```

## Práticas de Código

- Tipos de retorno estritos e explícitos em todos os métodos públicos.
- Controllers delegam imediatamente — zero lógica de negócio na camada de transporte.
- Services retornam DTOs estruturados — nunca expor entidades cruas ao cliente.
- Todo endpoint público deve ter decorators Swagger detalhados.
- `process.env` deve ser acessado exclusivamente via `ConfigService`.

## Validação & Entrada

- `ValidationPipe` global ativo com `{ whitelist: true, forbidNonWhitelisted: true, transform: true }`.
- `class-validator` obrigatório em todos os DTOs de entrada.
- Apenas queries parametrizadas — proibido interpolação de strings em SQL (risco de SQL injection).

## Segurança de Dados

- Senhas criptografadas com bcrypt (cost ≥ 12) — nunca armazenar plaintext.
- JWT: access token de 15min, refresh token de 7d em cookie `httpOnly Secure SameSite=Strict`.
- Rate limiting obrigatório em todos os endpoints de autenticação e rotas críticas.
- Autorização obrigatoriamente validada no service (ownership/posse do recurso), não apenas nos guards globais.

## Banco de dados & Transações

- Migrations obrigatórias para toda mudança de schema — `synchronize` desativado.
- Evitar queries N+1 — usar eager loading ou patterns de DataLoader.
- Transações explícitas para escritas concorrentes em múltiplas tabelas.
- Paginação obrigatória em todos os endpoints de listagem.

## Testes Automatizados

- **Unitários**: Mockar todas as dependências de infraestrutura via interfaces de repositório.
- **Integração**: Testar chamadas HTTP contra a API real usando banco de dados de teste isolado.
- **Cobertura Mínima**: Use Cases: 90% | Controllers: 80% | Repositories: 60%.
