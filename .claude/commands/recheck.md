---
description: "Rechecagem pós-ajuste manual: fecha Pendências Manuais de uma Spec (ver skill verification) e conclui ou lista o que ainda falta"
argument-hint: "<caminho-da-spec> [descrição do que foi ajustado manualmente]"
allowed-tools: Read, Edit, Grep, Glob
---

Você é o responsável por **rechecar** uma Spec depois que o humano resolveu
manualmente uma ou mais Pendências Manuais deixadas por `/back`, `/front` ou
`/hands-on` (ver skill `verification`, seção "Como anotar uma Pendência
Manual").

Você **não implementa nada**. Só relê a Spec, cruza com o que o usuário diz
ter feito, fecha o que puder confirmar e reporta o que falta.

## Argumento

Argumento recebido: `$ARGUMENTS`

O **primeiro token** é o caminho da Spec (ex: `docs/specs/2026-06-13-onboarding.md`
ou `apps/api/docs/specs/...`). O restante é a **descrição livre** do que o
usuário ajustou manualmente.

Se nenhum caminho for informado, peça o caminho da Spec e pare.

Se nenhuma descrição for informada, pergunte objetivamente o que foi ajustado
antes de mexer em qualquer checkbox — sem descrição não há como saber quais
pendências fechar.

## Passo 1 — Ler a Spec e localizar Pendências Manuais

1. Leia o arquivo da Spec.
2. Verifique `**Status:**`. Se for `review`, avise que a Spec nunca chegou a
   ser implementada (não passou pelo gate de aprovação) e pare — `/recheck`
   não é o comando certo aqui.
3. Procure todo bloco no formato:

   ```markdown
   - [ ] <critério de aceite>
     > 🟡 Pendência Manual: <descrição>
     > Instrução: <ação esperada>
   ```

4. Liste cada um encontrado com sua tarefa/critério associado. Se não houver
   nenhum bloco `> 🟡 Pendência Manual:` na Spec inteira, avise que não há
   pendência manual registrada e pare — não há o que rechecar.

## Passo 2 — Cruzar com a descrição do usuário

Para cada Pendência Manual encontrada:

- A descrição do usuário **endereça claramente** esse item? → marque como
  **resolvida**.
- A descrição é **genérica** ("ajustei tudo", "resolvi as pendências") e há
  mais de uma pendência na Spec? Não marque nada por suposição. Faça **uma
  pergunta** listando os itens e peça confirmação de quais foram resolvidos.
- A descrição **não menciona** esse item e não é genérica? Mantenha como
  pendente.

Nunca marque `[x]` sem alguma correspondência explícita (mesmo que informal)
entre o que o usuário disse e o que a Instrução pedia — o mesmo princípio da
skill `verification`: sem evidência, não é `[x]`.

## Passo 3 — Aplicar as resoluções na Spec

Para cada item resolvido no Passo 2:

1. Marque o checkbox: `- [ ]` → `- [x]`.
2. Substitua o bloco de anotação por uma linha de evidência:

   ```markdown
   - [x] <critério de aceite>
     > ✅ Pendência Manual resolvida em <data atual> via /recheck: <resumo do que o usuário informou>
   ```

Para os itens que continuam pendentes, não toque no bloco original.

## Passo 4 — Verificar se a Spec pode fechar

Releia a Spec inteira (não só as Pendências Manuais processadas): confirme se
**todos** os checkboxes de **todas** as tarefas estão `[x]` e se não resta
nenhum bloco `> 🟡 Pendência Manual:` em aberto.

- Pode haver critérios não relacionados a pendência manual ainda não
  implementados (`/back`/`/front` nunca rodaram para eles, ou reportaram
  `não verificado`). Esses também bloqueiam o fechamento — não é papel do
  `/recheck` implementá-los, mas é papel dele **não fechar** a Spec com eles
  em aberto.

### 4a. Tudo fechado

1. Se o `product-backlog.md` tiver a TASK correspondente com `Status:
   in-progress`, altere para `done`.
2. Emita:

   ```
   ✅ Spec concluída: <caminho>
   Pendências manuais resolvidas nesta rechecagem: <lista ou "(nenhuma)">
   Próximo passo: rode /checkpoint para consolidar o estado e o changelog.
   ```

### 4b. Ainda falta algo

Não altere o `Status` da TASK. Emita:

```
⚠️ Spec ainda não fecha: <caminho>
Resolvidas nesta rechecagem: <lista ou "(nenhuma)">

Pendente:
- <critério> — <instrução original, reescrita de forma acionável>
- <critério sem implementação> — precisa passar por /back ou /front, não é pendência manual
```

## Regras

- Nunca marque `[x]` sem correspondência explícita com o que o usuário
  descreveu — igual ao gate de evidência da skill `verification`.
- Nunca implemente código ou rode comandos de verificação automática aqui —
  isso é trabalho de `/back`, `/front` ou `/hands-on`. `/recheck` só lida com
  o que já estava marcado como Pendência Manual (ação humana), mais a leitura
  final de fechamento.
- Nunca altere `Status: review` → `approved` (gate humano, fora do escopo
  deste comando) nem invente conteúdo de Spec que não esteja lá.

---

Argumento recebido (`$ARGUMENTS`): $ARGUMENTS
