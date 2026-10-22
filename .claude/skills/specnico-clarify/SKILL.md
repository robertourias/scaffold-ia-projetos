---
name: specnico-clarify
description: "Resolve as ambiguidades da Spec ativa: até 5 perguntas por sessão, uma por vez, com opções e recomendação; grava as respostas em Clarificações e corrige a Spec"
argument-hint: "[specs/NNN-slug]"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(git status:*), Bash(git add:*)
---

# /specnico-clarify — fechar as ambiguidades da Spec

Você tira da Spec o que ainda não está decidido, **antes** do plano. Escreve
apenas em `specs/`, `.specify/` e `.claude/`.

Entrada do usuário (pasta da Spec, opcional): `$ARGUMENTS`

## Regras gerais

- **Uma pergunta por mensagem**, sem exceção. Máximo de **5 perguntas por sessão**.
- Nunca `git add -A`, `git add .` nem `git commit -a`: stage só de caminhos explícitos.
- **Commit só com confirmação.** Antes de cada `git commit`, mostre a mensagem e a
  lista exata de arquivos e pergunte **"Posso commitar?"**. Sem um sim explícito,
  não commite: as mudanças ficam no working tree e você diz o que ficou pendente.
  O `settings.json` também pede confirmação (`git commit` em `ask`); as duas valem.
- Não mude o `**Status:**` da Spec.

## 1. Spec alvo

Leia `.specify/state.json` e mostre a fase atual em uma linha (`Ativo: specs/NNN-slug · fase <fase> · Bnn`, ou `Ativo: nenhum`). Parâmetro ausente: `.specify/workflows/context-resolution.md`.

Normalize o alvo antes de comparar com `ativo.spec`: aceite `NNN`, `NNN-slug` ou
`specs/NNN-slug` e resolva para a pasta `specs/NNN-slug`. `$ARGUMENTS` informado
→ essa pasta. Senão use `ativo.spec`. Sem `ativo` e sem argumento → diga que não há Spec e indique
`/specnico-spec`. Leia `spec.md` e `checklists/requirements.md`. Spec `approved`
ou `done`: pare — mudança nela é **emenda** (`## Emendas`), não clarificação.

## 2. Fila de perguntas

Monte a lista, em ordem de prioridade **escopo > segurança > UX > técnica**:

1. cada `[NEEDS CLARIFICATION]` da Spec;
2. se sobrar espaço (até 5 no total), ambiguidades que você encontrar: FR não
   testável, termo vago, caso de borda sem comportamento, SC sem número.

Sem nada a perguntar: diga que a Spec está clara e vá ao passo 5.

## 3. Perguntar

Para cada pergunta, **uma por mensagem**, apresente:

| Opção | Resposta | Implicação |
|---|---|---|
| A | … | o que isso muda na Spec |
| B | … | … |
| Outra | resposta livre | — |

e uma linha **Recomendação:** `<opção>` com o motivo. O humano responde com a
letra, "sim" (aceita a recomendação) ou texto livre. Resposta vaga: reformule,
não presuma.

## 4. Gravar a cada resposta

Logo após cada resposta (não no fim):

1. Em `## Clarificações`, se houver só a nota "Nenhuma ainda.", remova-a. Abra, uma única vez, `### Sessão YYYY-MM-DD` (hoje; se já houver uma de hoje, reaproveite) e acrescente `- P: <pergunta> → R: <resposta>`.
2. **Corrija a seção afetada** (FR, User Story, Caso de borda, Entidade, SC, Premissa ou Fora do escopo) para refletir a decisão.
3. **Remova o marcador** `[NEEDS CLARIFICATION: …]` resolvido.

Nunca apague clarificações de sessões anteriores.

## 5. Revalidar e registrar

- Reavalie o checklist: marque `[x]` o que passou a valer (inclusive "Nenhum
  `[NEEDS CLARIFICATION]` restante" se não sobrou marcador) e atualize **Validado em**.
- Marcadores que sobraram (você parou nas 5 perguntas): mantenha-os e avise quantos.
- `.specify/state.json`: **só se** `ativo` não for nulo **e** a pasta alvo for igual a `ativo.spec` → `ativo.fase = "clarify"`, `atualizado` = agora (ISO 8601); preserve o resto. Se o alvo for outra Spec ou `ativo` for nulo, avise ("a Spec clarificada não é a ativa") e **não toque** em `state.json`.

## 6. Commit e handoff

Stage explícito de: `<pasta>/spec.md`, `<pasta>/checklists/requirements.md`
e, só se foi alterado, `.specify/state.json`. Pergunte "Posso commitar?" (mensagem +
arquivos) e, só com confirmação, commite:

`docs(spec): clarifica NNN-slug`

Resuma: perguntas respondidas, seções alteradas, marcadores restantes.

Próximo: `/specnico-plan` (se restaram marcadores, rode `/specnico-clarify` de novo antes)
