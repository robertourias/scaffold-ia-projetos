# Commit

Execute este protocolo antes de todo commit. Não pule etapas mesmo para commits pequenos.

## Passo 1 — Atualizar estado atual

Atualize `docs/context/current-state.md`:
- O que foi feito nesta sessão
- O que está em progresso
- Próximos passos

## Passo 2 — Atualizar changelog

Adicione entrada em `docs/changelog/YYYY-MM-DD.md` (crie o arquivo se não existir para a data de hoje):

```
# YYYY-MM-DD

- [tipo] descrição do que foi feito
```

Tipos válidos: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`.

## Passo 3 — Atualizar arquitetura (se aplicável)

Se houve decisão arquitetural nova ou mudança de stack, adicione uma linha na tabela "Decisões registradas" em `docs/architecture/overview.md`:

```
| Decisão | Escolha | YYYY-MM-DD | Justificativa |
```

## Passo 4 — Commit

```
git add <arquivos-da-feature>
git add docs/context/current-state.md
git add docs/changelog/YYYY-MM-DD.md
# se houve decisão arquitetural:
git add docs/architecture/overview.md
git commit -m "tipo: descrição concisa da mudança"
```

Prefixos Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`

## Regras

- Nunca comite sem atualizar current-state.md e changelog.
- Se não houve nada relevante para o changelog, registre igualmente (ex: "chore: ajuste de configuração").
- Commits devem ter menos de 72 caracteres na primeira linha.
