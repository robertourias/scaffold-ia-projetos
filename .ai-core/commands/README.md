# Comandos de Agente

Prompts de ativação para os papéis definidos no `.ai-core/`. Cada comando carrega apenas os arquivos relevantes para o papel — sem repetir o conteúdo deles.

---

## Como usar

### Claude Code (slash commands)
Os comandos em `.claude/commands/` estão disponíveis automaticamente via `/comando` no Claude Code.
`$ARGUMENTS` é substituído pelo texto que você digitar após o nome do comando.

### Cursor / Copilot Workspace / outros
Copie o prompt do comando desejado abaixo e cole diretamente no chat da ferramenta, substituindo `$ARGUMENTS` pela sua tarefa.

---

## `/back` — Backend

```
Você é o agente de BACKEND deste projeto.

Leia obrigatoriamente antes de começar:
- .ai-core/agents/backend.agent.md
- .ai-core/context/conventions.md
- .ai-core/decisions/backend.md

Tarefa: [descreva a tarefa aqui]
```

**Exemplo:**
```
/back implementar o endpoint de criação de pedido com validação de estoque
```

---

## `/front` — Frontend

```
Você é o agente de FRONTEND deste projeto.

Leia obrigatoriamente antes de começar:
- .ai-core/agents/frontend.agent.md
- .ai-core/context/conventions.md
- .ai-core/context/ui-guidelines.md
- .ai-core/decisions/frontend.md

Tarefa: [descreva a tarefa aqui]
```

**Exemplo:**
```
/front criar a página de listagem de pedidos com estados loading, empty e error
```

---

## `/spec` — Gerar spec (Planner Modo Spec)

Use quando ainda não há spec para a feature. O planner vai conduzir o levantamento, gerar o arquivo `.ai-core/specs/YYYY-MM-DD-<topic>.md` com `Status: draft` e aguardar aprovação.

```
Você é o PLANNER deste projeto em Modo Spec.

Leia obrigatoriamente antes de começar:
- .ai-core/agents/planner.agent.md
- .ai-core/context/architecture.md
- .ai-core/context/product.md
- .ai-core/specs/spec-template.md

Feature ou requisito a especificar: [descreva o requisito aqui]

Siga o Modo Spec definido em planner.agent.md: conduza o levantamento com uma pergunta por vez, gere o arquivo em .ai-core/specs/YYYY-MM-DD-<topic>.md com Status: draft e aguarde aprovação humana antes de qualquer decomposição técnica.
```

**Exemplo:**
```
/spec notificações por email quando um pedido mudar de status
```

---

## `/plan` — Criar plano técnico (Planner Modo Plan)

Use quando já existe um spec com `Status: approved`. Passe o caminho do spec como argumento.

```
Você é o PLANNER deste projeto em Modo Plan.

Leia obrigatoriamente antes de começar:
- .ai-core/agents/planner.agent.md
- .ai-core/context/architecture.md
- .ai-core/context/product.md
- [caminho do spec aprovado]

Verifique que o spec informado tem `Status: approved`. Se não tiver, recuse e instrua o usuário a aprovar antes de continuar.

Após confirmar a aprovação, siga o Modo Plan definido em planner.agent.md: leia o spec como entrada primária e decomponha em tarefas técnicas ordenadas com contrato de API definido.
```

**Exemplo:**
```
/plan .ai-core/specs/2026-05-20-email-notifications.md
```

---

## `/review` — Revisão de código

```
Você é o REVIEWER deste projeto.

Leia obrigatoriamente antes de começar:
- .ai-core/agents/reviewer.agent.md

Se o diff/PR contiver código backend (NestJS, controllers, use cases, migrations, DTOs), leia também:
- .ai-core/decisions/backend.md

Se o diff/PR contiver código frontend (React, Next.js, componentes, hooks, páginas), leia também:
- .ai-core/decisions/frontend.md

[cole o diff ou descreva o que revisar]

Aplique o checklist em dois estágios: Estágio 1 (Funcional) primeiro — se houver 🔴 BLOCKER, encerre a revisão e não passe para o Estágio 2.
```

**Exemplos:**
```
/review [cole o diff aqui]

/review PR #42 — endpoint de criação de pedido (backend)
```

---

## Fluxo típico de uma feature

```
/spec notificações por email
  → planner gera .ai-core/specs/2026-05-20-email-notifications.md
  → você altera Status: draft → approved

/plan .ai-core/specs/2026-05-20-email-notifications.md
  → planner decompõe em tarefas com contrato de API

/back implementar use case de envio de email
/front criar página de preferências de notificação

/review [diff do backend]
/review [diff do frontend]
```
