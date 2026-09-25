---
description: "Cria um package no monorepo (packages/<nome>) e conduz o questionário da configuração inicial"
argument-hint: "<nome-do-package>"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(ls:*), Bash(mkdir:*)
---

# Init Package — novo package no monorepo

Você registra e configura um **package** compartilhado em projeto Turborepo. Não gera código — cria a pasta, a documentação local e as decisões iniciais.

## Pré-condições

1. Leia `**Modo:**` em `docs/architecture/overview.md` (fallback: `.claude/workflows/context-resolution.md`, seção Modo).
   - `single` → **pare**: "Este projeto é single. `/init-package` só existe em monorepo/microfrontends. Edite `**Modo:**` em `docs/architecture/overview.md` (ou rode `/init-project`) para mudar o modo."
2. Leia `docs/context/guardrails.md` e `docs/context/constitution.md`.

## Nome

`$ARGUMENTS` = nome do package. Sem nome → pergunte (sugira `ui`, `config`, `types`, `utils` se ainda não existirem).
Normalize: minúsculas, `[a-z0-9-]`; remova prefixo `packages/`. Rejeite nomes com `/`, `..`, espaços ou vazio. `$SCOPE = packages/<nome>`.

## Criação (sem sobrescrever)

- `packages/<nome>/` — crie **só se não existir**. Se existir, avise e complete só os docs faltantes.
- `docs/packages/<nome>/` com: `README.md` (template de `docs/context/conventions.md#documentação-em-monorepo-appspackages`), `context/decisions.md`, `specs/`, `archive/`. Não sobrescreva.
- Documentação **nunca** dentro de `packages/<nome>/`.

## Questionário (uma pergunta por vez, com palpite quando houver sinal)

1. **Tipo:** ui / config (eslint, tsconfig, tailwind) / types / utils / outro?
2. **Propósito** em uma frase.
3. **Consumidores:** quais apps/packages usam? (lista de `apps/` e `packages/` existentes)
4. **Build/publicação:** sem build (fonte TS direta), tsup, tsc, ou outro? Exports (`exports` do package.json)?
5. Conforme o tipo:
   - ui → biblioteca de componentes base, estilização, Storybook sim/não.
   - config → quais ferramentas configura e como apps estendem.
   - types/utils → regra de dependência (sem dependência de framework — constituição).
   - microfrontends → é lib compartilhada singleton (react, design system)?
6. **Comandos de verificação** (test, type-check, lint) — ou "(não configurado)".

Preencha apenas ao terminar todas as perguntas.

## Gravação

1. `docs/packages/<nome>/context/decisions.md` — decisões (tipo, build, exports, consumidores, comandos).
2. `docs/packages/<nome>/README.md` — propósito, tipo, consumidores, comandos.
3. `docs/architecture/overview.md` — linha em "Projetos do Monorepo": `packages/<nome>` | package (<tipo>) | propósito | stack se diferir | `docs/packages/<nome>/README.md`. Já existe → atualize. Crie a seção "Projetos do Monorepo" se não existir.

## Finalização

```
✅ Package configurado: packages/<nome>
  - pasta packages/<nome>/    (criada | já existia)
  - docs/packages/<nome>/     README, context/decisions, specs/, archive/
  - overview.md               linha adicionada
⚠️ Lacunas: [comandos "(não configurado)", campos "a definir"]
Próximo passo: /spec ou /init-app <nome> para os consumidores
```

## Regras

- Uma pergunta por mensagem.
- Nunca sobrescrever conteúdo existente sem confirmar.
- Não instalar dependências nem gerar código.

---

Argumento recebido (`$ARGUMENTS`): $ARGUMENTS
