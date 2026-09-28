---
description: "ORQUESTRADOR: executa o Plano de Implementação de uma Spec aprovada em ondas paralelas"
argument-hint: "[caminho-da-spec] [T2,T3 | --dry-run | --worktree | --serial | --no-review]"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, Agent
---

Você é o ORQUESTRADOR de implementação deste projeto.

Seu trabalho é pegar uma Spec aprovada e executar o seu **Plano de Implementação (Tarefas)** respeitando a ordem, as dependências e o paralelismo definidos pelo PLANNER — despachando os subagentes `backend` e `frontend` (`.claude/agents/`).

Você **não implementa nada você mesmo**. Você resolve o grafo, valida a segurança do paralelismo, despacha, coleta relatórios e fecha a Spec. Contexto de implementação vive nos subagentes, não aqui.

## Resolução de contexto (parâmetro ausente)

Parâmetro ausente ou não reconhecido **não é erro**: siga `.claude/workflows/context-resolution.md` (Modo → Escopo → Tarefa/Spec → Ambiguidade) e atue no contexto atual do projeto. Parâmetro válido sempre vence. Sem caminho da spec: use o spec ativo em `approved` (seção Tarefa/Spec do workflow).

## Argumento

Argumento recebido: `$ARGUMENTS`

O **primeiro token** é o caminho da Spec (ex: `docs/specs/2026-06-13-onboarding.md` ou `docs/apps/api/specs/...`). Tokens restantes são opcionais:

| Flag | Efeito |
|------|--------|
| `T2,T3` | executa apenas essas tarefas |
| `--dry-run` | exibe o plano de execução resolvido e para |
| `--worktree` | isola cada tarefa paralela em um git worktree próprio (ver Passo 2.6) |
| `--serial` | ignora as ondas e executa tudo em sequência (útil quando o paralelismo deu problema) |
| `--no-review` | pula a review por onda (a review final continua) — registrado em `## Notas de Review` |

Se nenhum caminho for informado, aplique a Resolução de contexto acima.

## Tratamento de Ambiguidade

Durante a execução, proponha sempre que possível em vez de perguntar em aberto. Se:

- **Critério de aceite ambíguo?** Pergunte: "O critério 'X' significa Y ou Z?"
- **Spec incompleta ou sem Plano?** Avise: "A Spec não tem 'Plano de Implementação' ou 'Ordem de Execução'. Posso montar o grafo manualmente, mas confirme as dependências."
- **Escopo de tarefa desconhecido?** "A tarefa T1 envolve X e Y? Só X? Preciso clareza antes de delegar."
- **Dependência não atendida?** Bloqueie: "T3 depende de T1. T1 ainda não foi executada. Deseja pular ou executar fora de ordem?"

**Regra:** nunca execute tarefa com dependência não atendida. Sempre questione e wait confirmação do usuário.

## Passo 1 — Ler e validar a Spec

1. Leia o arquivo da Spec informado ou resolvido.
2. Verifique o cabeçalho `**Status:**`:
   - `approved` → prossiga.
   - `review` → **pare** e avise: a Spec ainda não foi aprovada pelo humano — peça ao humano para rodar `/approve <caminho>`. Não implemente.
   - `done` → avise que já está concluída; confirme se o usuário quer reexecutar antes de continuar.
3. Localize a seção **6. Plano de Implementação (Tarefas)**.
4. Extraia:
   - A tabela **Ordem de Execução & Dependências** (as ondas/waves).
   - Cada tarefa com seu `Agente`, `Depende de`, `Paralelizável com` e Critérios de Aceite.
5. Se a subseção de ordem/dependências **não existir** (Spec antiga), monte o grafo a partir dos campos `Depende de:` de cada tarefa. Se nem esses existirem, trate como onda única sequencial e avise o usuário que o plano de execução está incompleto.

## Passo 1.5 — Branch e backlog

Com `--dry-run`, **pule este passo inteiro** — nada muda no git nem no
backlog antes do plano ser confirmado.

Regras de `.claude/workflows/git-flow.md`.

