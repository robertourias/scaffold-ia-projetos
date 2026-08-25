# Scaffold IA — Next.js & NestJS

Harness de contexto persistente para agentes de IA no **Claude Code**. Define
papéis, fluxo spec-driven, padrões de código, guardrails de segurança e
processo de revisão em dois estágios.

---

## O problema que resolve

Agentes de IA não sabem sobre seu projeto: stack, convenções, decisões, regras de negócio. Sem contexto, inventam padrões, repetem perguntas e divergem do planejado.

`docs/` é a memória persistente do **produto** que preenche essa lacuna **sem reensinar tecnologias que o agente já conhece**. `.claude/` é o harness que define **como** os agentes operam sobre esse produto — comandos, subagentes, skills de papel, hooks de verificação e guardrails de permissão.

**Princípio central:** coloque no contexto apenas o que o agente não pode inferir sozinho. Carregue apenas o que é relevante para a tarefa em curso.

---

## Quick Start

### Para um projeto novo

```
# 1. Copiar scaffold
cp -r scaffold-ia-projetos/docs    seu-projeto/
cp -r scaffold-ia-projetos/.claude seu-projeto/

# 2. Inicializar no Claude Code (o Bloco 6 gera .claude/settings.json)
/init-project sistema de gestão de pedidos para restaurantes
```

O comando conduz entrevista em **8 blocos** (produto em profundidade, arquitetura, decisões backend, frontend, convenções, **guardrails**, **constituição** e **README do repositório**) e preenche automaticamente `docs/context/`, gera `.claude/settings.json` com os limites de permissão do projeto, e atualiza o `README.md` da raiz para quem chega no projeto pela primeira vez.

### Para um projeto existente (só reorganizar / economizar tokens)

```
# 1. Copiar o harness atualizado
cp -r scaffold-ia-projetos/.claude/. seu-projeto/.claude/

# 2. Criar pastas de produto
mkdir -p seu-projeto/docs/archive seu-projeto/docs/context/domains
```

### Para um projeto existente sem documentação (bootstrap retroativo)

Se o projeto já tem código rodando mas nunca teve `docs/context/` ou
`docs/architecture/` preenchidos — não é um problema de organização, é um
problema de conteúdo inexistente — use o prompt de bootstrap retroativo:

```
cat .claude/prompts/retroactive-documentation.md
# cole o conteúdo no Claude Code, na raiz do projeto existente
```

Diferente da migração acima (que só reorganiza arquivos genéricos), este
prompt **analisa o código real** — `package.json`, configs, estrutura de
pastas, git log — e gera o conteúdo de `product.md`, `decisions.md`,
`architecture/overview.md` etc. a partir do que já foi implementado, em vez
de deixar placeholders para você preencher manualmente. Qualquer informação
que não possa ser inferida com confiança é marcada como
`[INFERIDO — confirmar]` em vez de inventada.

---

## Estrutura

`docs/` é só produto. `.claude/` é o harness inteiro.

```
docs/
├── specs/                  ← Specs ativas (Status: review → approved → done)
│   └── YYYY-MM-DD-*.md
│
├── context/                ← Informações únicas do seu produto (preencha estes!)
│   ├── product.md          ← Usuários, regras de negócio
│   ├── product-backlog.md  ← Tasks (gerado por /backlog)
│   ├── conventions.md      ← Nomenclatura, Git, imports
│   ├── decisions.md        ← Escolhas de frontend e backend
│   ├── ui-guidelines.md    ← Design system, tokens, componentes
│   ├── current-state.md    ← Estado atual (atualizado por /checkpoint)
│   ├── guardrails.md       ← Limites invioláveis + verificação (SEMPRE carregado)
│   ├── constitution.md     ← Princípios arquiteturais CN-XXX (SEMPRE carregado)
│   └── domains/            ← Regras de negócio fragmentadas por domínio
│
├── architecture/            ← Visão arquitetural detalhada
│   ├── overview.md
│   ├── backend.md
│   ├── frontend.md
│   └── infra.md
│
├── features/                ← O que o sistema faz hoje (pós-merge)
├── archive/                  ← Specs concluídas
└── changelog/                ← Histórico por data

.claude/
├── CLAUDE.md                 ← carregado automaticamente em toda sessão
├── README.md                  ← referência completa do harness
├── settings.example.json      ← guardrails de permissão + hooks
├── commands/                   ← slash commands (fonte única)
├── agents/                     ← subagentes por papel (contexto isolado)
├── skills/                     ← skills de papel (.claude/skills/<nome>/SKILL.md)
├── hooks/                       ← verificação automática (Pre/PostToolUse, Stop)
├── workflows/                   ← processos de várias fases (sob demanda)
├── templates/                    ← spec-template.md
├── prompts/                       ← bootstrap retroativo, ativação de doc orgânica
└── comparativo-scaffold-vs-superpowers.md
```

