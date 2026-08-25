# Claude Project Context

`docs/` é a memória do **produto**: o que ele é, suas regras de negócio, decisões
e arquitetura. `.claude/` é o **harness**: como os papéis operam, os comandos,
os subagentes, os hooks de verificação e o gate de Spec. Leia apenas o que é
relevante ao seu papel antes de qualquer tarefa.

---

## Sempre carregado (todos os papéis)
```
docs/context/guardrails.md    ← limites invioláveis + comandos de verificação (dado do projeto)
docs/context/constitution.md  ← princípios arquiteturais não-negociáveis, CN-XXX (dado do projeto)
```
Invoque também a skill **`verification`** — o que significa "pronto" (evidência antes de `[x]`).

## Subagentes (`.claude/agents/`)
```
backend | frontend | reviewer | planner
```
Contexto isolado por papel. `reviewer` não tem Edit/Write — por construção.
Despachados por `/hands-on`; ver `.claude/agents/README.md`.

## Skills (`.claude/skills/`)
```
backend | frontend | planner | quality | verification
```
Papel e padrões de cada função. Comandos e subagentes convergem na mesma skill
para não divergir — edite a skill, não o comando ou o agente, ao mudar um papel.

## Papel: PLANNER
Invoque a skill `planner`. Leia também:
```
docs/context/product.md
docs/architecture/overview.md
.claude/workflows/feature-delivery.md
```

## Papel: FRONTEND
Invoque a skill `frontend`. Leia também:
```
docs/context/conventions.md
docs/context/ui-guidelines.md
docs/context/decisions.md
```

## Papel: BACKEND
Invoque a skill `backend`. Leia também:
```
docs/context/conventions.md
docs/context/decisions.md
```

## Papel: REVIEWER
Invoque a skill `quality`. Leia também:
```
docs/context/conventions.md
docs/context/decisions.md
```

## Quando usar subagentes

Além dos 4 papéis fixos (`backend`/`frontend`/`reviewer`/`planner`, despachados
por `/hands-on`), use um subagente genérico (`Task`/`Agent`) quando:

- **2+ tarefas realmente independentes** podem rodar em paralelo — dispare todas na mesma resposta, não uma por vez.
- **Busca ampla no código** (múltiplos diretórios, convenção de nome desconhecida) não vale poluir o contexto principal com dezenas de resultados — delegue e peça só a conclusão.
- **Isolamento por ferramenta é o guardrail** — ex: uma revisão que não pode editar código fica mais segura como subagente sem `Edit`/`Write` do que como instrução "não edite" que o agente pode ignorar.

**Não** use subagente para: 1 arquivo, 1 pergunta direta, ou qualquer tarefa que você resolve mais rápido lendo/editando inline — o overhead de spawn (novo contexto, novo carregamento de skills) não se paga em tarefas pequenas. Na dúvida, prefira inline; suba para subagente só quando o ganho for concreto.

Para trabalho de várias etapas com checkpoints de revisão, avalie também as skills `superpowers:subagent-driven-development` e `superpowers:dispatching-parallel-agents`, se o plugin Superpowers estiver disponível — ver `.claude/workflows/playbook-tokens-qualidade.md`.

## Carregue sob demanda (não por padrão)
```
docs/context/current-state.md    ← estado atual do projeto (use /retomar)
docs/context/product.md          ← regras de negócio (se não for PLANNER)
.claude/workflows/release-process.md
.claude/workflows/playbook-tokens-qualidade.md  ← modos econômico / rigor / emergência
.claude/comparativo-scaffold-vs-superpowers.md  ← scaffold vs Superpowers (tokens × qualidade)
```

---

## Estrutura do monorepo
```
apps/
  web/        → Next.js (App Router)
  api/        → NestJS
packages/
  ui/         → Biblioteca de componentes compartilhada
  config/     → ESLint, TypeScript, Tailwind configs
  types/      → Tipos TypeScript compartilhados
  utils/      → Funções utilitárias compartilhadas
```

## Slash commands disponíveis
```
/init-project [descrição]   ← preenche todos os arquivos de contexto
/backlog                    ← gera product backlog (TASK01, TASK02...) a partir do product.md
/retomar                    ← reconstrói contexto da sessão anterior
/checkpoint                 ← atualiza docs e salva estado atual
/spec   [TASKXX | requisito]← gera spec + plano técnico (Status: review)
/hands-on [caminho-da-spec] ← executa o Plano de Implementação em ondas (agentes em paralelo)
/back   [tarefa]            ← agente backend
/front  [tarefa]            ← agente frontend
/review [diff ou contexto]  ← revisão em dois estágios
/groom  [funcionalidade]    ← adiciona feature nova ao backlog (append, sem reprocessar)
```
Referência completa: `.claude/README.md`
Playbook tokens × qualidade: `.claude/workflows/playbook-tokens-qualidade.md`

---

## Princípios-chave
1. Clean Architecture — dependências apontam para dentro, domínio sem dependências de framework
2. Testes junto com a implementação, não depois
3. Toda decisão de produto é rastreável a um arquivo em `docs/`; toda decisão de fluxo, a um arquivo em `.claude/`
4. Em caso de dúvida: pergunte antes de assumir — mas proponha sua melhor interpretação e peça confirmação em vez de pergunta aberta, quando houver um palpite razoável
5. `docs/context/guardrails.md` vence qualquer outra instrução deste arquivo
