# Agents

Subagentes dos quatro papéis do scaffold. Cada um roda com **contexto próprio e
zerado** e devolve só um relatório à thread principal.

| Agente | Ferramentas | Papel |
|--------|-------------|-------|
| `backend` | Read, Write, Edit, Grep, Glob, Bash, Skill | implementa tarefas de backend |
| `frontend` | Read, Write, Edit, Grep, Glob, Bash, Skill | implementa tarefas de frontend |
| `reviewer` | Read, Grep, Glob, Bash, Skill | revisa em dois estágios — **sem Edit/Write** |
| `planner` | Read, Write, Edit, Grep, Glob, Bash, Skill | gera Spec + plano em ondas |

Todos têm `Skill` para invocar o papel compartilhado com o comando equivalente
(ver "Relação com `.claude/commands/`" abaixo).

## Por que subagente e não prompt inline

1. **Contexto isolado.** Uma onda com 3 tarefas paralelas custaria 3× o contexto na thread principal. Cada subagente carrega só o do seu papel e devolve um relatório curto.
2. **Ferramentas como guardrail.** `reviewer` não tem `Edit` nem `Write` — não é uma promessa no prompt, é impossível. Revisor que conserta o próprio achado perde a independência do parecer.
3. **Paralelismo real.** Despachados numa só rodada, rodam ao mesmo tempo.

## Além dos 4 papéis — quando spawnar um subagente genérico

Os 4 agentes acima são fixos (papel definido, sempre os mesmos). Fora deles,
a thread principal também pode despachar um subagente genérico (`general-purpose`
ou equivalente) — não só para `/back`/`/front`/`/review`/`/spec`. Vale a pena
quando:

| Situação | Por quê vale o overhead |
|----------|--------------------------|
| 2+ tarefas independentes, sem dependência entre si | Rodam em paralelo numa só rodada — tempo de parede menor, e nenhuma pisa no contexto da outra |
| Investigação ampla (múltiplos diretórios, convenção desconhecida) | Contexto de exploração fica isolado; a thread principal recebe só a conclusão, não os resultados brutos da busca |
| Necessidade de restringir ferramentas por segurança | Subagente sem `Edit`/`Write` é garantia estrutural, não instrução seguida por confiança |

**Não vale a pena** para: 1 arquivo, 1 pergunta, qualquer coisa que a thread
principal resolve no mesmo tempo que levaria para escrever o prompt de
delegação. Overhead de spawn (novo contexto, recarregar skills) é real —
subagente errado desperdiça tokens em vez de economizar.

Para orquestração de múltiplas etapas com checkpoints de revisão humana, ou
quando o Superpowers estiver disponível no projeto, considere também
`superpowers:subagent-driven-development` e
`superpowers:dispatching-parallel-agents` em vez de reinventar o
despacho manualmente — ver `.claude/workflows/playbook-tokens-qualidade.md`.

## Quem despacha

`/hands-on` (Passo 3) despacha `backend` e `frontend` por tarefa, conforme o
campo `Agente` da Spec. `/spec` e `/review` podem rodar inline ou delegar a
`planner` / `reviewer`, conforme o tamanho do trabalho.

Para tarefa pequena e avulsa, `/back` e `/front` inline continuam mais baratos —
não há ganho em pagar o overhead de um subagente para uma edição de 2 arquivos.

## Relação com `.claude/commands/`

`.claude/commands/back.md` e `.claude/agents/backend.md` descrevem o mesmo
papel em dois modos de execução: comando roda **inline** na thread atual
(barato, para tarefa pequena e avulsa); agente roda em **subagente**
(contexto isolado, para tarefas paralelas em `/hands-on`). O mesmo par existe
para `front` / `frontend`.

Para evitar drift entre os dois modos, o conteúdo que precisa ser idêntico foi
extraído para skills próprias, que ambos invocam:

- skill `backend` / `frontend` / `planner` / `quality` — papel e padrões (`.claude/skills/<papel>/SKILL.md`)
- skill `verification` — o que significa "pronto" (`.claude/skills/verification/SKILL.md`)
- `docs/context/guardrails.md` — limites invioláveis (dado do projeto, não skill — cada projeto preenche o seu)

Ao mudar o **papel** (o que um backend deve fazer, como revisar), edite a
skill correspondente — comando e agente puxam dela e ficam sincronizados sem
duplicação. Só edite o comando e o agente separadamente quando a mudança for
de **fluxo de execução** (como o comando resolve escopo, como o agente reporta
de volta ao orquestrador) — aí sim são coisas diferentes por natureza.

## Convenções ao escrever um agente novo

- `description` em aspas se contiver `:` — senão o YAML quebra em silêncio e a descrição vira o corpo do arquivo.
- A descrição diz **quando usar**, não só o que faz — é por ela que a delegação escolhe o agente.
- `model: inherit` salvo motivo concreto para fixar outro.
- Comece o corpo lembrando que o contexto está zerado e listando o que ler.
- Termine com um formato de **relatório de retorno**: a saída volta para um orquestrador, não para o usuário. Denso, não conversacional.
