# Spec & Plan: <título>

**Status:** review
**Data:** YYYY-MM-DD
**Autor:** <agente ou humano>

---

## 1. Problema e Visão Geral

<1-2 parágrafos descrevendo o que está quebrado ou faltando e por que importa resolver agora.>

---

## 2. Cenários de Usuário

- **P1 (crítico):** Como <quem>, quero <o quê>, para <por quê>.
- **P2 (importante):** Como <quem>, quero <o quê>, para <por quê>.
- **P3 (nice-to-have):** Como <quem>, quero <o quê>, para <por quê>.

> P1 = sem isso o produto não funciona. P2 = valor claro mas contornável. P3 = melhoria futura.

---

## 3. Requisitos Funcionais

- **FR-001:** <requisito mensurável e verificável>
- **FR-002:** <requisito mensurável e verificável>

> Cada FR deve ser independente e testável.

---

## 4. Fora do Escopo & Riscos

- **Fora do Escopo:** <o que explicitamente não será feito nesta iteração>
- **Premissa:** <o que precisa ser verdade para este spec funcionar>
- **Risco:** <o que pode dar errado> → Mitigação: <como reduzir o risco>

---

## 5. Contratos de API (Se aplicável)

- `HTTP_METHOD /caminho/endpoint`
  - **Request:** `<Corpo esperado>`
  - **Response:** `<Retorno esperado>`

---

## 6. Plano de Implementação (Tarefas)

<Liste as tarefas lógicas e atômicas de implementação>

### Ordem de Execução & Dependências

Grafo de execução em ondas (waves). Tarefas na mesma onda **não** dependem
entre si e podem rodar **em paralelo** (um agente por tarefa). Cada onda só
inicia após a anterior concluir.

| Onda | Tarefas (paralelas) | Pré-requisito |
|------|---------------------|---------------|
| 1    | T1                  | —             |
| 2    | T2, T3              | T1            |
| 3    | T4                  | T2, T3        |

> Regra: o agente de implementação (`/hands-on`) percorre as ondas em ordem.
> Dentro de uma onda, dispara as tarefas em paralelo. Não inicie uma tarefa
> antes de **todas** as suas dependências estarem com os critérios `[x]`.

### Tarefa 1: [Identificador]
- **Tipo:** feature | fix | refactor | chore
- **Agente:** frontend | backend | ambos
- **Depende de:** — (nenhuma) | T2, T3
- **Paralelizável com:** T4 | nenhuma
- **Descrição:** [O quê fazer e contratos relacionados]
- **Critérios de Aceite:**
  - [ ] Critério 1
  - [ ] Critério 2

### Tarefa 2: [Identificador]
...

---

<!-- 
GATE DE APROVAÇÃO
Revise as regras de negócio e as tarefas técnicas.
Se tudo estiver correto, altere o Status acima de "review" para "approved" para liberar os agentes de frontend/backend para iniciar a implementação.
-->
