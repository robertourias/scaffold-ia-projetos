---
name: approve
description: "Gate humano da Spec: valida e aprova (Status review → approved). Só o humano invoca, com /approve [caminho-da-spec]"
disable-model-invocation: true
argument-hint: "[caminho-da-spec]"
allowed-tools: Read, Edit, Grep, Glob, Bash(git config:*), Bash(git status:*), Bash(git add:*), Bash(git commit:*)
---

# Approve — gate humano da Spec

Você executa a aprovação que o **humano** pediu ao invocar `/approve`. Este
comando nunca é disparado pelo modelo por conta própria
(`disable-model-invocation`), e a edição do Status ainda passa por
confirmação no hook `spec-gate.mjs` — é esperado aparecer um prompt pedindo
confirmação: é o humano confirmando.

## Passo 1 — Resolver a Spec

- `$ARGUMENTS` com caminho → essa Spec.
- Sem argumento → `**Spec ativo:**` de `docs/context/current-state.md`.
- Sem Spec ativa → siga a seção Tarefa/Spec de `.claude/workflows/context-resolution.md`; se ainda ambíguo, liste as Specs em `Status: review` e pergunte qual.

## Passo 2 — Validar

Leia a Spec e verifique:

| Checagem | Regra |
|---|---|
| Status | é `review` (se `approved` ou `done`: avise e pare) |
| Rastreabilidade | todo `FR-XXX` da seção 3 aparece na tabela da seção de Rastreabilidade |
| Arquivos | toda tarefa tem `Arquivos:` preenchido (sem `caminho/a.ts` do template) |
| Verificação | a seção Verificação não tem `<comando>` |
| Placeholders | não sobrou `<...>` do template no corpo (ignore comentários HTML `<!-- -->`) |

Mostre o resultado como lista ✅/❌. Se houver ❌, pergunte:
"Aprovar mesmo assim? (s/N)" e **espere** a resposta. N → pare e sugira o que
corrigir. Não corrija a Spec você mesmo.

## Passo 3 — Aprovar

1. `git config user.name` (vazio → `humano`) e a data de hoje (`YYYY-MM-DD`).
2. Edite **somente** a linha do Status:
   `**Status:** review` → `**Status:** approved` seguida da linha
   `**Aprovado por:** <nome> em <data>`.
3. Se `**Spec ativo:**` em `docs/context/current-state.md` apontar para outra
   Spec (ou estiver `—`), atualize para esta.
4. Backlog: se a Spec veio de uma TASK (backlog de origem — root para ID sem
   prefixo, `docs/$SCOPE/context/backlog.md` para ID prefixado; a coluna
   "Spec" aponta para esta Spec), mude o Status da TASK para `spec-approved`.
5. Commit (regras de `.claude/workflows/git-flow.md`, stage explícito: Spec
   — incluindo edições manuais que o humano tenha feito nela durante a
   review, mesmo antes de rodar `/approve` (ver "Working tree" em
   git-flow.md: pendência rastreada na própria Spec não bloqueia, entra
   neste commit) — backlog se mudou, `current-state.md` se mudou):
   `docs(spec): aprova <slug>`.

## Passo 4 — Confirmar

```
✅ Spec aprovada: <caminho>
   Aprovado por: <nome> em <data>
Commit: <hash curto> docs(spec): aprova <slug>
Próximo: /hands-on <caminho>  (ou /back, /front para tarefas avulsas)
```

## Regras

- Nunca altere nada na Spec além do Status e da linha de aprovação.
- Se o hook pedir confirmação e o humano negar, pare e reporte — não tente outro caminho.

---

Argumento recebido (`$ARGUMENTS`): $ARGUMENTS
