# Harness: endurecimento (sub-projeto A)

**Status:** implementado
**Data:** 2026-09-27

Parte A de 4 da evolução do harness (A endurecimento → B fluxo SDD v2 → C
núcleo agnóstico + pacotes de stack → D tokens/manutenção). Esta spec cobre só A.

## Objetivo

Fechar os furos de segurança e de gate do harness, separar o que é template
(vai para os projetos) do que é meta (desenvolvimento do próprio scaffold),
tornar o harness autossuficiente (sem citar Superpowers), manter e corrigir a
instalação via `npx`, e refletir o novo fluxo no README.

## Decisões do usuário

1. Meta do scaffold em `meta/` na raiz; a raiz continua sendo o template.
2. `/approve` só invocável pelo humano + hook pedindo confirmação a qualquer edição via ferramenta que aprove uma Spec.
3. Referências ao comparativo inexistente e ao Superpowers saem de todo o template.
4. Instalação `npx @robertourias/scaffold-ia` (já publicada, 1.0.0) é mantida.
5. README atualizado com o novo fluxo de trabalho.

## Design

### 1. Separar meta do template

| De | Para |
|---|---|
| `docs/superpowers/specs/` | `meta/specs/` |
| `docs/superpowers/plans/` | `meta/plans/` |
| `docs/changelog/` (inteira: `2026-05-22.md`, `releases.md`) | `meta/changelog/` |
| `docs/assets/` | `meta/assets/` |

- Projetos criam o próprio `docs/changelog/` via `/checkpoint` (já é o comportamento; a pasta não é publicada no npm hoje).
- Novo `CLAUDE.md` na raiz, só para desenvolvimento do scaffold: specs e planos do harness vão para `meta/specs` e `meta/plans`; `meta/` nunca é copiado para projetos; rodar `node --test "meta/tests/*.test.mjs"` e `node meta/tests/lint-docs.mjs` antes de commitar. Não é publicado (fora de `files`) nem copiado pelo CLI (que copia só `.claude/` e `docs/`).
- README aponta imagem para `meta/assets/fluxo-workflow.png`.

### 2. `/approve`

- `.claude/skills/approve/SKILL.md`, frontmatter `disable-model-invocation: true`, `argument-hint: "[caminho-da-spec]"`.
- Sem argumento → Spec em `**Spec ativo:**` de `docs/context/current-state.md` (resolução de `.claude/workflows/context-resolution.md`).
- Pré-validação (lista problemas; se houver, pergunta se aprova mesmo assim):
  - Status atual é `review` (se `approved`/`done`, avisa e para);
  - todo `FR-XXX` da seção 3 aparece na tabela de Rastreabilidade;
  - toda tarefa tem `Arquivos:` preenchido;
  - seção Verificação sem `<comando>` placeholder;
  - nenhum `<...>` de template sobrando no corpo.
- Aprovação: troca `**Status:** review` → `**Status:** approved` e insere logo abaixo `**Aprovado por:** <git config user.name> em <YYYY-MM-DD>`.
- Guardrails (`docs/context/guardrails.md` seção 6), `spec-template.md` (comentário do gate) e as mensagens de `/spec` e da skill `planner` passam a instruir `/approve` em vez de edição manual. Edição manual no editor continua válida (fora do Claude, sem hook).

### 3. `spec-gate.mjs`

Duas regras, na ordem:

1. **Autoaprovação** — alvo é Spec (`docs/**/specs/*.md` ou `docs/**/archive/*.md`). O hook decide pelo `Status` resultante da edição, não pelo texto novo isolado: computa o texto final (Edit: aplica `old_string`→`new_string` sobre o arquivo atual — todas as ocorrências se `replace_all`, senão só a primeira; MultiEdit: aplica `edits[]` em sequência; Write: `content`) e extrai `**Status:**\s*(\S+)` de antes (arquivo atual no disco, ou `null` se ele ainda não existe) e de depois. Se `depois !== "review"` **e** (`antes === "review"` **ou** `antes === null`) — ou seja, toda saída de `review` (para `approved`, `Approved`, `done`, `aprovado`, remoção da linha `Status`) ou criação de Spec nova já fora de `review` — retorna o JSON `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"Aprovação de Spec exige confirmação humana (/approve)."}}` e sai 0; quando `antes` já é diferente de `review` (ex.: `approved` marcando checkbox, `approved`→`done`), não pede confirmação. Se o `old_string` não for localizado no arquivo (o resultado não dá para computar), cai no fallback: pede confirmação se qualquer texto novo (`new_string`/`content`/`edits[].new_string`) tiver `**Status:**` com um valor diferente de `review`.
2. **Implementação antes da aprovação** — Spec ativa em `review`:
   - coleta caminhos dos campos `Arquivos:` de todas as tarefas, ancorando a captura à linha de campo (regex `/^\s*(?:[-*]\s*)?\*{0,2}Arquivos:\*{0,2}[ \t]*(.+)$/gm`) para não confundir prosa que apenas menciona a palavra `Arquivos:` (ex.: texto do template citando o campo) com uma declaração real (backticks ou lista separada por vírgula);
   - se a lista não for vazia → bloqueia (exit 2) só se o arquivo editado estiver nela;
   - se vazia → bloqueia qualquer código (comportamento atual).
