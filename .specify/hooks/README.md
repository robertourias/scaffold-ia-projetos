# Hooks do Specnico (multi-plataforma)

Verificação automática executada pelo harness — não pelo agente. A lógica pura
vive em `.specify/hooks/core/` (Node.js sem dependências) e cada assistente
recebe um adapter fino de protocolo.

## O que roda

| Núcleo (`.specify/hooks/core/`) | Quando | O que faz |
|---|---|---|
| `spec-gate.mjs` | antes de editar arquivo | Regra 1: pede confirmação humana ao aprovar Spec (`review → approved`); Regra 2: bloqueia os `Arquivos:` da Spec ativa em `review`; Regra 3: pede confirmação em emendas normativas de `spec.md`/`plan.md` aprovados |
| `verify-file.mjs` | após editar arquivo | ESLint **no arquivo alterado** (rápido, sem `--fix`) |
| `verify-project.mjs` | fim do turno / sessão | type-check do projeto, se algum `.ts`/`.tsx` mudou |

Testes **não** rodam em hook — são responsabilidade do subagente **`runner`**
(na thread principal) e dos subagentes implementadores (`backend`/`frontend`).

## Matriz de paridade por plataforma

| Plataforma | Config / Adapter | Eventos | `ask` (Regras 1 e 3) | `block` (Regra 2, lint, type-check) |
|---|---|---|---|---|
| **Claude Code** | `.claude/settings.json` → `.claude/hooks/*.mjs` | `PreToolUse`, `PostToolUse`, `Stop` | Nativo (`permissionDecision: "ask"`) | Nativo (`exit 2` + `stderr`) |
| **GitHub Copilot** | `.github/hooks/specnico.json` → `.specify/hooks/adapters/copilot-hook.mjs` | `preToolUse`, `postToolUse`, `sessionEnd` | `permissionDecision: "ask"` (fallback para aprovação manual caso o cliente trate como `deny`) | `permissionDecision: "deny"` + `exit 2` |
| **Google AI Pro — Gemini CLI** | `.gemini/settings.json` → `node .specify/hooks/adapters/gemini-hook.mjs` | `BeforeTool`, `AfterTool`, `AfterAgent` | `decision: "ask"` (exit 0) | `decision: "deny"` + `exit 2` |
| **Google AI Pro — Antigravity** | `.agents/hooks.json` → `node ../.specify/hooks/adapters/gemini-hook.mjs` (`cwd = .agents/`) | `PreToolUse`, `PostToolUse` | `{"decision":"ask","reason":"..."}` (exit 0) | `PreToolUse`: `{"decision":"deny","reason":"..."}` (exit 0); `PostToolUse`: `{}` + `exit 2` |

## Fail open — invariante

Todos os hooks saem com **0 em silêncio** quando:

- não há `package.json`, ESLint, TypeScript ou `tsconfig.json`
- o arquivo editado não é `.ts` `.tsx` `.js` `.jsx` `.mjs` `.cjs`
- não há git, ou nenhum arquivo TypeScript mudou desde o `HEAD`
- o payload do hook não é JSON válido
- a **config** do ESLint está quebrada (erro de setup ≠ erro da edição)
- `.specify/state.json` não existe, `ativo` é `null` ou aponta fora de `specs/`

## Limites honestos

- Modo `bypassPermissions` (ou equivalente) pode ignorar prompts de `ask`.
- Escrita via terminal (`sed`, `echo >`) contorna hooks focados em ferramentas de edição.
- `verify-project.mjs` respeita `stop_hook_active` / `already_blocked`: no máximo 1 bloqueio extra por turno.

## Desligar

```bash
SPECNICO_VERIFY=0        # desliga todos os hooks
SCAFFOLD_VERIFY=0        # alias aceito (legado)
```
