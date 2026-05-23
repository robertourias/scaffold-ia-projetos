# Retomar — Reconstruir contexto da sessão anterior

Reconstrua o contexto completo do projeto para retomar o trabalho. **Não implemente nada ainda** — apenas leia, reconstrua e apresente o estado.

## Passo 1 — Ler fontes de contexto

Leia os seguintes arquivos em ordem:

1. `docs/context/current-state.md` — estado salvo da última sessão
2. `git log --oneline -15` — commits recentes
3. O spec referenciado em current-state.md (se existir e tiver `Status: approved`)
4. O plano referenciado em current-state.md (se existir)

Se o current-state.md estiver vazio ou sem dados (última atualização: `—`), reconstrua apenas a partir do git log e de specs aprovados encontrados em `docs/specs/`.

## Passo 2 — Apresentar resumo

Exiba o resumo neste formato exato:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Retomando projeto
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 Última sessão: [data] — [resumo em 1 frase]
🎯 Feature em andamento: [nome da feature]
📄 Spec: [caminho]
📋 Plano: [caminho, ou "não gerado ainda"]

✅ Concluído
  [lista de tasks prontas]

🔄 Onde paramos
  [task em progresso + % + último commit relevante]

⏭ Próxima ação
  → [ação concreta e específica]
    ex: "Implementar CreateOrderController com DTOs de request/response"
    comando sugerido: /back [tarefa]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Passo 3 — Perguntar

Após exibir o resumo, pergunte:

> "Continuar de onde paramos com `/back [próxima tarefa]`, ou há algo que mudou?"

## Casos especiais

**Sem current-state.md ou arquivo vazio:**
> "Não há checkpoint salvo. Reconstruindo a partir do histórico git..."
> Analise os commits e specs aprovados, apresente o resumo com o que for possível inferir, e sugira `/checkpoint` ao final desta sessão.

**Sem commits recentes e sem current-state:**
> "Nenhum contexto encontrado. Se o projeto ainda não foi inicializado, use `/init-project [descrição do produto]`."

**Múltiplos specs aprovados sem current-state:**
> Liste todos os specs com `Status: approved` encontrados em `docs/specs/` e pergunte qual está sendo trabalhado antes de apresentar o resumo.

## Regras

- Não comece a implementar antes de o usuário confirmar.
- Apresente apenas o que foi encontrado nos arquivos — sem inferências não fundamentadas.
- Se o próximo passo não estiver claro, diga explicitamente e proponha como descobrir (ex: "leia o plano completo com `/plan`").
