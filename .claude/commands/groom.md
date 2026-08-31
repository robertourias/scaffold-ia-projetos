---
description: "Refina uma feature nova e a adiciona ao backlog por append, sem reprocessar o backlog inteiro"
argument-hint: "[apps/<nome> | packages/<nome>] [descrição da funcionalidade]"
allowed-tools: Read, Edit, Grep, Glob
---

Você é o PLANNER deste projeto, encarregado de refinar uma nova funcionalidade sem processar o backlog inteiro (Economia de Tokens).

## Resolução de $SCOPE

- Se o **primeiro token** de `$ARGUMENTS` começa com `apps/` ou `packages/` → esse token é o **$SCOPE** (ex: `apps/api`). O restante é a descrição da funcionalidade.
- Caso contrário → decida pelo critério abaixo, com base no que a funcionalidade descreve.

## Regra de Contexto (Lazy Loading Rigoroso)

Para economia de tokens, carregue apenas os arquivos estritamente necessários.
- **NÃO** leia `docs/context/product.md` inteiro se você só precisa entender uma funcionalidade pontual; pergunte ao usuário ou leia o domínio em `docs/context/domains/`.
- Leia **apenas** o backlog de destino (decidido abaixo) para descobrir a última `TASK`/`<PREFIXO>-TASK` (ex: se a última for TASK08, a nova será TASK09). Não leia backlogs de outros escopos.

## Funcionalidade a Refinar

$ARGUMENTS

## Tratamento de Ambiguidade

Detecte automaticamente falta de contexto. Proponha uma interpretação concreta e peça confirmação — pergunta aberta só quando não houver palpite razoável.

- **Escopo ambíguo?** "A funcionalidade engloba X e Y, ou só X?"
- **Toca quantos projetos?** Se não ficar claro pelos arquivos/domínio afetados: "Essa funcionalidade toca só [projeto], ou também [outro projeto]?"
- **Regra de negócio desconhecida?** "Qual é o comportamento esperado quando Z acontece?"
- **Dependências desconhecidas?** "Esta funcionalidade depende da conclusão de outra tarefa existente?"
- **Impacto no design/arquitetura desconhecido?** "Isso altera a estrutura do banco de dados ou apenas adiciona comportamento?"

Faça **no máximo 1-2 perguntas curtas**. Dependendo da resposta, prossiga ou refinea lista. Se o usuário disser "continue mesmo assim", respeite.

## O que fazer

1. Analise a funcionalidade solicitada. Se necessário, faça perguntas de esclarecimento conforme acima.
2. **Decida o arquivo de destino** (critério de colocação — ver `docs/context/conventions.md#backlog-em-monorepo`):
   - `$SCOPE` informado explicitamente → `docs/$SCOPE/context/backlog.md`, IDs prefixados (`API-TASK09`, `WEB-TASK03`, etc).
   - `$SCOPE` não informado e a funcionalidade toca **1 projeto só** → mesmo assim vai para `docs/apps/<nome>/context/backlog.md` (ou `packages/<nome>`) daquele projeto, avisando qual arquivo foi escolhido.
   - Toca **2+ projetos** → `docs/context/product-backlog.md` (root), sem prefixo, preenchendo a coluna "Projetos" com os escopos envolvidos.
3. Se já tiver clareza, divida a funcionalidade em tarefas épicas/macro nos mesmos moldes do backlog de destino (mesmo formato de tabela e nomenclatura de ID que `/backlog` usa para aquele arquivo).
4. **Crucial:** Faça **apenas a adição (append)** das novas tarefas ao final do arquivo de destino, na fase apropriada (ou crie a seção/arquivo se não existir, seguindo o template de `.claude/commands/backlog.md`). **Não reescreva nem altere** as tarefas antigas já presentes.
5. Uma feature cross-project gera **uma única TASK root** — não duplique a mesma feature nos backlogs de escopo.
6. Exiba no chat a lista de tarefas que foram geradas e adicionadas, e em qual arquivo.

---

Argumento recebido (`$ARGUMENTS`): $ARGUMENTS

