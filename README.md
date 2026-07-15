# Scaffold IA — Next.js & NestJS

Estrutura agnóstica de contexto persistente para agentes de IA. Define papéis, fluxo spec-driven, padrões de código e processo de revisão em dois estágios.

Compatível com Claude Code, Cursor, Codex, Copilot Workspace e qualquer ferramenta que leia arquivos.

---

## O problema que resolve

Agentes de IA não sabem sobre seu projeto: stack, convenções, decisões, regras de negócio. Sem contexto, inventam padrões, repetem perguntas e divergem do planejado.

O `docs/` é a memória persistente que preenche essa lacuna **sem reensinar tecnologias que o agente já conhece**.

**Princípio central:** coloque no contexto apenas o que o agente não pode inferir sozinho. Carregue apenas o que é relevante para a tarefa em curso.

---

## Quick Start

### Para um projeto novo

```bash
# 1. Copiar scaffold
cp -r scaffold-ia-projetos/docs   seu-projeto/
cp -r scaffold-ia-projetos/.claude seu-projeto/
cp    scaffold-ia-projetos/AGENTS.md seu-projeto/

# 2. Inicializar no Claude Code
/init-project sistema de gestão de pedidos para restaurantes
```

O comando conduz entrevista em 5 blocos (nome, arquitetura, decisões backend, frontend, convenções) e preenche automaticamente `docs/context/`.

### Para um projeto existente

```bash
# 1. Copiar arquivos atualizados
cp -r scaffold-ia-projetos/docs/commands/ seu-projeto/docs/
cp -r scaffold-ia-projetos/docs/workflows/ seu-projeto/docs/
cp -r scaffold-ia-projetos/docs/skills/ seu-projeto/docs/

# 2. Criar pastas
mkdir -p seu-projeto/docs/archive seu-projeto/docs/context/domains

# 3. Reorganizar (veja "Migração" abaixo)
```

---

## Estrutura

```
docs/
├── skills/                ← Papéis, responsabilidades, padrões reutilizáveis
│   ├── planner.md        ← Spec-driven: Spec → Plan → Implementação
│   ├── backend.md
│   ├── frontend.md
│   ├── quality.md        ← Revisão em dois estágios
│   └── supabase.md       ← Padrões Supabase (Auth/DB/Storage)
│
├── specs/                 ← Specs aprovados de features
│   ├── spec-template.md  ← Base para novos specs
│   └── YYYY-MM-DD-*.md   ← Spec de cada feature (Status: draft → approved)
│
├── context/               ← Informações únicas do seu produto (preencha estes!)
│   ├── product.md        ← Usuários, regras de negócio
│   ├── product-backlog.md← Tasks (gerado por /backlog)
│   ├── conventions.md    ← Nomenclatura, Git, imports
│   ├── decisions.md      ← Escolhas de frontend e backend
│   ├── ui-guidelines.md  ← Design system, tokens, componentes
│   └── current-state.md  ← Estado atual (atualizado por /checkpoint)
│
├── architecture/          ← Visão arquitetural detalhada
│   ├── overview.md
│   ├── backend.md
│   ├── frontend.md
│   └── infra.md
│
├── workflows/             ← Processos (carregados sob demanda)
│   ├── feature-delivery.md← Fases 0-7 da entrega
│   ├── release-process.md
│   └── playbook-tokens-qualidade.md ← Modos econômico / rigor / emergência
│
├── commands/              ← Prompts de ativação de papéis
│   └── README.md          ← Referência completa
│
├── comparativo-scaffold-vs-superpowers.md ← Scaffold vs Superpowers (tokens × qualidade)
│
└── changelog/             ← Histórico por data

.claude/CLAUDE.md          ← Adaptador Claude Code
AGENTS.md                  ← Adaptador Cursor/Copilot/Codex
```

---

## Fluxo de entrega (Spec-driven)

```
Ideia/requisito
      ↓
[1] /init-project (uma vez no início)
      ↓
[2] /backlog (gera TASK01..TASKNN) ← ou pule para [3] se for feature avulsa
      ↓
[3] /spec TASK01 (gera spec + plano de tarefas técnicas)
      ↓
      ⛔ GATE: você edita spec/plano → Status: approved
      ↓
[4] /back tarefa1, tarefa2, tarefa3
      ↓
[5] /front tela1, tela2
      ↓
[6] /review [diff]
      ↓
[7] /checkpoint (salva estado) → git commit
      ↓
[8] Mova specs concluídas para docs/archive/
```

