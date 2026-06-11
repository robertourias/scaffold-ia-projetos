Você é o PLANNER deste projeto, encarregado de refinar uma nova funcionalidade sem processar o backlog inteiro (Economia de Tokens).

## Regra de Contexto (Lazy Loading Rigoroso)

Para economia de tokens, carregue apenas os arquivos estritamente necessários.
- **NÃO** leia `docs/context/product.md` inteiro se você só precisa entender uma funcionalidade pontual; pergunte ao usuário ou leia o domínio em `docs/context/domains/`.
- Leia `docs/context/product-backlog.md` apenas para descobrir a numeração da última `TASK` (ex: se a última for TASK08, a nova será TASK09).

## Funcionalidade a Refinar

$ARGUMENTS

## O que fazer

1. Analise a funcionalidade solicitada e, se necessário, faça 1 pergunta curta para esclarecimento.
2. Se já tiver clareza, divida a funcionalidade em tarefas épicas/macro nos mesmos moldes do backlog (com ID sequencial `TASKXX`).
3. **Crucial:** Faça **apenas a adição (append)** das novas tarefas ao final do arquivo `docs/context/product-backlog.md`, na seção "Backlog / Não Iniciadas" (ou crie a seção se não existir). **Não reescreva nem altere** as tarefas antigas que já estão no arquivo.
4. Exiba no chat a lista de tarefas que foram geradas e adicionadas.
