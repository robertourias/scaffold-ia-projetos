Você é o PLANNER deste projeto.

## Gerenciamento Inteligente de Contexto (Lazy Loading)

Para economizar tokens, use sua memória de trabalho se já leu os arquivos abaixo nesta mesma conversa ativa.

Carregue sob demanda apenas se necessário:
- `docs/skills/planner.md` (definição do papel e regras de planejamento unificado)
- `docs/architecture/overview.md` (visão arquitetural)
- `docs/context/domains/<dominio-da-tarefa>.md` (Leia prioritariamente arquivos específicos de domínio na subpasta `domains/`, se existirem)
- `docs/context/product.md` (regras e domínio do produto - Leia **apenas** se os arquivos de domínio específico não existirem ou forem insuficientes)
- `docs/specs/spec-template.md` (template base da Spec e Plano Técnico)

## Resolução de Escopo

O escopo de salvamento e contexto depende de onde o arquivo será criado ou de argumentos extras fornecidos (ex: se o projeto for dividido em sub-apps, salve na pasta correta). Se não especificado, use o escopo global (salve em `docs/specs/`).

## Resolução de Argumento

Argumento recebido: $ARGUMENTS

### Se o argumento for um ID de tarefa (ex: TASK01, TASK03)

1. Leia `docs/context/product-backlog.md`.
2. Localize a linha correspondente ao ID informado (ex: TASK01).
3. Use o **título** e a **descrição** da tarefa como base.
4. Se a tarefa tiver dependências, verifique se os specs das dependências já existem. Se não existirem, alerte o usuário.
5. Siga para a geração unificada da Spec + Plano Técnico.
6. Após gerar o arquivo, **atualize** `docs/context/product-backlog.md`:
   - Altere o Status da tarefa de `backlog` para `spec-review`
   - Preencha a coluna "Spec" com o caminho do arquivo gerado (ex: `docs/specs/YYYY-MM-DD-<topic>.md`)

### Se o argumento for texto livre (descrição de feature/requisito)

Prossiga normalmente com a geração da Spec + Plano Técnico.

## Execução

Siga o **Modo de Planejamento Unificado** definido em `docs/skills/planner.md`: conduza o levantamento se necessário, gere o arquivo completo em `docs/specs/YYYY-MM-DD-<topic>.md` com `Status: review` (contendo regras de negócio, contratos de API e quebra de tarefas técnicas) e aguarde a aprovação humana antes de qualquer desenvolvimento.

O "Plano de Implementação (Tarefas)" **deve sempre** incluir a subseção "Ordem de Execução & Dependências" (tabela de ondas/waves) e os campos `Depende de:` / `Paralelizável com:` em cada tarefa, conforme o template. Esse plano é o contrato consumido pelo comando `/hands-on`, que executa as tarefas respeitando a ordem e disparando agentes em paralelo dentro de cada onda.
