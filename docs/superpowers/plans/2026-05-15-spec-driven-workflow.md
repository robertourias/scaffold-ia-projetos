# Spec-Driven Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Inserir fase de Spec com gate humano no fluxo de entrega e separar o checklist de revisão em dois estágios sequenciais, tudo em `.ai-core` agnóstico de ferramenta.

**Architecture:** Quatro arquivos Markdown são modificados/criados no `.ai-core`. Não há código executável — as "verificações" são inspeções do conteúdo dos arquivos. Cada task produz um arquivo completo e autônomo; não há dependência de ordem entre tasks 1-3, mas task 4 (feature-delivery) deve ser feita por último pois referencia os demais.

**Tech Stack:** Markdown, edição de arquivos com ferramentas de texto.

---

### Task 1: Criar `spec-template.md`

**Files:**
- Create: `.ai-core/specs/spec-template.md`

- [ ] **Step 1: Criar o arquivo com o template híbrido completo**

Conteúdo exato do arquivo `.ai-core/specs/spec-template.md`:

```markdown
# Spec: <título>

**Status:** draft
**Data:** YYYY-MM-DD
**Autor:** <agente ou humano>

---

## Problema

<1-2 parágrafos descrevendo o que está quebrado ou faltando e por que importa resolver agora.>

---

## Cenários de Usuário

- **P1 (crítico):** Como <quem>, quero <o quê>, para <por quê>.
- **P2 (importante):** Como <quem>, quero <o quê>, para <por quê>.
- **P3 (nice-to-have):** Como <quem>, quero <o quê>, para <por quê>.

> P1 = sem isso o produto não funciona. P2 = valor claro mas contornável. P3 = melhoria futura.

---

## Requisitos Funcionais

- **FR-001:** <requisito mensurável e verificável>
- **FR-002:** <requisito mensurável e verificável>

> Cada FR deve ser independente e testável. Evite "o sistema deve ser rápido" — prefira "o endpoint deve responder em < 200ms sob carga de 100 req/s".

---

## Critérios de Sucesso

- [ ] <outcome verificável — comportamento observável ou métrica>
- [ ] <outcome verificável>

---

## Fora do Escopo

- <o que explicitamente não será feito nesta iteração>
- <segunda exclusão explícita>

---

## Riscos e Premissas

- **Premissa:** <o que precisa ser verdade para este spec funcionar>
- **Risco:** <o que pode dar errado> → Mitigação: <como reduzir o risco>

---

<!-- 
GATE DE APROVAÇÃO
Para desbloquear a criação do plano técnico, altere o Status acima de "draft" para "approved".
O agente planner NÃO deve criar tasks de implementação enquanto Status for "draft".
-->
```

- [ ] **Step 2: Verificar que o arquivo existe e contém os campos obrigatórios**

Abra `.ai-core/specs/spec-template.md` e confirme que todos estes campos estão presentes:
- `**Status:** draft`
- `## Problema`
- `## Cenários de Usuário` com marcadores P1/P2/P3
- `## Requisitos Funcionais` com padrão `FR-NNN`
- `## Critérios de Sucesso`
- `## Fora do Escopo`
- `## Riscos e Premissas`
- Comentário HTML `<!-- GATE DE APROVAÇÃO -->` ao final

- [ ] **Step 3: Commit**

```bash
git add .ai-core/specs/spec-template.md
git commit -m "feat: add spec-template.md with hybrid format to .ai-core/specs"
```

---

### Task 2: Atualizar `reviewer.agent.md` com dois estágios

**Files:**
- Modify: `.ai-core/agents/reviewer.agent.md`

- [ ] **Step 1: Substituir a seção `## Checklist` pelo novo conteúdo em dois estágios**

Substitua a seção `## Checklist` (linhas 13-38 do arquivo atual) pelo seguinte:

```markdown
## Checklist de Revisão

> Execute os estágios em ordem. Se houver 🔴 BLOCKER no Estágio 1, **encerre a revisão imediatamente** — não passe para o Estágio 2. Corrija os blockers e reinicie.

### Estágio 1 — Funcional
*O código faz o que deve fazer?*

- [ ] Atende a todos os requisitos do spec aprovado (ou da task declarada)
- [ ] Lógica de negócio correta — sem inversões de condição, sem side effects não intencionais
- [ ] Segurança: sem secrets hardcoded, sem vetores de SQL injection ou XSS, autorização checada na camada de service
- [ ] Testes cobrem happy path e ao menos um caminho de falha
- [ ] Migrations incluídas para toda mudança de schema
- [ ] Auth/authz correto e testado (quando aplicável)
- [ ] Sem regressões em fluxos existentes

> 🔴 BLOCKER no Estágio 1 → encerra revisão aqui. Não prossiga para o Estágio 2.

---

### Estágio 2 — Qualidade
*O código está bem feito?*

Só execute este estágio após o Estágio 1 passar sem BLOCKERs.

**Geral**
- [ ] Sem `any`, sem regras de lint desabilitadas sem justificativa
- [ ] Edge cases tratados (null, vazio, timeout, erro de rede)
- [ ] Naming e estrutura de arquivos seguem `.ai-core/context/conventions.md`

**Frontend**
- [ ] Segue as escolhas de `decisions/frontend.md`
- [ ] Sem re-renders desnecessários onde importa
- [ ] Acessibilidade mantida (ARIA, navegação por teclado, WCAG 2.1 AA)
- [ ] Impacto no bundle avaliado para imports novos grandes

**Backend**
- [ ] Zero lógica de negócio em controllers
- [ ] Todos os inputs validados via DTO
- [ ] Sem queries N+1
- [ ] Sem CVEs críticos em dependências novas
- [ ] Operações pesadas enviadas para fila assíncrona (nunca bloqueiam HTTP)
```

