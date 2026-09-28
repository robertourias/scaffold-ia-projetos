---
description: "Grava resumo da sessão no log do projeto (changelog + current-state) e arquiva Specs concluídas. Sem parâmetro"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(git log:*), Bash(git status:*), Bash(mkdir:*), Bash(mv:*), Bash(git mv:*), Bash(git add:*), Bash(git commit:*), Bash(git branch:*)
---

# Checkpoint — Salvar estado da sessão

## Sem parâmetro

Este comando **não recebe argumento**. Ele registra o que foi feito na sessão.

Antes de carregar histórico, leia `.claude/context-index.md`. Para este comando
use o Tier 1 (`current-state.md`) e apenas o Tier 3 necessário (changelog do
dia e Specs candidatas a archive).

Escopo é inferido: leia `**Modo:**` em `docs/architecture/overview.md`. Em `single`, não há escopo. Em `monorepo`/`microfrontends`, descubra os apps/packages tocados pela sessão via `git status --short` e `git log --name-only -15` (regra: `.claude/workflows/context-resolution.md`, seção Escopo). A sessão pode ter tocado **vários** — registre cada um separadamente; nada a perguntar. Sem commits nem mudanças → registre o que foi discutido, sem escopo.

Estado e log ficam **sempre na raiz**: `docs/context/current-state.md` e `docs/changelog/YYYY-MM-DD.md`. Cada linha de progresso/changelog é prefixada com o escopo (`**apps/api:** ...`). Specs concluídas de um escopo são arquivadas em `docs/$SCOPE/archive/` (raiz → `docs/archive/`). Documentação com escopo vive sob `docs/$SCOPE/`, nunca dentro de `apps/`/`packages/`.

## Passo 1 — Coletar informações

Execute e analise:

```
git log --oneline -15
```

Se houver escopo(s) inferido(s), restrinja também por escopo: `git log --oneline -15 -- <escopo>`. Se o repositório não tiver commits, `git log` falha — siga com `git status` e a conversa.

Identifique também:
- Quais specs em `docs/specs/` (ou `docs/$SCOPE/specs/` do(s) escopo(s) inferido(s)) têm `Status: approved` e estão sendo trabalhados
- O que foi feito nesta sessão com base no contexto da conversa e nos commits

## Passo 2 — Atualizar current-state.md

Reescreva `docs/context/current-state.md` (sempre o da raiz) com o seguinte conteúdo preenchido. **Importante para economia de tokens**: Resuma agressivamente o estado. Remova detalhes granulares e listas longas de tarefas antigas já concluídas (elas já estão no changelog). Mantenha no máximo 3 próximos passos, 5 decisões e 3 bloqueadores; detalhes devem apontar para Spec, changelog ou arquivo de decisão.

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
   abertas" e sugira ao usuário reconciliar `decisions.md` e `architecture/`
   com o código real em uma sessão dedicada.

## Passo 3 — Atualizar CHANGELOG

Abra `docs/changelog/YYYY-MM-DD.md` (usando a data atual — sempre na raiz, changelog é único para o projeto inteiro) e adicione ou complemente a entrada com o que foi feito nesta sessão. Se houver escopo(s) inferido(s), prefixe cada entrada com o path (ex: `**apps/api:** implementado endpoint X`).

## Passo 4 — Arquivar specs concluídas

Liste os arquivos em `docs/specs/` (e `docs/$SCOPE/specs/` de cada escopo inferido), exceto `spec-template.md`.

- `Status: done` → arquive.
- Legado — `Status: approved` com **todos** os Critérios de Aceite `[x]` e sem
  nenhum bloco `> 🟡 Pendência Manual:` em aberto → arquive também.
- Caso contrário (tarefa incompleta ou Pendência Manual em aberto): mantenha
  em seu `specs/` de origem — ainda em andamento.

Arquive com `git mv` — não recrie o arquivo com Write — para
`docs/archive/` (ou `docs/$SCOPE/archive/` do escopo, criando a pasta se não
existir).

Se a Spec arquivada for a mesma apontada em `**Spec ativo:**` de
`docs/context/current-state.md` (já reescrito no Passo 2), atualize esse
campo para `—` — uma Spec arquivada nunca continua como Spec ativa.

Isso replica o passo de arquivamento da Fase 6 do `.claude/workflows/feature-delivery.md`, garantido mesmo se o merge não passou por lá.

## Passo 4.5 — Commit

Stage explícito (nunca `git add -A`/`git add .`/`git commit -a`):

- `docs/context/current-state.md`;
- o arquivo do changelog do dia (`docs/changelog/YYYY-MM-DD.md`);
- `docs/context/decisions.md` e/ou `docs/context/ui-guidelines.md`, se o
  Passo 2.5 promoveu alguma decisão;
- as Specs arquivadas no Passo 4 (o `git mv` já as moveu; stage o novo
  caminho em `docs/archive/` ou `docs/$SCOPE/archive/`).

Commit: `docs(checkpoint): <YYYY-MM-DD>` (data atual).

Se o branch atual for `spec/<slug>` (`git branch --show-current`) e já
houver um PR aberto para ele, lembre o humano de rodar `git push` para
refletir este commit no PR — este comando nunca dá push sozinho.

## Passo 5 — Confirmar

Exiba:

```
✅ Checkpoint salvo em docs/context/current-state.md
📌 Última ação: [resumo]
📦 Specs arquivadas: [lista ou "(nenhuma)"]
⏭ Próxima sessão: /retomar
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
- Stage sempre explícito no Passo 4.5 — nunca `git add -A`, `git add .` nem `git commit -a`.
