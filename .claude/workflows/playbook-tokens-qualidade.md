# Playbook — Tokens × Qualidade

> Guia operacional de 1 página. Escolha o **modo** pela complexidade e risco da tarefa.

**Sistema padrão deste repo:** scaffold (`docs/` + comandos).

---

## Regra de ouro

1. Memória barata = **arquivo em disco** (`docs/`), não histórico de chat.
2. Um **orquestrador** por feature: `/hands-on` — nunca duas instâncias em paralelo na mesma Spec.
3. Spec com `Status: approved` (via `/approve`) antes de codar (exceto modo emergência).
4. Fechar sessão com `/checkpoint`; abrir com `/retomar`.

---

## Como escolher o modo

| Situação | Modo |
|----------|------|
| Feature típica, TASK clara, 1–5 arquivos | **Econômico** |
| Feature grande com ondas independentes | **Econômico** + `/hands-on` |
| Escopo ambíguo, UX/arquitetura em aberto, multi-subsistema | **Rigor** |
| Bug teimoso, “não sei por onde começar” | **Rigor** (debug) |
| Hotfix / prod quebrado / 1 linha óbvia | **Emergência** |
| PR crítico, auth, dinheiro, dados sensíveis | **Rigor** |

Na dúvida entre Econômico e Rigor: comece Econômico no `/spec`; se a entrevista revelar ambiguidade, suba para Rigor só na etapa de design.

---

## Modo Econômico (default — 80% do trabalho)

**Meta:** máximo de entrega por token, qualidade boa o suficiente.

```text
/retomar
/spec TASK0N | requisito
/approve docs/specs/YYYY-MM-DD-<topic>.md   # só humano
/back  … (batch 2–3 tarefas pequenas)   e/ou
/front … (batch)
# se a Spec tiver ondas com 2+ tarefas independentes:
/hands-on docs/specs/YYYY-MM-DD-<topic>.md
/review [diff]
/checkpoint
git commit
```

| Faça | Não faça |
|------|----------|
| Lazy load do papel (só skills do role) | Carregar todos os `docs/` sem necessidade |
| Batch de tarefas mecânicas | Um comando por checkbox minúsculo |
| Spec unificada (regras + plano) | Brainstorm + design + plan separados sem necessidade |
| Checkpoint comprimido | Colar sessão inteira no chat “pra lembrar” |
| `/hands-on` só com ondas reais | Orquestrar 1 tarefa sequencial com subagentes |
| `--no-review` quando as ondas são triviais e de baixo risco (a review final continua rodando) | Usar `--no-review` em toda Spec, sem avaliar o risco onda a onda |

**Checklist “estou economizando?”**

- [ ] Não li `product.md` inteiro em tarefa de CSS / estilo
- [ ] Agrupei 2–3 tarefas mecânicas no mesmo `/back` ou `/front`
- [ ] Usei `/hands-on` só se 2+ tarefas da onda forem independentes
- [ ] Não abri skill fora do papel atual "por precaução"
- [ ] `/checkpoint` antes de fechar

---

## Modo Rigor (alto risco / ambiguidade)

**Meta:** qualidade de engenharia e alinhamento — tokens secundários.

Mesmo conjunto de comandos do modo Econômico, usados com mais rigor em cada
fase: entrevista completa antes de codar, gate humano explícito, execução
sequencial quando o paralelismo é arriscado.

| Fase | O quê usar | Artefato canônico |
|------|------------|-------------------|
| Descoberta / ambiguidade | `/spec` — entrevista **uma pergunta por vez** até esgotar as dúvidas, sem pular para a geração | `docs/specs/YYYY-MM-DD-*.md` (`Status: review`) |
| Gate humano | `/approve` — valida rastreabilidade FR→tarefa, `Arquivos:` e Verificação antes de aprovar | Spec com `Status: approved` |
| Implementação controlada | `/hands-on --serial` — mantém a review por onda (padrão, até 3 rodadas de correção antes do commit) mas ignora as ondas e executa tudo em sequência | Spec com checkboxes e evidência de comando |
| Bug difícil | Reproduza antes de mexer; teste de regressão antes do fix | Teste de regressão + fix |
| Antes de "pronto" | skill `verification` — nenhum `[x]` sem evidência real de comando | Saída real de test/build |
| Review final | `/review` (Funcional → Qualidade) | Diff + critérios da Spec |
| Pós-ajuste manual | `/recheck` — fecha Pendências Manuais ou lista o que ainda falta | Spec com Pendências fechadas |

**Regras do modo Rigor**

- Não pule o gate humano — Spec só avança com `/approve` (`Status: approved`).
- Prefira `/hands-on --serial` a paralelo quando houver risco de colisão entre tarefas.
- TDD estrito e evidência de testes **obrigatórios** neste modo.

```text
# Exemplo rigor (ambiguidade → implementação controlada)
/spec  (entrevista uma pergunta por vez → docs/specs/… Status: review)
/approve docs/specs/…   # humano confirma
/hands-on docs/specs/… --serial
/review
/checkpoint
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
1. Reproduzir o bug (ou descrever o one-liner)
2. Fix mínimo + teste de regressão se houver harness
3. /review no diff (não pule se auth/pagamentos)
4. Commit focado
5. /groom ou /spec depois se o fix revelar dívida / feature incompleta
6. /checkpoint
```

| Faça | Não faça |
|------|----------|
| Escopo mínimo | “Já que estou aqui, refatoro o módulo” |
| Documentar no checkpoint o que ficou de fora | Esquecer e nunca specar a dívida |
| Subir para Econômico/Rigor se o fix crescer | Continuar em emergência por dias |

Se em 15 minutos o fix não está claro → **saia da emergência** e mude para o modo Rigor (`/spec` + `/approve` + `/hands-on --serial`).

---

## Mapa rápido de comandos scaffold

| Comando | Modo típico |
|---------|-------------|
| `/retomar` | Todo início de sessão |
| `/spec` | Econômico e Rigor |
| `/approve` | Rigor (gate humano explícito) |
| `/back` `/front` | Econômico (batch) |
| `/hands-on` | Econômico ampliado / Rigor (`--serial`) |
| `/review` | Todos (obrigatório em Rigor e em emergência sensível) |
| `/recheck` | Pós-ajuste manual, fecha Pendência Manual |
| `/checkpoint` | Todo fim de sessão |
| `/groom` | Feature nova sem reprocessar backlog inteiro |
| `/backlog` | Início de produto / replan |

---

## Anti-padrões caros

1. Carregar todos os skills do scaffold no mesmo turno “por precaução”.
2. Brainstorm informal para “adicionar um campo no form” em vez de ir direto ao `/spec`.
3. Um subagente por checkbox de 2 minutos.
4. Duas instâncias de `/hands-on` rodando ao mesmo tempo na mesma Spec.
5. Sessão longa sem checkpoint → próximo chat redescobre o mundo.
6. Implementar com `Status: review` ainda na Spec (sem passar por `/approve`).

---

## Decisão em 10 segundos

```text
Ambíguo ou crítico?  → Rigor
Prod quebrado / 1 fix óbvio? → Emergência (depois regularize)
Senão → Econômico
```
