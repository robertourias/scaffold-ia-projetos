# Desenvolvimento do Specnico

Este repositório é o **template** do Specnico — o núcleo canônico em `core/`,
o processo, hooks e memória em `.specify/` e `specs/README.md` são renderizados
e copiados para os projetos via `npx specnico` (`bin/cli.js` + `bin/adapters/`)
— e também o lugar onde ele é desenvolvido.

- **Fonte única canônica (`core/`):**
  - `core/AGENTS.md` — instruções base compartilhadas entre todas as plataformas.
  - `core/skills/` — as 11 skills `jarvis-*` + 5 papéis no padrão aberto Agent Skills.
  - `core/agents/` — os 5 subagentes (`backend`, `frontend`, `planner`, `reviewer`, `runner`).
  - `core/platforms/` — metadados de ferramentas/modelos/hooks por plataforma (`claude`, `copilot`, `gemini`).
- **Adapters (`bin/adapters/`):** projetam `core/` no formato nativo de Claude Code (`.claude/`), GitHub Copilot (`.github/`) e Google AI Pro — Antigravity & Gemini CLI (`.agents/`, `.gemini/`, `GEMINI.md`).
- **Hooks compartilhados (`.specify/hooks/`):** lógica pura em `core/` e adapters em `adapters/`.
- Specs e planos de evolução do harness: `meta/specs/` e `meta/plans/` — nunca em `.specify/` ou `specs/` (seriam copiados para os projetos).
- Changelog do Specnico: `meta/changelog/`. Imagens e fonte do diagrama do README: `meta/assets/`.
- `meta/` e este arquivo não são publicados (`files` do `package.json`) nem copiados pelo CLI.
- `.specify/memory/` é template: mantenha os arquivos de contexto vazios (marcador `**Status do arquivo:** vazio`). Não crie Specs em `specs/` aqui: só o `specs/README.md` é publicado.
- Antes de commitar: `npm run check` (roda `check:package`, `check:eol`, `check:docs` e `node --test "meta/tests/*.test.mjs"`).
