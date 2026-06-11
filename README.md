# Scaffold IA — Next.js & NestJS

Configuração agnóstica de IA para projetos com stack **Next.js + NestJS + Turborepo**.
Define papéis de agentes, fluxo de entrega spec-driven, decisões de projeto, padrões de código e processo de revisão em dois estágios.
Compatível com Claude Code, Codex, Cursor, Copilot Workspace e qualquer ferramenta que leia arquivos de contexto.

---

## O problema que isso resolve

Agentes de IA não sabem nada sobre o seu projeto: stack, convenções, decisões tomadas, regras de negócio. Sem contexto, eles inventam convenções, repetem perguntas e divergem do que foi decidido.

O `docs/` é a memória persistente que preenche essa lacuna — sem reensinar o que o agente já sabe sobre a tecnologia em si.

**Princípio central:** coloque no contexto apenas o que o agente não pode inferir sozinho. Carregue apenas o que é relevante para a tarefa em curso.

---

## Estrutura

```
docs/
├── skills/               ← Papel, responsabilidades e padrões técnicos reutilizáveis
│   ├── backend.md
│   ├── frontend.md
│   ├── planner.md        ← Spec-driven: Modo Spec e Modo Plan com checklist arquitetural
│   ├── quality.md        ← Revisão em dois estágios: Funcional → Qualidade
│   └── supabase.md       ← Padrões técnicos para a plataforma Supabase (Auth/DB/Storage)
│
├── specs/                ← Specs aprovados por feature (gerados pelo planner)
│   ├── spec-template.md  ← Template híbrido para novos specs
│   └── YYYY-MM-DD-<topic>.md  ← Spec de cada feature (Status: draft → approved)
│
├── context/              ← O que é único do seu produto (preencha estes)
│   ├── product.md        ← Usuários, regras de negócio
│   ├── product-backlog.md← Backlog do produto (gerado por /backlog)
│   ├── conventions.md    ← Nomenclatura, Git, imports, comentários
│   ├── decisions.md      ← Escolhas de frontend e backend consolidadas
│   ├── ui-guidelines.md  ← Design system, tokens, componentes
│   └── current-state.md  ← Estado atual do projeto (atualizado por /checkpoint)
│
├── architecture/         ← Visão arquitetural detalhada
│   ├── overview.md
│   ├── backend.md
│   ├── frontend.md
│   └── infra.md
│
├── workflows/            ← Processos (carregados sob demanda)
│   ├── feature-delivery.md  ← Fase 0: Spec → gate → Plan → implementação
│   └── release-process.md
│
├── commands/             ← Prompts de ativação de papéis (fonte canônica)
│   ├── README.md
│   ├── init-project.md
│   ├── backlog.md
│   ├── retomar.md
│   ├── checkpoint.md
│   ├── spec.md
│   ├── plan.md
│   ├── back.md
│   ├── front.md
│   └── review.md
│
└── changelog/            ← Changelog por data
    └── YYYY-MM-DD.md

.claude/CLAUDE.md         ← Adaptador para Claude Code (carregado automaticamente)
AGENTS.md                 ← Adaptador para Codex / Cursor / Copilot Workspace
```

---

## Economia de tokens

O design de carregamento sob demanda é intencional. Cada arquivo existe para ser lido **apenas quando relevante** — não em toda sessão.

### Quanto contexto cada papel usa

| Papel | Arquivos carregados | Tokens est. |
|-------|--------------------|-----------:|
| Backend | `skills/backend.md` + `conventions.md` + `decisions.md` | ~0.8k |
| Frontend | `skills/frontend.md` + `conventions.md` + `ui-guidelines.md` + `decisions.md` | ~1.1k |
| Planner (Modo Spec) | `skills/planner.md` + `context/product.md` + `architecture/overview.md` | ~1.3k |
| Planner (Modo Plan) | idem + spec aprovado da feature | ~2.2k |
| Reviewer | `skills/quality.md` + `conventions.md` + `decisions.md` | ~0.8k |

### O que não carregar por padrão

Estes arquivos são carregados **sob demanda**, não em toda sessão:

| Arquivo | Quando carregar |
|---------|----------------|
| `workflows/feature-delivery.md` | Ao iniciar planejamento de feature |
| `workflows/release-process.md` | Ao preparar deploy |
| `context/product.md` | Quando o planner precisar de regras de negócio |
| `context/current-state.md` | Ao usar /retomar |

