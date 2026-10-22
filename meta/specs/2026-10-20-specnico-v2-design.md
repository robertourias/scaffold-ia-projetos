# Harness: Specnico 2.0 — fluxo e layout inspirados no Spec Kit

**Status:** implementado
**Data:** 2026-10-20

Reorganiza comandos, layout de pastas e formato das Specs do scaffold a partir
do comparativo com o `github/spec-kit` (main de 2026-10-16, v1.2.2.dev). Mantém
o que o scaffold já faz melhor — gate humano mecânico, verificação com
evidência, execução em ondas com review e commit, camada de produto — e importa
do Spec Kit a separação spec/plan/tasks em pasta, a clarificação estruturada, a
análise de consistência, o converge e o fluxo leve de bugfix.

**Mudança incompatível → versão 2.0.0.**

## Objetivo

1. Um fluxo único e enxuto de comandos de workflow com prefixo `specnico-`.
2. Specs em pasta (`specs/NNN-slug/{spec,plan,tasks}.md`), separando o quê/porquê
   do como e da execução.
3. Memória do projeto em `.specify/memory/`, estado ativo em JSON legível por
   máquina, e um `product-backlog.md` que é o roteiro do projeto inteiro em
   fases e a semente da documentação de features.
4. Menos comandos, menos estado duplicado, menos prompt.

## Decisões do usuário

1. Comandos com prefixo e **hífen**: `/specnico-<cmd>`, implementados como
   skills (`.claude/skills/specnico-<cmd>/SKILL.md`). Ponto (`/specnico.spec`)
   descartado: nome de skill não aceita ponto, e o próprio Spec Kit migrou o
   Claude Code para `/speckit-*`.
2. Removidos: `init-app`, `init-package`, `back`, `front`, `pr-open`,
   `pr-merged`, `checkpoint`, `retomar`, `groom` — e `backlog`, absorvido pelo
   `/specnico-constitution`.
3. Layout `.specify/` + `specs/` como no Spec Kit; `docs/` deixa de existir.
4. `/specnico-constitution` substitui `/init-project` e gera
   `.specify/memory/constitution.md`.
5. Sem seção "próximos passos" na constituição: o roteiro inicial (fundação,
   arquitetura, features) vive em `.specify/memory/product-backlog.md`,
   organizado em fases, base para `/specnico-spec` e para a documentação de
   features.
6. Um único gate humano (`/specnico-approve`), sobre o pacote spec + plan + tasks.
7. Pacote npm renomeado de `@robertourias/scaffold-ia` para `specnico`
   (sem escopo; nome livre no registry em 2026-10-20). Binário `specnico`.
8. README raiz reescrito em torno de instalação, atualização e utilização.

## Design

### 1. Layout

```
.claude/                              ← só o que o Claude Code exige
  skills/
    specnico-constitution/SKILL.md    ← comandos de fluxo (seção 2)
    specnico-spec/  specnico-clarify/  specnico-plan/  specnico-analyze/
    specnico-approve/  specnico-implement/  specnico-converge/
    specnico-review/  specnico-fix/
    backend/  frontend/  planner/  quality/  verification/   ← papéis (sem prefixo)
  agents/        backend.md  frontend.md  reviewer.md  planner.md
  hooks/         spec-gate.mjs  verify-file.mjs  verify-project.mjs  README.md
  CLAUDE.md  README.md  settings.example.json

.specify/
  memory/                             ← dado do projeto (o CLI só cria, nunca sobrescreve)
    constitution.md                   ← identidade, CN, GR, comandos de verificação, governança
    product.md                        ← visão, personas, domínio, regras de negócio (RN)
    product-backlog.md                ← roteiro em fases + índice de features (seção 4)
    architecture.md                   ← antes overview + backend + frontend + infra
    conventions.md                    ← antes conventions + ui-guidelines
    decisions.md                      ← ADRs
    domains/<dominio>.md
    projects/<apps-api>.md            ← só monorepo; contexto local de app/package
  templates/                          ← harness (o CLI atualiza no --upgrade)
    constitution-template.md  product-template.md  product-backlog-template.md
    spec-template.md  plan-template.md  tasks-template.md
    checklist-template.md  bug-template.md
    ci/verify.yml
  packs/         typescript/  nextjs/  nestjs/  turborepo/
  workflows/     sdd.md  git-flow.md  context-resolution.md  release-process.md
                 playbook-tokens-qualidade.md
  state.json                          ← estado ativo (seção 6); dado do projeto

specs/
  README.md
  001-monorepo-base/
    spec.md  plan.md  tasks.md  review.md
    checklists/requirements.md
    contracts/                        ← opcional, quando o plan.md extrair contratos
  bugs/
    001-login-crash.md
```

