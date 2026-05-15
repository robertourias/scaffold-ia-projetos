# Scaffold IA — Next.js & NestJS

Configuração agnóstica de IA para projetos com stack **Next.js + NestJS + Turborepo**.
Define papéis de agentes, fluxo de entrega spec-driven, decisões de projeto, padrões de código e processo de revisão em dois estágios.
Compatível com Claude Code, Codex, Cursor, Copilot Workspace e qualquer ferramenta que leia arquivos de contexto.

---

## O problema que isso resolve

Agentes de IA não sabem nada sobre o seu projeto: stack, convenções, decisões tomadas, regras de negócio. Sem contexto, eles inventam convenções, repetem perguntas e divergem do que foi decidido.

O `.ai-core/` é a memória persistente que preenche essa lacuna — sem reensinar o que o agente já sabe sobre a tecnologia em si.

**Princípio central:** coloque no contexto apenas o que o agente não pode inferir sozinho. Carregue apenas o que é relevante para a tarefa em curso.

---

## Estrutura

```
.ai-core/
├── agents/               ← Papel, regras e checklist por tipo de trabalho
│   ├── planner.agent.md  ← Spec-driven: Modo Spec e Modo Plan separados
│   ├── frontend.agent.md
│   ├── backend.agent.md
│   └── reviewer.agent.md ← Revisão em dois estágios: Funcional → Qualidade
│
├── specs/                ← Specs aprovados por feature (gerados pelo planner)
│   ├── spec-template.md  ← Template híbrido para novos specs
│   └── YYYY-MM-DD-<topic>.md  ← Spec de cada feature (Status: draft → approved)
│
├── decisions/            ← Escolhas específicas do projeto (não tutoriais)
│   ├── frontend.md       ← Stack, libs, padrões de teste do frontend
│   └── backend.md        ← ORM, auth, arquitetura, padrões de teste do backend
│
├── context/              ← O que é único do seu produto (preencha estes)
│   ├── architecture.md   ← Stack real, estrutura, decisões arquiteturais
│   ├── product.md        ← Usuários, regras de negócio, glossário
│   ├── conventions.md    ← Nomenclatura, Git, imports, comentários
│   └── ui-guidelines.md  ← Design system, tokens, componentes
│
├── workflows/            ← Processos (carregados sob demanda)
│   ├── feature-delivery.md  ← Fase 0: Spec → gate → Plan → implementação
│   ├── review-process.md
│   └── release-process.md
│
└── GLOSSARY.md           ← Termos do domínio com definições precisas

.claude/CLAUDE.md         ← Adaptador para Claude Code (carregado automaticamente)
AGENTS.md                 ← Adaptador para Codex / Cursor / Copilot Workspace
```

---

## Economia de tokens

O design de carregamento sob demanda é intencional. Cada arquivo existe para ser lido **apenas quando relevante** — não em toda sessão.

### Quanto contexto cada papel usa

| Papel | Arquivos carregados | Tokens est. |
|-------|--------------------|-----------:|
| Backend | `backend.agent.md` + `conventions.md` + `decisions/backend.md` | ~1.1k |
| Frontend | `frontend.agent.md` + `conventions.md` + `ui-guidelines.md` + `decisions/frontend.md` | ~1.5k |
| Planner (Modo Spec) | `planner.agent.md` + `context/architecture.md` + `context/product.md` | ~2k |
| Planner (Modo Plan) | idem + spec aprovado da feature | ~3k |
| Reviewer | `reviewer.agent.md` + `decisions/<domínio>.md` | ~1k |

### O que não carregar por padrão

Estes arquivos são carregados **sob demanda**, não em toda sessão:

| Arquivo | Quando carregar |
|---------|----------------|
| `workflows/feature-delivery.md` | Ao iniciar planejamento de feature |
| `workflows/review-process.md` | Ao abrir PR ou revisão formal |
| `workflows/release-process.md` | Ao preparar deploy |
| `GLOSSARY.md` | Quando surgir termo de domínio ambíguo |
| `context/product.md` | Quando o planner precisar de regras de negócio |

### Princípio: delta, não tutorial

O agente já sabe como usar Next.js, NestJS, TypeScript e Clean Architecture. O que ele **não** sabe é que *você escolheu* Tailwind em vez de styled-components, ou que pedidos acima de R$ 500 exigem aprovação manual. Esse delta é o que o `.ai-core/` entrega.

Por isso os arquivos foram enxugados para conter apenas:
- **Decisões** (o que o projeto escolheu, não como a tecnologia funciona)
- **Regras não-óbvias** (restrições que divergem do comportamento padrão)
- **Contexto de domínio** (o que só existe no seu produto)

Naming óbvio (PascalCase, camelCase, snake_case para DB), breakpoints padrão do Tailwind, type scale padrão — tudo isso foi removido porque o LLM já sabe. Cada token deve entregar informação que o modelo não teria sem o arquivo.

### Status dos arquivos de contexto