- Continua liberando sempre `docs/`, `**/docs/**` e `.claude/` para a regra 2.
- Mensagem de bloqueio sem "prossiga normalmente"; indica `/approve`.
- Remove condição duplicada `rel.includes("/docs/")`; comentário do topo corrigido (o hook distingue edição via ferramenta de edição humana no editor).
- Limitação documentada no `hooks/README.md`: em `bypassPermissions`, `ask` passa direto.

### 4. Permissões (`.claude/settings.example.json`)

- Remover de `allow`: `Bash(cat:*)`, `Bash(head:*)`, `Bash(tail:*)`, `Bash(grep:*)`, `Bash(find:*)`, `Edit(./apps/**)`, `Edit(./packages/**)`, `Edit(./docs/**)`.
- Adicionar em `ask`: `Edit(./.claude/settings.json)`, `Edit(./.claude/settings.local.json)`, `Write(./.claude/settings.local.json)`, `Edit(./.claude/hooks/**)`, `Write(./.claude/hooks/**)`, `Edit(./.claude/skills/approve/**)`, `Write(./.claude/skills/approve/**)`.
- `/init-project` Bloco 6b: remover a instrução de manter cat/grep no allow, se houver; manter o restante.

### 5. Remover Superpowers e comparativo do template

- Remover todas as menções em `.claude/CLAUDE.md`, `.claude/README.md`, `.claude/agents/README.md`, `.claude/workflows/playbook-tokens-qualidade.md` e `README.md`.
- Playbook: "Modo Rigor" e "Superpowers — quando puxar" reescritos só com recursos do scaffold (entrevista do `/spec`, `/hands-on --serial`, `/review`); seção do Superpowers some.
- `meta/` mantém o histórico como está.

### 6. CLI `npx` (`bin/cli.js`, `package.json`)

- Manter instalação padrão (não destrutiva, `skip` em arquivo existente).
- **Novo `--upgrade`**: sobrescreve só o harness — `.claude/{agents,commands,hooks,skills,templates,workflows}/**`, `.claude/CLAUDE.md`, `.claude/README.md`, `.claude/settings.example.json`; em `docs/` apenas cria o que faltar (nunca sobrescreve contexto preenchido); nunca toca `.claude/settings.json`/`settings.local.json`. Ao final, lista arquivos de `.claude/settings.example.json` que mudaram e sugere merge manual no `settings.json`.
- `--force` pede confirmação interativa `y/N` quando algum arquivo de `docs/` do destino difere do template do pacote (contexto preenchido); com stdin não-TTY recusa sem `--yes`.
- `--upgrade` e `--force` só reescrevem arquivos cujo conteúdo difere; a versão em `.claude/.scaffold-version` é gravada em instalação limpa, `--upgrade` e `--force`.
- Grava `.claude/.scaffold-version` com a versão do pacote em instalação/upgrade; `--upgrade` mostra `de X para Y`.
- `package.json`: `files` segue excluindo `meta/`, `CLAUDE.md` da raiz e `docs/changelog` (já excluídos pela whitelist); bump de versão para `1.1.0` fica para o release, fora desta spec.
- README: Quick Start usa `npx` (novo) e `npx ... --upgrade` (existente/migração) — remove recomendação de `--force` para upgrade (hoje apagaria `docs/context/`).

### 7. Testes do harness (`meta/tests/`, sem dependências)

- `hooks.test.mjs` (`node --test`), executa `spec-gate.mjs` com payload no stdin sobre fixtures temporárias:
  - review + arquivo declarado → exit 2;
  - review + arquivo não declarado → exit 0;
  - review + Spec sem `Arquivos:` → exit 2;
  - approved → exit 0;
  - edição em Spec introduzindo `**Status:** approved` → stdout JSON com `permissionDecision: "ask"`;
  - edição em `docs/` e `.claude/` → exit 0;
  - sem `current-state.md` → exit 0.
- `cli.test.mjs`: instala em dir temporário; reinstala sem flag (skip); `--upgrade` sobrescreve `.claude/commands/*` mas preserva `docs/context/product.md` alterado e `settings.json`; grava `.scaffold-version`.
- `lint-docs.mjs`: frontmatter YAML válido (`---` delimitado, `description` presente) em `.claude/commands/*.md`, `.claude/skills/*/SKILL.md`, `.claude/agents/*.md`; links relativos `[..](..)` e caminhos citados em crases `.claude/...`/`docs/...` existentes, em todos os `.md` fora de `meta/`; ignora caminhos com `$`, `<`, `*`, `YYYY`, `...` ou `[`. Sai 1 listando falhas.

### 8. README com o novo fluxo

- Fluxo ASCII e diagrama: gate humano vira `/approve <spec>` (com validação); imagem regerada em `meta/assets/fluxo-workflow.png`.
- Tabela de Slash Commands: adiciona `/approve`.
- Quick Start / Migração conforme item 6.
- Remove menções a Superpowers e comparativo (item 5).
- `.claude/README.md` e `.claude/CLAUDE.md`: lista de comandos com `/approve`.

## Fora de escopo (sub-projeto B)

Branch/commit/PR no fluxo, loop de review no `/hands-on`, emenda de Spec aprovada (hash), ciclo `done`, CI.

## Verificação

- `node --test "meta/tests/*.test.mjs"` passa.
- `node meta/tests/lint-docs.mjs` sai 0.
- `grep -rni "superpowers\|comparativo" .claude docs README.md` vazio.
- `ls docs/superpowers docs/changelog docs/assets` inexistentes; `meta/{specs,plans,changelog,assets,tests}` existem.
- `npm pack --dry-run` não lista `meta/` nem `CLAUDE.md` da raiz.