Regras:

- `.claude/` contém apenas o que o Claude Code carrega (skills, agents, hooks,
  settings, CLAUDE.md). Todo o resto do processo vai para `.specify/`.
- `.claude/commands/`, `.claude/templates/`, `.claude/workflows/`,
  `.claude/packs/` e `.claude/context-index.md` deixam de existir. O índice por
  tiers passa a ser uma seção de `.claude/CLAUDE.md`.
- `docs/` deixa de existir no template, incluindo `features/`, `archive/` e
  `changelog/`. `specs/NNN-*` é o histórico (flow-forward: pasta concluída não é
  reescrita); o `state.json` diz o que está ativo, então agentes nunca varrem
  `specs/` e o arquivamento perde a razão de existir.
- `workflows/feature-delivery.md` vira `workflows/sdd.md`, agnóstico de stack.
  Os passos específicos hoje fixados em NestJS/Next.js (migration, class-validator,
  MSW, `loading.tsx`) migram para os `README.md` dos packs correspondentes.
- Monorepo: `specs/` é plano. O escopo é o campo `**Escopo:**` do `spec.md`
  (`raiz`, `apps/api`, ou lista). Não existe mais `docs/$SCOPE/`.

### 2. Comandos

| Comando | Substitui | Faz | Escreve |
|---|---|---|---|
| `/specnico-constitution` | `init-project`, `backlog`, `groom` | Entrevista e gera a memória do projeto, guardrails, CI e o product backlog. Re-executado: emenda | `.specify/memory/*`, `.claude/settings.json`, `.github/workflows/verify.yml` |
| `/specnico-spec` | `spec` (parte "o quê") | `Bnn` → especifica o item do backlog. Texto livre → registra item novo no backlog e especifica | `specs/NNN-slug/spec.md`, `checklists/requirements.md`, backlog, `state.json` |
| `/specnico-clarify` | — | Até 5 perguntas com opções; grava as respostas | `spec.md` (`## Clarificações`), checklist |
| `/specnico-plan` | `spec` (parte "como") | Plano técnico + tarefas em ondas × stories | `plan.md`, `tasks.md`, `contracts/`, `decisions.md` |
| `/specnico-analyze` | — | Somente leitura: consistência spec ↔ plan ↔ tasks ↔ constituição | nada (relatório) |
| `/specnico-approve` | `approve` | Só humano (`disable-model-invocation: true`). Roda o analyze e aprova o pacote | `spec.md` (Status), backlog, `state.json` |
| `/specnico-implement` | `hands-on`, `back`, `front`, `pr-open` | Sem argumento: todas as ondas. `Tnnn[,Tnnn]`: só essas tarefas. Commit por onda, review final, oferece PR | código, `tasks.md`, `review.md`, backlog, `state.json` |
| `/specnico-converge` | `recheck` | Código × artefatos. Fecha Pendências Manuais; acrescenta tarefas faltantes (append-only); se nada falta → `done` | `tasks.md` (`## Convergência`), `spec.md` (Status), backlog |
| `/specnico-review` | `review` | Revisão em dois estágios (Funcional → Qualidade), somente leitura | nada (relatório) |
| `/specnico-fix` | — | Bug: diagnóstico → correção → verificação, sem Spec completa | `specs/bugs/NNN-slug.md`, código |

Sem comando dedicado (funções removidas):

| Removido | Quem assume |
|---|---|
| `init-app`, `init-package` | Item de arquitetura no backlog (um por app/package), especificado como qualquer outro. O `/specnico-plan` desse item cria `.specify/memory/projects/<x>.md` e registra o projeto na constituição |
| `back`, `front` | `/specnico-implement Tnnn`; o despacho para os subagentes `backend`/`frontend` segue pelo campo `Agente:` da tarefa |
| `pr-open` | Passo final do `/specnico-implement` (com confirmação; `gh pr` segue em `ask`) |
| `pr-merged` | Manual: `git switch <padrão> && git pull && git branch -d spec/<NNN-slug>` |
| `checkpoint` | Estado = `state.json` + checkboxes do `tasks.md`; decisões vão para `decisions.md` no plan; histórico = `git log` |
| `retomar` | Todo comando `specnico-*` lê `state.json` no início e mostra a fase atual em uma linha |
| `backlog`, `groom` | `/specnico-constitution` (geração e replanejamento) + `/specnico-spec <texto livre>` (append de item) |

