# Scaffold IA — Next.js & NestJS

Configuração agnóstica de IA para projetos com stack **Next.js + NestJS + Turborepo**.
Define papéis de agentes, decisões de projeto, padrões de código e fluxos de entrega.
Compatível com Claude Code, Codex, Cursor, Copilot Workspace e qualquer ferramenta que leia arquivos de contexto.

---

## O problema que isso resolve

Agentes de IA não sabem nada sobre o seu projeto: stack, convenções, decisões tomadas, regras de negócio. O `.ai-core/` é a memória persistente que preenche essa lacuna — sem reensinar o que o agente já sabe.

**Princípio central**: coloque no contexto apenas o que o agente não pode inferir sozinho.

---

## Estrutura

```
.ai-core/
├── agents/               ← Papel, regras e checklist por tipo de trabalho
│   ├── frontend.agent.md
│   ├── backend.agent.md
│   ├── reviewer.agent.md
│   └── planner.agent.md
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
│   ├── feature-delivery.md
│   ├── review-process.md
│   └── release-process.md
│
└── GLOSSARY.md           ← Termos do domínio com definições precisas

.claude/CLAUDE.md         ← Adaptador para Claude Code (carregado automaticamente)
AGENTS.md                 ← Adaptador para Codex / Cursor / Copilot Workspace
```

---

## Como adotar em um projeto novo

```bash
# 1. Copie o .ai-core/ para o seu projeto
cp -r scaffold-ia/.ai-core  meu-projeto/
cp -r scaffold-ia/.claude   meu-projeto/
cp    scaffold-ia/AGENTS.md meu-projeto/

# 2. Preencha os arquivos de contexto
#    São os únicos que exigem edição manual:
#    .ai-core/context/architecture.md  → sua stack e decisões reais
#    .ai-core/context/product.md       → seu domínio e regras de negócio
#    .ai-core/context/ui-guidelines.md → seu design system

# 3. Preencha as decisões
#    .ai-core/decisions/frontend.md    → suas libs (Tailwind? shadcn? Zustand?)
#    .ai-core/decisions/backend.md     → seu ORM, auth, cache

# 4. Adicione termos do domínio
#    .ai-core/GLOSSARY.md
```

Os arquivos de `agents/` e `workflows/` funcionam sem edição. Ajuste só se seus processos divergirem do padrão.

---

## Como usar no dia a dia

Diga ao agente qual papel assumir e quais arquivos ler:

```
Você é o agente de BACKEND deste projeto.
Leia .ai-core/agents/backend.agent.md e .ai-core/decisions/backend.md.
Tarefa: implementar o endpoint de criação de pedido.
```

```
Você é o agente de FRONTEND deste projeto.
Leia .ai-core/agents/frontend.agent.md e .ai-core/decisions/frontend.md.
Tarefa: criar a página de listagem de pedidos.
```

```
Você é o PLANNER deste projeto.
Leia .ai-core/agents/planner.agent.md, context/architecture.md e context/product.md.
Quero implementar notificações por email. Quebre em tarefas.
```

```
Você é o REVIEWER deste projeto.
Leia .ai-core/agents/reviewer.agent.md e decisions/backend.md.
Revise o seguinte diff: [cole o diff]
```

---

## O que cada diretório faz

### `agents/`
Define **papel, responsabilidades e regras não-negociáveis** por tipo de trabalho.
Inclui os padrões de código — o agente não precisa de arquivos de standards separados.

### `decisions/`
Lista **escolhas do projeto** — não tutoriais de tecnologia.
Exemplo: `"Tailwind CSS — sem styled-components"`, `"Prisma com PostgreSQL"`.
O agente já sabe usar Tailwind; ele precisa saber que *você escolheu* Tailwind.

### `context/`
Informações **únicas do seu produto**. São os únicos arquivos que você precisa preencher ao adotar o scaffold. Quanto mais detalhado, melhor o resultado.

### `workflows/`
Processos de trabalho carregados **sob demanda**, não em toda sessão.
Úteis em planejamento de features, revisões e releases.

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
