# Hooks

Verificação automática executada pelo harness — não pelo agente. É a diferença
entre "o agente disse que está pronto" e "o projeto compila".

Ligados em `.claude/settings.example.json` → copie para `.claude/settings.json`
(o `/specnico-constitution` faz isso).

## O que roda

| Hook | Evento | Quando | O que faz |
|------|--------|--------|-----------|
| `spec-gate.mjs` | `PreToolUse` (`Edit`\|`Write`\|`MultiEdit`) | antes de cada edição | pede confirmação humana ao autoaprovar uma Spec; bloqueia os arquivos declarados em `Arquivos:` do `tasks.md` da Spec ativa (`.specify/state.json`) em `review` |
| `verify-file.mjs` | `PostToolUse` (`Edit`\|`Write`\|`MultiEdit`) | a cada arquivo editado | ESLint **no arquivo alterado** (rápido) |
| `verify-project.mjs` | `Stop` | fim do turno | type-check do projeto, se algum `.ts`/`.tsx` mudou |

Divisão proposital: lint por arquivo é barato e roda sempre; type-check é caro e
roda uma vez por turno. Testes **não** rodam em hook — são responsabilidade
explícita do agente (subagentes do `/specnico-implement`, `/specnico-fix`), porque a
suíte pode levar minutos e nem toda tarefa a exige.

## O gate de Spec — de honra para mecânico

Antes deste hook, `Status: approved` era só uma instrução no prompt: nada
impedia um agente de implementar contra uma Spec em `review`, ou de editar o
próprio campo `Status` para se autoaprovar. `spec-gate.mjs` fecha as duas
lacunas com duas regras.

Cada Spec é uma pasta `specs/NNN-slug/` com `spec.md` (requisitos e `Status`),
`plan.md` (plano técnico) e `tasks.md` (tarefas, com o campo `Arquivos:`). A
Spec ativa é a que `.specify/state.json` aponta em `ativo.spec`.

**Regra 1 — autoaprovação.** Toda edição feita por ferramenta do Claude passa
por este hook; edição humana direta no editor, não. Qualquer edição via
`Edit`/`Write`/`MultiEdit` que tire um `specs/<pasta>/spec.md` do
`Status: review` — computado sobre o texto **depois** da edição, não sobre o
texto novo isolado — ou que crie um `spec.md` novo já fora de `review`,
devolve no stdout:

```json
{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"Aprovação de Spec exige confirmação humana (/specnico-approve)."}}
```

O Claude Code pede confirmação humana no prompt antes de aplicar a edição. É
o caminho que o `/specnico-approve` usa; uma tentativa de autoaprovação pelo
agente vira um prompt que o humano nega.

**Regra 2 — implementação antes da aprovação.** O hook lê
`.specify/state.json` → `ativo.spec` (diretório da Spec ativa) e o `Status` de
`<spec>/spec.md`. Com a Spec em `review`, bloqueia `Edit`/`Write`/`MultiEdit`
apenas nos arquivos declarados no campo `Arquivos:` de cada tarefa do
`<spec>/tasks.md`. Uma Spec sem `tasks.md`, ou cujo `tasks.md` não declara
nenhum `Arquivos:`, bloqueia qualquer arquivo de código. `.specify/`, `specs/`
e `.claude/` nunca são bloqueados por esta regra. A mensagem de bloqueio manda
rodar `/specnico-approve <spec>`.

**Regra 3 — emenda em Spec aprovada.** Vale para `spec.md` e `plan.md`; no
caso do `plan.md`, o Status vem do `spec.md` da mesma pasta. Com Status antes
= `approved`, compara o conteúdo normativo antes/depois. Não conta como
emenda: marcar checkbox, blocos de Pendência Manual, as seções
`## Notas de Review` e `## Emendas`, e as linhas `Status`/`Aprovado por`/
`Concluído em` (transição `approved → done` é permitida). Diferença no
conteúdo normativo devolve no stdout:

```json
{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"Emenda em Spec aprovada — registre o que mudou e por quê em ## Emendas."}}
```

