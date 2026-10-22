---
name: specnico-implement
description: "ORQUESTRADOR: executa o tasks.md de uma Spec aprovada em ondas (todas, ou só Tnnn[,Tnnn]), com review por onda, commit por onda, review final e PR oferecido. Não fecha a Spec"
argument-hint: "[Tnnn[,Tnnn]] [specs/NNN-slug] [--dry-run | --worktree | --serial | --no-review]"
allowed-tools: Read, Write, Edit, Grep, Glob, Agent, Bash(git status:*), Bash(git branch --show-current), Bash(git rev-parse:*), Bash(git symbolic-ref --short refs/remotes/origin/HEAD), Bash(git switch:*), Bash(git merge-base:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git worktree add:*), Bash(git worktree remove:*), Bash(gh pr create:*)
---

# /specnico-implement — executar o tasks.md em ondas

Você é o ORQUESTRADOR de implementação. Resolve o grafo de `tasks.md`, valida a
segurança do paralelismo, despacha os subagentes `backend` e `frontend`
(`.claude/agents/`), coleta relatórios, faz review e commit por onda. Você
**não implementa nada você mesmo**: o contexto pesado vive nos subagentes. Este
comando substitui `hands-on`, `back`, `front` e `pr-open` da 1.x.

Argumento recebido: `$ARGUMENTS`

Invoque a skill `verification` (o que significa "pronto") e leia
`.specify/memory/constitution.md` (CN/GR e comandos de verificação, seção 4).
Siga `.specify/workflows/git-flow.md`.

## Argumento

| Token | Efeito |
|---|---|
| (vazio) | todas as ondas, em ordem |
| `T001[,T003]` | só essas tarefas (substitui `back` e `front` da 1.x). Cada dependência precisa estar com todos os critérios `[x]` ou fazer parte da mesma execução e rodar antes (ordem por onda/dependência; ex.: `T001,T002` com T002 dependendo de T001); senão **pare e liste** as faltantes — não execute fora de ordem |
| `NNN`, `NNN-slug` ou `specs/NNN-slug` | Spec alvo (senão `ativo.spec`) |
| `--dry-run` | mostra o plano resolvido e para; nada muda (git, backlog, estado) |
| `--serial` | ignora o paralelismo: tudo em sequência |
| `--worktree` | isola cada tarefa paralela em worktree próprio (Passo 4) |
| `--no-review` | pula a review por onda (a final continua) e registra em `review.md` |

## Regras gerais

- Nunca `git add -A`, `git add .` nem `git commit -a`: stage só de caminhos explícitos.
- **Commit só com confirmação.** Antes de cada `git commit`, mostre a mensagem e a
  lista exata de arquivos e pergunte **"Posso commitar?"**. Sem um sim explícito,
  não commite: as mudanças ficam no working tree e você diz o que ficou pendente.
  O `settings.json` também pede confirmação (`git commit` em `ask`); as duas valem.
- `allowed-tools` pré-aprova só os `git` deste fluxo e o `gh pr create`. Os comandos de verificação da constituição dependem do `permissions.allow` do `.claude/settings.json`; `git push`, `git merge --squash`, `git -C` e `git branch -D` (modo `--worktree`) pedem permissão.
- Nunca paralelize tarefas com dependência real nem que declarem o mesmo arquivo.
- Nunca execute tarefa com dependência não atendida; nunca avance de onda com a anterior quebrada.
- Nenhuma onda é dada como concluída sem a evidência de verificação dos agentes dela.
- **Não** marque a Spec como `done` nem o backlog como `done`: isso é do `/specnico-converge`.
- Falha em tarefa → **pare a onda**, reporte, não avance.
- Dúvida (critério ambíguo, escopo de tarefa incerto): proponha a interpretação e peça confirmação; uma pergunta por vez.

## Passo 1 — Spec alvo, estado e gate

Leia `.specify/state.json` e mostre a fase atual em uma linha (`Ativo: specs/NNN-slug · fase <fase> · Bnn`, ou `Ativo: nenhum`). Parâmetro ausente: `.specify/workflows/context-resolution.md`.

