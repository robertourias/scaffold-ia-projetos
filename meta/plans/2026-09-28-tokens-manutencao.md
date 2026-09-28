# Harness: tokens e manutenção — Implementation Plan

> Plano da fase D. Executar somente após a revisão/aprovação da spec de design.

**Goal:** tornar economia de contexto e manutenção do scaffold verificáveis,
reproduzíveis e seguros para publicação.

**Architecture:** documentação de tiers em `.claude/context-index.md`,
verificadores Node sem dependências em `meta/tests/`, scripts npm finos e
documentação operacional em `.claude/workflows/`.

**Tech Stack:** Node >= 18, `node:test`, filesystem padrão, Markdown e os
scripts já existentes. Nenhuma dependência nova.

## Task 1: índice e contrato de contexto

**Files:**

- Create: `.claude/context-index.md`
- Modify: `.claude/CLAUDE.md`
- Modify: `.claude/README.md`
- Modify: `.claude/workflows/context-resolution.md`

**Steps:**

1. Criar o índice com Tier 1/2/3, regras de escopo e packs.
2. Fazer `CLAUDE.md` apontar para o índice e remover instruções duplicadas.
3. Fazer README documentar o índice como contrato do harness.
4. Acrescentar ao workflow de contexto a regra de tier por comando.
5. Verificar que todos os caminhos citados existem.

## Task 2: verificar pacotes e arquivos publicados

**Files:**

- Create: `meta/tests/maintenance.test.mjs`
- Modify: `meta/tests/lint-docs.mjs`
- Modify: `meta/tests/check-eol.mjs`
- Modify: `package.json`

**Steps:**

1. Extrair uma lista única dos arquivos publicados a partir de
   `package.json.files` e comparar com o que a CLI copia.
2. Validar `pack.json` com `id`, `name`, `version`, `description` e
   `appliesTo`, incluindo correspondência entre diretório e `id`.
3. Validar que todo pack tem README e aparece na documentação de packs.
4. Validar referências de arquivos publicados e diagramas citados.
5. Cobrir falhas com fixtures temporárias, sem modificar o checkout.

## Task 3: scripts de manutenção

**Files:**

- Modify: `package.json`
- Modify: `meta/tests/lint-docs.mjs`
- Modify: `meta/tests/check-eol.mjs`
- Modify: `meta/tests/maintenance.test.mjs`

**Steps:**

1. Adicionar `check:docs`, `check:eol`, `check:package` e `check`.
2. Garantir que scripts funcionam no PowerShell, bash e CI sem depender de
   `grep`, `find` ou ferramentas externas.
3. Fazer `prepublishOnly` chamar apenas `npm run check` para não duplicar
   comandos divergentes.
4. Verificar `npm pack --dry-run --json` como parte do check de package, sem
   deixar `.tgz` no working tree.

## Task 4: higiene de contexto e checkpoint

**Files:**

- Modify: `.claude/commands/checkpoint.md`
- Modify: `.claude/commands/retomar.md`
- Modify: `.claude/workflows/feature-delivery.md`
- Modify: `docs/context/current-state.md`

**Steps:**

1. Definir formato curto e limite de conteúdo do current-state.
2. Fazer `/checkpoint` resumir e apontar para changelog/Spec em vez de copiar
   listas históricas.
3. Fazer `/retomar` ler o índice, estado atual e apenas a documentação ligada
   ao contexto resolvido.
4. Documentar arquivamento e migração de detalhes para `docs/features/`.
5. Adicionar casos de teste textuais para impedir regressão de caminhos e
   ausência de parâmetro.

## Task 5: drift e versão instalada

**Files:**

- Modify: `bin/cli.js`
- Modify: `.claude/README.md`
- Modify: `README.md`
- Modify: `meta/tests/cli.test.mjs`

**Steps:**

1. Extrair uma mensagem/rotina de diagnóstico para comparar
   `.claude/.scaffold-version` com a versão do pacote.
2. Manter instalação sem flag não destrutiva e sem alterar `.claude/settings.json`.
3. Cobrir versão ausente, versão antiga, arquivos locais divergentes e
   line endings equivalentes.
4. Documentar claramente `--upgrade`, `--force` e preservação de docs.

## Task 6: gate de CI e documentação final

**Files:**

- Modify: `.claude/templates/ci/verify.yml`
- Modify: `README.md`
- Modify: `.claude/README.md`
- Modify: `meta/specs/2026-09-28-tokens-manutencao-design.md`

**Steps:**

1. Documentar um passo opcional de manutenção no template sem duplicar os
   quatro marcadores de verificação de projeto nem instalá-lo em consumidores.
2. Documentar o comando recomendado para contributors e release.
3. Atualizar os critérios da spec com a saída real dos checks.
4. Rodar suíte completa, lint, EOL, package dry-run e validação YAML.

## Ordem de execução

Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6.

Tasks 1–3 formam o núcleo determinístico. Task 4 depende do índice. Task 5 é
isolada da lógica de contexto, mas deve reutilizar os testes da CLI. Task 6 só
entra depois de todos os checks passarem.

## Verificação final

```text
npm run check
npm pack --dry-run
node meta/tests/lint-docs.mjs
node meta/tests/check-eol.mjs
```

## Commit sugerido

```text
feat(harness): add token and maintenance checks
```
