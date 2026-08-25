# Hooks

Verificação automática executada pelo harness — não pelo agente. É a diferença
entre "o agente disse que está pronto" e "o projeto compila".

Ligados em `.claude/settings.example.json` → copie para `.claude/settings.json`
(o Bloco 6 do `/init-project` faz isso).

## O que roda

| Hook | Evento | Quando | O que faz |
|------|--------|--------|-----------|
| `spec-gate.mjs` | `PreToolUse` (`Edit`\|`Write`\|`MultiEdit`) | antes de cada edição | bloqueia código enquanto a Spec ativa estiver `Status: review` |
| `verify-file.mjs` | `PostToolUse` (`Edit`\|`Write`\|`MultiEdit`) | a cada arquivo editado | ESLint **no arquivo alterado** (rápido) |
| `verify-project.mjs` | `Stop` | fim do turno | type-check do projeto, se algum `.ts`/`.tsx` mudou |

Divisão proposital: lint por arquivo é barato e roda sempre; type-check é caro e
roda uma vez por turno. Testes **não** rodam em hook — são responsabilidade
explícita do agente (`/back`, `/front`, Passo 1 da Finalização), porque a
suíte pode levar minutos e nem toda tarefa a exige.

## O gate de Spec — de honra para mecânico

Antes deste hook, `Status: approved` era só uma instrução no prompt: nada
impedia um agente de implementar contra uma Spec em `review`, ou de editar o
próprio campo `Status` para se autoaprovar.

`spec-gate.mjs` fecha a primeira metade: lê `**Spec ativo:**` em
`docs/context/current-state.md` (escrito por `/spec` ao gerar a Spec, e por
`/checkpoint`), resolve o `Status` dessa Spec, e bloqueia `Edit`/`Write`/`MultiEdit`
fora de `docs/` e `.claude/` enquanto o status for `review`.

**Limites conhecidos, honestos:**

- Não impede o agente de editar o campo `Status` diretamente — isso continua
  dependendo da instrução (`docs/skills/planner.md`, `back.md`, `front.md`).
  Um hook não distingue "humano aprovou" de "agente editou a string".
- É heurístico: identifica a Spec ativa pelo campo declarado, não por análise
  de qual código pertence a qual Spec. Se `current-state.md` estiver
  desatualizado, o gate fica cego.
- Falha em aberto sem `current-state.md`, sem campo `Spec ativo:`, ou sem a
  Spec referenciada existir no disco.

## Contrato

Saída **exit 2** + mensagem no `stderr` → o Claude Code injeta o `stderr` de
volta no contexto e o agente corrige antes de seguir. Qualquer outro código
deixa o fluxo passar.

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
SCAFFOLD_VERIFY=0        # desliga os dois hooks
```

Ou remova o bloco `hooks` de `.claude/settings.json`.

## Limitações

- Verificam **sintaxe e tipos**, não corretude. Type-check verde não prova que a
  regra de negócio está certa — isso é o `/review` e os testes.
- `verify-file.mjs` roda ESLint sem `--fix`: o agente corrige, o hook não edita
  código por conta própria.
- Em monorepo, `verify-project.mjs` roda o script de type-check da **raiz**
  (`type-check`, `typecheck` ou `tsc`). Se cada app tem o seu, exponha um script
  agregador na raiz (ex: `turbo run type-check`).
