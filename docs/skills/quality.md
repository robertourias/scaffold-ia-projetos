# Skill: Quality

Critérios de revisão aplicáveis a qualquer agente.

## Severidade

- 🔴 **BLOCKER** — obrigatório corrigir antes do merge (falha de segurança, lógica quebrada, teste crítico faltando)
- 🟡 **WARNING** — deve corrigir (anti-pattern, risco de performance, edge case descoberto)
- 🟢 **SUGGESTION** — melhoria opcional
- 💡 **NOTE** — informativo, sem ação necessária

## Estágio 1 — Funcional

Se houver 🔴 BLOCKER aqui, encerre a revisão. Não passe para o Estágio 2.

- [ ] Atende a todos os requisitos do spec aprovado (ou da task declarada)
- [ ] Lógica de negócio correta — sem inversões de condição, sem side effects não intencionais
- [ ] Segurança: sem secrets hardcoded, sem SQL injection ou XSS, autorização checada no service
- [ ] Testes cobrem happy path e ao menos um caminho de falha
- [ ] Migrations incluídas para toda mudança de schema
- [ ] Auth/authz correto e testado (quando aplicável)
- [ ] Sem regressões em fluxos existentes

## Estágio 2 — Qualidade

Execute apenas após Estágio 1 passar sem BLOCKERs.

**Geral**
- [ ] Sem `any`, sem regras de lint desabilitadas sem justificativa
- [ ] Edge cases tratados (null, vazio, timeout, erro de rede)
- [ ] Naming e estrutura seguem `docs/context/conventions.md`

**Frontend**
- [ ] Sem re-renders desnecessários onde importa
- [ ] Acessibilidade mantida (ARIA, teclado, WCAG 2.1 AA)
- [ ] Impacto no bundle avaliado para imports grandes

**Backend**
- [ ] Zero lógica de negócio em controllers
- [ ] Todos os inputs validados via DTO
- [ ] Sem queries N+1
- [ ] Sem CVEs críticos em dependências novas
- [ ] Operações pesadas enviadas para fila (nunca bloqueiam HTTP)

## Não bloquear por

- Formatação (o linter trata)
- Preferências pessoais de estilo sem impacto objetivo
- Requisitos futuros especulativos fora do escopo

## Formato de saída

```
## Verdict: APPROVED | CHANGES REQUESTED | NEEDS DISCUSSION

### Issues
[🔴/🟡/🟢 arquivo:linha — descrição e sugestão de correção]

### Notes
[💡 observações informativas]
```
