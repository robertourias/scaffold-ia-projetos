# Agents

Subagentes dos quatro papéis do scaffold. Cada um roda com **contexto próprio e
zerado** e devolve só um relatório à thread principal.

| Agente | Ferramentas | Papel |
|--------|-------------|-------|
| `backend` | Read, Write, Edit, Grep, Glob, Bash | implementa tarefas de backend |
| `frontend` | Read, Write, Edit, Grep, Glob, Bash | implementa tarefas de frontend |
| `reviewer` | Read, Grep, Glob, Bash | revisa em dois estágios — **sem Edit/Write** |
| `planner` | Read, Write, Edit, Grep, Glob, Bash | gera Spec + plano em ondas |

## Por que subagente e não prompt inline

1. **Contexto isolado.** Uma onda com 3 tarefas paralelas custaria 3× o contexto na thread principal. Cada subagente carrega só o do seu papel e devolve um relatório curto.
2. **Ferramentas como guardrail.** `reviewer` não tem `Edit` nem `Write` — não é uma promessa no prompt, é impossível. Revisor que conserta o próprio achado perde a independência do parecer.
3. **Paralelismo real.** Despachados numa só rodada, rodam ao mesmo tempo.

## Quem despacha

`/hands-on` (Passo 3) despacha `backend` e `frontend` por tarefa, conforme o
campo `Agente` da Spec. `/spec` e `/review` podem rodar inline ou delegar a
`planner` / `reviewer`, conforme o tamanho do trabalho.

Para tarefa pequena e avulsa, `/back` e `/front` inline continuam mais baratos —
não há ganho em pagar o overhead de um subagente para uma edição de 2 arquivos.

## Relação com `docs/commands/`

`docs/commands/*.md` é a fonte **agnóstica de ferramenta** (serve Cursor,
Copilot, Codex). `.claude/agents/*.md` é a materialização em subagente do Claude
Code. Os dois descrevem o mesmo papel.

Para evitar drift, o conteúdo que precisa ser idêntico foi extraído para arquivos
únicos que ambos leem:

- `docs/skills/<papel>.md` — papel e padrões
- `docs/skills/verification.md` — o que significa "pronto"
- `docs/context/guardrails.md` — limites invioláveis

Ao editar um papel, mude o arquivo em `docs/skills/`. Só mexa aqui e em
`docs/commands/` se a mudança for de **fluxo**, não de conteúdo — e então mude
nos dois.

## Convenções ao escrever um agente novo

- `description` em aspas se contiver `:` — senão o YAML quebra em silêncio e a descrição vira o corpo do arquivo.
- A descrição diz **quando usar**, não só o que faz — é por ela que a delegação escolhe o agente.
- `model: inherit` salvo motivo concreto para fixar outro.
- Comece o corpo lembrando que o contexto está zerado e listando o que ler.
- Termine com um formato de **relatório de retorno**: a saída volta para um orquestrador, não para o usuário. Denso, não conversacional.
