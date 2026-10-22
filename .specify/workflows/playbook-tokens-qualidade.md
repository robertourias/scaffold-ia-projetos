# Playbook — Tokens × Qualidade

> Guia operacional de 1 página. Escolha o **modo** pela complexidade e risco da tarefa.

**Sistema padrão deste repo:** specnico (`.specify/` + `specs/` + comandos `/specnico-*`).

---

## Regra de ouro

1. Memória barata = **arquivo em disco** (`.specify/memory/`, `specs/`), não histórico de chat.
2. Estado ativo = `.specify/state.json`: todo comando o lê ao começar e mostra a fase — não há "retomar" nem "checkpoint".
3. Um **orquestrador** por Spec: `/specnico-implement` — nunca duas instâncias em paralelo na mesma Spec.
4. Spec com `Status: approved` (via `/specnico-approve`, só humano) antes de codar (exceto modo emergência).

---

## Como escolher o modo

| Situação | Modo |
|----------|------|
| Item do backlog claro, 1–5 arquivos | **Econômico** |
| Spec grande com ondas independentes | **Econômico** + `/specnico-implement` paralelo |
| Escopo ambíguo, UX/arquitetura em aberto, multi-subsistema | **Rigor** |
| Bug teimoso, “não sei por onde começar” | **Rigor** (`/specnico-fix`) |
| Hotfix / prod quebrado / 1 linha óbvia | **Emergência** |
| PR crítico, auth, dinheiro, dados sensíveis | **Rigor** |

Na dúvida entre Econômico e Rigor: comece Econômico no `/specnico-spec`; se
aparecerem `[NEEDS CLARIFICATION]`, suba para Rigor com `/specnico-clarify` e
`/specnico-analyze`.

---

## Modo Econômico (default — 80% do trabalho)

**Meta:** máximo de entrega por token, qualidade boa o suficiente.

```text
/specnico-spec Bnn | requisito
/specnico-plan
/specnico-approve        # só humano
/specnico-implement      # todas as ondas; ou Tnnn[,Tnnn] para um lote
/specnico-converge       # fecha Pendências e conclui (done)
```

| Faça | Não faça |
|------|----------|
| Lazy load do papel (só skills do role) | Carregar toda a `.specify/memory/` sem necessidade |
| Lote de tarefas mecânicas (`/specnico-implement T003,T004`) | Um comando por checkbox minúsculo |
| Pular `/specnico-clarify` e `/specnico-analyze` quando a Spec está limpa | Rodar todos os passos opcionais por hábito |
| Confiar no `state.json` para saber o que está ativo | Varrer `specs/` ou colar a sessão inteira no chat “pra lembrar” |
| Paralelismo só com ondas reais | Orquestrar 1 tarefa sequencial com subagentes |
| `--no-review` quando as ondas são triviais e de baixo risco (a review final continua rodando) | Usar `--no-review` em toda Spec, sem avaliar o risco onda a onda |

**Checklist “estou economizando?”**

- [ ] Não li `product.md` inteiro em tarefa de CSS / estilo
- [ ] Agrupei tarefas mecânicas num só `/specnico-implement Tnnn,Tnnn`
- [ ] Paralelismo só onde a onda tem 2+ tarefas independentes
- [ ] Não abri skill fora do papel atual "por precaução"

---

## Modo Rigor (alto risco / ambiguidade)

**Meta:** qualidade de engenharia e alinhamento — tokens secundários.

Mesmos comandos do modo Econômico, mais os passos opcionais e execução
controlada.

| Fase | O quê usar | Artefato canônico |
|------|------------|-------------------|
| Descoberta / ambiguidade | `/specnico-spec` + `/specnico-clarify` (até 5 perguntas, uma por vez) | `spec.md` (`Status: review`, `## Clarificações`) |
| Consistência | `/specnico-analyze` — spec ↔ plan ↔ tasks ↔ constituição | relatório (somente leitura) |
| Gate humano | `/specnico-approve` — análise + checagens sintáticas antes de aprovar | `spec.md` com `Status: approved` |
| Implementação controlada | `/specnico-implement --serial` — mantém a review por onda (até 3 rodadas) mas executa em sequência | `tasks.md` com checkboxes e evidência |
| Bug difícil | `/specnico-fix` — teste que reproduz antes do fix | `specs/bugs/NNN-slug.md` |
| Antes de "pronto" | skill `verification` — nenhum `[x]` sem evidência real de comando | Saída real de test/build |
| Review avulsa | `/specnico-review` (Funcional → Qualidade) | Diff + critérios da Spec |
| Pós-ajuste manual | `/specnico-converge` — fecha Pendências Manuais ou acrescenta tarefas | `tasks.md` `## Convergência` |

**Regras do modo Rigor**

- Não pule o gate humano — Spec só avança com `/specnico-approve`.
- Prefira `--serial` a paralelo quando houver risco de colisão entre tarefas.
- TDD estrito e evidência de testes **obrigatórios** neste modo.

```text
# Exemplo rigor (ambiguidade → implementação controlada)
/specnico-spec Bnn
/specnico-clarify
/specnico-plan
/specnico-analyze
/specnico-approve              # humano confirma
/specnico-implement --serial
/specnico-converge
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
/specnico-fix "<sintoma>"    # reprodução → correção mínima → verificação → registro
/specnico-review             # não pule se auth/pagamentos
/specnico-spec <texto>       # depois, se o fix revelar dívida / feature incompleta
```

| Faça | Não faça |
|------|----------|
| Escopo mínimo | “Já que estou aqui, refatoro o módulo” |
| Registrar em `specs/bugs/` o que ficou de fora | Esquecer e nunca specar a dívida |
| Subir para Econômico/Rigor se o fix crescer | Continuar em emergência por dias |

Se em 15 minutos o fix não está claro → **saia da emergência** e mude para o
modo Rigor (`/specnico-spec` + `/specnico-approve` + `/specnico-implement --serial`).

---

## Mapa rápido de comandos

| Comando | Modo típico |
|---------|-------------|
| `/specnico-constitution` | Início de produto / replanejamento (emenda) |
| `/specnico-spec` | Econômico e Rigor |
| `/specnico-clarify` | Rigor, ou Spec com `[NEEDS CLARIFICATION]` |
| `/specnico-plan` | Econômico e Rigor |
| `/specnico-analyze` | Rigor |
| `/specnico-approve` | Todos (gate humano) |
| `/specnico-implement` | Econômico (paralelo) / Rigor (`--serial`) |
| `/specnico-converge` | Fim de toda Spec; pós-ajuste manual |
| `/specnico-review` | Todos (obrigatório em Rigor e em emergência sensível) |
| `/specnico-fix` | Bugs e emergência |

---

## Anti-padrões caros

1. Carregar todos os skills do harness no mesmo turno “por precaução”.
2. Brainstorm informal para “adicionar um campo no form” em vez de ir direto ao `/specnico-spec`.
3. Um subagente por checkbox de 2 minutos.
4. Duas instâncias de `/specnico-implement` rodando ao mesmo tempo na mesma Spec.
5. Editar o `state.json` à mão sem conferir o Status do `spec.md`.
6. Implementar com `Status: review` ainda na Spec (sem passar por `/specnico-approve`).

---

## Decisão em 10 segundos

```text
Ambíguo ou crítico?  → Rigor
Prod quebrado / 1 fix óbvio? → Emergência (depois regularize)
Senão → Econômico
```
