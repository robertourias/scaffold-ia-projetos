Você é o PLANNER deste projeto, encarregado de refinar uma nova funcionalidade sem processar o backlog inteiro (Economia de Tokens).

## Regra de Contexto (Lazy Loading Rigoroso)

Para economia de tokens, carregue apenas os arquivos estritamente necessários.
- **NÃO** leia `docs/context/product.md` inteiro se você só precisa entender uma funcionalidade pontual; pergunte ao usuário ou leia o domínio em `docs/context/domains/`.
- Leia `docs/context/product-backlog.md` apenas para descobrir a numeração da última `TASK` (ex: se a última for TASK08, a nova será TASK09).

## Funcionalidade a Refinar

$ARGUMENTS

## Tratamento de Ambiguidade

Detecte automaticamente falta de contexto:

- **Escopo ambíguo?** "A funcionalidade engloba X e Y, ou só X?"
- **Regra de negócio desconhecida?** "Qual é o comportamento esperado quando Z acontece?"
- **Dependências desconhecidas?** "Esta funcionalidade depende da conclusão de outra tarefa existente?"
- **Impacto no design/arquitetura desconhecido?** "Isso altera a estrutura do banco de dados ou apenas adiciona comportamento?"

Faça **no máximo 1-2 perguntas curtas**. Dependendo da resposta, prossiga ou refinea lista. Se o usuário disser "continue mesmo assim", respeite.

## O que fazer

1. Analise a funcionalidade solicitada. Se necessário, faça perguntas de esclarecimento conforme acima.
2. Se já tiver clareza, divida a funcionalidade em tarefas épicas/macro nos mesmos moldes do backlog (com ID sequencial `TASKXX`).
3. **Crucial:** Faça **apenas a adição (append)** das novas tarefas ao final do arquivo `docs/context/product-backlog.md`, na seção "Backlog / Não Iniciadas" (ou crie a seção se não existir). **Não reescreva nem altere** as tarefas antigas que já estão no arquivo.
4. Exiba no chat a lista de tarefas que foram geradas e adicionadas.
