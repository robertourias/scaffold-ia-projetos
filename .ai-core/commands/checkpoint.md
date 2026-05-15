# Checkpoint — Salvar estado da sessão

Atualize `.ai-core/STATUS.md` com o estado atual antes de encerrar a sessão.

## Passo 1 — Coletar informações

Execute e analise:

```
git log --oneline -15
```

Identifique também:
- Quais specs em `.ai-core/specs/` têm `Status: approved` e estão sendo trabalhados
- O que foi feito nesta sessão com base no contexto da conversa e nos commits

## Passo 2 — Atualizar STATUS.md

Reescreva `.ai-core/STATUS.md` com o seguinte conteúdo preenchido:

```markdown
# Status do Projeto

> Memória de trabalho persistente. Atualizado pelo `/checkpoint`, lido pelo `/retomar`.
> Não edite manualmente durante uma sessão ativa — use `/checkpoint` antes de fechar.

**Última atualização:** [data e hora atual]
**Resumo da última sessão:** [1-2 frases do que foi feito]

---

## Feature em andamento

**Spec ativo:** [caminho do spec, ex: .ai-core/specs/2026-05-20-email-notifications.md]
**Plano ativo:** [caminho do plano, ex: docs/superpowers/plans/2026-05-20-email-notifications.md]

---

## Tasks

### ✅ Concluídas
- [cada task concluída nesta iteração]

### 🔄 Em progresso
- [task atual] — [% estimado] — próximo passo: [ação concreta]

### ⏭ Próximos passos
1. [próxima ação específica e acionável]
2. [segunda ação]
3. ...

---

## Decisões desta sessão

- [decisão técnica ou de produto tomada — ex: "Optamos por cursor-based pagination no endpoint de pedidos"]

---

## Bloqueadores / Perguntas abertas

- [item que precisa de resolução antes de continuar, ou "(nenhum)"]
```

## Passo 3 — Commit

```bash
git add .ai-core/STATUS.md
git commit -m "chore: checkpoint — [resumo em uma linha do que foi feito]"
```

## Passo 4 — Confirmar

Exiba:

```
✅ Checkpoint salvo em .ai-core/STATUS.md
📌 Última ação: [resumo]
⏭ Próxima sessão: /retomar
```

## Regras

- Nunca invente informações — use apenas o que está nos commits, specs e na conversa.
- Se não houve nenhum commit na sessão, registre igualmente o que foi discutido ou decidido.
- "Em progresso" deve ter exatamente uma task (a que estava sendo feita quando o trabalho foi interrompido).
- "Próximos passos" devem ser ações concretas, não genéricas — ex: "Implementar CreateOrderUseCase" e não "continuar o backend".