Normalize o alvo: `NNN`, `NNN-slug` ou `specs/NNN-slug`. Sem argumento de Spec,
leia `.specify/state.json` e use `ativo.spec`. Sem `ativo` e sem argumento →
diga que não há Spec e indique `/specnico-spec`.

Valide contra a realidade: pasta sem `spec.md`/`tasks.md`, `state.json`
ilegível ou `fase` divergente do Status → **avise** e proponha corrigir; só
altere com confirmação.

Leia `spec.md` e `tasks.md`. Gate pelo cabeçalho `**Status:**` de `spec.md`:

- `approved` → prossiga.
- `review` → **pare**: o humano precisa rodar `/specnico-approve`. Não implemente.
- `done` → avise que já está concluída; reexecutar só com confirmação.

Nunca altere você mesmo o Status. Edições de `tasks.md` (checkbox, Pendências
Manuais) e `review.md` não pedem emenda; mudar texto de `spec.md`/`plan.md`
exige registro em `## Emendas` (hook `spec-gate`). Precisa de arquivo fora do
`Arquivos:` de uma tarefa, ou a Spec parece errada → pare e escale; FR novo ou
removido é mudança de escopo, não emenda.

## Passo 2 — Plano de execução

De `tasks.md` extraia, por tarefa: `Agente`, `Depende de`, `Arquivos`, `Cobre` e
critérios. Monte as ondas pela tabela **Ondas** (confirme contra `Depende de`;
sem tabela, derive do grafo; sem nenhum dos dois, onda única sequencial e avise).

- Aplique o filtro `Tnnn` do argumento e verifique as dependências (acima).
- Pule tarefas com **todos** os critérios `[x]` (idempotência) e avise.
- `Agente: ambos` → separe em duas tarefas, uma por agente.
- **Propriedade de arquivos:** para cada onda com 2+ tarefas, cruze os `Arquivos:`. Interseção não vazia = não são independentes: serialize as em conflito e avise (`AVISO: T002 e T003 declaram src/app.module.ts`). Tarefa sem `Arquivos:` → trate a onda como sequencial e avise que o plano está incompleto.

Exiba o plano antes de executar:

```
Onda 1: T001 (backend)
Onda 2: T002 (backend) | T003 (frontend)   ← paralelo
Onda 3: T004 (frontend)
```

`--dry-run` → pare aqui.

## Passo 3 — Branch, estado e backlog

1. `git status --porcelain`: mudança **rastreada** pendente → pare e peça ao humano para commitar ou guardar. **Exceção:** o backlog e `.specify/state.json` que este comando grava (itens 4–5, inclusive numa execução anterior interrompida) não bloqueiam e entram no commit da primeira onda — regra de `.specify/workflows/git-flow.md` (Working tree). Não rastreados nunca bloqueiam e nunca são tocados.
2. Branch (`git branch --show-current`): se não estiver em `spec/NNN-slug` → `git switch spec/NNN-slug` se existir (`git rev-parse --verify --quiet refs/heads/spec/NNN-slug`); senão `git switch -c spec/NNN-slug` a partir do atual e avise.
3. Guarde `BASE` = `git merge-base <branch padrão> HEAD` (review final).
4. Backlog (`.specify/memory/product-backlog.md`): o `Item:` da Spec → `in-progress`. Spec sem `**Item:**` ou sem linha no backlog: avise e pule este item.
5. `.specify/state.json`: **só se** `ativo` não for nulo **e** a pasta alvo for igual a `ativo.spec` → `ativo.fase = "implement"`, `atualizado` = agora (ISO 8601); preserve o resto. Alvo diferente ou `ativo` nulo: avise e **não toque** em `state.json`.

Não commite agora: backlog e `state.json` entram no stage do commit da primeira onda efetivamente executada (única mudança admitida em aberto).

## Passo 4 — Isolamento por worktree (opcional, `--worktree`)

Por padrão as tarefas paralelas compartilham a working tree e a segurança vem
da propriedade de arquivos (Passo 2). Com `--worktree`, cada tarefa paralela
ganha uma árvore própria:

```
git worktree add ../.wt-<slug>-<Tnnn> -b wave/<slug>/<Tnnn> spec/<slug>
```

Ao fim da onda, para cada worktree, na ordem das tarefas:

```
git -C <worktree> add <Arquivos: da tarefa + arquivos reportados>
git -C <worktree> commit -m "wip(<Tnnn>): <título>"
git switch spec/<slug>
git merge --squash wave/<slug>/<Tnnn>
```

`--squash` traz as mudanças **sem commitar**: o commit `wip` fica só no branch
descartável, e a review da onda (`git diff HEAD`) continua vendo o diff. O
único commit real é o do Passo 5.5. Saída ≠ 0 do `merge --squash` → **pare a
onda** e reporte os arquivos em conflito. Só após o sucesso: `git worktree
remove --force <path>` e `git branch -D` (maiúsculo: squash nunca "mescla").

Compensa em tarefas longas de apps realmente independentes; no caso comum não —
cada worktree é um checkout sem `node_modules`. Avise antes de criar worktrees e
nunca use a flag com mudanças rastreadas não commitadas (exceto backlog/estado do Passo 3).

## Passo 5 — Executar onda a onda

Para cada onda, **em ordem**:

1. **Um subagente por tarefa**, conforme `Agente:` (`backend` → `backend`, `frontend` → `frontend`). Eles carregam o próprio contexto (guardrails, skill do papel, convenções); **não** o repita. Mande só o que é da tarefa — o implementador **não** recebe `spec.md` nem `plan.md` inteiros:

   ```
   Spec: specs/NNN-slug (Status: approved)
   Tarefa: Tnnn — <título>
   Escopo: <raiz | apps/<app>>   ← campo **Escopo:** da Spec
   Diretório de trabalho: <worktree>   ← só com --worktree
   Descrição: <texto da tarefa>
   Cobre — trechos da Spec: <texto dos FR/SC listados em Cobre:>
   Contrato (plan.md): <apenas a seção de contrato/modelo que a tarefa usa>
   Arquivos declarados: <lista de Arquivos:>
   Critérios de Aceite:
     - [ ] <critério 1 — com seu comando de verificação>
   Marque [x] em tasks.md só com evidência (skill verification).

   Não edite arquivos fora da lista declarada — outras tarefas desta onda
   dependem disso. Se precisar de um, pare e reporte.
   ```

2. **Paralelismo:** 2+ tarefas independentes e sem colisão → despache todos os subagentes numa só rodada. `--serial` ou colisão → em sequência.

3. **Colete os relatórios** (arquivos alterados, saída da verificação, critérios marcados). Falha ou `não verificado` → a onda **não** está concluída; `[x]` de agente que reportou `⚠️ não verificado` não conta — reabra a tarefa. **Pendência Manual não bloqueia:** o implementador a anota em `tasks.md` (`## Pendências Manuais`, formato da skill `verification`); acumule (tarefa, critério, instrução) para o resumo.

4. **Review da onda** (`--no-review` pula e registra `- [onda N] review pulada (--no-review)` em `review.md`). Despache `reviewer` — que recebe o pacote completo, não o recorte do implementador:

   ```
   Modo: onda N
   Spec: specs/NNN-slug   ← leia spec.md, plan.md e tasks.md
   Tarefas da onda: <Tnnn e títulos>
   Diff: `git diff HEAD` + estes arquivos novos: <não rastreados declarados
   ou reportados pelas tarefas da onda — nunca outros>
   Verificação: <saída reportada por tarefa>
   Revise contra os critérios de aceite e FRs das tarefas da onda.
   ```

   - 🔴 BLOCKER / 🟡 WARNING → atribua cada achado à tarefa dona do arquivo (`Arquivos:`; sem dono → tarefa da onda no diretório mais próximo; ambíguo → escale). Despache um **novo** implementador com a tarefa original + os achados; ele corrige e roda a verificação. Correções em paralelo só se os arquivos não colidirem; senão em sequência.
   - Re-review escopada: `reviewer` com `Modo: re-review`, `Spec:` e a lista de achados abertos (verdict por achado + quebra nova).
   - Máximo **3 rodadas** por onda. Estourou → **pare**, não commite a onda e reporte os achados abertos (`arquivo:linha` e correção sugerida). Para retomar: resolva manualmente (commit ou `git stash`) e rode `/specnico-implement <Tnnn da onda>`.
   - 🟢 SUGGESTION / 💡 NOTE → anote em `specs/NNN-slug/review.md`, sem loop: `- [onda N] arquivo:linha — texto`. Crie o arquivo se faltar, com o cabeçalho `# Notas de review — NNN-slug`. Essas notas **não** vão para a Spec.