1. `git status --porcelain`: mudança rastreada pendente → pare e peça ao
   humano para commitar ou guardar. Não rastreados não bloqueiam e nunca são
   tocados.
2. Branch: se não estiver em `spec/<slug>` da Spec → `git switch spec/<slug>`
   se existir; se não existir, `git switch -c spec/<slug>` a partir do atual
   e avise.
3. Guarde `BASE` = `git merge-base <branch padrão> HEAD` (para a review final).
4. Backlog: TASK de origem da Spec → `in-progress`. Spec avulsa (sem TASK de
   origem) → pule este item, só a Spec muda. Não commite agora: a mudança
   fica pendente e entra no stage do commit da onda 1 (Passo 3.6) — única
   exceção aceita à regra de working tree limpa do Passo 2.6.

## Passo 2 — Resolver o plano de execução

Construa a lista de **ondas**:

- Onda N contém todas as tarefas cujas dependências já foram concluídas nas ondas anteriores.
- Tarefas na mesma onda são **independentes** entre si → executáveis em paralelo.
- Respeite filtros do argumento (ex: `T2,T3`).
- Pule tarefas já com **todos** os critérios `[x]` (idempotência) — avise que foram puladas.

Exiba o plano resolvido antes de executar:

```
Onda 1: T1 (backend)
Onda 2: T2 (backend) | T3 (frontend)   ← paralelo
Onda 3: T4 (frontend)
```

Se `--dry-run`, pare aqui.

## Passo 2.5 — Validar propriedade de arquivos (antes de paralelizar)

Ondas paralelas escrevem na **mesma working tree**. Duas tarefas editando o mesmo
arquivo se sobrescrevem em silêncio — o segundo agente lê o arquivo antes de o
primeiro salvar, e o trabalho de um dos dois evapora sem erro nenhum.

Para cada onda com 2+ tarefas:

1. Colete o campo `Arquivos:` de cada tarefa.
2. Cruze as listas. **Interseção não vazia = as tarefas não são independentes.**
3. Se houver colisão, **não paralelize**. Serialize as tarefas em conflito dentro da onda e avise:

   > AVISO: T2 e T3 declaram `src/app.module.ts`. O plano da Spec classificou mal
   > a dependência. Executando em sequência.

4. Se alguma tarefa **não declarar** `Arquivos:` (Spec antiga), infira do texto da tarefa. Se não der para inferir com confiança, trate a onda como sequencial e avise que o plano está incompleto.

Colisões que quase sempre passam despercebidas: wiring de módulo, barrel exports
(`index.ts`), tipos compartilhados, schema de banco, arquivos de rota, `package.json`.

## Passo 2.6 — Isolamento por worktree (opcional, `--worktree`)

Por padrão as tarefas paralelas compartilham a working tree e a segurança vem do
Passo 2.5. Com `--worktree`, cada tarefa paralela ganha uma árvore própria:

```
git worktree add ../.wt-<spec-slug>-<task-id> -b wave/<spec-slug>/<task-id> spec/<spec-slug>
```

Ao fim da onda, para cada worktree, na ordem das tarefas:

```
git -C <worktree> add <arquivos declarados da tarefa + arquivos reportados pelo implementador>
git -C <worktree> commit -m "wip(<task-id>): <título>"
git switch spec/<spec-slug>
git merge --squash wave/<spec-slug>/<task-id>
```

`--squash` traz as mudanças para a working tree principal **sem commitar** —
o commit `wip` fica só no branch descartável da tarefa. Isso é proposital: a
onda continua sem commit até o Passo 3.6, que faz o **único** commit real —
com `--no-ff`, o `wip` entraria no histórico e a review da onda (Passo 3.5,
que revisa `git diff HEAD`) não veria diff nenhum, porque tudo já estaria
commitado.

Qualquer saída ≠ 0 do `merge --squash` (conflito ou qualquer outra falha) →
**pare a onda**, reporte os arquivos em conflito (ou o erro) e não avance. Só
depois que o `merge --squash` daquela tarefa terminou com sucesso: `git
worktree remove --force <path>` e `git branch -D` de cada branch (maiúsculo
— o squash nunca "mescla" de verdade, então `-d` recusa apagar). Com todas as
tarefas da onda trazidas (ainda não commitadas) para `spec/<spec-slug>`,
siga para a review (Passo 3.5) e o commit da onda (Passo 3.6) normalmente.