**Handoff.** Todo comando termina com uma linha `Próximo:` com o comando
seguinte do fluxo (ex: depois de `/specnico-spec` → `/specnico-clarify` se houver
`[NEEDS CLARIFICATION]`, senão `/specnico-plan`).

**Fluxo:**

```
/specnico-constitution          (1× por projeto; re-executar = emenda)
  └─ por item do backlog:
     /specnico-spec Bnn → [/specnico-clarify] → /specnico-plan → [/specnico-analyze]
       → /specnico-approve (humano) → /specnico-implement → /specnico-converge
         (repetir implement → converge até done)
bug: /specnico-fix "<sintoma>"
```

### 3. `/specnico-constitution`

Entrevista em 5 blocos, uma pergunta por vez, com proposta de resposta quando
houver palpite razoável:

1. **Produto** — problema, público, proposta de valor, funcionalidades P1/P2/P3,
   regras de negócio conhecidas.
2. **Modo e projetos** — `single | monorepo | microfrontends`; no monorepo, apps
   e packages previstos.
3. **Stack e packs** — linguagem, frameworks, banco, testes; packs ativos
   (`.specify/packs/`). Sem pack aplicável → registra "nenhum" e não inventa stack.
4. **Princípios** — CN-XXX (propõe base: Clean Architecture, teste junto, contrato
   antes de consumo) e guardrails GR-XXX.
5. **Verificação e ferramentas** — comandos reais de type-check, lint, testes,
   build; instalar `settings.json` com hooks e o CI `verify.yml`.

Saídas: `constitution.md`, `product.md`, `architecture.md`, `conventions.md`,
`decisions.md` (ADR-001 com a stack), `product-backlog.md`, `state.json`
(`fase: "constitution"`), `README.md` do repositório.

Re-execução (arquivo já existe): **modo emenda**.
- Mostra o diff proposto e incrementa a versão (semver: MAJOR = princípio
  removido ou redefinido; MINOR = princípio/seção nova; PATCH = redação).
- Pode replanejar o backlog: reordenar fases, incluir itens, marcar itens
  `descartado`. Nunca altera itens `in-progress` ou `done`.
- Relatório de sincronização: templates ou skills que citam um CN/GR
  alterado.

Para manter o prompt sob controle, o `SKILL.md` carrega em seções separadas
(lidas só quando o passo chega lá) a entrevista, a geração do backlog e o modo
emenda.

Formato de `.specify/memory/constitution.md`:

```markdown
# Constituição — <Projeto>

**Versão:** 1.0.0 | **Ratificada:** YYYY-MM-DD | **Última emenda:** YYYY-MM-DD

## 1. Identidade
- **Modo:** single | monorepo | microfrontends
- **Projetos:** <apps/web (nextjs) · apps/api (nestjs) · packages/ui> | raiz
- **Packs ativos:** <typescript, turborepo, nextjs, nestjs> | nenhum

## 2. Princípios (CN)
- **CN-001 <nome>** — <regra verificável>. Por quê: <motivo>.

## 3. Guardrails (GR) — invioláveis
- **GR-001 <nome>** — <regra>.

## 4. Comandos de verificação
| O quê | Comando | Escopo |
|---|---|---|
| Type-check | `<comando>` | raiz |
| Lint | `<comando>` | raiz |
| Testes | `<comando>` | raiz |
| Build | `<comando>` | raiz |

## 5. Governança
- Emendas só via `/specnico-constitution`, com versão e data.
- Violação de CN num `plan.md` exige linha em Complexity Tracking e aprovação
  humana no `/specnico-approve`.
- `guardrails` vencem qualquer outra instrução do harness.
```

`docs/context/guardrails.md` e `docs/context/constitution.md` (1.x) fundem-se
nas seções 2–4.

### 4. `product-backlog.md`

Roteiro do projeto inteiro: fundação, arquitetura e features, em fases. É a
entrada do `/specnico-spec Bnn` e a semente da documentação de features.