- [ ] **Step 2: Verificar que a seção `## Não bloquear por` foi preservada ao final**

Confirme que após o novo checklist ainda existe a seção:

```markdown
## Não bloquear por
- Formatação (o linter trata)
- Preferências pessoais de estilo sem impacto objetivo
- Requisitos futuros especulativos fora do escopo
```

- [ ] **Step 3: Verificar que os labels de severidade estão antes do checklist (linhas 1-11 inalteradas)**

Os labels 🔴 🟡 🟢 💡 e o `## Formato de saída` devem estar intactos.

- [ ] **Step 4: Commit**

```bash
git add .ai-core/agents/reviewer.agent.md
git commit -m "feat: split reviewer checklist into Stage 1 (Functional) and Stage 2 (Quality)"
```

---

### Task 3: Atualizar `planner.agent.md` com dois modos de operação

**Files:**
- Modify: `.ai-core/agents/planner.agent.md`

- [ ] **Step 1: Adicionar a seção `## Modos de Operação` logo após `## Role`**

Insira o seguinte bloco após a linha `## Role` (linha 3) e antes de `## Leia antes de começar` (linha 6):

```markdown
## Modos de Operação

Você opera em **exatamente um** dos dois modos abaixo. Nunca misture os dois no mesmo contexto.

---

### Modo Spec ← use quando não há spec aprovado

**Quando usar:** o requisito chegou como descrição de produto, user story ou pedido verbal — sem um arquivo `.ai-core/specs/YYYY-MM-DD-<topic>.md` com `Status: approved`.

**O que fazer:**
1. Conduza o levantamento fazendo **uma pergunta por vez** para entender problema, cenários de usuário e restrições.
2. Ao ter clareza suficiente, gere o arquivo `.ai-core/specs/YYYY-MM-DD-<topic>.md` usando o template em `.ai-core/specs/spec-template.md`.
3. **Pare.** Informe o caminho do arquivo gerado e aguarde:
   > "Spec gerado em `.ai-core/specs/YYYY-MM-DD-<topic>.md` com `Status: draft`. Revise o arquivo e altere `Status` para `approved` para continuar."
4. **Não crie tasks, não defina API contracts, não decomponha nada** antes da aprovação.

---

### Modo Plan ← use quando há spec aprovado

**Quando usar:** existe um arquivo `.ai-core/specs/YYYY-MM-DD-<topic>.md` com `Status: approved`.

**Verificação obrigatória antes de começar:**
```
Leia o campo Status no spec. Se não for "approved", recuse e instrua o humano a aprovar primeiro.
```

**O que fazer:**
1. Leia o spec aprovado como entrada primária — todos os FRs e critérios de sucesso guiam o plano.
2. Siga o processo de planejamento abaixo (seções 1-4).
3. Produza as tarefas técnicas no formato declarado.

---
```

- [ ] **Step 2: Verificar que as seções `## Leia antes de começar`, `## Processo de planejamento` e `## Escalar imediatamente se` foram preservadas intactas**

O arquivo deve ter a seguinte estrutura após a edição:
1. `# Planner Agent`
2. `## Role`
3. `## Modos de Operação` ← novo
4. `## Leia antes de começar`
5. `## Processo de planejamento`
6. `## Formato de tarefa`
7. `## Escalar imediatamente se`

- [ ] **Step 3: Commit**

```bash
git add .ai-core/agents/planner.agent.md
git commit -m "feat: add Spec/Plan dual-mode operation to planner.agent with human gate"
```

---

### Task 4: Atualizar `feature-delivery.md` com Fase 0 e gate humano

**Files:**
- Modify: `.ai-core/workflows/feature-delivery.md`

- [ ] **Step 1: Substituir a linha `## Overview` e o diagrama atual**

Localize e substitua este bloco (linhas 5-9):

```markdown
## Overview

```
Requirement → Plan → Backend → Frontend → Integration → Review → Deploy
```
```

