# Playbook — Tokens × Qualidade

> Guia operacional de 1 página. Escolha o **modo** pela complexidade e risco da tarefa.

**Sistema padrão deste repo:** specnico (`.specify/` + `specs/` + comandos `/jarvis-*`).

---

## Regra de ouro

1. Memória barata = **arquivo em disco** (`.specify/memory/`, `specs/`), não histórico de chat.
2. Estado ativo = `.specify/state.json`: todo comando o lê ao começar e mostra a fase — não há "retomar" nem "checkpoint".
3. Um **orquestrador** por Spec: `/jarvis-implement` — nunca duas instâncias em paralelo na mesma Spec.
4. Spec com `Status: approved` (confirmada pelo humano no `/jarvis-implement`) antes de codar (exceto modo emergência).

---

## Como escolher o modo

| Situação | Modo |
|----------|------|
| Item do backlog claro, 1–5 arquivos | **Econômico** |
| Spec grande com ondas independentes | **Econômico** + `/jarvis-implement` paralelo |
| Escopo ambíguo, UX/arquitetura em aberto, multi-subsistema | **Rigor** |
| Bug teimoso, “não sei por onde começar” | **Rigor** (`/jarvis-fix`) |
| Hotfix / prod quebrado / 1 linha óbvia | **Emergência** |
| PR crítico, auth, dinheiro, dados sensíveis | **Rigor** |

Na dúvida entre Econômico e Rigor: comece Econômico no `/jarvis-specify`; se
aparecerem `[NEEDS CLARIFICATION]`, suba para Rigor com `/jarvis-clarify` e
`/jarvis-analyze`.

---

## Modo Econômico (default — 80% do trabalho)

**Meta:** máximo de entrega por token, qualidade boa o suficiente.

```text
/jarvis-specify Bnn | requisito
/jarvis-plan
/jarvis-tasks
/jarvis-implement      # pede a aprovação humana; todas as ondas, ou Tnnn[,Tnnn] para um lote
/jarvis-converge       # fecha Pendências e conclui (done)
```

| Faça | Não faça |
|------|----------|
| Delegar `test`, `build`, `lint` e `type-check` na thread principal ao subagente `runner` (modelo econômico) | Rodar suítes e builds verbosos inline, poluindo o contexto principal com milhares de linhas |
| Disparar 2+ subagentes em paralelo na mesma rodada para rotinas/verificações independentes | Rodar em série checagens ou buscas que não compartilham recurso mutável |
| Lazy load do papel (só skills do role) | Carregar toda a `.specify/memory/` sem necessidade |
| Lote de tarefas mecânicas (`/jarvis-implement T003,T004`) | Um comando por checkbox minúsculo |
| Pular `/jarvis-clarify` e `/jarvis-analyze` quando a Spec está limpa | Rodar todos os passos opcionais por hábito |
| Confiar no `state.json` para saber o que está ativo | Varrer `specs/` ou colar a sessão inteira no chat “pra lembrar” |
| Paralelismo só com ondas reais e sem disputa de recurso mutável (`dist`/`.next`/DB) | Orquestrar 1 tarefa trivial com subagente ou paralelizar 2 builds na mesma pasta |
| `--no-review` quando as ondas são triviais e de baixo risco (a review final continua rodando) | Usar `--no-review` em toda Spec, sem avaliar o risco onda a onda |

**Checklist “estou economizando?”**

- [ ] Comandos verbosos (`test`/`build`/`lint`/`type-check`) rodaram no `runner` e só o resumo voltou ao contexto principal
- [ ] Não li `product.md` inteiro em tarefa de CSS / estilo
- [ ] Agrupei tarefas mecânicas num só `/jarvis-implement Tnnn,Tnnn`
- [ ] Disparei em paralelo tudo que é independente e sem disputa de recurso mutável
- [ ] Não abri skill fora do papel atual "por precaução"

---

## Modo Rigor (alto risco / ambiguidade)

**Meta:** qualidade de engenharia e alinhamento — tokens secundários.

Mesmos comandos do modo Econômico, mais os passos opcionais e execução
controlada.