`context/architecture.md` e `context/product.md` contêm seções `<!-- TODO -->` a preencher. Enquanto vazios, carregá-los desperdiça tokens sem entregar valor. Ambos têm um aviso de **Status do arquivo** no topo — preencha antes de usar com agentes.

---

## Fluxo de entrega (spec-driven)

O fluxo completo de uma feature vai da ideia ao deploy em seis fases. A novidade é a **Fase 0** com gate humano — nenhum plano técnico começa sem spec aprovado.

```
Ideia/requisito
      ↓
[Fase 0: Spec]  ← planner conduz levantamento, gera .ai-core/specs/YYYY-MM-DD-<topic>.md
      ↓
⛔ GATE: você altera Status: draft → Status: approved no arquivo
      ↓
[Fase 1: Plan]  ← planner lê o spec aprovado e decompõe em tarefas técnicas
      ↓
[Fase 2: Backend] → [Fase 3: Frontend] → [Fase 4: Integration]
      ↓
[Fase 5: Review]  ← revisor aplica checklist em dois estágios
      ↓
[Fase 6: Deploy]
```

### Por que o gate importa

Sem o gate, o agente assume o escopo e você descobre o desvio tarde — após código já escrito. O spec obriga o alinhamento **antes** de qualquer implementação. Se o spec estiver errado, você edita um arquivo Markdown; se o plano estiver errado, você reverte código.

---

## Como usar no dia a dia

### Slash commands (Claude Code)

Os comandos abaixo estão disponíveis via `/` no Claude Code. Cada um carrega automaticamente os arquivos `.ai-core/` relevantes para o papel.

| Comando | Exemplo | O que faz |
|---------|---------|-----------|
| `/init-project [desc]` | `/init-project sistema de pedidos` | Preenche todos os arquivos de contexto interativamente (use ao iniciar) |
| `/retomar` | `/retomar` | Reconstrói contexto da sessão anterior — use ao voltar ao projeto |
| `/checkpoint` | `/checkpoint` | Salva estado atual em `STATUS.md` — use antes de encerrar a sessão |
| `/spec [requisito]` | `/spec notificações por email` | Planner conduz levantamento, gera spec draft e para — aguarda aprovação |
| `/plan [caminho-spec]` | `/plan .ai-core/specs/2026-05-20-email.md` | Planner cria plano técnico a partir do spec aprovado |
| `/back [tarefa]` | `/back implementar use case de envio de email` | Backend agent com contexto completo carregado |
| `/front [tarefa]` | `/front criar página de preferências de notificação` | Frontend agent com contexto completo carregado |
| `/review [diff]` | `/review [cole o diff aqui]` | Revisão em dois estágios — Funcional → Qualidade |

O revisor aplica o checklist em **dois estágios sequenciais**: Estágio 1 (Funcional) primeiro — um 🔴 BLOCKER encerra a revisão sem avançar para o Estágio 2 (Qualidade).

Referência completa e uso em outros tools (Cursor, Copilot Workspace): [`.ai-core/commands/README.md`](.ai-core/commands/README.md)

### Retomando o trabalho após uma interrupção

Quando você volta a um projeto depois de horas ou dias, o agente não tem memória da sessão anterior. O par `/checkpoint` + `/retomar` resolve isso.

**Antes de fechar:**
```
/checkpoint
  → agente lê git log + contexto da conversa
  → escreve .ai-core/STATUS.md com tasks prontas, em progresso e próximos passos
  → faz commit do STATUS.md
```

**Ao voltar:**
```
/retomar
  → agente lê STATUS.md + git log + spec ativo + plano ativo
  → apresenta resumo: o que está pronto, onde parou, próxima ação concreta
  → pergunta: "Continuar de onde paramos?"
```

O `/retomar` funciona mesmo sem `/checkpoint` anterior — ele infere o estado a partir do git log e dos specs aprovados. Mas com o checkpoint ele recupera também decisões verbais e trabalho não commitado.

### Fluxo completo de uma feature com slash commands

```
# Iniciar o projeto (uma vez)
/init-project [descrição do produto]

# Feature nova
/spec notificações por email
  → planner gera .ai-core/specs/2026-05-20-email-notifications.md (Status: draft)
  → você edita o arquivo: Status: draft → Status: approved

/plan .ai-core/specs/2026-05-20-email-notifications.md
  → planner decompõe em tarefas técnicas com contrato de API

/back implementar use case de envio de email
/front criar página de preferências de notificação

/review [diff do backend]
/review [diff do frontend]

# Antes de fechar
/checkpoint

# Ao voltar
/retomar
```

### Sem slash commands (Cursor, Copilot, outros)

Use os prompts abaixo copiando diretamente no chat da ferramenta:

**Spec:**
```
Você é o PLANNER deste projeto.
Leia .ai-core/agents/planner.agent.md, .ai-core/context/architecture.md e .ai-core/specs/spec-template.md.
Feature: notificações por email. Não há spec aprovado ainda.
```

