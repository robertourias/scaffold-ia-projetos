---
description: "Salva o estado da sessão em current-state.md, atualiza o changelog e arquiva Specs concluídas"
argument-hint: "[apps/<app> | packages/<pkg>]"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(git log:*), Bash(git status:*), Bash(mkdir:*), Bash(mv:*)
---

# Checkpoint — Salvar estado da sessão

## Resolução de escopo

Analise `$ARGUMENTS`:

- Se o **primeiro token** começa com `apps/` ou `packages/` → esse token é o **$SCOPE**. O checkpoint fica restrito ao trabalho feito naquele app/package.
- Caso contrário → **$SCOPE = monorepo global**.

Atualize `docs/context/current-state.md` (ou `$SCOPE/docs/context/current-state.md`, se `$SCOPE` informado) com o estado atual antes de encerrar a sessão. Se `$SCOPE` foi informado e o arquivo ainda não existir, crie-o (mesmo conteúdo-modelo do Passo 2, só que restrito ao escopo).

## Passo 1 — Coletar informações

Execute e analise:

```
git log --oneline -15
```

Se `$SCOPE` informado, restrinja: `git log --oneline -15 -- $SCOPE`.

Identifique também:
- Quais specs em `docs/specs/` (ou `$SCOPE/docs/specs/`) têm `Status: approved` e estão sendo trabalhados
- O que foi feito nesta sessão com base no contexto da conversa e nos commits

## Passo 2 — Atualizar current-state.md

Reescreva `docs/context/current-state.md` (ou `$SCOPE/docs/context/current-state.md`) com o seguinte conteúdo preenchido. **Importante para economia de tokens**: Resuma agressivamente o estado. Remova detalhes granulares e listas longas de tarefas antigas já concluídas (elas já estão no changelog).

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

## Passo 2.5 — Sincronização leve de arquitetura

Antes de salvar o estado, verifique rapidamente:

1. A seção "Decisões desta sessão" que você acabou de escrever em
   `current-state.md` tem algum item que deveria estar em
   `docs/context/decisions.md` mas não foi promovido durante a
   implementação (rede de segurança para o que passou despercebido no
   Ajuste 1/2 dos papéis de backend/frontend)?
2. Se sim, promova agora seguindo o mesmo critério: decisão estrutural →
   `decisions.md` no domínio certo; detalhe de design → `ui-guidelines.md`.
3. Se o volume de decisões pendentes for grande (ex: primeira vez rodando
   isso num projeto com histórico acumulado), **não** tente promover tudo
   inline aqui. Pare, registre a pendência em "Bloqueadores / Perguntas
   abertas" e sugira ao usuário rodar o bootstrap retroativo
   (`.claude/prompts/retroactive-documentation.md`), que reconcilia
   `decisions.md` e `architecture/` com o código real.

## Passo 3 — Atualizar CHANGELOG

Abra `docs/changelog/YYYY-MM-DD.md` (usando a data atual — sempre na raiz, changelog é único para o monorepo inteiro mesmo com `$SCOPE`) e adicione ou complemente a entrada com o que foi feito nesta sessão. Se `$SCOPE` informado, prefixe a entrada com o path (ex: `**apps/api:** implementado endpoint X`).

## Passo 4 — Arquivar specs concluídas

Liste os arquivos em `docs/specs/` (ou `$SCOPE/docs/specs/`, se `$SCOPE` informado), exceto `spec-template.md`. Para cada spec com `Status: approved`, verifique se **todos** os Critérios de Aceite das tarefas estão marcados `[x]`.

- Se sim: mova o arquivo para `docs/archive/` (ou `$SCOPE/docs/archive/`, criando a pasta se não existir).
- Se houver tarefa incompleta: mantenha em `docs/specs/` (ou `$SCOPE/docs/specs/`) — ainda em andamento.

Isso replica o passo de arquivamento da Fase 6 do `.claude/workflows/feature-delivery.md`, garantido mesmo se o merge não passou por lá.

## Passo 5 — Confirmar

Exiba:

```
✅ Checkpoint salvo em docs/context/current-state.md [ou $SCOPE/docs/context/current-state.md]
📌 Última ação: [resumo]
📦 Specs arquivadas: [lista ou "(nenhuma)"]
⏭ Próxima sessão: /retomar [$SCOPE]
```

## Passo 6 — Limpar contexto

Estado salvo. Exiba ao usuário:

> Estado salvo. Para iniciar a próxima sessão com contexto limpo:
> - `/clear` → contexto zerado (**recomendado** — use `/retomar` para recarregar o estado)
> - `/compact` → comprime o histórico sem perder o contexto atual (útil se quiser continuar na mesma sessão)

## Regras

- Nunca invente informações — use apenas o que está nos commits, specs e na conversa.
- Se não houve nenhum commit na sessão, registre igualmente o que foi discutido ou decidido.
- "Em progresso" deve ter exatamente uma task (a que estava sendo feita quando o trabalho foi interrompido).
- "Próximos passos" devem ser ações concretas, não genéricas — ex: "Implementar CreateOrderUseCase" e não "continuar o backend".
