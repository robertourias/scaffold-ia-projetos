---
description: "Reconstrói o contexto da sessão anterior e apresenta onde o trabalho parou. Somente leitura"
allowed-tools: Read, Grep, Glob, Bash(git log:*), Bash(git status:*)
model: claude-haiku-4-5-20251001
---

# Retomar — Reconstruir contexto da sessão anterior

Reconstrua o contexto completo do projeto para retomar o trabalho. **Não implemente nada ainda** — apenas leia, reconstrua e apresente o estado.

## Sem parâmetro

Este comando **não recebe argumento**. Ele retoma o último histórico salvo, sempre a partir da raiz. Não filtre por escopo: apresente tudo que estava em andamento, agrupado por app/package quando o estado citar mais de um.

## Passo 1 — Ler fontes de contexto

Leia os seguintes arquivos em ordem:

1. `.claude/context-index.md` — tiers e regras de carregamento
2. `docs/context/current-state.md` — estado salvo da última sessão
3. `docs/changelog/` — arquivo mais recente por nome
4. `git log --oneline -15` — commits recentes
5. O spec ativo referenciado em `current-state.md`

Se o current-state.md estiver vazio ou sem dados (última atualização: `—`), reconstrua a partir do git log e de specs aprovados encontrados em `docs/specs/` **e** em `docs/apps/*/specs/` e `docs/packages/*/specs/`.

## Passo 2 — Apresentar resumo

Exiba o resumo neste formato exato:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Retomando projeto
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 Última sessão: [data] — [resumo em 1 frase]
🎯 Feature em andamento: [nome da feature]
📄 Spec/Plano: [caminho]

✅ Concluído
  [lista de tasks prontas]

🔄 Onde paramos
  [task em progresso + % + último commit relevante]

⏭ Próxima ação
  → [ação concreta e específica]
    comando sugerido: /back ou /front (o contexto atual resolve)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Passo 3 — Perguntar

Após exibir o resumo, pergunte:

> "Continuar de onde paramos, ou há algo que mudou?"

## Casos especiais

**Sem current-state.md ou arquivo vazio:**
> "Não há checkpoint salvo. Reconstruindo a partir do histórico git..."
> Analise os commits e specs aprovados, apresente o resumo com o que for possível inferir, e sugira `/checkpoint` ao final desta sessão.

**Sem commits recentes e sem current-state:**
> "Nenhum contexto encontrado. Se o projeto ainda não foi inicializado, use `/init-project [descrição do produto]`."

**Múltiplos specs aprovados sem current-state:**
> Liste todos os specs com `Status: approved` encontrados em `docs/specs/` e em `docs/apps/*/specs/` e `docs/packages/*/specs/`, e pergunte qual está sendo trabalhado antes de apresentar o resumo.

## Regras

- Não comece a implementar antes de o usuário confirmar.
- Apresente apenas o que foi encontrado nos arquivos — sem inferências não fundamentadas.
- Se o próximo passo não estiver claro, diga explicitamente e proponha como descobrir (ex: "leia a seção de tarefas técnicas no spec/plano").
- Não carregue `docs/archive/`, `docs/features/` ou contexto de outro escopo
  salvo apenas por completude; eles são Tier 3 sob demanda.
