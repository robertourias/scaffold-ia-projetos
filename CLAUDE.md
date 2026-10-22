# Desenvolvimento do Specnico

Este repositório é o **template** do Specnico — o harness em `.claude/`, o
processo e a memória em `.specify/` e `specs/README.md` são copiados para os
projetos via `npx specnico` — e também o lugar onde ele é desenvolvido. As
instruções do harness para os projetos estão em `.claude/CLAUDE.md`.

- Specs e planos de evolução do harness: `meta/specs/` e `meta/plans/` — nunca
  em `.specify/` ou `specs/` (seriam copiados para os projetos).
- Changelog do Specnico: `meta/changelog/`. Imagens e fonte do diagrama do
  README: `meta/assets/`.
- `meta/` e este arquivo não são publicados (`files` do `package.json`) nem
  copiados pelo CLI.
- `.specify/memory/` é template: mantenha os arquivos de contexto vazios
  (marcador `**Status do arquivo:** vazio`). Não crie Specs em `specs/` aqui:
  só o `specs/README.md` é publicado.
- Antes de commitar: `node --test "meta/tests/*.test.mjs"` e `node meta/tests/lint-docs.mjs`.
