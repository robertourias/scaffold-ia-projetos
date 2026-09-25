---
description: "Cria um app no monorepo (apps/<nome>) e conduz o questionário da configuração inicial"
argument-hint: "<nome-do-app>"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(ls:*), Bash(mkdir:*)
---

# Init App — novo app no monorepo

Você registra e configura um **app** em projeto Turborepo. Não gera código do app — cria a pasta, a documentação local e as decisões iniciais.

## Pré-condições

1. Leia `**Modo:**` em `docs/architecture/overview.md` (fallback: `.claude/workflows/context-resolution.md`, seção Modo).
   - `single` → **pare**: "Este projeto é single. `/init-app` só existe em monorepo/microfrontends. Edite `**Modo:**` em `docs/architecture/overview.md` (ou rode `/init-project`) para mudar o modo."
2. Leia `docs/context/guardrails.md` e `docs/context/constitution.md`.

## Nome

`$ARGUMENTS` = nome do app. Sem nome → pergunte (proponha nomes a partir de `product.md`).
Normalize: minúsculas, `[a-z0-9-]`; remova prefixo `apps/`. Rejeite (e peça outro) nomes com `/`, `..`, espaços ou vazio. `$SCOPE = apps/<nome>`.

## Criação (sem sobrescrever)

- `apps/<nome>/` — crie **só se não existir** (`ls` antes). Se existir, avise e continue apenas com docs faltantes.
- `docs/apps/<nome>/` com: `README.md` (template mínimo de `docs/context/conventions.md#documentação-em-monorepo-appspackages`), `context/decisions.md`, `specs/`, `archive/`. Não sobrescreva arquivo existente.
- Documentação **nunca** dentro de `apps/<nome>/`.

## Questionário (uma pergunta por vez, com palpite quando houver sinal)

Se `apps/<nome>/package.json` já existir, leia-o e proponha o que encontrar.

1. **Tipo:** web / api / mobile / host (microfrontends) / remote (microfrontends)?
2. **Propósito** em uma frase.
3. **Framework:** (web: Next.js/Vite+React · api: NestJS/Fastify · host/remote: bundler + Module Federation).
4. Conforme o tipo:
   - api → ORM, banco, auth, fila, cache (só o que diferir do global).
   - web → estilização, biblioteca de componentes, estado, forms, data fetching.
   - host/remote (modo `microfrontends`) → módulos expostos/consumidos, singletons compartilhados, porta.
5. **Porta** de desenvolvimento.
6. **Comandos de verificação do app** (test, type-check, lint) — ou "(não configurado)". Nunca invente.
7. **Packages internos que consome** (liste os de `packages/`, se houver).

Preencha apenas ao terminar todas as perguntas.

## Gravação

1. `docs/apps/<nome>/context/decisions.md` — decisões do app (stack, comandos, packages consumidos). Sem `<!-- TODO -->`; "a definir" → `<!-- a definir -->`.
2. `docs/apps/<nome>/README.md` — propósito, tipo, stack, comandos.
3. `docs/architecture/overview.md` — acrescente uma linha em "Projetos do Monorepo": `apps/<nome>` | app (<tipo>) | propósito | stack se diferir | `docs/apps/<nome>/README.md`. Se o app já constar, atualize a linha. Crie a seção "Projetos do Monorepo" se não existir.

## Finalização

```
✅ App configurado: apps/<nome>
  - pasta apps/<nome>/        (criada | já existia)
  - docs/apps/<nome>/         README, context/decisions, specs/, archive/
  - overview.md               linha adicionada
⚠️ Lacunas: [comandos "(não configurado)", campos "a definir"]
Próximo passo: /backlog ou /spec (o contexto atual passa a apontar para apps/<nome>)
```

## Regras

- Uma pergunta por mensagem.
- Nunca sobrescrever conteúdo existente sem confirmar.
- Não instalar dependências nem gerar código do app.

---

Argumento recebido (`$ARGUMENTS`): $ARGUMENTS
