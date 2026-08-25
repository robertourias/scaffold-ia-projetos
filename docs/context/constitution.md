# Constituição

> **Status do arquivo:** vazio — preenchido pelo Bloco 7 do `/init-project`.
>
> Princípios arquiteturais **não-negociáveis** deste projeto. Uma Spec que os
> viole não deve ser aprovada; um diff que os viole não deve passar na revisão.
>
> Carregado por **todos** os papéis. Mantenha em ≤ 40 linhas úteis —
> constituição longa não é lida, e o que não é lido não restringe nada.

---

## Divisão de responsabilidade

| Arquivo | Responde |
|---------|----------|
| `constitution.md` | **como o sistema deve ser construído** (estrutura, dependências, testes) |
| `guardrails.md` | **o que é proibido fazer** (comandos, caminhos, segredos, gate) |
| `conventions.md` | **como escrever** (nomes, imports, formatação) |
| `decisions.md` | **o que escolhemos** (libs, ORM, auth) — muda com o tempo |

Constituição muda por decisão deliberada e registrada, não por conveniência de
uma tarefa. Em conflito, `guardrails.md` (segurança) vence a constituição, que
vence convenções, que vencem preferência do agente.

---

## Princípios

Cada princípio recebe ID `CN-XXX` para que Specs e revisões possam citá-lo.

- **CN-001 — Direção das dependências.**
  `<!-- TODO: ex. Domínio não importa framework. Dependências apontam para dentro: presentation → application → domain. Infra implementa interfaces do domínio, nunca o contrário. -->`

- **CN-002 — Testes junto da implementação.**
  `<!-- TODO: ex. Comportamento novo entra com teste no mesmo diff. Bug corrigido entra com teste de regressão que falha sem o fix. -->`

- **CN-003 — Rastreabilidade.**
  `<!-- TODO: ex. Toda decisão técnica é rastreável a um arquivo em docs/. Decisão implementada e não registrada é dívida, não pragmatismo. -->`

- **CN-004 — Limite de acoplamento.**
  `<!-- TODO: ex. Módulos se comunicam por interface pública; nada de import atravessando camada interna de outro módulo. -->`

- **CN-005 — `<!-- TODO: princípio específico deste produto -->`**

---

## Como é usado

| Papel | Uso |
|-------|-----|
| `planner` | Spec que exija violar um `CN-XXX` **não é planejada** — escale ao humano antes |
| `backend` / `frontend` | Implementação que precise violar um `CN-XXX` → pare e reporte, não contorne |
| `reviewer` | Violação de `CN-XXX` é 🔴 BLOCKER no Estágio 1 |

## Como mudar

Princípio que atrapalha toda tarefa está errado — mas a saída é **emendar a
constituição** deliberadamente, com o motivo registrado em `decisions.md`, não
ignorá-lo caso a caso. Exceção pontual não vira precedente: ou o princípio vale,
ou ele muda.
