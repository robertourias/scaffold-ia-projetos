# Specnico

[![npm version](https://img.shields.io/npm/v/specnico.svg)](https://www.npmjs.com/package/specnico)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](#licença)

Fluxo spec-driven para o **Claude Code**, com gate humano mecânico, verificação
com evidência e execução em ondas.

---

## Por que

- Agentes de IA não conhecem seu projeto: sem contexto, inventam padrões, repetem
  perguntas e divergem do planejado. A **constituição** e a memória em
  `.specify/memory/` entregam só o que o agente não infere sozinho.
- "Está pronto" costuma ser autodeclaração. Aqui nenhum critério de aceite vira
  `[x]` sem a saída real de um comando de verificação; o que exige ação humana
  vira **Pendência Manual** rastreável.
- Implementar antes de aprovar não depende de boa vontade: o hook `spec-gate`
  **bloqueia** a edição dos arquivos da Spec ativa enquanto ela está em `review`,
  e a aprovação é um gate humano no início do `/jarvis-implement`.
- Trabalho grande vira ondas pequenas, cada uma com subagente, review e commit
  próprios, sempre num branch por Spec. Nenhum commit acontece sem você
  confirmar.

Inspirado no [Spec Kit](https://github.com/github/spec-kit); o Specnico é
Claude-native, com aprovação humana e hooks que bloqueiam em vez de só orientar.

---

## Instalação

**Pré-requisitos:** Node ≥ 18, [Claude Code](https://claude.com/claude-code) e
git. O `gh` (GitHub CLI) é opcional, usado só para abrir o PR no fim da
implementação.

**Projeto novo:**

```bash
cd seu-projeto
npx specnico
# abra o Claude Code e rode:
/jarvis-constitution
```

**Projeto existente (sem Specnico):**

```bash
cd seu-projeto
npx specnico
# abra o Claude Code e rode:
/jarvis-onboard
```

O `/jarvis-onboard` lê o código em vez de entrevistar: preenche a memória e o
backlog (features entregues como `done`) e grava o resumo
`.specify/memory/overview.md`. Ao fim da instalação, o próprio CLI indica qual
dos dois comandos usar (`Próximo:`), conforme o diretório já tenha código ou não.

O `npx specnico` nunca sobrescreve arquivos que já existem. Se o projeto já tem
o Spec Kit (arquivo `init-options.json` em `.specify`), o CLI avisa: os dois usam
`.specify/memory/constitution.md`.

### O que é instalado

```
.claude/                    ← o que o Claude Code carrega
  skills/                   ← 11 comandos jarvis-* + 5 papéis (backend, frontend, planner, quality, verification)
  agents/                   ← subagentes backend, frontend, reviewer, planner
  hooks/                    ← spec-gate, verify-file, verify-project
  CLAUDE.md  README.md  settings.example.json
.specify/
  memory/                   ← dado do projeto: constituição, produto, backlog, arquitetura, convenções, decisões (+ overview.md do onboard)
  templates/  packs/  workflows/   ← processo (atualizado pelo --upgrade)
specs/
  README.md                 ← uma pasta por Spec: specs/NNN-slug/
```

---

## Atualização

```bash
npx specnico --check             # versão instalada e drift local (somente leitura)
npx specnico@latest --upgrade    # atualiza o harness
```

O `--upgrade` **sobrescreve** o harness (`.claude/{agents,hooks,skills}`,
`.claude/{CLAUDE.md,README.md,settings.example.json}` e
`.specify/{templates,packs,workflows}`), inclusive edições locais nesses
arquivos. **Preserva** `.specify/memory/`, `specs/` e `.claude/settings.json`:
nessas áreas só cria o que faltar. `--force` sobrescreve tudo e pede
confirmação quando o contexto já foi preenchido.

Quando o `settings.example.json` muda, o `--upgrade` avisa, mas não toca no seu
`.claude/settings.json`: faça o merge à mão. Vindo de uma versão anterior à
2.1.1, mova `Bash(git commit:*)` de `allow` para `ask` (ver
[Commit só com confirmação](#hooks-e-segurança)).

## Vindo da 2.x (`/specnico-*`)

A 3.0 renomeia os comandos para `/jarvis-*`, troca `/specnico-spec` por
`/jarvis-specify`, separa as tarefas em `/jarvis-tasks` (antes parte do `plan`) e
remove o `/specnico-approve` (o gate virou o início do `/jarvis-implement`).
Rode `npx specnico@latest --upgrade`: o upgrade troca as skills e remove as
`specnico-*` antigas. A memória e as Specs não são tocadas.

---

## Vindo do `@robertourias/scaffold-ia` 1.x

O pacote antigo foi renomeado para `specnico`. A 2.0 é uma mudança
incompatível (novo layout e novos comandos), então a conversão é explícita:

```bash
npx specnico@latest --migrate
```

`npx specnico`, `--upgrade` e `--force` recusam rodar sobre um projeto 1.x e
apontam para este comando.

**Pré-condições**

- Nenhuma Spec 1.x em `approved` com critério `[ ]` aberto. O `--migrate` recusa
  e lista quais; termine-as na 1.x antes.
- Em repositório git, working tree limpa (recomendado; o comando não verifica),
  para poder revisar o resultado.
- Sem git, faça um **backup do projeto** antes de confirmar.

O comando mostra o plano e pede confirmação (`--yes` confirma sem perguntar, e é
obrigatório fora de terminal interativo). É idempotente: rodar de novo diz
"nada a migrar". Remove apenas os arquivos de harness entregues pela 1.x. Quando
um destino já existe, grava `X-2` e imprime uma nota de "conflito".

**Caminhos: 1.x → 2.0**

| 1.x | 2.0 |
|---|---|
| `docs/context/{product,conventions,decisions}.md`, `docs/context/domains/` | `.specify/memory/` |
| `docs/context/ui-guidelines.md` | anexado a `.specify/memory/conventions.md` (seção UI) |
| `docs/architecture/*.md` | `.specify/memory/architecture.md` (concatenados) |
| `docs/context/guardrails.md` + `constitution.md` | `.specify/memory/constitution.md` (com marcador de revisão) |
| `docs/context/product-backlog.md` e backlogs de escopo | `.specify/memory/product-backlog.md` (seção "Legado (1.x)") |
| `docs/apps/<x>/`, `docs/packages/<x>/` | `.specify/memory/projects/<apps-x>.md` |
| `docs/specs/*.md`, `docs/archive/*.md`, `docs/features/`, `docs/changelog/` | `specs/legacy/` (somente leitura) |
| `docs/context/current-state.md` | `specs/legacy/current-state-1x.md` |
| demais arquivos em `docs/` | `specs/legacy/docs/<caminho>` |
| `.claude/{commands,templates,workflows,packs}`, `.claude/context-index.md` | `.claude/skills/jarvis-*`, `.specify/{templates,workflows,packs}`, índice em `.claude/CLAUDE.md` |
| `.claude/.scaffold-version` | `.specify/.specnico-version` |
| (não existia) | `.specify/state.json`, gerado com `ativo: null` |

**Comandos: 1.x → 2.0**

| 1.x | 2.0 |
|---|---|
| `/init-project`, `/backlog`, `/groom` | `/jarvis-constitution` (geração e replanejamento do backlog) |
| `/spec` (parte "o quê") | `/jarvis-specify` |
| `/spec` (parte "como") | `/jarvis-plan` (plano) e `/jarvis-tasks` (tarefas em ondas) |
| `/approve` | sem comando próprio: a aprovação é o gate do `/jarvis-implement` |
| `/hands-on`, `/back`, `/front` | `/jarvis-implement` (`/jarvis-implement T001,T002` para tarefas específicas) |
| `/recheck` | `/jarvis-converge` |
| `/review` | `/jarvis-review` |
| `/init-app`, `/init-package` | um item de arquitetura no backlog por app/package, especificado como qualquer outro |
| `/pr-open` | passo final do `/jarvis-implement` (com confirmação) |
| `/pr-merged` | manual: `git switch main && git pull && git branch -d spec/NNN-slug` |
| `/checkpoint`, `/retomar` | `.specify/state.json` + checkboxes do `tasks.md` + `git log`; todo `/jarvis-*` mostra a fase atual |
| (não existia) | `/jarvis-clarify`, `/jarvis-analyze`, `/jarvis-fix` |

**Depois de migrar**

1. Revise o resultado com `git status`. Os dados migrados já estão no índice do
   git; o harness novo (`.claude/`, `.specify/{templates,packs,workflows}`) **não**
   é adicionado automaticamente. Adicione explicitamente, por exemplo
   `git add .claude .specify specs`, e confira antes de commitar. Nunca use
   `git add -A`.
2. Rode `/jarvis-constitution`: ele detecta a migração (modo migração),
   reconstrói a constituição no formato 2.0 sem perder texto e converte o
   backlog legado para o formato novo.
3. Comece o próximo item com `/jarvis-specify Bnn`.

Para desligar os hooks, `SPECNICO_VERIFY=0` substitui `SCAFFOLD_VERIFY=0`, que
continua aceito como alias.

---

## Utilização

![Fluxo de entrega do Specnico](https://raw.githubusercontent.com/robertourias/scaffold-ia-projetos/main/meta/assets/fluxo-workflow.png)

### Os 11 comandos

O fluxo segue o do [Spec Kit](https://github.com/github/spec-kit): `constitution`
→ `specify` → `clarify` → `plan` → `tasks` → `analyze` → `implement`, com o
prefixo `/jarvis-`. A coluna **Uso** diz o que é obrigatório e o que é opcional.

| Comando | Uso | Quando usar | O que produz |
|---|---|---|---|
| `/jarvis-constitution` | **Obrigatório** (projeto novo; ou `onboard`) | uma vez por projeto; de novo para emendar | memória do projeto (`.specify/memory/*`), `product-backlog.md`, `settings.json`, CI `verify.yml` |
| `/jarvis-onboard [área]` | **Obrigatório** (projeto existente, no lugar da `constitution`); depois, opcional para sincronizar | projeto que já existe, no lugar da entrevista | memória inferida do código, backlog com as features entregues (`done`), resumo `.specify/memory/overview.md` |
| `/jarvis-specify [Bnn \| texto]` | **Obrigatório** | especificar um item do backlog (ou um requisito novo) | branch `spec/NNN-slug`, `specs/NNN-slug/spec.md` (Status `review`), checklist |
| `/jarvis-clarify` | Opcional (recomendado com `[NEEDS CLARIFICATION]`) | a Spec tem ambiguidades | até 5 perguntas, uma por vez; respostas em `## Clarificações` |
| `/jarvis-plan` | **Obrigatório** | Spec pronta para virar plano técnico | `plan.md` (Constitution Check, contratos), ADRs em `decisions.md` |
| `/jarvis-tasks` | **Obrigatório** | plano pronto para virar trabalho | `tasks.md` em ondas (propriedade de arquivos, rastreabilidade, critérios) |
| `/jarvis-analyze` | Opcional (recomendado antes de implementar) | checar consistência do pacote | relatório somente leitura: spec ↔ plan ↔ tasks ↔ constituição |
| `/jarvis-implement [Tnnn,…]` | **Obrigatório** | executar o `tasks.md`; começa pelo gate humano | validação do pacote e sua aprovação (`review → approved`), código, commit por onda (cada um com sua confirmação), `review.md`, PR oferecido |
| `/jarvis-converge` | **Obrigatório** (fecha a Spec) | depois do implement | fecha Pendências Manuais, acrescenta tarefas faltantes ou conclui a Spec (`done`) |
| `/jarvis-review [alvo]` | Opcional | revisar o diff do branch ou um alvo | relatório em dois estágios (Funcional → Qualidade), somente leitura |
| `/jarvis-fix "<sintoma>"` | Opcional (fora do fluxo de Specs) | bug, sem Spec completa | reprodução, correção mínima, `specs/bugs/NNN-slug.md` |

Todo comando termina com uma linha `Próximo:` indicando o passo seguinte. Os
que commitam (`constitution`, `specify`, `clarify`, `plan`, `tasks`,
`implement`, `converge`, `fix`) mostram a mensagem e os arquivos e perguntam
"Posso commitar?" antes; sem confirmação, as mudanças ficam no working tree.

> **Não há comando de aprovação à parte.** A aprovação humana (`review → approved`)
> é o primeiro passo do `/jarvis-implement`: ele roda as checagens do pacote,
> mostra o resultado e só segue com o seu "sim". O hook `spec-gate` continua
> bloqueando código enquanto a Spec está em `review`.

### Exemplo completo

```text
/jarvis-constitution            # entrevista em 5 blocos; gera a memória e o backlog em fases
                                #   (projeto existente: /jarvis-onboard no lugar)
/jarvis-specify B01             # specs/001-monorepo-base/spec.md (Status: review)
/jarvis-clarify                 # opcional: só se houver ambiguidades
/jarvis-plan                    # plan.md: o como técnico
/jarvis-tasks                   # tasks.md: tarefas em ondas
/jarvis-analyze                 # opcional: consistência antes de implementar
/jarvis-implement               # gate: você aprova o pacote; depois ondas com subagentes,
                                #   review e commit por onda (você confirma cada um); oferece o PR
/jarvis-converge                # fecha pendências; sem lacunas, a Spec vai a done
/jarvis-specify B02             # próximo item do backlog
```

- **Projeto que já existe:** comece por `/jarvis-onboard` em vez da
  entrevista. Ele lê o repositório, preenche a memória e o backlog (features
  já entregues como `done`) e grava `.specify/memory/overview.md`: arquitetura,
  stack, como rodar, onde ficam as regras de negócio, features e pontos de
  atenção. O que não dá para inferir fica marcado "a revisar"; ajuste com
  `/jarvis-constitution` (emenda). Rodar de novo sincroniza só o que mudou
  no código.
- **Bug:** `/jarvis-fix "login quebra com e-mail em maiúsculas"`.
- **Retomar trabalho:** nenhum comando especial. Todo `/jarvis-*` lê
  `.specify/state.json` e mostra a fase atual.
- **Feature nova depois:** `/jarvis-specify <texto livre>` propõe ID, fase e
  feature, confirma com você, grava o item no backlog e especifica.
- **Parâmetro ausente:** o comando resolve pelo `state.json` e, depois, pelo
  primeiro item do backlog liberado (`.specify/workflows/context-resolution.md`).

---

## Recomendações

Duas coisas que combinam bem com o fluxo (ambas opcionais):

- **[Caveman](https://github.com/JuliusBrussee/caveman):** faz o agente
  responder de forma curta, sem perder a precisão de código, comandos e erros.
  Num fluxo com muitos comandos e subagentes, economiza tokens. Instalação no
  Claude Code:

  ```bash
  claude plugin marketplace add JuliusBrussee/caveman && claude plugin install caveman@caveman
  ```

- **Skills globais do [Nico Skills](https://skills.nico.dev.br):** catálogo de
  skills pessoais (repositório `robertourias/skills`) que valem para qualquer
  projeto, por isso instale no escopo global (`-g`), uma vez por máquina:

  ```bash
  npx skills add robertourias/skills -g
  ```

---

## Conceitos

- **Constituição** (`.specify/memory/constitution.md`): identidade do projeto,
  princípios `CN-XXX`, guardrails `GR-XXX` invioláveis, comandos de verificação
  e governança. Vence qualquer outra instrução do harness.
- **Product backlog** (`.specify/memory/product-backlog.md`): roteiro em fases
  (fundação, arquitetura, MVP, complementar, polimento), itens `Bnn` com IDs
  estáveis e um índice de features `F-<SIGLA>` (`planejada` → `live`), que serve
  de documentação viva.
- **Pasta da Spec** (`specs/NNN-slug/`): `spec.md` (o quê e porquê), `plan.md`
  (como) e `tasks.md` (ondas, critérios, `Arquivos:`). Specs concluídas não são
  reescritas nem arquivadas: o histórico é a própria pasta.
- **Gate de aprovação:** o início do `/jarvis-implement` é a única porta de
  `review` para `approved` e só o humano aciona (a skill não é invocável pelo
  modelo). O hook `spec-gate` pede confirmação a qualquer
  tentativa de autoaprovação e a emendas em Spec aprovada (registradas em
  `## Emendas`).
- **Pendência Manual:** critério que o agente não pode cumprir (dispositivo
  real, credencial, decisão de negócio). Fica anotado no `tasks.md` até você
  resolver e relatar ao `/jarvis-converge`.
- **Packs de stack** (`.specify/packs/`): `typescript`, `nextjs`, `nestjs`,
  `turborepo`. São opt-in; sem pack ativo, o Specnico não presume framework.
- **Monorepo:** `specs/` é plano; o escopo de cada Spec é o campo `**Escopo:**`
  do `spec.md`. O contexto local de cada app/package fica em
  `.specify/memory/projects/<apps-x>.md`.

Referência completa do harness: [`.claude/README.md`](.claude/README.md).

---

## Hooks e segurança

| Hook | Quando | O que faz |
|---|---|---|
| `spec-gate.mjs` | antes de cada edição | pede confirmação ao aprovar Spec ou emendar Spec aprovada; bloqueia os `Arquivos:` da Spec ativa enquanto está em `review` |
| `verify-file.mjs` | a cada arquivo editado | ESLint no arquivo alterado |
| `verify-project.mjs` | fim do turno | type-check, se algum `.ts`/`.tsx` mudou |

Todos **falham em aberto**: projeto sem ESLint, TypeScript ou git não é
bloqueado. Detalhes e limites em
[`.claude/hooks/README.md`](.claude/hooks/README.md).

**Limites honestos.** `permissions.deny` e hooks reduzem acidente; não são
sandbox. Em modo `bypassPermissions` o `ask` do `spec-gate` passa sem prompt, e
escrita via `Bash` (`sed`, `echo >`) não passa pelo hook. A garantia forte vem da
combinação: comandos de verificação que realmente rodam, hooks fora do controle
do agente e o gate humano. Sem comando de teste, lint ou type-check configurado,
os critérios de aceite viram autodeclaração do agente, e o
`/jarvis-constitution` avisa quando isso acontece.

**Commit só com confirmação.** Nenhum comando commita sem perguntar: antes de
cada commit (inclusive por onda no `/jarvis-implement`) ele mostra a mensagem
e os arquivos e pergunta "Posso commitar?". Além disso, o
`settings.example.json` põe `git commit` em `ask`, e nenhuma skill pré-aprova
commit, então o Claude Code também pede a permissão. Regra completa em
[`.specify/workflows/git-flow.md`](.specify/workflows/git-flow.md).

**Desligar os hooks de verificação:** `SPECNICO_VERIFY=0` (o antigo
`SCAFFOLD_VERIFY=0` segue aceito como alias).

---

## Desenvolvimento do Specnico

Este repositório é o template e também onde o Specnico é desenvolvido. Veja
[`CLAUDE.md`](CLAUDE.md) para a organização (`meta/` não é publicado). Antes de
commitar:

```bash
npm run check
```

---

## Licença

MIT