---

## Guardrails

Scaffold é um **harness**, não só documentação: ele é copiado para dentro de um
projeto real, onde o agente tem permissão de escrita no código de produção. Por
isso a inicialização é obrigada a instalar limites antes de liberar o fluxo.

### O que é instalado

| Camada | Arquivo | O que impede |
| --- | --- | --- |
| Permissões | `.claude/settings.json` (base: `settings.example.json`) | leitura de `.env` e chaves, `git push --force`, `reset --hard`, reset de banco, `publish` |
| Verificação automática | `.claude/hooks/` | encerrar o turno com lint quebrado ou type-check vermelho |
| Ferramentas por papel | `.claude/agents/` | o `reviewer` editar o código que ele mesmo revisa |
| Contrato do projeto | `docs/context/guardrails.md` | comandos de verificação obrigatórios, caminhos protegidos, regras `GR-XXX` invioláveis, gatilhos de escalação |
| Gate de processo | `Status: approved` na Spec + `.claude/hooks/spec-gate.mjs` | implementação antes de aprovação humana — agora mecânico, não só instrução |
| Princípios arquiteturais | `docs/context/constitution.md` | Spec ou diff que viole um `CN-XXX` |

### Verificação automática (hooks)

| Hook | Quando | O que roda |
| --- | --- | --- |
| `spec-gate.mjs` | antes de cada edição | bloqueia código se a Spec ativa estiver `Status: review` |
| `verify-file.mjs` | a cada arquivo editado | ESLint no arquivo alterado |
| `verify-project.mjs` | fim do turno | type-check, se algum `.ts`/`.tsx` mudou |

Falha resulta em `exit 2` + `stderr`, que o Claude Code devolve ao agente para
correção. Todos **falham em aberto**: projeto sem ESLint/TypeScript/git não é
bloqueado. Desligar com `SCAFFOLD_VERIFY=0`.
Detalhes em [`.claude/hooks/README.md`](.claude/hooks/README.md).

`spec-gate.mjs` é heurístico: identifica a Spec ativa pelo campo `**Spec
ativo:**` de `docs/context/current-state.md`, não por análise do código. Não
impede um agente de editar o próprio campo `Status` para se autoaprovar — isso
continua dependendo da instrução nos papéis. `/spec` mantém o campo atualizado
ao gerar a Spec, sem esperar pelo `/checkpoint`.

`docs/context/guardrails.md` é carregado por **todos** os papéis, em **toda**
tarefa, e **vence** qualquer outra instrução do scaffold em caso de conflito.
`docs/context/constitution.md` carrega junto — guardrails restringe o que é
proibido fazer; constitution restringe como o sistema deve ser construído.
Mantenha os dois curtos.

### Como são gerados

| Situação | Comando | Etapa |
| --- | --- | --- |
| Projeto novo | `/init-project` | Blocos 6 (Guardrails) e 7 (Constituição) |
| Projeto existente sem docs | `.claude/prompts/retroactive-documentation.md` | Passos 5.5 e 5.6 |

Ambos **inferem do repositório real** (scripts do `package.json`, `.gitignore`,
pastas de migration, constraints do schema) antes de perguntar, e registram
`(não configurado)` em vez de inventar um comando que não roda.