| Fase | O quê usar | Artefato canônico |
|------|------------|-------------------|
| Descoberta / ambiguidade | `/jarvis-specify` + `/jarvis-clarify` (até 5 perguntas, uma por vez) | `spec.md` (`Status: review`, `## Clarificações`) |
| Consistência | `/jarvis-analyze` — spec ↔ plan ↔ tasks ↔ constituição | relatório (somente leitura) |
| Gate humano | `/jarvis-implement` — análise + checagens sintáticas e confirmação do humano antes de aprovar (`--dry-run` só mostra as checagens) | `spec.md` com `Status: approved` |
| Implementação controlada | `/jarvis-implement --serial` — mantém a review por onda (até 3 rodadas) mas executa em sequência | `tasks.md` com checkboxes e evidência |
| Bug difícil | `/jarvis-fix` — teste que reproduz antes do fix | `specs/bugs/NNN-slug.md` |
| Antes de "pronto" | skill `verification` — nenhum `[x]` sem evidência real de comando | Saída real de test/build |
| Review avulsa | `/jarvis-review` (Funcional → Qualidade) | Diff + critérios da Spec |
| Pós-ajuste manual | `/jarvis-converge` — fecha Pendências Manuais ou acrescenta tarefas | `tasks.md` `## Convergência` |

**Regras do modo Rigor**

- Não pule o gate humano — a Spec só vira `approved` com a sua confirmação no `/jarvis-implement`.
- Prefira `--serial` a paralelo quando houver risco de colisão entre tarefas.
- TDD estrito e evidência de testes **obrigatórios** neste modo.

```text
# Exemplo rigor (ambiguidade → implementação controlada)
/jarvis-specify Bnn
/jarvis-clarify
/jarvis-plan
/jarvis-tasks
/jarvis-analyze
/jarvis-implement --serial   # humano confirma o gate
/jarvis-converge
```

---

## Modo Emergência (exceção controlada)

**Meta:** destravar produção ou correção óbvia com blast radius mínimo.

**Permitido sem Spec completa** apenas se:

- Hotfix localizado (tipicamente 1–3 arquivos), **ou**
- Correção trivial com causa raiz já conhecida, **ou**
- Bloqueio que impede qualquer outro trabalho

```text
# mínimo viável
/jarvis-fix "<sintoma>"    # reprodução → correção mínima → verificação → registro
/jarvis-review             # não pule se auth/pagamentos
/jarvis-specify <texto>       # depois, se o fix revelar dívida / feature incompleta
```

| Faça | Não faça |
|------|----------|
| Escopo mínimo | “Já que estou aqui, refatoro o módulo” |
| Registrar em `specs/bugs/` o que ficou de fora | Esquecer e nunca specar a dívida |
| Subir para Econômico/Rigor se o fix crescer | Continuar em emergência por dias |

Se em 15 minutos o fix não está claro → **saia da emergência** e mude para o
modo Rigor (`/jarvis-specify` + `/jarvis-plan` + `/jarvis-tasks` + `/jarvis-implement --serial`).

---

## Mapa rápido de comandos

| Comando | Modo típico |
|---------|-------------|
| `/jarvis-constitution` | Início de produto / replanejamento (emenda) |
| `/jarvis-specify` | Econômico e Rigor |
| `/jarvis-clarify` | Rigor, ou Spec com `[NEEDS CLARIFICATION]` |
| `/jarvis-plan` | Econômico e Rigor |
| `/jarvis-tasks` | Econômico e Rigor |
| `/jarvis-analyze` | Rigor |
| `/jarvis-implement` | Econômico (paralelo) / Rigor (`--serial`); contém o gate humano |
| `/jarvis-converge` | Fim de toda Spec; pós-ajuste manual |
| `/jarvis-review` | Todos (obrigatório em Rigor e em emergência sensível) |
| `/jarvis-fix` | Bugs e emergência |

---

## Anti-padrões caros

1. Rodar `npm test`, `build`, `lint` ou `type-check` verbosos direto na thread principal em vez de despachar o subagente `runner`.
2. Carregar todos os skills do harness no mesmo turno “por precaução”.
3. Brainstorm informal para “adicionar um campo no form” em vez de ir direto ao `/jarvis-specify`.
4. Um subagente por comando curto de 1 linha (`git status`, `ls`) ou checkbox de 2 minutos.
5. Duas instâncias de `/jarvis-implement` rodando ao mesmo tempo na mesma Spec.
6. Editar o `state.json` à mão sem conferir o Status do `spec.md`.
7. Implementar com `Status: review` ainda na Spec (sem passar pelo gate do `/jarvis-implement`).

---

## Decisão em 10 segundos

```text
Ambíguo ou crítico?  → Rigor
Prod quebrado / 1 fix óbvio? → Emergência (depois regularize)
Senão → Econômico
```
