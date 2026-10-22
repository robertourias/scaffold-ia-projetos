# Agents

Subagentes dos quatro papéis do harness. Cada um roda com **contexto próprio e
zerado** e devolve só um relatório à thread principal.

| Agente | Ferramentas | Papel |
|--------|-------------|-------|
| `backend` | Read, Write, Edit, Grep, Glob, Bash, Skill | implementa tarefas de backend |
| `frontend` | Read, Write, Edit, Grep, Glob, Bash, Skill | implementa tarefas de frontend |
| `reviewer` | Read, Grep, Glob, Bash, Skill | revisa em dois estágios — **sem Edit/Write** |
| `planner` | Read, Write, Edit, Grep, Glob, Bash, Skill | escreve a Spec (o quê) ou o plano e as tarefas em ondas (como) |

Todos têm `Skill` para invocar o papel compartilhado com os comandos
`specnico-*` (ver "Relação com as skills" abaixo).

## Por que subagente e não prompt inline

1. **Contexto isolado.** Uma onda com 3 tarefas paralelas custaria 3× o contexto na thread principal. Cada subagente carrega só o do seu papel e devolve um relatório curto.
2. **Ferramentas como guardrail.** `reviewer` não tem `Edit` nem `Write` — não é uma promessa no prompt, é impossível. Revisor que conserta o próprio achado perde a independência do parecer.
3. **Paralelismo real.** Despachados numa só rodada, rodam ao mesmo tempo.

## Além dos 4 papéis — quando spawnar um subagente genérico

Os 4 agentes acima são fixos (papel definido, sempre os mesmos). Fora deles,
a thread principal também pode despachar um subagente genérico (`general-purpose`
ou equivalente) — não só dentro dos comandos `specnico-*`. Vale a pena quando:

| Situação | Por quê vale o overhead |
|----------|--------------------------|
| 2+ tarefas independentes, sem dependência entre si | Rodam em paralelo numa só rodada — tempo de parede menor, e nenhuma pisa no contexto da outra |
| Investigação ampla (múltiplos diretórios, convenção desconhecida) | Contexto de exploração fica isolado; a thread principal recebe só a conclusão, não os resultados brutos da busca |
| Necessidade de restringir ferramentas por segurança | Subagente sem `Edit`/`Write` é garantia estrutural, não instrução seguida por confiança |

**Não vale a pena** para: 1 arquivo, 1 pergunta, qualquer coisa que a thread
principal resolve no mesmo tempo que levaria para escrever o prompt de
delegação. Overhead de spawn (novo contexto, recarregar skills) é real —
subagente errado desperdiça tokens em vez de economizar.

## Quem despacha

| Agente | Despachado por |
|--------|----------------|
| `planner` | `/specnico-spec` (Spec) e `/specnico-plan` (plano e tarefas), quando o trabalho é grande o bastante para valer o contexto isolado; senão o comando roda inline com a skill `planner` |
| `backend` / `frontend` | `/specnico-implement`, um por tarefa, conforme o campo `Agente:` do `tasks.md` |
| `reviewer` | `/specnico-implement` (por onda e final), `/specnico-review` e `/specnico-converge` |

Não há comando para implementar uma tarefa avulsa inline: use
`/specnico-implement Tnnn`. Bugs vão pelo `/specnico-fix`, que roda inline
com a skill `backend` ou `frontend`.

## Relação com as skills

Comandos (`.claude/skills/specnico-*`) e agentes descrevem o mesmo papel em
dois modos de execução: o comando roda **inline** na thread atual e orquestra;
o agente roda em **subagente** (contexto isolado, para tarefas paralelas e
pareceres independentes).

Para evitar drift entre os dois modos, o conteúdo que precisa ser idêntico foi
extraído para skills de papel, que ambos invocam:

- skill `backend` / `frontend` / `planner` / `quality` — papel e padrões (`.claude/skills/<papel>/SKILL.md`)
- skill `verification` — o que significa "pronto" (`.claude/skills/verification/SKILL.md`)
- `.specify/memory/constitution.md` — limites invioláveis e comandos de verificação (dado do projeto, não skill — cada projeto preenche o seu)

Ao mudar o **papel** (o que um backend deve fazer, como revisar), edite a
skill correspondente — comando e agente puxam dela e ficam sincronizados sem
duplicação. Só edite o comando e o agente separadamente quando a mudança for
de **fluxo de execução** (como o comando resolve a Spec alvo, como o agente
reporta de volta ao orquestrador) — aí sim são coisas diferentes por natureza.

## Convenções ao escrever um agente novo

- `description` em aspas se contiver `:` — senão o YAML quebra em silêncio e a descrição vira o corpo do arquivo.
- A descrição diz **quando usar**, não só o que faz — é por ela que a delegação escolhe o agente.
- `model: inherit` salvo motivo concreto para fixar outro.
- Comece o corpo lembrando que o contexto está zerado e listando o que ler.
- Termine com um formato de **relatório de retorno**: a saída volta para um orquestrador, não para o usuário. Denso, não conversacional.
