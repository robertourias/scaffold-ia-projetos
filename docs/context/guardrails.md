# Guardrails

> **Status do arquivo:** vazio — preenchido pelo Bloco 6 do `/init-project`.
>
> Limites que **nenhum agente pode cruzar** neste projeto. Diferente de
> `conventions.md` (como escrever código) e `decisions.md` (o que escolhemos),
> este arquivo diz **o que é proibido** e **o que precisa passar antes de dizer "pronto"**.
>
> Carregado por **todos** os papéis, em **toda** tarefa. Mantenha curto —
> se passar de ~60 linhas, algo aqui é convenção disfarçada de guardrail.

---

## 1. Comandos de verificação (obrigatórios)

Estes comandos definem "pronto". Nenhuma tarefa é concluída — nem checkbox de
Critério de Aceite marcado `[x]` — sem que eles passem, com a saída real colada
na resposta.

| Verificação | Comando | Quando rodar |
|-------------|---------|--------------|
| Type-check | `<!-- TODO: ex. npx tsc --noEmit -->` | toda tarefa que toca `.ts`/`.tsx` |
| Lint | `<!-- TODO: ex. npm run lint -->` | toda tarefa que toca código |
| Testes | `<!-- TODO: ex. npm run test -->` | toda tarefa com lógica |
| Build | `<!-- TODO: ex. npm run build -->` | antes de release |

> Se um comando ainda não existe no projeto, escreva `(não configurado)` —
> nunca invente um comando que não roda.

Parte disso é automatizada por `.claude/hooks/` (lint por arquivo editado,
type-check no fim do turno). O hook é a rede de segurança; a tabela acima
continua sendo a definição de "pronto" que o agente precisa satisfazer e
**evidenciar** — testes, em particular, nenhum hook roda por você.

---

## 2. Caminhos protegidos

Nunca editar sem pedido explícito do humano:

- `<!-- TODO: ex. migrations já aplicadas em produção -->`
- `<!-- TODO: ex. .github/workflows/ -->`
- `<!-- TODO: ex. infra/terraform/ -->`

Nunca ler, nunca imprimir no chat, nunca commitar:

- `.env` e variantes (exceto `.env.example`)
- chaves privadas (`*.pem`, `*.key`, `id_rsa*`)
- `<!-- TODO: outros caminhos de segredo deste projeto -->`

---

## 3. Operações proibidas

Bloqueadas em `.claude/settings.json` (`permissions.deny`) e reafirmadas aqui
porque a lista de permissões não cobre todo caminho possível:

- `git push --force`, `git reset --hard`, `git clean -fd` — destroem trabalho não commitado
- reset/drop de banco fora de ambiente local descartável (ex: `prisma migrate reset`)
- `npm publish` e equivalentes
- desabilitar hook de commit (`--no-verify`) ou regra de lint sem comentário justificando
- `<!-- TODO: operações específicas deste produto -->`

---

## 4. Regras de negócio invioláveis

Regras cuja violação corrompe dados ou quebra contrato com o usuário.
Fonte: `docs/context/product.md` / `docs/context/domains/`.

- **GR-001:** `<!-- TODO: ex. invoice nunca é deletada, apenas anulada -->`
- **GR-002:** `<!-- TODO: ex. valor monetário sempre em inteiro de centavos, nunca float -->`

> Toda regra recebe ID para que Specs e Critérios de Aceite possam citá-la
> (`Cobre: GR-001`).

---

## 5. Escalar ao humano — parar e perguntar

Pare a execução e pergunte antes de prosseguir quando a tarefa envolver:

- alteração em fluxo de autenticação ou autorização
- migration destrutiva (`DROP`, `ALTER ... DROP COLUMN`) ou em tabela grande
- breaking change em contrato de API já publicado
- nova dependência de runtime ou serviço externo
- qualquer coisa que mova dinheiro ou exponha dado pessoal
- `<!-- TODO: gatilhos específicos deste produto -->`

---

## 6. Gate de Spec

- Implementação só começa com Spec em `Status: approved`.
- **Somente humano** altera `review` → `approved`. Agente que alterar esse campo
  está violando o gate — se a Spec parece pronta, avise e pare.
- Agente marca `[x]` num Critério de Aceite **apenas** com evidência de verificação
  (seção 1) na mesma resposta.
- **Mecânico, não só honra:** `.claude/hooks/spec-gate.mjs` bloqueia edição de
  código enquanto a Spec declarada em `**Spec ativo:**`
  (`docs/context/current-state.md`) estiver `Status: review`. Depende desse
  campo estar atualizado — `/spec` o atualiza ao gerar a Spec.
