# Geração de Product Backlog

Você é o PLANNER deste projeto em Modo Backlog.

## Gerenciamento Inteligente de Contexto (Lazy Loading)

Para economizar tokens, use sua memória de trabalho se já leu os arquivos abaixo nesta mesma conversa ativa.

Carregue sob demanda apenas se necessário:
- `docs/context/product.md` (domínio, features, regras de negócio)
- `docs/architecture/overview.md` (visão arquitetural e stack)
- `docs/context/decisions.md` (decisões técnicas)

## Pré-condição

O projeto deve ter sido inicializado com `/init-project`. Verifique se `docs/context/product.md` contém dados reais (sem `<!-- TODO -->`). Se não estiver preenchido, informe:
> "O projeto ainda não foi inicializado. Execute `/init-project [descrição]` primeiro."

## Execução

Contexto adicional do usuário (opcional): $ARGUMENTS

### Processo

1. **Leia o contexto do produto** em `docs/context/product.md`:
   - Features listadas na tabela "Core Features"
   - Regras de negócio
   - User Journeys
   - Roadmap (se definido)

2. **Leia a arquitetura** em `docs/architecture/overview.md` para entender as restrições técnicas.

3. **Proponha o backlog** ao usuário antes de gravar. Apresente uma lista numerada com:
   - ID da tarefa (TASK01, TASK02, ...)
   - Título curto
   - Descrição de 1-2 frases do que será especificado
   - Fase sugerida (fundação / core / complementar / polimento)
   - Dependências (quais TASKs devem estar concluídas antes)

4. **Pergunte ao usuário**:
   > "Este é o backlog proposto. Deseja alterar a ordem, adicionar, remover ou renomear alguma tarefa antes de gravar?"

5. **Após aprovação**, gere o arquivo `docs/context/product-backlog.md` no formato abaixo.

### Formato do arquivo `docs/context/product-backlog.md`

```markdown
# Product Backlog

> Gerado por `/backlog` em YYYY-MM-DD. Fonte: `docs/context/product.md`.
> Use `/spec TASKXX` para gerar a especificação de cada tarefa.

## Legenda de Status

| Status | Significado |
|--------|-------------|
| backlog | Aguardando especificação |
| spec-draft | Spec gerado, aguardando aprovação |
| spec-approved | Spec aprovado, pronto para /plan |
| in-progress | Em implementação |
| done | Concluído |

---

## Fase 1 — Fundação

| ID | Título | Descrição | Status | Dependências | Spec |
|----|--------|-----------|--------|--------------|------|
| TASK01 | [título] | [descrição curta] | backlog | — | — |
| TASK02 | [título] | [descrição curta] | backlog | TASK01 | — |

## Fase 2 — Core

| ID | Título | Descrição | Status | Dependências | Spec |
|----|--------|-----------|--------|--------------|------|
| TASK03 | [título] | [descrição curta] | backlog | TASK01, TASK02 | — |

## Fase 3 — Complementar

...

## Fase 4 — Polimento

...
```

### Regras de nomenclatura

- IDs são sequenciais: TASK01, TASK02, ... TASK99
- Se o backlog ultrapassar 99 itens, use TASK100, TASK101, etc.
- Cada TASK deve ter escopo suficiente para gerar **um spec completo** — nem granular demais (uma função), nem amplo demais (um módulo inteiro)
- A coluna "Spec" é preenchida posteriormente pelo comando `/spec` com o link do arquivo gerado

## Regras

- Não gere o arquivo sem aprovação do usuário.
- Não invente features que não estejam em `docs/context/product.md` ou no input do usuário.
- Se o usuário fornecer contexto adicional em $ARGUMENTS, combine com o que está em `product.md`.
- Cada tarefa deve ser auto-descritiva — ao ler o título e descrição, deve ficar claro o que será especificado com `/spec`.
- Ordene por dependências lógicas: infraestrutura/banco → domínio → backend → frontend → integração → polish.