```markdown
# Product Backlog — <Projeto>

**Gerado por:** /specnico-constitution em YYYY-MM-DD | **Modo:** <modo>
**Status:** backlog → spec → approved → in-progress → done | descartado
**Tipo:** fundação | arquitetura | feature

## Fase 0 — Fundação
| ID | Título | Tipo | Escopo | Feature | Depende | Status | Spec |
|----|--------|------|--------|---------|---------|--------|------|
| B01 | Monorepo base | fundação | raiz | — | — | backlog | — |
| B02 | Config compartilhada | fundação | packages/config | — | B01 | backlog | — |

## Fase 1 — Arquitetura
| B03 | API base em camadas | arquitetura | apps/api | — | B02 | backlog | — |
| B04 | Web base | arquitetura | apps/web | — | B02 | backlog | — |

## Fase 2 — MVP
| B05 | Cadastro e login | feature | apps/api, apps/web | F-AUTH | B03, B04 | backlog | — |

## Fase 3 — Complementar
## Fase 4 — Polimento

---

## Descrições

Entrada do `/specnico-spec Bnn`. O quê e porquê — nunca o como.

### B01 — Monorepo base
<descrição em 2-5 linhas>
**Pronto quando:** <resultado observável>

---

## Features

Índice do que o produto faz. Base da documentação de features.

| Feature | Nome | Itens | Status | Resumo |
|---------|------|-------|--------|--------|
| F-AUTH | Autenticação | B05 | planejada | <1 linha> |
```

Geração (pelo `/specnico-constitution`):

| Modo | Fase 0 — Fundação | Fase 1 — Arquitetura |
|---|---|---|
| `single` | projeto base + tooling + CI | 1 item: estrutura em camadas da stack |
| `monorepo` | workspace + config compartilhada + CI | 1 item por app/package declarado |
| `microfrontends` | workspace + CI | shell + 1 item por remoto |

Fases 2–4 vêm das funcionalidades P1/P2/P3 do bloco Produto, agrupadas em
features `F-<SIGLA>`. Itens de fundação e arquitetura têm `Feature: —`.

Regras de manutenção:

- **Status** só é alterado pelos comandos: `spec` → `spec` (e preenche Spec com
  `specs/NNN-slug/`), `approve` → `approved`, `implement` → `in-progress`,
  `converge` → `done`. Constituição em modo emenda → `descartado`.
- **IDs** `Bnn` são estáveis: nunca renumerados; item descartado mantém o ID.
- **Dependências:** `/specnico-spec Bnn` avisa (não bloqueia) se algum `Depende`
  não estiver `done`.
- **Item novo** (`/specnico-spec <texto livre>`): próximo ID livre; fase
  proposta = a primeira fase com item do mesmo tipo ainda não `done`; feature
  proposta por similaridade com o índice. Fase e feature são **confirmadas com
  o humano** antes de gravar.
- **Índice de features:** quando todos os itens de uma feature ficam `done`, o
  `/specnico-converge` muda a feature para `live` e reescreve o Resumo a partir
  dos `spec.md` dos itens. A documentação detalhada de features (fora deste
  design) é derivada daqui.
- O backlog **não é normativo**: o `spec-gate` não o protege.

### 5. Artefatos da Spec

Pasta `specs/NNN-slug/`. `NNN` = próximo número sequencial de 3 dígitos em
`specs/` (ignorando `bugs/`); `slug` = 2–4 palavras do título em kebab-case.
Branch: `spec/NNN-slug`.

**`spec.md` — o quê e porquê** (sem stack, sem caminho de arquivo):

```markdown
# Spec: <título>

**Status:** review | approved | done
**Item:** B05 | **Escopo:** apps/api, apps/web | **Feature:** F-AUTH
**Criada:** YYYY-MM-DD

## Problema
## User Stories
### US1 — <título> (P1) 🎯 MVP
<jornada>
**Por que P1:** <valor>
**Teste independente:** <como provar esta story sozinha>
**Cenários:**
1. Dado <estado>, quando <ação>, então <resultado>.
## Casos de borda
## Requisitos funcionais
- **FR-001:** O sistema DEVE <capacidade testável>.
- **FR-002:** O sistema DEVE <...> [NEEDS CLARIFICATION: <pergunta>]
## Entidades-chave
## Critérios de sucesso
- **SC-001:** <métrica mensurável e agnóstica de tecnologia>
## Premissas
## Fora do escopo
## Clarificações
### Sessão YYYY-MM-DD
- P: <pergunta> → R: <resposta>
## Emendas
```