### Limitação honesta

`permissions.deny` reduz acidente — **não é sandbox**. Um comando shell criativo
o suficiente contorna a lista de permissões. Guardrail forte depende de:

1. comandos de verificação que realmente rodam (definem o que é "pronto"),
2. os hooks de `.claude/hooks/`, que rodam fora do controle do agente,
3. o gate humano de Spec.

Sem comando de teste/lint/type-check configurado, os Critérios de Aceite viram
autodeclaração do agente. O `/init-project` avisa explicitamente quando isso acontece.

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
      ⛔ GATE: você edita spec/plano → Status: approved (mecânico: .claude/hooks/spec-gate.mjs)
      ↓
[4] /back tarefa1, tarefa2, tarefa3   ou   /hands-on docs/specs/....md (ondas paralelas)
      ↓
[5] /front tela1, tela2
      ↓
[6] /review [diff]
      ↓
[7] /checkpoint (salva estado) → /commit
      ↓
[8] Specs concluídas migram para docs/archive/ (feito por /checkpoint)
```

**Por que o gate importa:** Sem a aprovação, o agente assume escopo e você descobre tarde. A spec com as tarefas técnicas obriga alinhamento **antes** de escrever código — e agora um hook bloqueia mecanicamente a edição de código enquanto a Spec ativa não estiver aprovada.

### Playbook e comparativo (tokens × qualidade)

| Documento | Uso |
| --- | --- |
| [Playbook — modos econômico / rigor / emergência](.claude/workflows/playbook-tokens-qualidade.md) | Decidir **como** trabalhar em cada tarefa (default do dia a dia) |
| [Comparativo Scaffold vs Superpowers](.claude/comparativo-scaffold-vs-superpowers.md) | Entender trade-offs de tokens, qualidade e modelo híbrido |

**Regra prática:** scaffold como sistema operacional do projeto; Superpowers só sob demanda (ambiguidade, bug hard, feature de alto risco). Detalhes no playbook.

---

## Slash Commands

| Comando | Exemplo | O quê |
| --- | --- | --- |
| `/init-project` | `/init-project sistema de pedidos` | Entrevista, preenche contexto e guardrails |
| `/backlog` | `/backlog` | Gera TASK01..TASKNN do product.md |
| `/spec` | `/spec TASK01` | Levantamento, gera spec + plano técnico (Status: review) |
| `/groom` | `/groom nova funcionalidade` | Refina uma nova feature isolada adicionando-a ao backlog |
| `/hands-on` | `/hands-on docs/specs/….md` | Executa o plano da Spec em ondas (paralelo), via subagentes |
| `/back` | `/back implementar auth com JWT` | Agente backend, inline |
| `/front` | `/front criar modal de login` | Agente frontend, inline |
| `/review` | `/review [cole diff aqui]` | Revisão 2 estágios: Funcional → Qualidade |
| `/checkpoint` | `/checkpoint` | Salva estado, gera changelog, arquiva specs concluídas |
| `/retomar` | `/retomar` | Reconstrói contexto após interrupção |
| `/commit` | `/commit` | Agrupa o working tree em commits Conventional (nunca faz push) |

Referência completa: [`.claude/README.md`](.claude/README.md)

Playbook de modos (quando batch vs hands-on vs Superpowers): [`.claude/workflows/playbook-tokens-qualidade.md`](.claude/workflows/playbook-tokens-qualidade.md)

Bootstrap retroativo para projeto existente sem contexto: [`.claude/prompts/retroactive-documentation.md`](.claude/prompts/retroactive-documentation.md)

---

## Subagentes

Os quatro papéis existem como subagentes em `.claude/agents/`. Cada um roda com
contexto próprio e zerado e devolve só um relatório à thread principal.

| Agente | Ferramentas | Papel |
| --- | --- | --- |
| `backend` | Read, Write, Edit, Grep, Glob, Bash, Skill | implementa tarefas de backend |
| `frontend` | Read, Write, Edit, Grep, Glob, Bash, Skill | implementa tarefas de frontend |
| `reviewer` | Read, Grep, Glob, Bash, Skill | revisa em dois estágios — **sem Edit/Write** |
| `planner` | Read, Write, Edit, Grep, Glob, Bash, Skill | gera Spec + plano em ondas |

Ganhos: contexto isolado (uma onda de 3 tarefas não custa 3× na thread
principal), paralelismo real, e ferramentas como guardrail — o `reviewer` não
consegue editar o código que revisa, não por promessa no prompt, mas porque não
tem a ferramenta.

`/hands-on` despacha `backend` e `frontend` por tarefa. Para tarefa pequena e
avulsa, `/back` e `/front` inline continuam mais baratos. Detalhes em
[`.claude/agents/README.md`](.claude/agents/README.md).

### Skills de papel

Comando inline e subagente do mesmo papel (`/back` e `backend`, por exemplo)
compartilham o conteúdo do papel através de uma skill em
`.claude/skills/<nome>/SKILL.md` — formato padrão do Claude Code. Editar o
papel significa editar a skill uma vez; comando e agente convergem
automaticamente, sem duplicação para ficar dessincronizada.

### Paralelismo seguro

Ondas paralelas escrevem na mesma working tree. Duas tarefas editando o mesmo
arquivo se sobrescrevem **em silêncio**. Por isso:

1. Cada tarefa da Spec declara `Arquivos:` — o que ela cria ou modifica.
2. O `planner` não coloca duas tarefas que disputam um arquivo na mesma onda.
3. O `/hands-on` cruza as listas antes de despachar (Passo 2.5) e serializa se houver colisão.

`--worktree` isola cada tarefa paralela em um git worktree próprio. Raramente
compensa: worktree é checkout novo, sem `node_modules`, e o merge só troca
conflito de arquivo por conflito de git. Use apenas com motivo concreto — a
declaração de arquivos já resolve o problema real.

---

## Economia de Tokens — Controle de Contexto

O design de **carregamento sob demanda** é proposital: cada arquivo existe para ser lido **apenas quando relevante** — nunca em toda sessão.

### Quanto contexto cada papel usa

| Papel | Skill + contexto | Tokens |
| --- | --- | --- |
| Backend | skill `backend` + `conventions.md` + `decisions.md` | ~0.8k |
| Frontend | skill `frontend` + `conventions.md` + `ui-guidelines.md` + `decisions.md` | ~1.1k |
| Planner (Spec + Plan) | skill `planner` + `product.md` + `architecture/overview.md` | ~1.4k |
| Reviewer | skill `quality` + `conventions.md` + `decisions.md` | ~0.8k |

### Estratégias implementadas

**1. Fragmentação por relevância**
- Só carrega o que a tarefa precisa
- Specs vão para `docs/archive/` quando concluídas
- Regras de negócio fragmentadas em `docs/context/domains/` (auth.md, payments.md, etc.)

**2. Delta, não tutorial**
O agente já sabe Next.js, NestJS, TypeScript, Clean Architecture. `docs/` entrega apenas o que é **único do seu produto**:
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
- Você adiciona nova regra de negócio → `docs/context/product.md` ou `docs/context/domains/*.md`
- Você toma decisão arquitetural → `docs/architecture/*.md` ou `docs/context/decisions.md`
- Você aprova nova feature → novo spec em `docs/specs/`

Tudo mais é descartado ao final de cada feature (specs vão para `docs/archive/`).

### Quando escalar o processo (e quando não)

Para não gastar tokens com processo pesado em tarefa simples — nem subinvestir em feature crítica — use o playbook:
- **[Playbook tokens × qualidade](.claude/workflows/playbook-tokens-qualidade.md)** — modos Econômico (default), Rigor e Emergência
- **[Comparativo Scaffold vs Superpowers](.claude/comparativo-scaffold-vs-superpowers.md)** — o que cada sistema otimiza e o modelo híbrido recomendado

---

## Retomando após interrupção

Quando você volta após horas ou dias, use o par `/checkpoint` + `/retomar`.

**Antes de fechar:**
```
/checkpoint
  → agente lê git log + contexto da sessão
  → escreve current-state.md resumido (pronto, em progresso, próximos passos)
  → arquiva specs concluídas em docs/archive/
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

```
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
/commit

# Próxima tarefa
/spec TASK02
```

---

## Migração — Otimizar projeto existente

Se você já tem um projeto rodando com uma versão antiga do scaffold e quer
atualizar para a estrutura atual (harness consolidado em `.claude/`, `docs/`
só produto):

```
cp -r scaffold-ia-projetos/.claude/. seu-projeto/.claude/
mkdir -p seu-projeto/docs/archive seu-projeto/docs/context/domains
```

Se seu projeto ainda tem `docs/commands/`, `docs/skills/`, `docs/workflows/`
ou `docs/prompts/` de uma versão anterior, remova-os — o conteúdo equivalente
já veio com o `.claude/` copiado acima.

Se a documentação de produto (`docs/context/`) estiver desatualizada ou
verbosa demais, rode este prompt no Claude Code:

```
Você é o PLANNER. Atualize a arquitetura de contexto para economizar tokens:

1. Analise docs/context/product.md. Se extenso, fragmente regras em
   docs/context/domains/ (ex: auth.md, payments.md, reports.md),
   deixando product.md apenas com visão geral + links.

2. Mova specs finalizadas de docs/specs/ para docs/archive/.

3. Reescreva docs/context/current-state.md extremamente resumido:
   - Status geral (1 frase)
   - Tarefa em progresso (1 linha)
   - Próximos passos (2-3 linhas)
   - Remove histórico e listas antigas
```

---

## O que cada diretório faz

### `docs/` — produto

| Diretório | Responsabilidade |
| --- | --- |
| `specs/` | Specs ativas (Status: review → approved → done) |
| `context/` | Informações únicas do seu produto — **você preenche** (ou o bootstrap retroativo preenche por você) |
| `architecture/` | Visão técnica: backend, frontend, infra |
| `features/` | Comportamento atual de cada feature entregue |
| `archive/` | Specs concluídas |
| `changelog/` | Histórico por data |

### `.claude/` — harness

| Diretório | Responsabilidade |
| --- | --- |
| `commands/` | Slash commands — fonte única, sem indireção |
| `agents/` | Subagentes por papel, contexto isolado |
| `skills/` | Skills de papel (formato padrão `<nome>/SKILL.md`), compartilhadas entre comando e agente |
| `hooks/` | Verificação automática (gate de Spec, lint, type-check) |
| `workflows/` | Processos de várias fases (feature-delivery, release, playbook tokens×qualidade) |
| `templates/` | `spec-template.md` |
| `prompts/` | Bootstrap retroativo e ativação de documentação orgânica |
| `comparativo-scaffold-vs-superpowers.md` | Scaffold vs Superpowers (tokens × qualidade) |

---

## Manutenção

`docs/` e `.claude/` são documentos vivos. Trate como código de produção: versionado, revisado em PR.

Atualize `docs/` quando:
- Decisão arquitetural → `architecture/`
- Regra de negócio → `context/product.md` ou `context/domains/`
- Nova tech/lib → `context/decisions.md`
- Feature aprovada → novo spec em `specs/`

Atualize `.claude/` quando:
- Mudar como um papel deve operar → a skill correspondente em `skills/`
- Adicionar/mudar um slash command → `commands/`
- Adicionar/mudar verificação automática → `hooks/`

Se a documentação de um projeto existente ficou pra trás em relação ao
código (status desatualizado, decisões implementadas mas nunca registradas),
rode o [bootstrap retroativo](.claude/prompts/retroactive-documentation.md) para
reconciliar antes de continuar usando o fluxo normal de specs.

---

## Stack padrão

| Camada | Tech |
| --- | --- |
| Monorepo | Turborepo |
| Frontend | Next.js 14+ (App Router) |
| Backend | NestJS |
| Linguagem | TypeScript strict |
| Arquitetura | Clean Architecture |

---

## Licença

MIT
