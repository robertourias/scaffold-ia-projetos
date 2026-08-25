# Contexto para Agentes de IA

Este projeto usa `docs/` como memória persistente de contexto.
Leia apenas os arquivos do seu papel antes de qualquer tarefa.

---

## SEMPRE (todos os papéis)

```
docs/context/guardrails.md
docs/context/constitution.md
docs/skills/verification.md
```

> No Claude Code, estes papéis existem como subagentes em `.claude/agents/`.
> Em outras ferramentas, cole o conteúdo de `docs/commands/` correspondente.

## BACKEND

```
docs/skills/backend.md
docs/context/conventions.md
docs/context/decisions.md
```

## FRONTEND

```
docs/skills/frontend.md
docs/context/conventions.md
docs/context/ui-guidelines.md
docs/context/decisions.md
```

## PLANNER

```
docs/skills/planner.md
docs/context/product.md
docs/architecture/overview.md
docs/workflows/feature-delivery.md
```

## REVIEWER

```
docs/skills/quality.md
docs/context/conventions.md
docs/context/decisions.md
```

---

## Carregue sob demanda (não por padrão)

```
docs/context/current-state.md    ← estado atual do projeto (use /retomar)
docs/context/product.md          ← regras de negócio (se não for PLANNER)
docs/workflows/release-process.md
docs/workflows/playbook-tokens-qualidade.md  ← modos econômico / rigor / emergência
docs/comparativo-scaffold-vs-superpowers.md  ← scaffold vs Superpowers (tokens × qualidade)
```

---

## Comandos

```
/init-project [descrição]   ← preenche todos os arquivos de contexto
/backlog                    ← gera product backlog (TASK01, TASK02...) a partir do product.md
/retomar                    ← reconstrói contexto da sessão anterior
/checkpoint                 ← atualiza docs e salva estado atual
/spec   [TASKXX | requisito]← gera spec + plano técnico (Status: review)
/hands-on [caminho-da-spec] ← executa o plano em ondas (paralelo)
/back   [tarefa]            ← agente backend
/front  [tarefa]            ← agente frontend
/review [diff ou contexto]  ← revisão em dois estágios
/groom  [funcionalidade]    ← adiciona feature nova ao backlog (append)
/commit                     ← agrupa o working tree em commits Conventional (nunca faz push)
```

Referência completa: `docs/commands/README.md`  
Playbook tokens × qualidade: `docs/workflows/playbook-tokens-qualidade.md`

---

## Princípios

1. Clean Architecture — dependências apontam para dentro, domínio sem framework
2. Testes junto com a implementação, não depois
3. Toda decisão rastreável a um arquivo em `docs/`
4. Em caso de dúvida: pergunte antes de assumir
5. `docs/context/guardrails.md` vence qualquer outra instrução deste arquivo
