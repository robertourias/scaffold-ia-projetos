# Commit

Execute este protocolo antes de todo commit. Não pule etapas mesmo para commits pequenos.

## Resolução de escopo

Analise `$ARGUMENTS` (se fornecido):

- Se o **primeiro token** começa com `apps/` ou `packages/` → esse token é o **$SCOPE** (ex: `apps/metronome`). O restante são instruções adicionais opcionais.
- Caso contrário → **$SCOPE = monorepo global**.

O **$SCOPE_NAME** é o último segmento do caminho (ex: `apps/metronome` → `metronome`, `packages/ui` → `ui`).

## Passo 1 — Atualizar estado atual

**Se $SCOPE específico:**
- Atualize `$SCOPE/docs/context/current-state.md` (crie se não existir)
- Atualize também `docs/context/current-state.md` com uma linha de referência ao que foi feito no app

**Se $SCOPE global:**
- Atualize apenas `docs/context/current-state.md`

Conteúdo: o que foi feito nesta sessão, o que está em progresso, próximos passos.

## Passo 2 — Atualizar changelog

**Se $SCOPE específico:**
- Adicione entrada em `$SCOPE/docs/changelog/YYYY-MM-DD.md` (crie o arquivo e o diretório se não existirem)
- Adicione também uma linha resumida em `docs/changelog/YYYY-MM-DD.md` com o prefixo `[$SCOPE_NAME]`

**Se $SCOPE global:**
- Adicione entrada apenas em `docs/changelog/YYYY-MM-DD.md`

Formato:
```
# YYYY-MM-DD

- [tipo] descrição do que foi feito
```

Tipos válidos: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`.

## Passo 3 — Atualizar arquitetura (se aplicável)

Se houve decisão arquitetural nova ou mudança de stack:

**Se $SCOPE específico:**
- Adicione em `$SCOPE/docs/context/decisions.md`
- Se for decisão que afeta o monorepo inteiro, adicione também em `docs/architecture/overview.md`

**Se $SCOPE global:**
- Adicione linha na tabela "Decisões registradas" em `docs/architecture/overview.md`

```
| Decisão | Escolha | YYYY-MM-DD | Justificativa |
```

## Passo 4 — Commit

```
git add <arquivos-da-feature>
git add <arquivos-de-contexto-atualizados>
git commit -m "tipo(escopo): descrição concisa da mudança"
```

**Formato da mensagem de commit:**
- **Com $SCOPE:** `tipo($SCOPE_NAME): descrição` — ex: `feat(metronome): implementar clock com Web Audio API`
- **Sem $SCOPE (global):** `tipo: descrição` — ex: `feat: adicionar módulo de autenticação`

Prefixos Conventional Commits: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`

## Regras

- Nunca comite sem atualizar os arquivos de contexto e changelog corretos para o escopo.
- Se não houve nada relevante para o changelog, registre igualmente (ex: `chore(metronome): ajuste de configuração`).
- Commits devem ter menos de 72 caracteres na primeira linha.
- O `$SCOPE_NAME` no commit deve ser o nome curto do app/package, não o caminho completo.
