# Constituição — <Projeto>

**Versão:** 1.0.0 | **Ratificada:** YYYY-MM-DD | **Última emenda:** YYYY-MM-DD

## 1. Identidade
- **Modo:** single | monorepo | microfrontends
- **Projetos:** <apps/web (nextjs) · apps/api (nestjs) · packages/ui> | raiz
- **Packs ativos:** <typescript, turborepo, nextjs, nestjs> | nenhum

## 2. Princípios (CN)
- **CN-001 <nome>** — <regra verificável>. Por quê: <motivo>.

## 3. Guardrails (GR) — invioláveis
- **GR-001 <nome>** — <regra>.

## 4. Comandos de verificação
| O quê | Comando | Escopo |
|---|---|---|
| Type-check | `<comando>` | raiz |
| Lint | `<comando>` | raiz |
| Testes | `<comando>` | raiz |
| Build | `<comando>` | raiz |

## 5. Governança
- Emendas só via `/specnico-constitution`, com versão e data.
- Violação de CN num `plan.md` exige linha em Complexity Tracking e aprovação
  humana no `/specnico-approve`.
- `guardrails` vencem qualquer outra instrução do harness.
