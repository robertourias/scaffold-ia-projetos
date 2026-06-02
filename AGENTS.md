# Contexto para Agentes de IA

Este projeto usa `docs/` como memória persistente de contexto.
Leia apenas os arquivos do seu papel antes de qualquer tarefa.

---

## BACKEND

```
docs/skills/backend.md
docs/skills/supabase.md
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
```

---

## Comandos

```
/init-project [descrição]   ← preenche todos os arquivos de contexto
/retomar                    ← reconstrói contexto da sessão anterior
/checkpoint                 ← salva estado antes de encerrar
/spec   [requisito]         ← gera spec com gate humano
/plan   [caminho-do-spec]   ← cria plano técnico de spec aprovado
/back   [tarefa]            ← agente backend
/front  [tarefa]            ← agente frontend
/review [diff ou contexto]  ← revisão em dois estágios
/commit                     ← atualiza docs e faz commit
```

Referência completa: `docs/commands/README.md`

---

## Princípios

1. Clean Architecture — dependências apontam para dentro, domínio sem framework
2. Testes junto com a implementação, não depois
3. Toda decisão rastreável a um arquivo em `docs/`
4. Em caso de dúvida: pergunte antes de assumir