### Princípio: delta, não tutorial

O agente já sabe como usar Next.js, NestJS, TypeScript e Clean Architecture. O que ele **não** sabe é que *você escolheu* Tailwind em vez de styled-components, ou que pedidos acima de R$ 500 exigem aprovação manual. Esse delta é o que o `docs/` entrega.

Por isso os arquivos foram enxugados para conter apenas:
- **Decisões** (o que o projeto escolheu, não como a tecnologia funciona)
- **Regras não-óbvias** (restrições que divergem do comportamento padrão)
- **Contexto de domínio** (o que só existe no seu produto)

---

## Fluxo de entrega (spec-driven)

O fluxo completo de uma feature vai da ideia ao deploy em seis fases. A novidade é a **Fase 0** com gate humano — nenhum plano técnico começa sem spec aprovado.

```
Ideia/requisito global
      ↓
[Fase 0: Init]   ← /init-project preenche product.md e arquivos de contexto
      ↓
[Fase 0.5: Backlog] ← /backlog gera product-backlog.md com TASK01..TASKNN (Para features avulsas, use /groom)
      ↓
[Fase 1: Spec]   ← /spec TASKXX conduz levantamento, gera docs/specs/YYYY-MM-DD-<topic>.md
      ↓
⛔ GATE: você altera Status: draft → Status: approved no arquivo
      ↓
[Fase 2: Plan]   ← planner lê o spec aprovado e decompõe em tarefas técnicas
      ↓
[Fase 3: Backend] → [Fase 4: Frontend] → [Fase 5: Integration] (Use Batching para tarefas pequenas)
      ↓
[Fase 6: Review]  ← revisor aplica checklist em dois estágios
      ↓
[Fase 7: Deploy & Archiving] ← Mova specs e plans concluídos para docs/archive/
```

### Por que o gate importa

Sem o gate, o agente assume o escopo e você descobre o desvio tarde — após código já escrito. O spec obriga o alinhamento **antes** de qualquer implementação. Se o spec estiver errado, você edita um arquivo Markdown; se o plano estiver errado, você reverte código.

---

## Como usar no dia a dia

### Slash commands (Claude Code)

Os comandos abaixo estão disponíveis via `/` no Claude Code. Cada um carrega automaticamente os arquivos `docs/` relevantes para o papel.

| Comando | Exemplo | O que faz |
|---------|---------|-----------|
| `/init-project [desc]` | `/init-project sistema de pedidos` | Preenche todos os arquivos de contexto interativamente (use ao iniciar) |
| `/backlog` | `/backlog` | Gera product backlog (TASK01, TASK02...) a partir do product.md |
| `/groom [feature]` | `/groom integração com pagarme` | Refina uma funcionalidade específica e adiciona ao backlog existente (muito mais barato que `/backlog`) |
| `/retomar` | `/retomar` | Reconstrói contexto da sessão anterior — use ao voltar ao projeto |
| `/checkpoint` | `/checkpoint` | Salva o estado atual comprimido e changelog antes de encerrar |
| `/spec [TASKXX]` | `/spec TASK01` | Spec a partir do backlog — lê a descrição da tarefa e domínios específicos |
| `/spec [requisito]` | `/spec notificações por email` | Spec a partir de texto livre — sem consultar backlog |
| `/plan [caminho-spec]` | `/plan docs/specs/2026-05-20-email.md` | Planner cria plano técnico a partir do spec aprovado |
| `/back [tarefa]` | `/back implementar use cases X, Y e Z` | Backend agent (suporta batching para economia de tokens) |
| `/front [tarefa]` | `/front criar páginas A e B` | Frontend agent (suporta batching para economia de tokens) |
| `/review [diff]` | `/review [cole o diff aqui]` | Revisão em dois estágios — Funcional → Qualidade |

O revisor aplica o checklist em **dois estágios sequenciais**: Estágio 1 (Funcional) primeiro — um 🔴 BLOCKER encerra a revisão sem avançar para o Estágio 2 (Qualidade).

Referência completa e uso em outros tools (Cursor, Copilot Workspace): [`docs/commands/README.md`](docs/commands/README.md)

### Retomando o trabalho após uma interrupção

Quando você volta a um projeto depois de horas ou dias, o agente não tem memória da sessão anterior. O par `/checkpoint` + `/retomar` resolve isso.

