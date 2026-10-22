# Fluxo SDD (Spec-Driven Development)

> Do requisito ao merge. Agnóstico de stack: os passos específicos de cada
> tecnologia vivem no `README.md` dos packs ativos (`.specify/packs/<id>/`),
> listados em `**Packs ativos:**` de `.specify/memory/constitution.md`.

## Visão geral

```
/specnico-constitution          (1× por projeto novo; re-executar = emenda)
  ou /specnico-onboard           (projeto existente: lê o código; re-executar = sincroniza)
  └─ por item do backlog:
     /specnico-spec Bnn → [/specnico-clarify] → /specnico-plan → [/specnico-analyze]
       → ⛔ /specnico-approve (humano) → /specnico-implement → /specnico-converge
         (repetir implement → converge até done)
bug: /specnico-fix "<sintoma>"
```

Todo comando lê `.specify/state.json` ao começar, mostra a fase em uma linha
e termina com `Próximo:` apontando o passo seguinte. Branch, stage e
mensagens de commit: `.specify/workflows/git-flow.md`.

## 0. Constituição

`/specnico-constitution` entrevista o humano e gera a memória do projeto em
`.specify/memory/` (constituição com CN, GR e comandos de verificação;
produto; arquitetura; convenções; decisões), o product backlog em fases,
`.claude/settings.json` e o CI. Re-executar = emenda versionada.

Projeto que já existe: `/specnico-onboard` faz o mesmo papel lendo o
repositório em vez de entrevistar — grava a memória inferida, o backlog com as
features entregues (`done`) e o resumo `.specify/memory/overview.md`. O que não
dá para inferir fica marcado "a revisar" para o humano ajustar com
`/specnico-constitution` (emenda).

## 1. Especificação — o quê e por quê

`/specnico-spec Bnn` (ou texto livre, que vira item novo no backlog) cria a
branch `spec/NNN-slug`, a pasta `specs/NNN-slug/` com `spec.md` em
`Status: review` e o checklist `checklists/requirements.md`. Sem stack, sem
caminho de arquivo.

`/specnico-clarify` (opcional, recomendado com `[NEEDS CLARIFICATION]`) faz até
5 perguntas, uma por vez, e grava as respostas em `## Clarificações`.

## 2. Planejamento — como

`/specnico-plan` gera `plan.md` (contexto técnico, Constitution Check,
contratos, decisões registradas em `.specify/memory/decisions.md`) e
`tasks.md` em ondas: Fundacional → US1 🎯 MVP → … → Polimento. Cada tarefa
declara `Agente:`, `Depende de:`, `Arquivos:`, `Cobre:` e critérios
verificáveis; duas tarefas da mesma onda nunca compartilham arquivo.

`/specnico-analyze` (opcional) confere spec ↔ plan ↔ tasks ↔ constituição sem
editar nada.

## ⛔ Gate — aprovação humana

`/specnico-approve` só é invocado pelo humano. Roda a análise e as checagens
sintáticas e aprova o pacote (`review → approved`). Antes disso, o hook
`spec-gate.mjs` bloqueia a edição dos arquivos declarados no `tasks.md` (ou de
qualquer código, se não houver `Arquivos:`). Depois, mudança normativa em
`spec.md`/`plan.md` exige registro em `## Emendas`.

## 3. Implementação

`/specnico-implement` (todas as ondas, ou só `Tnnn[,Tnnn]`) despacha um
subagente `backend`/`frontend` por tarefa, conforme `Agente:`. Por onda:
verificação com evidência (skill `verification`), review do `reviewer` (até 3
rodadas) e commit. Ao fim, review final do branch e PR oferecido (com
confirmação). Pendência Manual não bloqueia: fica anotada no `tasks.md`.

Os passos de cada camada (schema, validação, mocks, rotas) seguem os packs
ativos e `.specify/memory/decisions.md` — este fluxo não os presume.

## 4. Convergência

`/specnico-converge` compara código × artefatos: fecha as Pendências Manuais
resolvidas pelo humano, pede ao `reviewer` as lacunas e as acrescenta como
tarefas novas em `## Convergência` (append-only; volte ao
`/specnico-implement`). Sem lacunas nem pendências: `Status: done`, item do
backlog `done`, índice de features atualizado e `state.json` zerado.

## Bugs

`/specnico-fix "<sintoma>"` — sem Spec nem gate: teste que reproduz →
diagnóstico → correção mínima → verificação → registro em
`specs/bugs/NNN-slug.md`. Correção que muda requisito para e sugere
`/specnico-spec`.

## Pós-merge e release

Merge do PR, volta à branch padrão e remoção da branch: ver
`.specify/workflows/git-flow.md`. Deploy: `.specify/workflows/release-process.md`.

## Definition of Done

- [ ] Todos os critérios de aceite do `tasks.md` em `[x]` com evidência, ou
      Pendências Manuais fechadas pelo `/specnico-converge`
- [ ] Review final sem 🔴 e CI verde no PR
- [ ] Spec em `Status: done` e item do backlog em `done`
- [ ] `.specify/memory/architecture.md` e `.specify/memory/decisions.md`
      refletem as decisões desta Spec
- [ ] `.env.example` atualizado se novas variáveis foram adicionadas
