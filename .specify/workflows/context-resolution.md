# Resolução de contexto (fallback de parâmetros)

Regra única para comandos `specnico-*` que recebem parâmetro (`/specnico-spec`,
`/specnico-clarify`, `/specnico-plan`, `/specnico-analyze`,
`/specnico-approve`, `/specnico-implement`, `/specnico-converge`,
`/specnico-review`). Aplique **apenas quando o parâmetro estiver ausente ou
não for reconhecido** — parâmetro válido sempre vence.

## 1. Estado ativo

Leia `.specify/state.json` primeiro, sempre:

- `ativo` não nulo → a Spec alvo é `ativo.spec` (pasta `specs/NNN-slug`).
  Confira o `**Status:**` do `spec.md` contra `ativo.fase` (`spec`/`clarify`/
  `plan` ⇒ `review`; `approved`/`implement`/`converge` ⇒ `approved`).
  Divergência, pasta sem `spec.md` ou branch atual ≠ `ativo.branch` → avise e
  proponha corrigir o `state.json`; só altere com confirmação.
- `ativo: null`, arquivo ausente ou ilegível (avise) → vá ao backlog.

Mostre a fase atual em uma linha antes de seguir
(ex: `Ativo: specs/005-cadastro-login · fase plan · B05`).

## 2. Backlog

Sem Spec ativa, leia `.specify/memory/product-backlog.md`:

- `/specnico-spec` → primeiro item com Status `backlog` cujas dependências
  estão todas `done`, na ordem das fases.
- Comandos que precisam de Spec existente (`clarify`, `plan`, `analyze`,
  `approve`, `implement`, `converge`) → item `spec`, `approved` ou
  `in-progress` com a coluna `Spec` preenchida; mais de um → ambiguidade.

Nunca varra `specs/` para adivinhar o que está ativo: o `state.json` responde.

## 3. Modo e escopo

`**Modo:**` e `**Projetos:**` vêm de `## 1. Identidade` em
`.specify/memory/constitution.md`.

- `single` → não existe escopo; nunca pergunte por app/package.
- `monorepo` | `microfrontends` → o escopo é o campo `**Escopo:**` do
  `spec.md` alvo (`raiz`, `apps/api` ou lista). Sem Spec, use a coluna
  `Escopo` do item no backlog; empate → ambiguidade.
- Campo ausente → infira: `turbo.json` ou `apps/`+`packages/` na raiz ⇒
  `monorepo`; dependência `@module-federation/*` ⇒ `microfrontends`; senão
  `single`. Diga o que inferiu e peça confirmação antes de seguir.

Com escopo resolvido, carregue `.specify/memory/projects/<apps-x>.md` daquele
escopo, se existir. Nunca carregue o de outro projeto.

## 4. Ambiguidade

Nunca pergunte em aberto. Proponha o melhor palpite e peça confirmação:
"Sem parâmetro. Pelo contexto (`<fonte>`), assumo `<spec/item>`. Confirma?"
Sem palpite possível, liste as opções encontradas (máx. 5) e peça escolha.

## 5. Tiers de contexto

Depois de resolver estado, item e escopo, siga o índice por tiers de
`.claude/CLAUDE.md`. Comece pelo Tier 1. Leia o Tier 2 apenas quando a tarefa
envolver decisões, arquitetura ou uma stack ativa; consulte o Tier 3 somente
se houver referência histórica explícita.