**Antes de fechar:**
```
/checkpoint
  → agente lê git log + contexto da conversa
  → escreve docs/context/current-state.md com tasks prontas, em progresso e próximos passos
  → usuário realiza o commit manual de código e documentação no Git
```

**Ao voltar:**
```
/retomar
  → agente lê current-state.md + git log + spec ativo + plano ativo
  → apresenta resumo: o que está pronto, onde parou, próxima ação concreta
  → pergunta: "Continuar de onde paramos?"
```

O `/retomar` funciona mesmo sem `/checkpoint` anterior — ele infere o estado a partir do git log e dos specs aprovados. Mas com o checkpoint ele recupera também decisões verbais e trabalho não commitado.

### Fluxo completo com backlog (recomendado)

```
# Iniciar o projeto (uma vez)
/init-project [descrição do produto]

# Gerar o backlog do produto
/backlog
  → planner analisa product.md e propõe tarefas TASK01..TASKNN
  → você revisa e aprova a lista
  → gera docs/context/product-backlog.md

# Especificar cada tarefa pelo ID
/spec TASK01
  → planner lê descrição de TASK01 no backlog
  → conduz levantamento, gera docs/specs/YYYY-MM-DD-<topic>.md (Status: draft)
  → atualiza backlog: Status → spec-draft, link do spec
  → você edita: Status: draft → Status: approved no spec

/plan docs/specs/YYYY-MM-DD-<topic>.md
  → planner decompõe em tarefas técnicas com contrato de API

/back implementar tarefas 1, 2 e 3
/front implementar telas X e Y

/review [diff do backend]
/review [diff do frontend]

# Salve o checkpoint e comite manualmente no Git
/checkpoint
git commit -m "feat: ..."

# Arquive os documentos concluídos
Mova os specs e plans finalizados para docs/archive/

# Próxima tarefa (ou /groom para features isoladas)
/spec TASK02
```

### Fluxo sem backlog (feature avulsa)

```
/spec notificações por email
  → planner gera docs/specs/YYYY-MM-DD-email-notifications.md (Status: draft)
  → você edita o arquivo: Status: draft → Status: approved

/plan docs/specs/YYYY-MM-DD-email-notifications.md
  → planner decompõe em tarefas técnicas com contrato de API

/back implementar use case de envio de email
/front criar página de preferências de notificação

/review [diff do backend]
/review [diff do frontend]

# Salve o checkpoint e comite manualmente no Git
/checkpoint
git commit -m "feat: implementar notificações por email"

# Ao voltar
/retomar
```

### Sem slash commands (Cursor, Copilot, outros)

Use os prompts abaixo copiando diretamente no chat da ferramenta:

**Spec:**
```
Você é o PLANNER deste projeto.
Leia docs/skills/planner.md, docs/architecture/overview.md e docs/specs/spec-template.md.
Feature: notificações por email. Não há spec aprovado ainda.
```

**Plan** (após spec aprovado):
```
Você é o PLANNER deste projeto.
Leia docs/skills/planner.md e docs/specs/2026-05-20-email-notifications.md.
O spec está aprovado. Gere o plano técnico.
```

**Backend:**
```
Você é o agente de BACKEND deste projeto.
Leia docs/skills/backend.md, docs/context/conventions.md e docs/context/decisions.md.
Tarefa: implementar o use case de envio de notificação por email.
```

**Frontend:**
```
Você é o agente de FRONTEND deste projeto.
Leia docs/skills/frontend.md, docs/context/conventions.md e docs/context/decisions.md.
Tarefa: criar a página de preferências de notificação.
```

**Review:**
```
Você é o REVIEWER deste projeto.
Leia docs/skills/quality.md, docs/context/conventions.md e docs/context/decisions.md.
Revise o seguinte diff: [cole o diff]
```

---

## Como adotar em um projeto novo

```bash
# 1. Copiar o scaffold
cp -r scaffold-ia-projetos/docs   meu-projeto/
cp -r scaffold-ia-projetos/.claude  meu-projeto/
cp    scaffold-ia-projetos/AGENTS.md meu-projeto/
cp    scaffold-ia-projetos/.gitignore meu-projeto/

# 2. Inicializar
/init-project sistema de gestão de pedidos para restaurantes
```

O comando conduz uma entrevista em 5 blocos sequenciais, uma pergunta por vez:

| Bloco | Perguntas | Preenche
|------|-----------|---------|
| 1 — Produto | nome, estágio, usuários, features, regras de negócio | docs/context/product.md |
| 2 — Arquitetura | ORM, auth, banco, filas, cache, hospedagem, CI/CD | docs/architecture/overview.md |
| 3 — Backend | confirmação de decisões + extras | docs/context/decisions.md (seção Backend) |
| 4 — Frontend | styling, componentes, estado, forms, data fetching, ícones, tokens | docs/context/decisions.md (seção Frontend) + docs/context/ui-guidelines.md |
| 5 — Convenções | usa termos coletados no Bloco 1 | docs/context/conventions.md |

Ao final, exibe um resumo do que foi preenchido, o que ficou como "a definir" e sugere o próximo passo: `/backlog` para gerar o backlog do produto.

---

## Como atualizar projetos existentes (Migração para Economia de Tokens)

Se você já possui um projeto rodando com a versão anterior do Scaffold-IA e quer se beneficiar da otimização de tokens (Fragmentação, Batching, Compressão Ativa e `/groom`), siga estes passos:

1. **Atualize os comandos base:** Copie a pasta `docs/commands/`, `docs/workflows/` e `docs/skills/` deste repositório e substitua os equivalentes no seu projeto existente.
2. **Crie os diretórios de organização:** Crie as pastas `docs/archive/` (para specs e plans concluídos) e `docs/context/domains/` (para a fragmentação de regras de negócio).

### Instrução para reorganizar o contexto atual
No seu projeto existente, abra o chat com a IA e envie o prompt abaixo para que ela automatize a migração do seu histórico:

> **Prompt de Atualização:**
> "Você é o PLANNER. Estamos atualizando nossa arquitetura de contexto para economizar tokens. Por favor, execute as seguintes ações:
> 1. Analise o arquivo `docs/context/product.md`. Se ele estiver muito extenso, fragmente as regras de negócio em arquivos menores dentro de `docs/context/domains/` (ex: `auth.md`, `payments.md`), mantendo no `product.md` apenas a visão geral e links/apontamentos para os domínios.
> 2. Mova todos os arquivos de `docs/specs/` e `docs/plans/` que já estão com suas tarefas totalmente concluídas no `product-backlog.md` para a nova pasta `docs/archive/`.
> 3. Reescreva o arquivo `docs/context/current-state.md` removendo o histórico granular de tarefas concluídas e listas antigas, deixando o arquivo extremamente resumido, focado apenas no status de alto nível, na tarefa "Em Progresso" atual e nos próximos passos imediatos."

Após a IA concluir, seu projeto estará otimizado. Para refinar novas features pontuais, use `/groom [feature]`. Nas implementações, agrupe as tarefas usando *batching* para enviar várias tarefas numa só chamada aos agentes.

---

## O que cada diretório faz

### `docs/skills/`
Define o **papel, as responsabilidades e os padrões técnicos** reutilizáveis (checklists, regras de implementação, boas práticas e qualidade). É a única fonte de instrução técnica de papéis do projeto.

### `docs/specs/`
Specs gerados pelo planner durante o levantamento de features. O campo `Status` controla o gate:
- `draft` → spec em revisão, planner bloqueado para criar tasks
- `approved` → planner pode criar o plano técnico

Use `spec-template.md` como base. Specs aprovados ficam versionados como histórico de decisão de produto.

### `docs/context/`
Informações **únicas do seu produto**. São os únicos arquivos que você precisa preencher ao adotar o scaffold. Quanto mais detalhado, melhor o resultado.

### `docs/architecture/`
Visão arquitetural detalhada — overview, backend, frontend, infraestrutura.

### `docs/workflows/`
Processos de trabalho carregados **sob demanda**, não em toda sessão.

### `docs/commands/`
Prompts de ativação de papéis — fonte canônica usada pelos slash commands do `.claude/commands/`.

### `docs/changelog/`
Changelog organizado por data. Atualizado pelo protocolo de checkpoint via `/checkpoint`.

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

O `docs/` é um documento vivo. Atualize quando:

- Decisão arquitetural for tomada → `docs/architecture/overview.md`
- Regra de negócio for definida → `docs/context/product.md`
- Nova lib/stack for adotada → `docs/context/decisions.md`
- Feature nova for aprovada → `docs/specs/YYYY-MM-DD-<topic>.md`

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
