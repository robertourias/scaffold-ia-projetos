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

Índice de carregamento por tiers: `.claude/context-index.md`. Comece no Tier 1
e suba apenas quando a tarefa exigir decisões ou referência histórica.

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

## Packs de stack (`.claude/packs/`)

O núcleo de processo não presume framework. Packs como `typescript`, `nextjs`,
`nestjs` e `turborepo` fornecem regras de tecnologia opt-in. Leia o campo
`**Packs de stack:**` em `docs/architecture/overview.md` e carregue apenas os
`README.md` dos packs ativos; em monorepos, acrescente os packs declarados no
contexto do app/package. Se não houver pack ativo, não invente uma stack.

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

## Carregue sob demanda (não por padrão)
```
docs/context/current-state.md    ← estado atual do projeto (use /retomar)
docs/context/product.md          ← regras de negócio (se não for PLANNER)
.claude/workflows/release-process.md
.claude/workflows/context-resolution.md  ← fallback quando um comando não recebe parâmetro
.claude/workflows/playbook-tokens-qualidade.md  ← modos econômico / rigor / emergência
.claude/workflows/git-flow.md  ← branch, stage e commit do fluxo
```

---

## Estrutura do monorepo
Estrutura depende do **Modo** em `docs/architecture/overview.md` — atualizada por `/init-project`, `/init-app` e `/init-package`.

Cada app/package pode ter `docs/{context,architecture,specs}` próprio dentro de
`docs/$SCOPE/` (ex: `docs/apps/api/`) — **nunca** dentro do próprio
`apps/api/` (`$SCOPE` nos comandos `back`/`front`/`spec`/`review`). Toda documentação, com ou sem escopo, vive sob `docs/` na
raiz. Raiz sem subpasta = monorepo inteiro; `docs/$SCOPE/` = local a um
app/package. Convenção: `docs/context/conventions.md#documentação-em-monorepo-appspackages`.

## Slash commands disponíveis
```
/init-project [descrição]   ← inicializa projeto: detecta modo (single | monorepo | microfrontends) e preenche contexto global
/init-app <nome>            ← (monorepo) cria app + docs locais + questionário de configuração
/init-package <nome>        ← (monorepo) cria package + docs locais + questionário de configuração
/backlog                    ← gera product backlog (TASK01, TASK02...) a partir do product.md
/retomar                    ← retoma o último histórico salvo (sem parâmetro)
/checkpoint                 ← grava resumo da sessão no log do projeto (sem parâmetro)
/spec   [TASKXX | requisito]← gera spec + plano técnico (Status: review)
/approve [spec]              ← (só humano) valida e aprova a Spec (review → approved)
/hands-on [caminho-da-spec] ← executa o Plano de Implementação em ondas (agentes em paralelo, review por onda, commit, PR)
/back   [tarefa]            ← agente backend
/front  [tarefa]            ← agente frontend
/review [diff ou contexto]  ← revisão em dois estágios
/groom  [funcionalidade]    ← adiciona feature nova ao backlog (append, sem reprocessar)
/recheck [spec] [ajustes]   ← rechecagem pós-ajuste manual: fecha Pendências Manuais ou lista o que falta
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