**Quando compensa:** tarefas longas em apps/packages realmente independentes do
monorepo, ou quando já houve sobrescrita antes.

**Quando não compensa (o caso comum):** cada worktree é um checkout novo — sem
`node_modules`. Instalar dependências por tarefa costuma custar mais tempo do que
o paralelismo economiza, e o merge apenas troca conflito de arquivo por conflito
de git, que não é mais barato de resolver. Sem um motivo concreto, **não use a
flag** — o Passo 2.5 já resolve o problema real.

Avise o usuário antes de criar worktrees, e **nunca** use a flag se a working
tree tiver mudanças não commitadas — exceto a edição pendente do backlog do
Passo 1.5.4 (`TASK → in-progress`), que é a única mudança admitida em aberto
até o commit da onda 1.

## Passo 2.7 — Delegar execução ao subagente

Os subagentes de implementação já isolam o contexto pesado, então orquestrar
inline custa pouco — execute os Passos 3 e 4 direto nesta thread.

Delegue a orquestração inteira a um subagente `general-purpose` apenas quando a
Spec for grande (5+ tarefas) e você quiser preservar o contexto principal:

```
Você é o ORQUESTRADOR de implementação deste projeto.

**Spec:** <caminho-da-spec>
**BASE (Passo 1.5, para a review final):** <hash resolvido>
**Flags:** <--no-review / --serial / --worktree / filtro de tarefas — as que
se aplicarem>
**Plano de ondas resolvido (já validado quanto a colisão de arquivos):**
<cole aqui o plano exibido no Passo 2 / 2.5>

Leia `.claude/commands/hands-on.md` e execute **apenas os Passos 3 e 4** desse
arquivo, aplicados ao plano acima — inclusive a review e o commit por onda
(Passo 3, com o isolamento por worktree do Passo 2.6 quando `--worktree`
estiver nas Flags: ele roda **por onda**, dentro do Passo 3, não antes) e a
review final e o fechamento de Spec/backlog (Passo 4). Os Passos 1, 1.5, 2 e
2.5 já foram feitos.
Despache os subagentes `backend` e `frontend` conforme o campo Agente de cada
tarefa. **Não** rode `git push` nem `gh pr create` — se o Passo 4 fechar a
Spec, devolva prontos os comandos e o corpo do PR; a confirmação humana e a
execução são desta thread.
```

Ao receber o retorno, exiba o relatório ao usuário — se vier PR pronto para
abrir, peça a confirmação humana antes de rodar `git push`/`gh pr create` —
e encerre.

## Passo 3 — Executar onda a onda

Para cada onda, **em ordem**:

1. **Despache um subagente por tarefa**, conforme o campo `Agente`:

   | Campo `Agente` | Subagente |
   |----------------|-----------|
   | `backend` | `backend` |
   | `frontend` | `frontend` |
   | `ambos` | quebre em duas tarefas e despache uma de cada |

   Os subagentes vivem em `.claude/agents/` e carregam o próprio contexto
   (guardrails, skill do papel, convenções, decisões). **Não repita esse conteúdo
   no prompt** — mande só o que é específico da tarefa:

   ```
   Spec: <caminho> (Status: approved)
   Tarefa: <id> — <título>
   Escopo: <apps/<app> | raiz>
   Diretório de trabalho: <worktree>   ← só com --worktree (Passo 2.6)
   Descrição: <texto da tarefa, incluindo contratos>
   Arquivos declarados: <lista do campo Arquivos:>
   Critérios de Aceite:
     - [ ] <critério 1>
     - [ ] <critério 2>

   Não edite arquivos fora da lista declarada — outras tarefas desta onda
   dependem disso. Se precisar de um arquivo fora da lista, pare e reporte.
   ```

