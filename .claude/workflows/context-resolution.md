# Resolução de contexto (fallback de parâmetros)

Regra única para comandos que recebem parâmetro (`/spec`, `/back`, `/front`,
`/review`, `/recheck`, `/hands-on`, `/groom`, `/backlog`). Aplique **apenas
quando o parâmetro estiver ausente ou não for reconhecido** — parâmetro válido
sempre vence.

## Modo
Leia `**Modo:**` em `docs/architecture/overview.md`.
- `single` → `$SCOPE` não existe; nunca pergunte por app/package; tudo em `docs/` raiz.
- `monorepo` | `microfrontends` → `$SCOPE` (`apps/<nome>` | `packages/<nome>`) pode existir.
- Campo ausente ou `a definir` → infira: `turbo.json` ou `apps/`+`packages/` na raiz ⇒ `monorepo`; dependência `@module-federation/*` ⇒ `microfrontends`; senão `single`. Diga o que inferiu e peça confirmação antes de seguir.

## Escopo (`$SCOPE`)
Só em `monorepo`/`microfrontends`. Ordem de tentativa (pare no primeiro que resolver para **um** app/package existente em `apps/`/`packages/`):
1. `docs/context/current-state.md` → escopo em "Em progresso" / spec ativo.
2. `git status --short` → arquivos alterados concentrados em um único `apps/<x>`/`packages/<x>`.
3. Commit mais recente (`git log -1 --name-only`) → idem.
Se nenhum resolver ou houver empate → ambiguidade.

## Tarefa/Spec
Comandos que precisam de spec/TASK:
1. Spec ativo em `current-state.md` (`Status: approved`).
2. Única spec `approved` em `docs/specs/` (ou `docs/$SCOPE/specs/`).
3. Próxima TASK com Status `backlog` (para /spec) ou `spec-approved`/`in-progress` (para /back, /front, /hands-on) do backlog do escopo resolvido.
Nenhuma → ambiguidade.

## Ambiguidade
Nunca pergunte em aberto. Proponha o melhor palpite e peça confirmação:
"Sem parâmetro. Pelo contexto (`<fonte>`), assumo `<escopo/spec>`. Confirma?"
Sem palpite possível, liste as opções encontradas (máx. 5) e peça escolha.

## Tiers de contexto

Depois de resolver Modo, Escopo e Tarefa, carregue `.claude/context-index.md`.
Comece pelo Tier 1. Leia o Tier 2 apenas quando a tarefa envolver decisões,
arquitetura ou uma stack ativa; consulte o Tier 3 somente se houver referência
histórica explícita. Nunca carregue o contexto de outro app/package.