Regras do `/specnico-spec`: no máximo 3 `[NEEDS CLARIFICATION]` (prioridade:
escopo > segurança > UX > técnica), o resto vira premissa documentada. Gera
`checklists/requirements.md` (qualidade do requisito: sem detalhe de
implementação, FR testáveis, SC mensuráveis, escopo delimitado) e valida até 3
iterações.

**`plan.md` — como:**

```markdown
# Plano: <título>

**Spec:** ./spec.md | **Packs:** <ativos> | **Data:** YYYY-MM-DD

## Resumo técnico
## Contexto técnico
Linguagem · dependências · armazenamento · testes · plataforma · restrições
## Constitution Check
| Princípio | Atende? | Nota |
|-----------|---------|------|
| CN-001 | ✅ | |
## Estrutura
<árvore real dos diretórios tocados>
## Modelo de dados
## Contratos
`METHOD /caminho` — request / response / erros (ou link para contracts/)
## Decisões
- ADR-NNN registrado em `.specify/memory/decisions.md` — <resumo>
## Riscos técnicos
## Complexity Tracking
| Violação | Por que é necessária | Alternativa simples rejeitada porque |
## Emendas
```

**`tasks.md` — execução** (substitui a seção 6 do template 1.x):

```markdown
# Tarefas: <título>

**Spec:** ./spec.md | **Plano:** ./plan.md

## Ondas
| Onda | Fase | Tarefas (paralelas) | Pré-requisito |
|------|------|---------------------|---------------|
| 1 | Fundacional | T001 | — |
| 2 | US1 🎯 MVP | T002, T003 | T001 |
| 3 | US1 🎯 MVP | T004 | T002, T003 |

## Fundacional
### T001 — <identificador>
- **Story:** — | **Agente:** backend | **Tipo:** feature
- **Depende de:** —
- **Arquivos:** `caminho/a.ts`
- **Cobre:** FR-001, CN-001
- **Critérios de Aceite:**
  - [ ] Dado …, quando …, então … — verificado por `<comando|teste>`

## US1 — <título> (P1) 🎯 MVP
### T002 [P] — …
**Checkpoint US1:** <teste independente da story>

## Polimento

## Rastreabilidade
| FR | Tarefas | Verificado por |

## Verificação
| O quê | Comando | Saída esperada |

## Pendências Manuais

## Convergência
<!-- append-only, escrito pelo /specnico-converge -->
```

Regras mantidas da 1.x: propriedade de arquivos por onda (duas tarefas da mesma
onda não declaram o mesmo caminho), `Cobre:` obrigatório, critérios com
comando de verificação, Pendência Manual da skill `verification`.
Nova: ondas agrupam por story (Fundacional → US1 → US2 → … → Polimento); dentro
de uma story, as ondas seguem o grafo de dependência.

**`review.md`** — notas de review (🟢/💡, `- [onda N] arquivo:linha — texto`),
fora dos artefatos normativos.

**`specs/bugs/NNN-slug.md`** (`/specnico-fix`): sintoma e reprodução →
diagnóstico (causa, arquivos) → correção (diff resumido) → verificação (saída
real do teste que reproduz o sintoma + suíte) → veredito `verificado | parcial |
falhou`. Sem gate de aprovação; correção que exige mudar requisito para e
sugere `/specnico-spec`. Commit `fix(<escopo>): <slug>`.

### 6. `state.json`

```json
{
  "versao": 1,
  "ativo": {
    "spec": "specs/005-cadastro-login",
    "item": "B05",
    "fase": "spec | clarify | plan | approved | implement | converge",
    "branch": "spec/005-cadastro-login"
  },
  "atualizado": "2026-10-20T14:03:00Z"
}
```

- Uma Spec ativa por vez. `ativo: null` quando não há.
- Escrito por todo comando `specnico-*` que muda de fase; `converge` em `done`
  zera `ativo`.
- Lido no início de todo comando (substitui `/retomar`) e pelo `spec-gate.mjs`
  (substitui o campo `**Spec ativo:**` de `current-state.md`).
- `context-resolution.md` (parâmetro ausente) passa a resolver por
  `state.json` → backlog (primeiro item `backlog` com dependências `done`).

### 7. Hooks

`spec-gate.mjs`:

| Regra | 1.x | 2.0 |
|---|---|---|
| 1 — autoaprovação | `docs/**/specs/*.md` sai de `review` | `specs/*/spec.md` sai de `review` → `ask` |
| 2 — implementar antes de aprovar | Spec de `current-state.md` em `review` bloqueia `Arquivos:` do Plano | Spec de `state.json` em `review` bloqueia `Arquivos:` do `tasks.md`; sem `tasks.md` ou sem `Arquivos:` → bloqueia qualquer código. Nunca bloqueia `.specify/`, `.claude/`, `specs/` |
| 3 — emenda | diff normativo da Spec aprovada | diff normativo de `spec.md` **e** `plan.md` aprovados → `ask` (registrar em `## Emendas`). `tasks.md` livre (checkbox, Pendências, Convergência) |

`verify-file.mjs` e `verify-project.mjs` não mudam. `settings.example.json`:
permissões de `git` iguais; remover referências a comandos removidos.

Limites conhecidos documentados no `hooks/README.md` continuam (bypass mode,
escrita via Bash, confiança no arquivo de estado), trocando `current-state.md`
por `state.json`.

### 8. CLI e distribuição

**Pacote.** `package.json`: `name: "specnico"`, `version: "2.0.0"`,
`bin: { "specnico": "bin/cli.js" }`, `description`/`keywords` atualizados
(`spec-driven`, `spec-kit`, `claude-code`, `sdd`). Uso:

```bash
npx specnico                 # instala no diretório atual; nunca sobrescreve
npx specnico@latest --upgrade  # atualiza o harness; preserva .specify/memory, specs/, settings.json
npx specnico@latest --migrate  # converte um projeto @robertourias/scaffold-ia 1.x para o layout 2.0
npx specnico --check         # versão instalada e drift local (somente leitura)
```

Pacote antigo: depois de publicar `specnico@2.0.0`, rodar
`npm deprecate @robertourias/scaffold-ia "Renomeado para specnico — npx specnico@latest --migrate"`
(ação externa, feita pelo mantenedor com confirmação — não pelo plano
automatizado). Releases 1.x continuam instaláveis.

`bin/cli.js`:

| Grupo | Caminhos | Install | `--upgrade` |
|---|---|---|---|
| Harness | `.claude/{agents,hooks,skills}`, `.claude/CLAUDE.md`, `.claude/README.md`, `.claude/settings.example.json`, `.specify/{templates,packs,workflows}` | cria | sobrescreve |
| Dado | `.specify/memory/` (arquivos com marcador `**Status do arquivo:** vazio`), `specs/README.md` | cria | só cria o que faltar |

- `package.json` `files` espelha a tabela; `.specify/state.json` não é publicado.
- Versão instalada: `.specify/.specnico-version`. O `--check` e o `--migrate`
  reconhecem o legado `.claude/.scaffold-version` como instalação 1.x.
- Mensagens, `--help` e avisos do CLI citam `specnico`; nenhuma menção a
  `scaffold-ia` fora do texto de migração.
- **Migração 1.x → 2.0** (`--migrate`, explícito, idempotente, com resumo antes de
  aplicar e confirmação):
  - Recusa se houver Spec 1.x em `approved` com critério `[ ]` (termine-a na
    1.x antes) — lista quais.
  - `git mv` quando for repositório git: `docs/context/{product,conventions,decisions}.md`
    e `domains/` → `.specify/memory/`; `docs/architecture/*.md` →
    concatenados em `.specify/memory/architecture.md`; `ui-guidelines.md`
    anexado a `conventions.md`; `docs/apps|packages/<x>/` →
    `.specify/memory/projects/<apps-x>.md` (concatenado).
  - `guardrails.md` + `constitution.md` → `.specify/memory/constitution.md`
    com marcador `<!-- migrado da 1.x: revise com /specnico-constitution -->`.
  - `product-backlog.md` e backlogs de escopo → `.specify/memory/product-backlog.md`
    com seção "Legado (1.x)" sem reformatar; o `/specnico-constitution` em modo
    emenda converte para o formato novo.
  - `docs/specs/*.md`, `docs/archive/*.md` → `specs/legacy/` (somente leitura,
    fora da numeração).
  - `docs/features/`, `docs/changelog/` → `specs/legacy/`.
  - Remove `.claude/{commands,templates,workflows,packs}` e
    `.claude/context-index.md` do harness 1.x.
  - Gera `state.json` com `ativo: null`.

