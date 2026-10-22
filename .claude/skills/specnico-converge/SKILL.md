---
name: specnico-converge
description: "Converge código × artefatos de uma Spec implementada: fecha Pendências Manuais, avalia lacunas pelo reviewer, acrescenta tarefas em ## Convergência e, sem lacunas, conclui a Spec (done), o backlog e a feature"
argument-hint: "[specs/NNN-slug] [o que você ajustou manualmente]"
allowed-tools: Read, Edit, Grep, Glob, Agent, Bash(git status:*), Bash(git branch --show-current), Bash(git rev-parse:*), Bash(git symbolic-ref --short refs/remotes/origin/HEAD), Bash(git switch:*), Bash(git diff:*), Bash(git log:*), Bash(git merge-base:*), Bash(git add:*), Bash(git commit:*)
---

# /specnico-converge — fechar a Spec (código × artefatos)

Você é o responsável por **convergir** uma Spec depois do `/specnico-implement`:
confere se o código entregue bate com `spec.md`, `plan.md` e `tasks.md`, fecha
as Pendências Manuais que o humano resolveu e só então marca a Spec como
concluída. Substitui o `recheck` da 1.x. Você **não implementa código**.

Entrada do usuário: `$ARGUMENTS`

O primeiro token que for `NNN`, `NNN-slug` ou `specs/NNN-slug` é a Spec alvo; o
restante é a **descrição livre** do que o humano ajustou manualmente.

Invoque a skill `verification` (evidência antes de `[x]`) e leia
`.specify/memory/constitution.md`. Siga `.specify/workflows/git-flow.md`.

## Regras gerais

- Nunca `git add -A`, `git add .` nem `git commit -a`: stage só de caminhos explícitos.
- Nunca marque `[x]` sem correspondência explícita entre o relato do humano (ou evidência) e o que a Instrução da pendência pedia.
- Nunca edite tarefas já existentes em `tasks.md` além de checkbox/Pendência Manual; lacunas viram tarefas **novas** em `## Convergência`.
- Nunca altere `plan.md` nem o texto da Spec; só o cabeçalho de Status (passo 5).

## 1. Spec alvo, estado e gate

Leia `.specify/state.json` e mostre a fase atual em uma linha (`Ativo: specs/NNN-slug · fase <fase> · Bnn`, ou `Ativo: nenhum`). Parâmetro ausente: `.specify/workflows/context-resolution.md`.

Normalize o alvo (`NNN`, `NNN-slug`, `specs/NNN-slug`). Sem argumento, use
`ativo.spec` de `.specify/state.json`; sem `ativo` → diga que não há Spec e
indique `/specnico-spec`. `state.json` ilegível, pasta sem `spec.md`/`tasks.md`
ou `fase` divergente → **avise** e proponha corrigir; só altere com confirmação.

Gate pelo `**Status:**` de `spec.md`:

- `approved` → prossiga.
- `review` → pare: a Spec nunca foi aprovada nem implementada (`/specnico-approve`).
- `done` → avise que já está concluída e pare.

**Branch.** Compare `git branch --show-current` com `ativo.branch` (ou
`spec/NNN-slug`). Na branch padrão, em outra branch, ou com a da Spec já
mergeada (PR mergeado, `git merge-base --is-ancestor spec/NNN-slug <padrão>`, ou
ela não existe mais) → avise e ofereça, antes de qualquer commit: `git switch
spec/NNN-slug` se ela existe e não foi mergeada; senão `git switch -c
spec/NNN-slug-converge` a partir da branch padrão (o fechamento vai num PR
próprio). **Nunca commite na branch padrão**; sem confirmação, pare sem commitar.

Se o alvo for `ativo.spec`, ponha `ativo.fase = "converge"` e `atualizado` =
agora (ISO 8601), preservando o resto; alvo diferente ou `ativo` nulo → avise e
**não toque** em `state.json`.

## 2. Pendências Manuais

`git status --porcelain`: mudança **rastreada** fora de `specs/`, do backlog e
de `.specify/state.json` (estes dois o próprio comando grava — exceção de
`.specify/workflows/git-flow.md`, Working tree), ou seja, ajustes que o humano
fez no código → liste e pergunte se fazem parte da pendência resolvida e se entram num commit `fix(<escopo>): <slug> — pendência
manual`, feito **antes** do commit de conclusão. Sem confirmação, não toque.
Não rastreados nunca bloqueiam e nunca são tocados.

