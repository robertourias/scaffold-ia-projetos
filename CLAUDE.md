# Desenvolvimento do scaffold

Este repositório é o **template** do scaffold — tudo em `.claude/` e `docs/`
é copiado para os projetos via `npx @robertourias/scaffold-ia` — e também o
lugar onde o scaffold é desenvolvido. As instruções do harness para os
projetos estão em `.claude/CLAUDE.md`.

- Specs e planos de evolução do harness: `meta/specs/` e `meta/plans/` — nunca
  em `docs/` (seriam copiados para os projetos).
- Changelog do scaffold: `meta/changelog/`. Imagens e fonte do diagrama do
  README: `meta/assets/`.
- `meta/` e este arquivo não são publicados (`files` do `package.json`) nem
  copiados pelo CLI.
- `docs/` é template: mantenha os arquivos de contexto vazios (marcador
  `**Status do arquivo:** vazio`).
- Antes de commitar: `node --test "meta/tests/*.test.mjs"` e `node meta/tests/lint-docs.mjs`.