**Por que o gate importa:** Sem a aprovação, o agente assume escopo e você descobre tarde. A spec com as tarefas técnicas obriga alinhamento **antes** de escrever código.

### Playbook e comparativo (tokens × qualidade)

| Documento | Uso |
|-----------|-----|
| [Playbook — modos econômico / rigor / emergência](docs/workflows/playbook-tokens-qualidade.md) | Decidir **como** trabalhar em cada tarefa (default do dia a dia) |
| [Comparativo Scaffold vs Superpowers](docs/comparativo-scaffold-vs-superpowers.md) | Entender trade-offs de tokens, qualidade e modelo híbrido |

**Regra prática:** scaffold como sistema operacional do projeto; Superpowers só sob demanda (ambiguidade, bug hard, feature de alto risco). Detalhes no playbook.

---

## Slash Commands (Claude Code)

| Comando | Exemplo | O quê |
|---------|---------|-------|
| `/init-project` | `/init-project sistema de pedidos` | Entrevista, preenche contexto |
| `/backlog` | `/backlog` | Gera TASK01..TASKNN do product.md |
| `/spec` | `/spec TASK01` | Levantamento, gera spec + plano técnico (Status: review) |
| `/groom` | `/groom nova funcionalidade` | Refina uma nova feature isolada adicionando-a ao backlog |
| `/hands-on` | `/hands-on docs/specs/….md` | Executa o plano da Spec em ondas (paralelo) |
| `/back` | `/back implementar auth com JWT` | Agent backend |
| `/front` | `/front criar modal de login` | Agent frontend |
| `/review` | `/review [cole diff aqui]` | Revisão 2 estágios: Funcional → Qualidade |
| `/checkpoint` | `/checkpoint` | Salva estado, gera changelog |
| `/retomar` | `/retomar` | Reconstrói contexto após interrupção |

Referência completa e uso em Cursor/Copilot: [`docs/commands/README.md`](docs/commands/README.md)

Playbook de modos (quando batch vs hands-on vs Superpowers): [`docs/workflows/playbook-tokens-qualidade.md`](docs/workflows/playbook-tokens-qualidade.md)

---

## Economia de Tokens — Controle de Contexto

O design de **carregamento sob demanda** é proposital: cada arquivo existe para ser lido **apenas quando relevante** — nunca em toda sessão.

### Quanto contexto cada papel usa

| Papel | Arquivos | Tokens |
|-------|----------|--------|
| Backend | `skills/backend.md` + `conventions.md` + `decisions.md` | ~0.8k |
| Frontend | `skills/frontend.md` + `conventions.md` + `ui-guidelines.md` + `decisions.md` | ~1.1k |
| Planner (Spec + Plan) | `skills/planner.md` + `product.md` + `architecture/overview.md` | ~1.4k |
| Reviewer | `skills/quality.md` + `conventions.md` + `decisions.md` | ~0.8k |

### Estratégias implementadas

**1. Fragmentação por relevância**
- Só carrega o que a tarefa precisa
- Specs vão para `archive/` quando concluídos
- Regras de negócio fragmentadas em `context/domains/` (auth.md, payments.md, etc.)

**2. Delta, não tutorial**
O agente já sabe Next.js, NestJS, TypeScript, Clean Architecture. O `docs/` entrega apenas o que é **único do seu produto**:
- Decisões tomadas (Tailwind em vez de styled-components)
- Regras não-óbvias (pedidos acima de R$ 500 precisam aprovação)
- Contexto de domínio (seu modelo de negócio)

**3. Batching**
Agrupe tarefas pequenas em uma chamada:
```
/back implementar use cases: autenticação, criação de pedido, listagem
/front criar páginas: login, home, checkout
```
Reduz overhead de sessões múltiplas.

**4. Compressão ativa**
Antes de fechar, `/checkpoint` gera `current-state.md` comprimido — apenas status alto nível, tarefa ativa e próximos passos. Remove histórico granular.

### Crescimento controlado

O contexto cresce apenas quando:
- Você adiciona nova regra de negócio → `product.md` ou `context/domains/*.md`
- Você toma decisão arquitetural → `architecture/*.md` ou `decisions.md`
- Você aprova nova feature → novo spec em `specs/`

Tudo mais é descartado ao final de cada feature (specs vão para archive).

### Quando escalar o processo (e quando não)

Para não gastar tokens com processo pesado em tarefa simples — nem subinvestir em feature crítica — use o playbook:

