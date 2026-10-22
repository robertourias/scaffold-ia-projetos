---
name: verification
description: "Define o que significa \"pronto\" neste projeto: nenhum critério de aceite vira [x] sem evidência real de comando de verificação, e todo critério que exige ação humana vira Pendência Manual rastreável. Invocada por /specnico-implement, /specnico-converge, /specnico-fix, a skill quality e todos os subagentes de implementação."
---

# Skill: Verificação

Fonte canônica do que significa "pronto" neste projeto. Referenciada por
`/specnico-implement`, `/specnico-converge`, `/specnico-fix`,
`.claude/skills/quality/SKILL.md` e pelos subagentes em `.claude/agents/`.

> Os comandos concretos vivem em `.specify/memory/constitution.md`, seção 4
> (Comandos de verificação) — em monorepo, também em
> `.specify/memory/projects/<apps-x>.md` do escopo. Este arquivo define **como
> usá-los**; aqueles definem **quais são**.

---

## A regra

Nenhum Critério de Aceite vira `[x]` sem que os comandos de verificação
aplicáveis tenham rodado e a **saída real** esteja na resposta.

Checkbox marcado sem evidência é autodeclaração. Um agente afirmando que o
código funciona não é diferente de não ter testado — o leitor não tem como
distinguir os dois casos.

## O que rodar

| Você alterou | Rode |
|--------------|------|
| qualquer `.ts` / `.tsx` | type-check |
| qualquer código | lint |
| lógica de negócio ou de componente | testes |
| dependências, config de build | build |

Não rode a suíte inteira quando um arquivo de teste específico cobre a mudança —
mas diga qual rodou.

## Como reportar

```
Verificação:
  type-check: passou | falhou | não configurado
  lint:       passou | falhou | não configurado
  testes:     N passando | falhou | não configurado
  <saída relevante, recortada>

Pendências Manuais: (nenhuma) | <critério> — <instrução resumida>
```

## Os cinco casos

**1. Passou.** Marque `[x]`. Inclua a saída.

**2. Reprovou.** Corrija e rode de novo. Não avance, não marque nada.

**3. `(não configurado)` na constituição.** Escreva literalmente:

> ⚠️ `<verificação>` não configurada neste projeto — critério não verificado.

Não marque `[x]` por essa dimensão. Não invente um comando para preencher a
lacuna.

**4. Falha pré-existente**, sem relação com sua mudança. Reporte nominalmente
(arquivo e erro), registre como dívida, e siga. Não silencie e não "conserte de
passagem" — correção fora de escopo entra no diff sem revisão.

**5. Pendência Manual.** O critério exige ação que você não consegue executar
nem verificar sozinho — teste manual em navegador/dispositivo real, credencial
ou ambiente externo que você não acessa, decisão de negócio, aprovação humana.
Não deixe isso em aberto silenciosamente e não marque `[x]` por suposição.
Anote no `tasks.md` (formato abaixo), reporte ao usuário com instrução
concreta do que fazer, e siga sem bloquear o restante da tarefa. Quando o
humano resolver, ele roda `/specnico-converge` para fechar o critério — não é
seu trabalho como agente de implementação ficar esperando.

## Como anotar uma Pendência Manual no `tasks.md`

Logo abaixo do critério de aceite afetado — na própria tarefa, ou em
`## Pendências Manuais` quando o `/specnico-plan` já a previu —, insira
(mantendo o checkbox `- [ ]`):

```markdown
- [ ] <critério de aceite original>
  > 🟡 Pendência Manual: <o que falta e por que você não consegue verificar>
  > Instrução: <ação concreta que o humano precisa tomar — ex: "testar em
  > dispositivo iOS real e colar evidência", "confirmar com o time de negócio
  > se X é aceitável", "gerar a credencial Y em produção e configurar .env">
```

`/specnico-converge` procura por esse bloco (linha `> 🟡 Pendência Manual:`)
em todo o `tasks.md` para saber o que rechecar, e o troca por
`> ✅ Pendência Manual resolvida em <data> via /specnico-converge: <resumo>`. Não use esse formato para falhas normais (caso 2) — só para o
que está genuinamente fora do seu alcance como agente.

## Emenda em Spec aprovada

Mudança normativa numa Spec `approved` — texto de FR, user story, critério de
sucesso no `spec.md`; contrato, modelo de dados ou decisão no `plan.md` —
exige, **na mesma edição**, uma entrada em `## Emendas` do próprio arquivo:
`- YYYY-MM-DD — <o que mudou> — <por quê> — <quem>`. O hook `spec-gate.mjs`
pede confirmação humana para edições normativas em `spec.md` e `plan.md`
aprovados. FR novo ou removido **não** é emenda — é mudança de escopo: pare e
escale ao humano.

O `tasks.md` é livre (não é emenda): marcar checkbox, anotar Pendência Manual
(aberta ou resolvida pelo `/specnico-converge`), tarefas novas em
`## Convergência`. Também não é emenda escrever o `review.md` nem fechar a
Spec (`approved → done`, pelo `/specnico-converge`).

## Proibido

- `--no-verify`, `--passWithNoTests`, `--force` para fazer um comando passar
- `eslint-disable` / `@ts-ignore` / `@ts-expect-error` sem comentário explicando a causa real
- `expect(true).toBe(true)`, teste que não exercita o código, ou `skip` para ficar verde
- afirmar "os testes passam" sem ter rodado nesta sessão

Fazer o sinal ficar verde não é o objetivo. O sinal existe para ser informativo;
adulterá-lo destrói a única evidência que o revisor tem.

## Se você não rodou nada

A resposta correta não é `[x]`. É:

> Implementado, **não verificado**: `<motivo>`.

Isso é uma entrega honesta e útil. Um `[x]` falso não é.

## Camadas automáticas

`.claude/hooks/` roda parte disso fora do seu controle: lint por arquivo editado
e type-check no fim do turno. Hook verde **não substitui** este gate — nenhum
hook roda testes, e hooks falham em aberto (projeto sem ESLint/TypeScript não é
verificado por eles).