Texto não computável (old_string não encontrado, etc.) → não pede. O
`tasks.md` não passa pela Regra 3: marcar checkbox e anexar `## Convergência`
são livres. É o caminho que registra emendas pós-aprovação em `## Emendas` em
vez de editar a Spec aprovada em silêncio.

**Limites conhecidos, honestos:**

- **Limitação:** em modo `bypassPermissions` o `ask` das regras 1 e 3 passa
  sem prompt — a autoaprovação não é barrada nesse modo.
- O hook só é acionado no matcher `Edit`/`Write`/`MultiEdit`: escrita via
  `Bash` (`sed`, `mv`, `echo >` e afins) não passa por ele e contorna as
  regras.
- Editar `ativo.spec` em `.specify/state.json` para apontar para outra Spec
  (ou para uma pasta inexistente) desliga a Regra 2 sobre a Spec real — o
  hook confia nesse campo para saber qual Spec está em `review`.
- É heurístico: identifica a Spec ativa pelo `state.json`, e os arquivos
  bloqueados pelo campo `Arquivos:` de cada tarefa do `tasks.md`, não por
  análise semântica do conteúdo. Se o `state.json` ou o `tasks.md` estiverem
  desatualizados, o gate fica cego ou bloqueia o arquivo errado.
- Falha em aberto (exit 0, sem stderr) se `.specify/state.json` não existe ou
  não é JSON válido, se `ativo` é `null`, se `ativo.spec` não está sob
  `specs/` (caminho absoluto, outra pasta ou `..`), ou se a pasta apontada não
  tem `spec.md`.
- Rebaixar uma Spec `approved` de volta para `review` (ou apagar a linha
  `**Status:**`) passa pela Regra 3 em silêncio: as linhas de Status são
  ignoradas de propósito na comparação normativa, então essa mudança sozinha
  não conta como emenda.
- A normalização de checkbox da Regra 3 só reconhece marcadores `-`/`*`
  (`- [x]` → `- [ ]`); um checklist com marcador `+` (`+ [x]`) não é
  normalizado e marcar/desmarcar esse item numa Spec aprovada gera `ask`.

## Contrato

Três saídas possíveis. **exit 2** + mensagem no `stderr` (Regra 2, bloqueio) →
o Claude Code injeta o `stderr` de volta no contexto e o agente corrige antes
de seguir. **exit 0** com o JSON `permissionDecision: "ask"` no stdout (Regra
1 — autoaprovação, ou Regra 3 — emenda em Spec aprovada; dois `reason`
possíveis) → o Claude Code pede confirmação humana antes de aplicar a edição.
**exit 0** silencioso → o hook não tem objeção, a edição segue.

## Fail open — invariante

Os dois hooks saem com **0 em silêncio** quando:

- não há `package.json`, ESLint, TypeScript ou `tsconfig.json`
- o arquivo editado não é `.ts` `.tsx` `.js` `.jsx` `.mjs` `.cjs`
- não há git, ou nenhum arquivo TypeScript mudou desde o `HEAD`
- o payload do hook não é JSON válido
- a **config** do ESLint está quebrada (erro de setup ≠ erro da edição)

Um scaffold copiado para um projeto sem tooling nunca pode travar o agente.
Se você alterar estes scripts, preserve essa invariante.

### Proteção contra loop

`verify-project.mjs` respeita `stop_hook_active`: se o turno já foi bloqueado
uma vez, o segundo bloqueio é suprimido. No máximo um ciclo extra por turno.

## Desligar

```bash
SPECNICO_VERIFY=0        # desliga os dois hooks
SCAFFOLD_VERIFY=0        # alias aceito (legado)
```

Ou remova o bloco `hooks` de `.claude/settings.json`.

## Limitações

- Verificam **sintaxe e tipos**, não corretude. Type-check verde não prova que a
  regra de negócio está certa — isso é o `/specnico-review` e os testes.
- `verify-file.mjs` roda ESLint sem `--fix`: o agente corrige, o hook não edita
  código por conta própria.
- Em monorepo, `verify-project.mjs` roda o script de type-check da **raiz**
  (`type-check`, `typecheck` ou `tsc`). Se cada app tem o seu, exponha um script
  agregador na raiz (ex: `turbo run type-check`).
