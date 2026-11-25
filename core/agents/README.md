# Agents

Subagentes dos cinco papéis do harness. Cada um roda com **contexto próprio e
zerado** e devolve só um relatório denso à thread principal.

| Agente | Perfil de ferramentas | Modelo | Papel |
|--------|-----------------------|--------|-------|
| `backend` | leitura, busca, edição, terminal, skills | herdado | implementa tarefas de backend |
| `frontend` | leitura, busca, edição, terminal, skills | herdado | implementa tarefas de frontend |
| `reviewer` | leitura, busca, terminal, skills (**sem edição**) | herdado | revisa em dois estágios (Funcional → Qualidade) |
| `planner` | leitura, busca, edição, terminal, skills | herdado | escreve a Spec (o quê) ou o plano e as tarefas em ondas (como) |
| `runner` | leitura, busca, terminal (**sem edição**) | econômico (`haiku`/`flash`) | roda comandos verbosos (`test`, `build`, `lint`, `type-check`) e devolve só o resumo e erros relevantes |

## Por que subagente e não prompt inline

1. **Contexto isolado.** Uma onda com 3 tarefas paralelas custaria 3× o contexto na thread principal; um `npm test` + `build` despejaria milhares de linhas que seriam reenviadas em cada turno seguinte. Cada subagente absorve o ruído no próprio contexto descartável e devolve um relatório curto.
2. **Ferramentas como guardrail.** `reviewer` e `runner` não têm edição de arquivos — não é uma promessa no prompt, é impossível. Revisor que conserta o próprio achado perde a independência; executor de testes que edita código viola escopo.
3. **Paralelismo real.** Despachados numa só rodada, rodam ao mesmo tempo (ex.: tarefas sem colisão de `Arquivos:`, ou `lint` + `type-check` + testes unitários em paralelo).
4. **Custo proporcional.** `runner` usa modelo rápido/econômico porque executar comandos e filtrar saída de terminal é trabalho mecânico, não arquitetural.

## Regra de não-aninhamento

Quem despacha o `runner` é a **thread principal / orquestrador** (uso livre, `/jarvis-implement` Passo 6, `/jarvis-fix`, `/jarvis-converge`, `/jarvis-review`). Os subagentes implementadores (`backend` e `frontend`) já rodam em contexto isolado e descartável, então executam seus comandos de verificação diretamente (filtrados ao escopo alterado) e já devolvem só o recorte no relatório de retorno.

## Além dos 5 papéis — quando spawnar um subagente genérico

| Situação | Por quê vale o overhead |
|----------|--------------------------|
| Comandos verbosos na thread principal (`test`, `build`, `lint`, `type-check`) | Use o **`runner`** — contexto principal recebe só status, contagem e `arquivo:linha` das falhas |
| 2+ rotinas independentes sem escrita concorrente | Rodam em paralelo numa só rodada — tempo de parede menor e contextos isolados |
| Investigação ampla (múltiplos diretórios, monorepo, convenção desconhecida) | Contexto de exploração fica isolado; a thread principal recebe só a conclusão com caminhos |
| Necessidade de restringir ferramentas por segurança | Subagente sem edição de arquivos é garantia estrutural |

**Não vale a pena** para: comandos curtos (`git status`, `git diff --stat`, `ls`), 1 arquivo, 1 pergunta direta. Overhead de spawn é real — subagente errado desperdiça tokens em vez de economizar.

## Quem despacha

| Agente | Despachado por |
|--------|----------------|
| `planner` | `/jarvis-specify`, `/jarvis-plan` e `/jarvis-tasks`, quando o trabalho é grande o bastante para valer o contexto isolado; senão o comando roda inline com a skill `planner` |
| `backend` / `frontend` | `/jarvis-implement`, um por tarefa, conforme o campo `Agente:` do `tasks.md` |
| `reviewer` | `/jarvis-implement` (por onda e final), `/jarvis-review` e `/jarvis-converge` |
| `runner` | thread principal (uso avulso), `/jarvis-implement` (verificação final), `/jarvis-fix` (reprodução e verificação), `/jarvis-converge` e `/jarvis-review` (verificação da constituição) |

## Relação com as skills

Comandos (`jarvis-*`) e agentes convergem nas mesmas skills de papel (`backend`, `frontend`, `planner`, `quality`, `verification`) para evitar drift entre execução inline e subagente. O conteúdo canônico vive em `core/` no pacote `specnico` e o CLI projeta cada arquivo no formato da plataforma escolhida (`claude`, `copilot`, `gemini`).