Por:

```markdown
## Overview

```
Requirement → [Fase 0: Spec] → ⛔ GATE: aprovação humana → [Fase 1: Plan] → Backend → Frontend → Integration → Review → Deploy
```

> O gate entre Fase 0 e Fase 1 é obrigatório. Nenhuma fase de implementação começa sem um spec com `Status: approved` em `.ai-core/specs/`.
```

- [ ] **Step 2: Inserir `## Phase 0: Spec (Planner Agent — Modo Spec)` antes de `## Phase 1`**

Insira o seguinte bloco completo antes da linha `## Phase 1: Planning (Planner Agent)`:

```markdown
## Phase 0: Spec (Planner Agent — Modo Spec)

**Input:** Requisito de produto, user story, ou pedido verbal
**Output:** `.ai-core/specs/YYYY-MM-DD-<topic>.md` com `Status: draft`

1. Ler `.ai-core/context/architecture.md` e `.ai-core/context/product.md`
2. Conduzir levantamento com o solicitante (uma pergunta por vez)
3. Gerar spec usando `.ai-core/specs/spec-template.md` como base
4. Salvar em `.ai-core/specs/YYYY-MM-DD-<nome-do-topico>.md`
5. **Parar e aguardar** — informar o caminho do arquivo ao solicitante

**⛔ GATE — Aprovação Humana Obrigatória**

O solicitante deve:
- Revisar o spec gerado
- Corrigir ambiguidades, escopos incorretos ou requisitos faltantes
- Alterar `Status: draft` → `Status: approved` no arquivo

**Nenhuma fase subsequente começa antes deste gate ser cumprido.**

---
```

- [ ] **Step 3: Atualizar o cabeçalho da `Phase 1` para refletir o novo input**

Localize:
```markdown
**Input**: Product requirement or user story
**Output**: Technical spec with tasks and API contract
```

Substitua por:
```markdown
**Input:** Spec aprovado em `.ai-core/specs/YYYY-MM-DD-<topic>.md` (campo `Status: approved` obrigatório)
**Output:** Tarefas técnicas ordenadas com contrato de API definido
```

- [ ] **Step 4: Verificar a estrutura final do arquivo**

O arquivo deve ter estas seções na ordem:
1. `# Feature Delivery Workflow`
2. `## Overview` (com o novo diagrama)
3. `## Phase 0: Spec` ← novo
4. `## Phase 1: Planning`
5. `## Phase 2: Backend Implementation`
6. `## Phase 3: Frontend Implementation`
7. `## Phase 4: Integration`
8. `## Phase 5: Review`
9. `## Phase 6: Deploy`
10. `## Definition of Done`

- [ ] **Step 5: Commit**

```bash
git add .ai-core/workflows/feature-delivery.md
git commit -m "feat: add Phase 0 Spec with human approval gate to feature-delivery workflow"
```

---

### Task 5: Verificação final de consistência

**Files:**
- Read: `.ai-core/specs/spec-template.md`
- Read: `.ai-core/agents/planner.agent.md`
- Read: `.ai-core/agents/reviewer.agent.md`
- Read: `.ai-core/workflows/feature-delivery.md`

- [ ] **Step 1: Verificar FR-001 — gate explícito no feature-delivery.md**

Abrir `feature-delivery.md` e confirmar:
- Existe `## Phase 0: Spec` antes de `## Phase 1`
- Existe a seção `⛔ GATE — Aprovação Humana Obrigatória`
- O `## Overview` menciona o gate

- [ ] **Step 2: Verificar FR-002/FR-003/FR-004 — dois modos no planner**

Abrir `planner.agent.md` e confirmar:
- Existe `## Modos de Operação`
- Existe `### Modo Spec` com instrução de parar e não criar tasks
- Existe `### Modo Plan` com verificação obrigatória do campo `Status: approved`

- [ ] **Step 3: Verificar FR-005 — spec-template.md com formato híbrido**

Abrir `spec-template.md` e confirmar que os seis campos obrigatórios estão presentes (Problema, Cenários P1/P2/P3, FR-NNN, Critérios de Sucesso, Fora do Escopo, Riscos).

- [ ] **Step 4: Verificar FR-006/FR-007 — dois estágios no reviewer**

Abrir `reviewer.agent.md` e confirmar:
- Existe `### Estágio 1 — Funcional`
- Existe `### Estágio 2 — Qualidade`
- Existe instrução explícita de encerrar no Estágio 1 se houver BLOCKER

- [ ] **Step 5: Verificar FR-008 — sem referências a ferramentas específicas**

Buscar nos quatro arquivos por: "Claude", "Copilot", "Gemini", "GitHub Actions", "VS Code".
Nenhuma referência deve existir.

- [ ] **Step 6: Commit final**

```bash
git add .
git commit -m "chore: verify spec-driven workflow implementation complete"
```
