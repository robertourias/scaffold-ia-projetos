# Checkpoint — Salvar estado da sessão

Atualize `docs/context/current-state.md` com o estado atual antes de encerrar a sessão.

## Passo 1 — Coletar informações

Execute e analise:

```
git log --oneline -15
```

Identifique também:
- Quais specs em `docs/specs/` têm `Status: approved` e estão sendo trabalhados
- O que foi feito nesta sessão com base no contexto da conversa e nos commits

## Passo 2 — Atualizar current-state.md

Reescreva `docs/context/current-state.md` com o seguinte conteúdo preenchido. **Importante para economia de tokens**: Resuma agressivamente o estado. Remova detalhes granulares e listas longas de tarefas antigas já concluídas (elas já estão no changelog).

```markdown
# Status do Projeto

> Memória de trabalho persistente. Atualizado pelo `/checkpoint`, lido pelo `/retomar`.
> Não edite manualmente durante uma sessão ativa — use `/checkpoint` antes de fechar.

**Última atualização:** [data e hora atual]
**Resumo de progresso global:** [Resumo de alto nível (2-3 frases) do que já está pronto]
**Resumo da última sessão:** [1-2 frases do que foi feito]

---

## Feature em andamento

**Spec ativo:** [caminho do spec, ex: docs/specs/2026-05-20-email-notifications.md]

---

## Tasks (Foco no Presente)

### 🔄 Em progresso
- [nome do projeto/escopo] - [task atual] — [% estimado] — próximo passo: [ação concreta]

### ⏭ Próximos passos imediatos
1. [próxima ação específica e acionável]
2. [segunda ação]
3. ...

---

## Decisões desta sessão

- [decisão técnica ou de produto tomada]

---

## Bloqueadores / Perguntas abertas

- [item que precisa de resolução antes de continuar, ou "(nenhum)"]
```

## Passo 3 — Atualizar CHANGELOG

Abra `docs/changelog/YYYY-MM-DD.md` (usando a data atual) e adicione ou complemente a entrada com o que foi feito nesta sessão.

## Passo 4 — Confirmar

Exiba:

```
✅ Checkpoint salvo em docs/context/current-state.md
📌 Última ação: [resumo]
⏭ Próxima sessão: /retomar
```

## Regras

- Nunca invente informações — use apenas o que está nos commits, specs e na conversa.
- Se não houve nenhum commit na sessão, registre igualmente o que foi discutido ou decidido.
- "Em progresso" deve ter exatamente uma task (a que estava sendo feita quando o trabalho foi interrompido).
- "Próximos passos" devem ser ações concretas, não genéricas — ex: "Implementar CreateOrderUseCase" e não "continuar o backend".
