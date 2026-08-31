---
description: "Gera o product backlog (TASK01..TASKNN) a partir de docs/context/product.md"
argument-hint: "[apps/<nome> | packages/<nome>] [contexto adicional opcional]"
allowed-tools: Read, Write, Edit, Grep, Glob
---

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

## Tratamento de Ambiguidade

Antes de gerar o backlog, se detectar **falta de contexto** nos dados de `docs/context/product.md`, faça perguntas curtas. Proponha uma interpretação concreta e peça confirmação — pergunta aberta só quando não houver palpite razoável.

- Features não claras? "Qual é a prioridade das features X, Y, Z? Devem ser no backlog inicial?"
- Fases ou roadmap indefinidas? "Qual é a fase de entrega esperada (MVP, V1, fase de crescimento)?"
- Restrições técnicas desconhecidas? "Há restrições de stack, banco de dados ou infraestrutura que devem guiar as tarefas?"
- Regras de negócio ambíguas? "Qual é a regra exata para X?"

Espere respostas antes de continuar. Use sua melhor interpretação se o usuário preferir que você prossiga mesmo com ambiguidade.

## Resolução de $SCOPE

- Se o **primeiro token** de `$ARGUMENTS` começa com `apps/` ou `packages/` → esse token é o **$SCOPE** (ex: `apps/api`). O restante é contexto adicional.
- Caso contrário → **$SCOPE = monorepo global** (root).

## Execução

Contexto adicional do usuário (opcional, após remover `$SCOPE` se houver): $ARGUMENTS

### Processo

1. **Leia o contexto do produto** em `docs/context/product.md`:
   - Features listadas na tabela "Core Features"
   - Regras de negócio
   - User Journeys
   - Roadmap (se definido)

2. **Leia a arquitetura** em `docs/architecture/overview.md` para entender as restrições técnicas e a lista de projetos do monorepo (seção "Projetos do Monorepo").

3. **Para cada feature/tarefa candidata, decida onde ela pertence** (critério de colocação — ver `docs/context/conventions.md#backlog-em-monorepo`):
   - Toca **1 projeto só** (identificável nos arquivos/domínio afetado) → vai para o backlog **daquele escopo**, mesmo que `/backlog` tenha sido chamado sem `$SCOPE`.
   - Toca **2+ projetos** (ex: feature que exige mudança em web, api e bff) → vai para o backlog **root**, com a coluna "Projetos" listando todos os escopos envolvidos.
   - Se `$SCOPE` foi informado explicitamente, gere apenas as tarefas daquele escopo (não gere tarefas de outros projetos nesta chamada).

4. **Proponha o backlog** ao usuário antes de gravar. Apresente uma lista numerada com:
   - ID da tarefa (TASK01, TASK02, ... ou prefixado pelo escopo — ver Regras de nomenclatura)
   - Título curto
   - Descrição de 1-2 frases do que será especificado
   - Projetos envolvidos (só relevante para tarefas root)
   - Fase sugerida (fundação / core / complementar / polimento)
   - Dependências (quais TASKs devem estar concluídas antes — pode referenciar IDs de outro arquivo/escopo)

5. **Pergunte ao usuário**:
   > "Este é o backlog proposto. Deseja alterar a ordem, adicionar, remover ou renomear alguma tarefa antes de gravar?"

6. **Após aprovação**, grave no(s) arquivo(s) correspondente(s) — root e/ou `docs/$SCOPE/context/backlog.md` — no formato abaixo. Se `docs/$SCOPE/` ainda não existir, crie-o agora (mesmo gatilho de `/spec`).

### Formato do arquivo root `docs/context/product-backlog.md`

```markdown
# Product Backlog

> Gerado por `/backlog` em YYYY-MM-DD. Fonte: `docs/context/product.md`.
> Contém apenas tarefas cross-cutting ou que tocam 2+ projetos do monorepo.
> Tarefas de um único projeto vivem em `docs/apps/<nome>/context/backlog.md`
> ou `docs/packages/<nome>/context/backlog.md`.
> Use `/spec TASKXX` para gerar a especificação de cada tarefa.

## Legenda de Status

| Status | Significado |
|--------|-------------|
| backlog | Aguardando especificação |
| spec-review | Spec + Tarefas geradas, aguardando aprovação |
| spec-approved | Spec aprovado, pronto para implementação |
| in-progress | Em implementação |
| done | Concluído |

---

## Fase 1 — Fundação

| ID | Título | Descrição | Projetos | Status | Dependências | Spec |
|----|--------|-----------|----------|--------|---------------|------|
| TASK01 | [título] | [descrição curta] | web, api | backlog | — | — |
| TASK02 | [título] | [descrição curta] | web, api, bff | backlog | TASK01 | — |

## Fase 2 — Core

...

## Fase 3 — Complementar

...

## Fase 4 — Polimento

...
```

### Formato do arquivo de escopo `docs/$SCOPE/context/backlog.md`

Mesmo layout, sem a coluna "Projetos" (o escopo já está implícito no caminho do arquivo) e com IDs prefixados (ver Regras de nomenclatura):

```markdown
# Backlog — <nome do projeto>

> Gerado/atualizado por `/backlog apps/api` (ou `/groom apps/api ...`) em YYYY-MM-DD.
> Tarefas que tocam apenas este projeto. Tarefas cross-project ficam em
> `docs/context/product-backlog.md`.

## Fase 1 — Fundação

| ID | Título | Descrição | Status | Dependências | Spec |
|----|--------|-----------|--------|--------------|------|
| API-TASK01 | [título] | [descrição curta] | backlog | — | — |
```

### Regras de nomenclatura

- **Root**: IDs sequenciais sem prefixo — TASK01, TASK02, ... TASK99, depois TASK100, TASK101, etc.
- **Escopo**: IDs prefixados com o nome do projeto em maiúsculas (último segmento do path) + `-TASK` — ex: `apps/api` → `API-TASK01`; `apps/web` → `WEB-TASK01`; `packages/ui` → `UI-TASK01`. Numeração é independente por arquivo (o `API-TASK01` não tem relação com `WEB-TASK01`).
- Dependência entre arquivos diferentes referencia o ID completo (ex: root `TASK02` na coluna Dependências de `API-TASK05`).
- Cada TASK deve ter escopo suficiente para gerar **um spec completo** — nem granular demais (uma função), nem amplo demais (um módulo inteiro)
- A coluna "Spec" é preenchida posteriormente pelo comando `/spec` com o link do arquivo gerado

## Regras

- Não gere nenhum arquivo sem aprovação do usuário.
- Não invente features que não estejam em `docs/context/product.md` ou no input do usuário.
- Se o usuário fornecer contexto adicional em $ARGUMENTS, combine com o que está em `product.md`.
- Cada tarefa deve ser auto-descritiva — ao ler o título e descrição, deve ficar claro o que será especificado com `/spec`.
- Ordene por dependências lógicas: infraestrutura/banco → domínio → backend → frontend → integração → polish.
- Uma feature que toca 2+ projetos gera **uma única TASK root** (não duplique a mesma feature em cada backlog de escopo) — o fan-out por projeto acontece dentro do Plano de Implementação quando `/spec` for rodado sobre essa TASK.

---

Argumento recebido (`$ARGUMENTS`): $ARGUMENTS

