---
name: verification
description: "Define o que significa \"pronto\" neste projeto: nenhum critério de aceite vira [x] sem evidência real de comando de verificação, e todo critério que exige ação humana vira Pendência Manual rastreável. Invocada por /back, /front, /hands-on, /recheck, a skill quality e todos os subagentes de implementação."
---

# Skill: Verificação

Fonte canônica do que significa "pronto" neste projeto. Referenciada por
`.claude/commands/back.md`, `.claude/commands/front.md`, `.claude/commands/hands-on.md`,
`.claude/commands/recheck.md`, `.claude/skills/quality/SKILL.md` e pelos subagentes em `.claude/agents/`.

> Os comandos concretos vivem em `docs/context/guardrails.md`, seção 1. Este
> arquivo define **como usá-los**; aquele define **quais são**.

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

**3. `(não configurado)` no guardrails.** Escreva literalmente:

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
Anote na Spec (formato abaixo), reporte ao usuário com instrução concreta do
que fazer, e siga sem bloquear o restante da tarefa. Quando o humano resolver,
ele roda `/recheck` para fechar o critério — não é seu trabalho como agente de
implementação ficar esperando.

## Como anotar uma Pendência Manual na Spec

Logo abaixo do critério de aceite afetado, insira (mantendo o checkbox
`- [ ]`):

```markdown
- [ ] <critério de aceite original>
  > 🟡 Pendência Manual: <o que falta e por que você não consegue verificar>
  > Instrução: <ação concreta que o humano precisa tomar — ex: "testar em
  > dispositivo iOS real e colar evidência", "confirmar com o time de negócio
  > se X é aceitável", "gerar a credencial Y em produção e configurar .env">
```

`/recheck` procura por esse bloco (linha `> 🟡 Pendência Manual:`) para saber
o que rechecar. Não use esse formato para falhas normais (caso 2) — só para o
que está genuinamente fora do seu alcance como agente.

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