**Plan** (após spec aprovado):
```
Você é o PLANNER deste projeto.
Leia .ai-core/agents/planner.agent.md e .ai-core/specs/2026-05-20-email-notifications.md.
O spec está aprovado. Gere o plano técnico.
```

**Backend:**
```
Você é o agente de BACKEND deste projeto.
Leia .ai-core/agents/backend.agent.md, .ai-core/context/conventions.md e .ai-core/decisions/backend.md.
Tarefa: implementar o use case de envio de notificação por email.
```

**Frontend:**
```
Você é o agente de FRONTEND deste projeto.
Leia .ai-core/agents/frontend.agent.md, .ai-core/context/conventions.md e .ai-core/decisions/frontend.md.
Tarefa: criar a página de preferências de notificação.
```

**Review:**
```
Você é o REVIEWER deste projeto.
Leia .ai-core/agents/reviewer.agent.md e .ai-core/decisions/backend.md.
Revise o seguinte diff: [cole o diff]
```

---

## Como adotar em um projeto novo

```bash
# 1. Copiar o scaffold
cp -r scaffold-ia-projetos/.ai-core  meu-projeto/
cp -r scaffold-ia-projetos/.claude   meu-projeto/
cp    scaffold-ia-projetos/AGENTS.md meu-projeto/
cp    scaffold-ia-projetos/.gitignore meu-projeto/

# 2. Inicializar
/init-project sistema de gestão de pedidos para restaurantes
```

O comando conduz uma entrevista em 5 blocos sequenciais, uma pergunta por vez:

| Bloco | Perguntas | Preenche
|------|-----------|---------|
| 1 — Produto | nome, estágio, usuários, features, regras de negócio, glossário | context/product.md |
| 2 — Arquitetura | ORM, auth, banco, filas, cache, hospedagem, CI/CD | context/architecture.md |
| 3 — Backend | confirmação de decisões + extras | decisions/backend.md |
| 4 — Frontend | styling, componentes, estado, forms, data fetching, ícones, tokens | decisions/frontend.md + ui-guidelines.md |
| 5 — Glossário | usa termos coletados no Bloco 1 | GLOSSARY.md | 

Ao final, exibe um resumo do que foi preenchido, o que ficou como "a definir" e sugere o primeiro /spec para começar a entregar.

---

## O que cada diretório faz

### `agents/`
Define **papel, responsabilidades e regras não-negociáveis** por tipo de trabalho.
O planner tem dois modos mutuamente exclusivos (Spec e Plan). O reviewer tem checklist em dois estágios.

### `specs/`
Specs gerados pelo planner durante o levantamento de features. O campo `Status` controla o gate:
- `draft` → spec em revisão, planner bloqueado para criar tasks
- `approved` → planner pode criar o plano técnico

Use `spec-template.md` como base. Specs aprovados ficam versionados como histórico de decisão de produto.

### `decisions/`
Lista **escolhas do projeto** — não tutoriais de tecnologia.
Exemplo: `"Tailwind CSS — sem styled-components"`, `"Prisma com PostgreSQL"`.
O agente já sabe usar Tailwind; ele precisa saber que *você escolheu* Tailwind.

### `context/`
Informações **únicas do seu produto**. São os únicos arquivos que você precisa preencher ao adotar o scaffold. Quanto mais detalhado, melhor o resultado.

### `workflows/`
Processos de trabalho carregados **sob demanda**, não em toda sessão.
O `feature-delivery.md` descreve o fluxo completo com Fase 0 (Spec) e todos os gates.

### `GLOSSARY.md`
Termos do domínio com definições precisas.
Pequeno arquivo, alto ROI: elimina ambiguidades de negócio que custam retrabalho.

---

## Adaptadores incluídos

| Ferramenta | Arquivo | Comportamento |
|-----------|---------|---------------|
| Claude Code | `.claude/CLAUDE.md` | Carregado automaticamente ao abrir o projeto |
| OpenAI Codex | `AGENTS.md` | Lido automaticamente na raiz do repositório |
| Cursor Agent | `AGENTS.md` | Cursor usa `AGENTS.md` como contexto do projeto |
| Copilot Workspace | `AGENTS.md` | Compatível com o formato AGENTS.md |

---

## Manutenção

O `.ai-core/` é um documento vivo. Atualize quando:

- Decisão arquitetural for tomada → `context/architecture.md`
- Regra de negócio for definida → `context/product.md`
- Nova lib/stack for adotada → `decisions/frontend.md` ou `decisions/backend.md`
- Novo termo do domínio surgir → `GLOSSARY.md`
- Feature nova for aprovada → `specs/YYYY-MM-DD-<topic>.md`

Trate com o mesmo cuidado que código de produção: versionado no Git, revisado em PR.

---

## Stack suportada por padrão

| Camada | Tecnologia |
|--------|-----------|
| Monorepo | Turborepo |
| Frontend | Next.js 14+ (App Router) |
| Backend | NestJS |
| Linguagem | TypeScript strict |
| Arquitetura | Clean Architecture |

---

## Licença

MIT
