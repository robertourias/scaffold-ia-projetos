---
name: specnico-fix
description: "Fluxo leve de bugfix sem gate de Spec: sintoma → reprodução (teste que falha) → diagnóstico → correção mínima → verificação → veredito, registrado em specs/bugs/NNN-slug.md. Mudança de requisito para e sugere /specnico-spec"
argument-hint: "<sintoma do bug> [apps/<app>]"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(git status:*), Bash(git branch --show-current), Bash(git rev-parse:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*)
---

# /specnico-fix — corrigir um bug com evidência

Você corrige **um bug** com o menor desvio possível, provando por teste que o
sintoma existia e deixou de existir. Não há gate de aprovação nem Spec nova: o
registro é `specs/bugs/NNN-slug.md` (template `.specify/templates/bug-template.md`).
Substitui o uso de `back` e `front` da 1.x para bugs.

Sintoma recebido: `$ARGUMENTS`

Invoque a skill `verification` (o que é "pronto") e, conforme o código tocado,
`backend` ou `frontend`. Leia `.specify/memory/constitution.md` (GR/CN e comandos
de verificação) e siga `.specify/workflows/git-flow.md`.

## Regras gerais

- Nunca `git add -A`, `git add .` nem `git commit -a`: stage só de caminhos explícitos (arquivos da correção, do teste e do relato do bug).
- `allowed-tools` pré-aprova só os `git` deste fluxo; o teste da reprodução e os comandos de verificação da constituição dependem do `permissions.allow` do `.claude/settings.json` (fora dele, pedem permissão).
- Correção **mínima**: nada de refatoração, limpeza ou feature carona.
- Não edite `spec.md`/`plan.md` de nenhuma Spec e não mexa em Status nem no backlog.
- Sem sintoma em `$ARGUMENTS`, pergunte: o que acontece, o que deveria acontecer e como reproduzir.
- `git status --porcelain` com mudança **rastreada** pendente → pare e peça ao humano para commitar ou guardar. Não rastreados nunca bloqueiam e nunca são tocados.

## Passo 0 — Preflight do estado

Leia `.specify/state.json` e mostre a fase atual em uma linha (`Ativo: specs/NNN-slug · fase <fase> · Bnn`, ou `Ativo: nenhum`; formato de `.specify/workflows/context-resolution.md`). Se `ativo` aponta para uma Spec cujo `**Status:**` é `review`, **pare antes de editar qualquer código**: o hook `spec-gate` bloqueia (exit 2) edição de código enquanto a Spec ativa está em `review` (todo código, se o `tasks.md` dela não tem `Arquivos:`; senão, os arquivos declarados). Explique isso e ofereça: aprovar a Spec (`/specnico-approve`), concluí-la ou abandoná-la, ou — se o bug for independente dela — o humano limpar `ativo` com confirmação. Nunca proponha `SPECNICO_VERIFY=0` como caminho padrão. `approved`, `done`, `ativo: null` ou `state.json` ausente/ilegível (avise) → prossiga.

## Passo 1 — Sintoma e reprodução

1. Reescreva o sintoma (observado × esperado) e os passos. Dúvida → proponha a melhor interpretação e peça confirmação, uma pergunta por vez.
2. **Escreva um teste que falha** reproduzindo o sintoma, no padrão de testes do projeto. Rode-o e confirme que falha **pelo motivo certo**; cole a saída. Sem como automatizar (bug visual, ambiente), registre a reprodução manual e marque o veredito como no máximo `parcial`.

## Passo 2 — Diagnóstico

Ache a **causa raiz** (leia o código, rode o teste isolado; evidência, não palpite). Registre causa e arquivos.

**Checagem de requisito:** a correção esperada contradiz ou amplia o que a Spec/constituição afirma (FR, regra de negócio, contrato)? Isto é **mudança de requisito**, não bug. **Pare**, não altere código, explique o conflito (cite o FR/regra) e sugira `/specnico-spec`.

## Passo 3 — Correção mínima

Aplique a menor mudança que ataca a causa raiz. Arquivo protegido por guardrail só com pedido explícito. Precisou de mudança grande ou em vários módulos → pare e reavalie (provável requisito).

## Passo 4 — Verificação

1. O teste da reprodução agora **passa** (saída real).
2. A suíte e os comandos da constituição (type-check, lint, testes) passam; cole as saídas. Falha pré-existente sem relação: registre como 💡 e não esconda.

Sem saída real, o veredito não é `verificado` (skill `verification`).

## Passo 5 — Registro, veredito e commit

1. Numere o bug: maior `NNN` em `specs/bugs/` + 1 (3 dígitos, começando em `001`; numeração própria, separada das Specs). Slug em kebab-case do sintoma. Crie `specs/bugs/NNN-slug.md` pelo template: sintoma e reprodução, diagnóstico, correção (diff resumido), verificação (saídas reais), veredito `verificado | parcial | falhou — <justificativa>`, data e escopo.
2. Commit, stage explícito (arquivos da correção + teste + `specs/bugs/NNN-slug.md`): `fix(<escopo>): <slug>` (`<escopo>` = app/package; omita em `single`). Corpo: `Bug: specs/bugs/NNN-slug.md`.
3. Resumo curto: causa, arquivos, evidência (teste antes/depois e suíte), veredito, hash do commit.

Veredito `parcial` ou `falhou` → não finja sucesso: diga o que falta.

Próximo: `/specnico-review` para revisar a correção; o bugfix encerra o fluxo aqui, sem Spec a fechar