### 9. Ajustes no restante do harness

- `.claude/CLAUDE.md`: reescrito para o layout novo; inclui o índice por tiers
  (antes `context-index.md`) e a lista dos 10 comandos.
- Skills de papel (`backend`, `frontend`, `planner`, `quality`,
  `verification`): caminhos `docs/` → `.specify/memory/` e `specs/`; `planner`
  passa a cobrir spec (o quê) e plan/tasks (como) em seções separadas.
- Agentes: `planner` é despachado por `/specnico-spec` e `/specnico-plan`;
  `backend`/`frontend` por `/specnico-implement`; `reviewer` por
  `/specnico-implement` (por onda e final), `/specnico-review` e
  `/specnico-converge`.
- `/specnico-analyze` e `/specnico-approve` compartilham as checagens: o
  approve executa o analyze como passo 1 e acrescenta as checagens sintáticas
  da 1.x (placeholders, `Arquivos:` preenchido, Verificação sem `<comando>`).
  🔴 no analyze → "Aprovar mesmo assim? (s/N)".
- `/specnico-converge` absorve o `/recheck`: (1) fecha Pendências Manuais com
  base no relato do humano e evidência; (2) avalia código × spec/plan/tasks
  pelo `reviewer` (estágio Funcional); (3) lacunas → tarefas novas em
  `## Convergência`; (4) sem lacunas nem pendências → `Status: done`, backlog
  `done`, índice de features, `state.json` zerado, commit
  `docs(spec): conclui NNN-slug`.
- Diagrama (`meta/assets/fluxo-workflow.mmd`/`.png`) refeito com os 10 comandos.
- `.claude/README.md` (referência do harness no projeto do usuário) reescrito
  para o layout e os comandos novos.
- `meta/changelog/` e `releases.md`: entrada 2.0.0 com guia de migração.
- `CLAUDE.md` da raiz (desenvolvimento do scaffold): `docs/` → `.specify/` e
  `specs/`; comandos de teste inalterados.

### 10. README raiz

Reescrito do zero (o atual — "Scaffold IA — Next.js & NestJS" — está preso à
stack e à 1.x). Público: quem vai instalar e usar. Detalhe de harness fica no
`.claude/README.md`, linkado. Estrutura:

1. **Specnico** — uma frase: fluxo spec-driven para Claude Code, com gate humano
   mecânico, verificação com evidência e execução em ondas. Badges npm/licença.
2. **Por que** — 3-4 bullets (problema que resolve) + uma linha de
   comparação com o Spec Kit: "inspirado no Spec Kit; Claude-native, com
   aprovação humana e hooks que bloqueiam".
3. **Instalação**
   - Pré-requisitos: Node ≥ 18, Claude Code, git; `gh` opcional (PR).
   - Projeto novo: `npx specnico` → abrir o Claude Code → `/specnico-constitution`.
   - Projeto existente (sem specnico): mesmo comando; a constituição detecta
     código existente e a stack.
   - O que é instalado (árvore curta de `.claude/`, `.specify/`, `specs/`).
4. **Atualização**
   - `npx specnico@latest --upgrade`: o que é sobrescrito (harness) e o que é
     preservado (`.specify/memory/`, `specs/`, `.claude/settings.json`).
   - `npx specnico --check` antes, para ver drift local.
   - **Vindo do `@robertourias/scaffold-ia` 1.x:** `npx specnico@latest --migrate`,
     pré-condições (nenhuma Spec 1.x aprovada inacabada, working tree limpa),
     tabela "1.x → 2.0" de caminhos e comandos, e o passo seguinte
     (`/specnico-constitution` em modo migração para converter constituição e backlog).
5. **Utilização**
   - Diagrama do fluxo.
   - Tabela dos 10 comandos (comando · quando usar · o que produz).
   - Passo a passo de exemplo: constituição → backlog gerado → `/specnico-spec B01`
     → clarify → plan → approve → implement → converge → próximo item.
   - Bug: `/specnico-fix`.
   - Retomar trabalho: qualquer `/specnico-*` lê `state.json`.
   - Adicionar feature nova depois: `/specnico-spec <texto livre>`.
6. **Conceitos** — constituição (CN/GR), product backlog e índice de features,
   pasta da Spec (spec/plan/tasks), gate de aprovação e `spec-gate`, Pendência
   Manual, packs de stack, monorepo (`Escopo:`).