- **[Playbook tokens × qualidade](docs/workflows/playbook-tokens-qualidade.md)** — modos Econômico (default), Rigor e Emergência
- **[Comparativo Scaffold vs Superpowers](docs/comparativo-scaffold-vs-superpowers.md)** — o que cada sistema otimiza e o modelo híbrido recomendado

---

## Retomando após interrupção

Quando você volta após horas ou dias, use o par `/checkpoint` + `/retomar`.

**Antes de fechar:**
```
/checkpoint
  → agente lê git log + contexto da sessão
  → escreve current-state.md resumido (pronto, em progresso, próximos passos)
  → você realiza commit manual
```

**Ao voltar:**
```
/retomar
  → agente lê current-state.md + git log + specs ativos
  → apresenta: o quê está pronto, onde parou, próxima ação
```

O `/retomar` funciona mesmo sem checkpoint anterior — ele infere estado do git log. Mas com checkpoint recupera também decisões verbais.

---

## Fluxo completo (exemplo)

```bash
# Iniciar uma vez
/init-project plataforma de gestão de despesas

# Gerar backlog
/backlog
  → você aprova lista de tarefas

# Especificar e planejar uma tarefa (juntos!)
/spec TASK01
  → você aprova spec + plano técnico, edita Status: review → Status: approved

# Implementar (batching)
/back implementar use case 1, 2 e 3
/front criar telas X, Y, Z

# Revisar
/review [diff do backend]
/review [diff do frontend]

# Encerrar
/checkpoint
git commit -m "feat: descrição"

# Arquivar
mv docs/specs/YYYY-MM-DD-*.md docs/archive/

# Próxima tarefa
/spec TASK02
```

---

## Migração — Otimizar projeto existente

Se você já tem um projeto rodando e quer economizar tokens:

### Passo 1: Atualizar arquivos base
```bash
cp -r scaffold-ia-projetos/docs/commands/ seu-projeto/docs/
cp -r scaffold-ia-projetos/docs/workflows/ seu-projeto/docs/
cp -r scaffold-ia-projetos/docs/skills/ seu-projeto/docs/
mkdir -p seu-projeto/docs/archive seu-projeto/docs/context/domains
```

### Passo 2: Reorganizar contexto (no Claude Code)

Execute este prompt:

```
Você é o PLANNER. Atualize a arquitetura de contexto para economizar tokens:

1. Analise docs/context/product.md. Se extenso, fragmente regras em
   docs/context/domains/ (ex: auth.md, payments.md, reports.md),
   deixando product.md apenas com visão geral + links.

2. Mova specs/ finalizadas para docs/archive/.

3. Reescreva docs/context/current-state.md extremamente resumido:
   - Status geral (1 frase)
   - Tarefa em progresso (1 linha)
   - Próximos passos (2-3 linhas)
   - Remove histórico e listas antigas
```

Após isso, seu projeto usa 30-40% menos tokens sem perder contexto.

---

## O que cada diretório faz

| Diretório | Responsabilidade |
|-----------|------------------|
| `skills/` | Papéis, checklist, boas práticas, qualidade |
| `specs/` | Specs de features (Status: review → approved) |
| `context/` | Informações únicas do seu produto — **você preenche** |
| `architecture/` | Visão técnica: backend, frontend, infra |
| `workflows/` | Processos (feature-delivery, release, playbook tokens×qualidade) |
| `commands/` | Prompts de ativação de papéis |
| `comparativo-scaffold-vs-superpowers.md` | Scaffold vs Superpowers (tokens × qualidade) |
| `changelog/` | Histórico por data |
| `archive/` | Specs concluídas |

---

## Adaptadores incluídos

| Ferramenta | Arquivo | Carregamento |
|-----------|---------|-------------|
| Claude Code | `.claude/CLAUDE.md` | Automático |
| Cursor | `AGENTS.md` | Automático |
| Copilot Workspace | `AGENTS.md` | Automático |
| Codex / Outros | `AGENTS.md` | Manual (copie no chat) |

---

## Manutenção

O `docs/` é um documento vivo. Trate como código de produção: versionado, revisado em PR.

Atualize quando:
- Decisão arquitetural → `architecture/`
- Regra de negócio → `product.md` ou `context/domains/`
- Nova tech/lib → `decisions.md`
- Feature aprovada → novo spec em `specs/`

---

## Stack padrão

| Camada | Tech |
|--------|------|
| Monorepo | Turborepo |
| Frontend | Next.js 14+ (App Router) |
| Backend | NestJS |
| Linguagem | TypeScript strict |
| Arquitetura | Clean Architecture |

---

## Licença

MIT