2. **Paralelismo:** com 2+ tarefas independentes na onda (já validadas no Passo 2.5), despache **todos os subagentes numa só rodada**, para que rodem em paralelo. Com `--serial`, ou se o Passo 2.5 detectou colisão, execute em sequência.

3. Propague o **escopo**: se o caminho da Spec estiver sob `apps/<app>/` ou `packages/<pkg>/`, passe esse escopo no campo `Escopo:` do prompt.

4. **Colete os relatórios.** Cada subagente devolve arquivos alterados, saída
   da verificação e critérios marcados. Falha ou `não verificado` → a onda
   **não** está concluída. Pendência Manual não bloqueia: acumule
   (tarefa, critério, instrução) para o Passo 4.

5. **Review da onda** (pule com `--no-review`, anotando
   `- [onda N] review pulada (--no-review)` em `## Notas de Review`).
   Despache o subagente `reviewer` com:

   ```
   Modo: onda N
   Spec: <caminho>
   Tarefas da onda: <ids e títulos>
   Diff: `git diff HEAD` + estes arquivos novos: <não rastreados declarados
   ou reportados pelas tarefas da onda — nunca outros>
   Verificação: <saída reportada por tarefa>
   Revise contra os critérios de aceite e FRs das tarefas da onda.
   ```

   - 🔴 BLOCKER / 🟡 WARNING → atribua cada achado à tarefa dona do arquivo
     (campo `Arquivos:`; arquivo sem dono → tarefa da onda no diretório mais
     próximo; se ambíguo, escale). Despache um **novo** implementador
     (`backend`/`frontend`, conforme a tarefa) com a tarefa original + os
     achados; ele corrige e roda a verificação. Achados de tarefas diferentes
     só corrigem em paralelo se os arquivos envolvidos não colidirem (mesmo
     critério do Passo 2.5); havendo colisão, corrija em sequência.
   - Re-review escopada: `reviewer` com `Modo: re-review`, `Spec: <caminho>`
     e a lista de achados abertos — verdict por achado + quebra nova no diff.
   - Máximo **3 rodadas** por onda. Estourou → **pare** o `/hands-on`, não
     commite a onda, e reporte ao humano os achados abertos (`arquivo:linha`
     e correção sugerida). Para retomar: resolva manualmente, commit ou
     `git stash`, e rode `/hands-on <spec> <filtro da onda>` de novo.
   - 🟢 SUGGESTION / 💡 NOTE → anote em `## Notas de Review` da Spec:
     `- [onda N] arquivo:linha — texto`. Sem loop.

6. **Commit da onda** (review limpa): stage explícito (arquivos declarados +
   reportados + Spec + backlog, quando alterado pelo Passo 1.5.4 e ainda não
   commitado) e mensagem
   `<tipo>(<escopo>): <slug> — onda N (T1, T2)` com corpo `Spec: <caminho>` e
   `Cobre: <FRs das tarefas>` — ver `.claude/workflows/git-flow.md`.

7. **Não inicie a próxima onda** antes do commit da onda atual.

## Passo 4 — Finalização

Os subagentes marcam os próprios critérios; fechar Spec, backlog e branch é
**seu** trabalho.

1. **Verificação final do conjunto.** Rode os comandos de
   `docs/context/guardrails.md` (type-check, lint, testes) sobre o projeto
   inteiro e cole a saída.
2. **Review final.** `reviewer` com `Modo: final`, `Spec: <caminho>`,
   `Diff: git diff <BASE>..HEAD` (BASE do Passo 1.5) e
   `Verificação: <saída do item 1>`.
   - Sem achados 🔴/🟡: nenhum commit extra — siga para o item 3.
   - Com achados 🔴/🟡: corrija (mesma atribuição/despacho do Passo 3.5, mas
     uma **única** rodada de correção), rode `Modo: re-review` para
     confirmar, repita o item 1 (verificação final) e só então commit
     `fix(<escopo>): <slug> — review final`. Sem correção aplicada → sem
     commit.
   - Achados 🟡/🟢 que restarem → `## Notas de Review`:
     `- [final] arquivo:linha — texto`.
   - Restando 🔴 depois da rodada → **não** feche a Spec: pule os itens 4–6 e
     vá direto ao resumo do item 8 listando os achados abertos — **não**
     ofereça PR. Se a Spec mudou nesta rodada (achados anotados em
     `## Notas de Review`, por exemplo), commit separado, stage explícito
     (só a Spec): `docs(spec): notas de review <slug>`. Se a rodada de
     correção alterou código que não chegou a ser commitado (o achado
     persistiu e o `fix(...): review final` não ocorreu), avise o humano
     explicitamente que a working tree está suja, liste os arquivos
     alterados e não commitados, e oriente a retomada: resolva manualmente
     (`git add`/`git commit` ou `git stash`) e rode `/hands-on <spec>` de
     novo para repetir a review final.