Localize em `tasks.md` todo bloco:

```markdown
- [ ] <critério>
  > 🟡 Pendência Manual: <descrição>
  > Instrução: <ação esperada>
```

Para cada um, cruze com a descrição do humano: endereça claramente → marque
`[x]` e troque o bloco por `> ✅ Pendência Manual resolvida em <data> via
/specnico-converge: <resumo do relato>`; descrição genérica com 2+ pendências →
**uma pergunta** listando os itens; não mencionada → continua pendente. Sem
descrição e com pendências abertas → pergunte o que foi ajustado.

## 3. Código × artefatos

Despache o `reviewer` (somente leitura), estágio Funcional:

```
Modo: final
Spec: specs/NNN-slug   ← leia spec.md, plan.md e tasks.md
Diff: git diff <merge-base com a branch padrão>..HEAD + working tree
Verificação: rode os comandos da constituição e cole a saída real
Foco: FRs/SCs sem implementação ou sem teste; critérios [x] sem evidência;
tarefas com critérios [ ]; CN/GR violados; divergência código × plan.md.
```

Junte ao parecer a leitura de `tasks.md`: critério `[ ]` sem Pendência Manual,
FR sem tarefa concluída, `[x]` contradito pela verificação.

## 4. Lacunas → tarefas em `## Convergência`

Cada lacuna vira uma tarefa **nova** na seção `## Convergência` de `tasks.md`
(append-only: acrescente no fim, nunca reordene nem reescreva o que existe):

- Numeração a partir do maior `Tnnn` existente no arquivo + 1.
- Mesmo formato das demais: `### Tnnn — <título>`, `**Story:** — | **Agente:** … | **Tipo:** …`, `**Depende de:**`, uma linha própria `- **Arquivos:** \`…\`` (o hook de propriedade de arquivos lê essa linha), `**Cobre:**` e critérios com comando de verificação.
- Pendência Manual aberta **não** é lacuna: continua listada, sem tarefa nova.

Commit com stage explícito (`tasks.md`; mais o `.specify/state.json` se mudou):
`docs(spec): converge NNN-slug — lacunas (Tnnn…)`. Reporte as lacunas e pare:
rode `/specnico-implement Tnnn[,Tnnn]` e depois `/specnico-converge` de novo,
até não faltar nada.

## 5. Sem lacunas nem pendências: concluir

Só quando **todos** os critérios de **todas** as tarefas estão `[x]`, nenhum
bloco `> 🟡 Pendência Manual:` está aberto e o parecer não traz 🔴/🟡:

1. `spec.md`: `**Status:** approved` → `**Status:** done`, seguido da linha
   `**Concluído em:** <YYYY-MM-DD>`. O hook `spec-gate` só pergunta quando o Status sai de `review`;
   `approved → done` passa sem prompt. Se ainda assim o humano negar algum
   prompt, pare e reporte, sem outro caminho.
2. Backlog (`.specify/memory/product-backlog.md`): o `Item:` da Spec → `done`
   (Spec sem item/linha: avise e pule).
3. Índice de features (seção `## Features` do backlog): se **todos** os itens da
   feature `F-<SIGLA>` do item estão `done`, a feature passa a `live` e o
   **Resumo** é reescrito (1 linha) a partir dos `spec.md` desses itens.
   Feature com item pendente: não mude. Item sem feature (`—`): pule.
4. `.specify/state.json`: **só se** `ativo` não for nulo **e** a pasta alvo for
   igual a `ativo.spec` → `ativo = null`, `atualizado` = agora. Senão não toque.
5. Commit, stage explícito (`spec.md`, `tasks.md`, backlog, `state.json` se
   mudaram): `docs(spec): conclui NNN-slug`.

## 6. Resumo

```
✅ Spec concluída: specs/NNN-slug        (ou ⚠️ ainda não fecha)
Pendências resolvidas: <lista ou "(nenhuma)">
Lacunas: <Tnnn — título, ou "(nenhuma)">
Feature: F-XXX → live | em andamento (<itens done>/<total>)
Commit: <hash curto> <mensagem>
```

Concluída: o PR é mergeado pelo humano; depois a branch é limpa à mão (ver `.specify/workflows/git-flow.md`, Push e PR).

Próximo: `/specnico-spec` (próximo item do backlog) ou, com lacunas, `/specnico-implement Tnnn`
