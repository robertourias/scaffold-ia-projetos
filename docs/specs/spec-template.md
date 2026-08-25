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

> Cada FR deve ser independente e testável. Toda tarefa na seção 6 declara quais
> FR cobre (campo `Cobre:`); a tabela de rastreabilidade na seção 8 fecha o
> ciclo FR → tarefa → teste.

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

> Regra: o orquestrador (`/hands-on`) percorre as ondas em ordem. Dentro de uma
> onda, despacha as tarefas em paralelo. Não inicie uma tarefa antes de **todas**
> as suas dependências estarem com os critérios `[x]`.

> **Propriedade de arquivos:** duas tarefas da **mesma onda** não podem declarar
> o mesmo caminho no campo `Arquivos:`. Elas rodam em paralelo na mesma working
> tree e se sobrescrevem em silêncio. Se houver colisão, serialize (mova uma
> para a onda seguinte) ou extraia a edição compartilhada para uma tarefa
> própria em onda anterior. Colisões típicas: wiring de módulo, barrel exports,
> tipos compartilhados, schema, rotas.

### Tarefa 1: [Identificador]
- **Tipo:** feature | fix | refactor | chore
- **Agente:** frontend | backend | ambos
- **Depende de:** — (nenhuma) | T2, T3
- **Paralelizável com:** T4 | nenhuma
- **Arquivos:** `caminho/a.ts`, `caminho/b.tsx`  ← todos os arquivos que esta tarefa cria ou modifica
- **Cobre:** FR-001 | GR-002, CN-001  ← requisito(s) funcional(is) e/ou guardrail/princípio relevante
- **Descrição:** [O quê fazer e contratos relacionados]
- **Critérios de Aceite:**
  - [ ] Dado <estado>, quando <ação>, então <resultado observável>. — cobre FR-001, verificado por `<comando ou arquivo de teste>`
  - [ ] Dado <estado de falha>, quando <ação>, então <erro tratado de forma X>. — cobre FR-001, verificado por `<comando ou arquivo de teste>`

### Tarefa 2: [Identificador]
...

---

## 7. Rastreabilidade

Fecha o ciclo requisito → tarefa → teste. Preenchida **depois** da seção 6 —
copie os IDs já usados nas tarefas, não invente novos aqui.

| FR | Coberto por | Verificado por |
|----|-------------|-----------------|
| FR-001 | T1, T3 | `<arquivo de teste ou comando>` |
| FR-002 | T2 | `<arquivo de teste ou comando>` |

> Todo FR aparece em pelo menos uma linha. FR sem tarefa correspondente é
> requisito esquecido — volte à seção 6. Tarefa sem FR correspondente é escopo
> não declarado — volte à seção 3 ou remova a tarefa.

---

## 8. Verificação

Como provar que esta Spec foi entregue. Comandos reais de
`docs/context/guardrails.md` — não descrições.

| O quê | Comando | Saída esperada |
|-------|---------|----------------|
| Type-check | `<comando>` | sem erros |
| Lint | `<comando>` | sem erros |
| Testes | `<comando>` | N passando, incluindo `<nome do teste novo>` |
| Manual | `<passo a passo, se houver algo que teste automatizado não cobre>` | `<o que observar>` |

> Nenhum Critério de Aceite é marcado `[x]` sem a saída real destes comandos
> na conversa. Ver `docs/context/guardrails.md`, seção 1.

---

<!-- 
GATE DE APROVAÇÃO
Revise as regras de negócio e as tarefas técnicas.
Se tudo estiver correto, altere o Status acima de "review" para "approved" para liberar os agentes de frontend/backend para iniciar a implementação.
-->