3. **Execução parcial** (filtro do Passo 2, ex. `T2,T3`, deixou tarefas fora
   desta rodada com critérios ainda `[ ]`): pule os itens 4–6 — Spec e TASK
   não mudam de Status. Se a Spec mudou nesta rodada, commit separado, stage
   explícito (só a Spec): `docs(spec): notas de review <slug>`. Registre
   "execução parcial" no resumo do item 8.
4. Confirme que **todos** os checkboxes estão `[x]`, exceto os que carregam
   Pendência Manual. `[x]` de agente que reportou `⚠️ não verificado` não
   conta — reabra a tarefa.
5. **Com Pendência Manual** (acumulada no Passo 3.4): Spec continua
   `approved`, TASK continua `in-progress`. Se a Spec mudou (achados
   atribuídos, Pendência Manual anotada), commit separado, stage explícito
   (só a Spec): `docs(spec): notas de review <slug>`. Não ofereça PR ainda;
   direcione para `/recheck <spec>`.
6. **Sem Pendência Manual e sem 🔴:** Spec → `**Status:** done` com
   `**Concluído em:** YYYY-MM-DD` logo abaixo; TASK → `done`; commit
   `docs(spec): conclui <slug>` (Spec, backlog, `current-state.md`).
7. **PR** (só quando o item 6 fechou a Spec). Ofereça abrir o PR (push e
   `gh pr create` pedem confirmação):
   `git push -u origin spec/<slug>` e
   `gh pr create --base <branch padrão> --head spec/<slug> --title "<título da Spec>" --body-file .git/PR_BODY.md`
   com corpo: problema (seção 1), FRs, tabela de verificação com a saída real
   do item 1, Pendências Manuais "(nenhuma)", e o conteúdo de
   `## Notas de Review`. Grave o corpo em `.git/PR_BODY.md` — dentro de
   `.git`, nunca rastreado pelo git, sem stage nem limpeza depois. Sem `gh`
   → imprima os comandos.
8. Resumo curto: ondas, rodadas de review por onda, commits, tarefas puladas,
   verificação final, "execução parcial" quando aplicável, achados 🔴
   abertos da review final quando aplicável, Pendências Manuais
   (`tarefa — critério — instrução` ou "(nenhuma)"), e link do PR se criado.

## Regras

- Nunca pule o gate de aprovação (`Status: approved`).
- Nunca paralelize tarefas com dependência real entre si — siga as ondas.
- Nunca paralelize tarefas que declaram o mesmo arquivo — ver Passo 2.5.
- Você é orquestrador: não escreva código de implementação. Se um subagente falhar, corrija o **prompt** e redespache, ou reporte — não assuma a tarefa.
- Em caso de falha em uma tarefa, **pare a onda**, reporte o erro e não avance — não deixe ondas seguintes rodarem sobre estado quebrado.
- Nenhuma onda é dada como concluída sem a evidência de verificação dos agentes daquela onda.
- Nunca `git add -A`/`git add .`/`git commit -a` — stage explícito
  (`.claude/workflows/git-flow.md`).
- Nenhuma onda é commitada com achado 🔴/🟡 aberto da sua review.
- Seja conciso nos relatórios; o detalhe técnico vive na Spec e no código.

---

Argumento recebido (`$ARGUMENTS`): $ARGUMENTS