7. **Hooks e segurança** — o que bloqueia, limites honestos (bypass mode,
   escrita via Bash), como desligar (`SCAFFOLD_VERIFY=0` → `SPECNICO_VERIFY=0`,
   aceitando o antigo como alias).
8. **Desenvolvimento do Specnico** — link para `CLAUDE.md` da raiz e
   `npm run check`.
9. **Licença.**

Exemplos de comando no README são verificados pelo `lint-docs.mjs`: todo
`/specnico-*` citado existe como skill; nenhum comando removido aparece fora
da seção de migração.

## Fora do escopo

- Geração da documentação detalhada de features (só o índice no backlog).
- Renomear o repositório GitHub (`scaffold-ia-projetos`); `repository`/`homepage`
  do `package.json` seguem apontando para ele até decisão separada.
- Publicar no npm e deprecar o pacote antigo (passo manual do mantenedor).
- Suporte a outros agentes além do Claude Code; catálogos, presets, bundles e
  motor de workflows em YAML do Spec Kit.
- `/specnico-checklist` customizado (só o `checklists/requirements.md` automático).
- Integração do backlog com GitHub Issues.

## Riscos

| Risco | Mitigação |
|---|---|
| `/specnico-constitution` vira o maior prompt do harness | Seções lidas sob demanda; entrevista, backlog e emenda separados |
| Colisão com o Spec Kit no mesmo repositório (`.specify/memory/constitution.md`) | Aviso no README; `--check` detecta `.specify/init-options.json` do Spec Kit e alerta |
| Migração destrutiva em projetos 1.x | `--migrate` explícito, resumo + confirmação, `git mv`, recusa com Spec ativa inacabada |
| `state.json` desatualizado cega o gate | Todo comando valida `state.json` contra o Status do `spec.md`; divergência → avisa e corrige com confirmação |
| Usuários 1.x não descobrem o pacote novo | O `--check` da 1.x só conhece o pacote antigo, então o `npm deprecate` com a instrução de migração é passo obrigatório do release (o aviso aparece em todo `npx @robertourias/scaffold-ia`) |
| Perda de `features/`, changelog e limpeza pós-merge | Índice de features no backlog; `git log`; passo manual documentado |
| Spec em 3 arquivos aumenta leitura no implement | Implementadores recebem só a tarefa + trechos referenciados (FR, contrato); spec e plan inteiros só para planner/reviewer |

## Critérios de aceite

- [ ] `package.json` com `name: "specnico"`, `bin.specnico`, versão `2.0.0`; `npm pack --dry-run` lista só os caminhos da seção 8.
- [ ] README raiz segue a estrutura da seção 10; `.claude/README.md` reescrito; `lint-docs.mjs` valida comandos citados.
- [ ] `npx specnico` em diretório vazio cria `.claude/` (só skills/agents/hooks/settings/CLAUDE/README), `.specify/` e `specs/README.md`; nenhum `docs/`.
- [ ] Os 10 comandos existem como `.claude/skills/specnico-*/SKILL.md` com frontmatter válido; `specnico-approve` com `disable-model-invocation: true`; nenhum comando removido sobrevive.
- [ ] `/specnico-constitution` gera `constitution.md` (seções 1–5, sem próximos passos) e `product-backlog.md` com fases 0–4 conforme o modo, descrições por item e índice de features.
- [ ] `/specnico-spec B01` cria `specs/001-<slug>/spec.md` + checklist, atualiza backlog e `state.json`, cria branch `spec/001-<slug>`.
- [ ] `/specnico-spec <texto livre>` propõe ID/fase/feature, confirma e grava o item antes de especificar.
- [ ] `spec-gate.mjs`: testes de Regra 1/2/3 reescritos para `specs/*/` + `state.json` e passando.
- [ ] `--migrate` sobre fixture 1.x produz o layout 2.0, é idempotente e recusa com Spec ativa inacabada.
- [ ] `node --test "meta/tests/*.test.mjs"` e `node meta/tests/lint-docs.mjs` verdes (lint atualizado para `.claude/skills/specnico-*`, `.specify/` e `specs/`).
- [ ] Nenhuma referência a `docs/`, `/spec `, `/hands-on`, `/back`, `/front`, `/checkpoint`, `/retomar`, `/groom`, `/recheck`, `/pr-open`, `/pr-merged`, `/init-*` fora de `meta/` e do guia de migração.