5. **Commit da onda** (review limpa) — pergunte "Posso commitar?" com a mensagem e a
   lista de arquivos; negado → **pare a execução** aqui (onda fica no working tree)
   e vá ao resumo. Confirmado: stage explícito de arquivos declarados + reportados + `tasks.md` + `review.md` (se mudou) e, na primeira onda executada, o backlog e `state.json`. Mensagem:

   `<tipo>(<escopo>): NNN-slug — onda N (T001, T002)`

   Corpo: `Spec: specs/NNN-slug` e `Cobre: <FRs das tarefas>`. `<tipo>` = `feat`, ou `fix`/`refactor`/`chore` quando **todas** as tarefas da onda tiverem esse `Tipo:`; `<escopo>` = app/package (omita em `single`).

6. **Não inicie a próxima onda** antes do commit da atual.

## Passo 6 — Finalização

1. **Verificação final do conjunto:** rode os comandos da constituição (type-check, lint, testes) sobre o projeto inteiro e cole a saída real.
2. **Review final:** `reviewer` com `Modo: final`, `Spec: specs/NNN-slug` (pacote completo), `Diff: git diff <BASE>..HEAD` e `Verificação: <saída do item 1>`.
   - Com 🔴/🟡: **uma única** rodada de correção (mesma atribuição do Passo 5.4), `Modo: re-review`, repita o item 1 e commite `fix(<escopo>): NNN-slug — review final`. Sem correção aplicada → sem commit.
   - 🟡/🟢 que restarem → `review.md` como `- [final] arquivo:linha — texto`.
   - Restando 🔴: **não** ofereça PR; vá ao resumo listando os achados abertos. Se a rodada alterou código não commitado, avise que a working tree está suja, liste os arquivos e oriente a retomada (resolver manualmente e rodar o comando de novo).
3. Se `tasks.md`/`review.md` mudaram sem commit (notas, Pendências), commit separado, stage explícito só desses arquivos: `docs(spec): notas de review NNN-slug`.
4. **Execução parcial** (filtro `Tnnn` deixou tarefas com critérios `[ ]`) → não ofereça PR; registre "execução parcial" no resumo.
5. **PR** (execução completa de todas as ondas e review final sem 🔴; Pendência Manual aberta **não** impede o PR: vai listada no corpo e segue para o `/specnico-converge`). Ofereça abrir (push e `gh pr create` pedem confirmação; nunca `--force`):
   - Título (≤ 70 caracteres, Conventional Commits): o título da Spec.
   - Corpo em pt-BR, só o que Spec/commits/diff sustentam, gravado em `.git/PR_BODY.md` (dentro de `.git`, nunca rastreado): **Problema** (seção da Spec), **FRs** cobertos, **tabela de verificação com a saída real** do item 1, **Pendências Manuais** (as abertas, com instrução; ou "(nenhuma)"), e link para `specs/NNN-slug/review.md`.
   - `git push -u origin spec/NNN-slug` e `gh pr create --base <branch padrão> --head spec/NNN-slug --title "<título>" --body-file .git/PR_BODY.md`. Sem `gh` → imprima os comandos.
6. **Resumo curto:** ondas, rodadas de review por onda, commits, tarefas puladas, verificação final, "execução parcial" quando aplicável, achados 🔴 abertos, Pendências Manuais (`tarefa — critério — instrução` ou "(nenhuma)"), link do PR se criado.

A Spec segue `approved` e o item `in-progress` até o `/specnico-converge`, que
confere código × artefatos, fecha Pendências e só então marca `done`.

Próximo: `/specnico-converge`
