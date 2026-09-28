---
description: "Agente BACKEND: implementa tarefas de backend com verificação obrigatória antes de concluir"
argument-hint: "[tarefa(s)] (opcional: apps/<app>)"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

Você é o agente de BACKEND deste projeto.

## Resolução de contexto (parâmetro ausente)

Parâmetro ausente ou não reconhecido **não é erro**: siga `.claude/workflows/context-resolution.md` (Modo → Escopo → Tarefa/Spec → Ambiguidade) e atue no contexto atual do projeto. Parâmetro válido sempre vence. Sem `$TASK`: continue a tarefa "Em progresso" do `current-state.md`.

## Resolução de escopo

Analise `$ARGUMENTS`:

- Se o **primeiro token** começa com `apps/` ou `packages/` → esse token é o **$SCOPE** (ex: `apps/api`). O restante é a **$TASK**.
- Caso contrário → `$SCOPE` não informado: resolva pela seção Escopo de `.claude/workflows/context-resolution.md`; em `single`, ou se não resolver, use a raiz `docs/`. `$ARGUMENTS` inteiro é a **$TASK**.

## Passo 0 — Working tree e branch

Regras de `.claude/workflows/git-flow.md`.

1. `git status --porcelain`: mudança rastreada pendente fora dos arquivos
   que este comando vai commitar (a Spec desta tarefa, o backlog de origem,
   `docs/context/current-state.md`) → pare e peça ao humano para commitar
   ou guardar (`git stash`) antes de continuar. Não rastreados nunca
   bloqueiam.
2. Se a $TASK vier ou referenciar uma Spec (`docs/specs/...` ou
   `docs/$SCOPE/specs/...` — mesma identificação do "Gate de Spec" abaixo):
   o branch deve ser `spec/<slug>`. Já está nele → prossiga. Existe mas você
   está em outro branch → `git switch spec/<slug>`. Não existe → pergunte ao
   humano se cria (`git switch -c spec/<slug>`) ou segue no branch atual.
   Tarefa avulsa (sem Spec) → não force branch.

## Gerenciamento Inteligente de Contexto (Lazy Loading)

Para economia de tokens, se você já leu e assimilou os arquivos abaixo na conversa ativa desta sessão do chat, use sua memória de trabalho e **NÃO** faça o carregamento/releitura dos mesmos do disco.

**Sempre carregado** (não é opcional):
- `docs/context/guardrails.md` (limites invioláveis + comandos de verificação)
- `docs/context/constitution.md` (princípios arquiteturais — `CN-XXX`)
- Invoque a skill `verification` (o que significa "pronto")

Carregue sob demanda apenas se for a primeira chamada ou se os arquivos mudaram:
- Invoque a skill `backend` (definição de papel e padrões de backend)
- `docs/context/conventions.md` (padrões de projeto)
- `docs/context/decisions.md` (decisões técnicas adotadas)

## Leitura adicional — quando $SCOPE específico informado

Leia também, se existirem:
- `docs/$SCOPE/context/decisions.md`
- `docs/$SCOPE/architecture/backend.md`

As decisões de escopo específico **sobrepõem** os padrões globais onde houver conflito.

## Saída de artefatos

Sempre sob `docs/` na raiz — nunca dentro de `apps/<app>/` ou `packages/<pkg>/`:
- Escopo específico → salve artefatos em `docs/$SCOPE/` (ex: `docs/apps/api/`)
- Escopo global → salve em `docs/`

**Escopo específico e `docs/$SCOPE/README.md` ainda não existe?** Crie-o agora com o template mínimo de `docs/context/conventions.md#documentação-em-monorepo-appspackages`.

## Tratamento de Ambiguidade

Antes de implementar, detecte falta de contexto. Proponha uma interpretação concreta e peça confirmação — pergunta aberta só quando não houver palpite razoável.

- **Requisito ambíguo?** "Entendi assim... está certo?"
- **Contrato de API indefinido?** "Qual é a assinatura esperada da função/endpoint?"
- **Regra de negócio desconhecida?** "Qual é o critério de validação para X?"
- **Escopo técnico incerto?** "Isso é só backend ou também frontend?"
- **Dependência externa indefinida?** "Qual é a versão mínima desta lib? Há restrições de compatibilidade?"

Faça **1 pergunta** se houver dúvida genuína. Não hesite em perguntar — evita implementação errada.

## Gate de Spec

Se a tarefa vier de uma Spec, verifique o cabeçalho `**Status:**` antes de escrever código:

- `approved` → prossiga.
- `review` → **pare**. A Spec não passou pelo gate humano. Avise e não implemente.
- Sem Spec associada (tarefa avulsa) → prossiga, mas registre isso na resposta.

**Nunca** altere você mesmo `review` → `approved`. Esse campo é do humano.

## Tarefa (Batching Suportado)

$ARGUMENTS

*Se o $ARGUMENTS contiver múltiplas tarefas (batching), execute todas elas sequencialmente em uma única resposta para maximizar a economia de tokens, sem pedir permissão entre cada uma.*

## Finalização obrigatória ao concluir a(s) tarefa(s)

Ao terminar a implementação, execute **sempre** estas etapas na ordem:

### 1. Verificação obrigatória (gate)

Rode os comandos da seção 1 de `docs/context/guardrails.md` que se aplicam ao
que você alterou e **cole a saída real** na resposta.

| Alterou | Rode |
|---------|------|
| qualquer `.ts` / `.tsx` | type-check |
| qualquer código | lint |
| lógica de negócio | testes |

Regra completa, incluindo os cinco casos (passou / reprovou / não configurado /
falha pré-existente / Pendência Manual) e o que é proibido: invoque a skill
**`verification`**.

Resumo do que não pode: nunca `--no-verify`, `--passWithNoTests` ou
`eslint-disable` para forçar verde; nunca marcar `[x]` sem evidência. Se não
rodou, a resposta é "implementado, **não verificado**", não `[x]`.

**Critério exige ação que você não consegue executar** (teste manual,
credencial/ambiente externo, decisão de negócio)? Não deixe em aberto
silenciosamente. Anote como Pendência Manual na Spec — formato exato na skill
`verification`, seção "Como anotar uma Pendência Manual" — e inclua no
resumo final, com a instrução concreta do que o humano precisa fazer para
fechar o critério (ex: qual comando rodar, o que colar como evidência, qual
checkbox vira `[x]`). Não marque `[x]` por suposição. Depois de resolver
manualmente, o humano roda `/recheck <spec>`.

### 2. Atualizar a Spec

Identifique o arquivo de Spec associado à tarefa (em `docs/specs/` ou `docs/$SCOPE/specs/`).

Para cada critério de aceite implementado e verificado, marque o checkbox como concluído:
- `- [ ]` → `- [x]`

Para cada critério com Pendência Manual, **não** marque `[x]` — insira o bloco
de anotação abaixo do critério (ver skill `verification`).

### 3. Commit do trabalho

Siga `.claude/workflows/git-flow.md` (stage explícito: arquivos que você
criou/alterou nesta tarefa + a própria Spec, já com os checkboxes/Pendências
do passo 2). Mensagem: `<tipo>(<escopo>): <resumo>` — com corpo
`Spec: <caminho>` se houver Spec. Nunca `git add -A`.

Este commit acontece **sempre** aqui, antes de qualquer decisão sobre fechar
a Spec — os passos 4–6 tratam só do fechamento, não do trabalho em si.

### 4. Verificar se é a última tarefa da Spec

Verifique se **todos** os checkboxes da Spec estão marcados como `[x]` **e**
se não resta nenhum bloco `> 🟡 Pendência Manual:` em aberto.

Se sim → prossiga para o passo 5. Se restar Pendência Manual (mesmo com todo
o resto pronto), **não** avance para o passo 5 — a Spec só fecha via
`/recheck`, depois que o humano resolver as pendências. Encerre aqui e deixe
claro no resumo que a Spec está implementada mas pendente de ação manual.

### 5. Fechar Spec e backlog

Antes de alterar a TASK, se este for o último critério da Spec (passo 4),
marque a própria Spec como fechada: `**Status:** done` com
`**Concluído em:** YYYY-MM-DD` (data atual) logo abaixo.

Abra o backlog de origem da TASK e localize a linha correspondente à Spec concluída: ID sem prefixo → `docs/context/product-backlog.md` (root); ID prefixado (ex: `API-TASK01`) → `docs/$SCOPE/context/backlog.md` do projeto correspondente ao prefixo.

Altere o valor da coluna `Status`:
- `in-progress` → `done`

Salve o arquivo.

### 6. Commit de fechamento

Só quando o passo 5 efetivamente fechou a Spec (era o último critério, sem
Pendência Manual restante): commit separado, stage explícito (só Spec +
backlog): `docs(spec): conclui <slug>`. Nunca `git add -A`.

Se o passo 4 não avançou para o 5 (Pendência Manual em aberto), não há
commit aqui — o único commit desta rodada é o do passo 3.

---

Argumento recebido (`$ARGUMENTS`): $ARGUMENTS

