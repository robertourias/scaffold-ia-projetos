# Features

Documentação de features **entregues** (pós-merge). Um arquivo por feature:
`docs/features/<feature>.md`.

Criado/atualizado na Fase 6 de `docs/workflows/feature-delivery.md` e no
checklist de `docs/workflows/release-process.md`.

## Features vs Specs vs Archive

| Pasta | Responde | Tempo verbal |
|-------|----------|--------------|
| `docs/specs/` | O que **vamos** construir e como | futuro |
| `docs/archive/` | O que foi **planejado** naquela época | passado (histórico) |
| `docs/features/` | O que o sistema **faz hoje** | presente |

A Spec descreve a intenção de uma iteração. O arquivo de feature descreve o
comportamento atual acumulado — atualizado a cada iteração que toca a feature.

## Template

```markdown
# Feature: <nome>

**Status:** live | beta | deprecated
**Domínio:** <auth | payments | ...>
**Última atualização:** YYYY-MM-DD

## O que faz
<1-2 parágrafos do comportamento observável hoje>

## Pontos de entrada
- Rota/tela: `<path>`
- Endpoint: `<METHOD /path>`
- Código: `<caminho principal>`

## Regras de negócio aplicadas
- RN-<DOMINIO>-001 — <resumo>

## Limitações conhecidas
- <o que ainda não funciona>

## Specs relacionadas
- `docs/archive/YYYY-MM-DD-<topic>.md`
```

## Regra de leitura

Não é carregado por padrão. Carregue quando a tarefa **alterar** uma feature
existente — para saber o comportamento atual antes de mudá-lo.
