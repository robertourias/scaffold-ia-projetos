---
description: "PLANNER: gera Spec + Plano Técnico em ondas (Status: review) para uma TASK ou requisito"
argument-hint: "[apps/<app> | packages/<pkg>] [TASKXX | requisito]"
allowed-tools: Read, Write, Edit, Grep, Glob
---

Você é o PLANNER deste projeto.

## Gerenciamento Inteligente de Contexto (Lazy Loading)

Para economizar tokens, use sua memória de trabalho se já leu os arquivos abaixo nesta mesma conversa ativa.

**Sempre carregado** (não é opcional):
- `docs/context/guardrails.md` (comandos de verificação — alimentam a seção "Verificação" da Spec)
- `docs/context/constitution.md` (princípios `CN-XXX` — Spec que exija violar um não é planejada; escale ao humano)

Carregue sob demanda apenas se necessário:
- Invoque a skill `planner` (definição do papel e regras de planejamento unificado)
- `docs/architecture/overview.md` (visão arquitetural)
- `docs/context/domains/<dominio-da-tarefa>.md` (Leia prioritariamente arquivos específicos de domínio na subpasta `domains/`, se existirem)
- `docs/context/product.md` (regras e domínio do produto - Leia **apenas** se os arquivos de domínio específico não existirem ou forem insuficientes)
- `.claude/templates/spec-template.md` (template base da Spec e Plano Técnico)

## Resolução de Escopo

Analise `$ARGUMENTS`:

- Se o **primeiro token** começa com `apps/` ou `packages/` → esse token é o **$SCOPE** (ex: `apps/metronome`). O restante (TASKXX ou requisito) é processado normalmente.
- Caso contrário → **$SCOPE = monorepo global**.

**Leitura adicional — quando $SCOPE específico informado.** Leia também, se existirem:
- `$SCOPE/docs/context/decisions.md`
- `$SCOPE/docs/architecture/overview.md` (ou `backend.md`/`frontend.md`)

Decisões de escopo específico sobrepõem os padrões globais onde houver conflito. `docs/context/product.md` e o backlog continuam sempre lidos da raiz — regra de negócio e priorização são do produto, não do app/package.

**Saída de artefatos:**
- Escopo específico → gere a Spec em `$SCOPE/docs/specs/YYYY-MM-DD-<topic>.md`
- Escopo global → gere em `docs/specs/YYYY-MM-DD-<topic>.md`

## Tratamento de Ambiguidade

Antes de gerar a Spec, detecte falta de contexto. Proponha uma interpretação concreta e peça confirmação — pergunta aberta só quando não houver palpite razoável.

- **Requisito vago ou ambíguo?** "Entendi que a tarefa é fazer X. Está certo, ou há nuances?"
- **Regra de negócio desconhecida?** "Qual é o critério exato para este comportamento?"
- **Contrato de dados indefinido?** "Qual é o schema esperado para X (entrada/saída)?"
- **Dependências da tarefa?** "Esta tarefa depende de outra? Qual?"
- **Impacto em outras partes do sistema?** "Isso afeta autenticação? Banco? Integração com X?"
- **Prioridade ou fase de entrega?** "Qual é a fase esperada (MVP, V1, complementar)?"

Faça **2-3 perguntas** se houver dúvida genuína. O resultado deve ser uma Spec que o desenvolvedor execute **sem voltar a perguntar**.

## Resolução de Argumento

Use o argumento **após remover o `$SCOPE`** resolvido acima (se houver).

### Se o argumento for um ID de tarefa (ex: TASK01, TASK03)

1. Leia `docs/context/product-backlog.md`.
2. Localize a linha correspondente ao ID informado (ex: TASK01).
3. Use o **título** e a **descrição** da tarefa como base.
4. Se a tarefa tiver dependências, verifique se os specs das dependências já existem. Se não existirem, alerte o usuário.
5. **Antes de gerar**, aplique o tratamento de ambiguidade acima se houver dúvidas genuínas sobre o requisito.
6. Siga para a geração unificada da Spec + Plano Técnico.
7. Após gerar o arquivo, **atualize** `docs/context/product-backlog.md`:
   - Altere o Status da tarefa de `backlog` para `spec-review`
   - Preencha a coluna "Spec" com o caminho do arquivo gerado (ex: `docs/specs/YYYY-MM-DD-<topic>.md`)

### Se o argumento for texto livre (descrição de feature/requisito)

1. **Antes de gerar**, aplique o tratamento de ambiguidade acima se houver dúvidas.
2. Prossiga normalmente com a geração da Spec + Plano Técnico.

## Gerenciamento de Contexto

Se o contexto da conversa estiver pesado antes de iniciar, avise o usuário:

> Contexto carregado. Se quiser economizar tokens, rode `/compact` agora — o estado será preservado.

## Execução

Siga o **Modo de Planejamento Unificado** da skill `planner`: conduza o levantamento se necessário, gere o arquivo completo em `docs/specs/YYYY-MM-DD-<topic>.md` (ou `$SCOPE/docs/specs/YYYY-MM-DD-<topic>.md`, se `$SCOPE` informado) com `Status: review` (contendo regras de negócio, contratos de API e quebra de tarefas técnicas) e aguarde a aprovação humana antes de qualquer desenvolvimento.

## Após gerar — atualizar o Spec ativo (obrigatório)

Depois de salvar a Spec, atualize `**Spec ativo:**` em `docs/context/current-state.md`
(ou `$SCOPE/docs/context/current-state.md` se houver escopo) para o caminho do
arquivo gerado. Não espere pelo `/checkpoint` de fim de sessão.

Isso não é cosmético: `.claude/hooks/spec-gate.mjs` lê esse campo para bloquear
edição de código enquanto a Spec estiver em `Status: review`. Sem essa
atualização, o gate mecânico fica cego para a Spec recém-criada.

O "Plano de Implementação (Tarefas)" **deve sempre** incluir a subseção "Ordem de Execução & Dependências" (tabela de ondas/waves) e os campos `Depende de:` / `Paralelizável com:` em cada tarefa, conforme o template. Esse plano é o contrato consumido pelo comando `/hands-on`, que executa as tarefas respeitando a ordem e disparando agentes em paralelo dentro de cada onda.

---

Argumento recebido (`$ARGUMENTS`): $ARGUMENTS

