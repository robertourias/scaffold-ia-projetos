# Playbook — Tokens × Qualidade

> Guia operacional de 1 página. Escolha o **modo** pela complexidade e risco da tarefa.  
> Comparativo completo scaffold vs Superpowers: [`docs/comparativo-scaffold-vs-superpowers.md`](../comparativo-scaffold-vs-superpowers.md)

**Sistema padrão deste repo:** scaffold (`docs/` + comandos).  
**Superpowers:** ferramentas sob demanda — nunca default em todo turno.

---

## Regra de ouro

1. Memória barata = **arquivo em disco** (`docs/`), não histórico de chat.
2. Um **orquestrador** por feature: `/hands-on` **ou** Superpowers SDD — nunca os dois.
3. Spec com `Status: approved` antes de codar (exceto modo emergência).
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
# humano: Status → approved
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
| Lazy load do papel (só skills do role) | Carregar todos os `docs/` e Superpowers |
| Batch de tarefas mecânicas | Um comando por checkbox minúsculo |
| Spec unificada (regras + plano) | Brainstorm + design + plan separados sem necessidade |
| Checkpoint comprimido | Colar sessão inteira no chat “pra lembrar” |
| `/hands-on` só com ondas reais | Orquestrar 1 tarefa sequencial com subagentes |

**Checklist “estou economizando?”**

- [ ] Não li `product.md` inteiro em tarefa de CSS / estilo
- [ ] Agrupei 2–3 tarefas mecânicas no mesmo `/back` ou `/front`
- [ ] Usei `/hands-on` só se 2+ tarefas da onda forem independentes
- [ ] Superpowers **não** entrou nesta sessão (ou só verification pontual)
- [ ] `/checkpoint` antes de fechar

---

## Modo Rigor (alto risco / ambiguidade)

**Meta:** qualidade de engenharia e alinhamento — tokens secundários.

Use trechos do Superpowers **por fase**, mantendo o artefato canônico no scaffold.

| Fase | O quê usar | Artefato canônico |
|------|------------|-------------------|
| Descoberta | Superpowers `brainstorming` (1 pergunta por vez, 2–3 abordagens) | Depois **traduzir** para `docs/specs/YYYY-MM-DD-*.md` |
| Plano detalhado (10+ tarefas, risco de drift) | Superpowers `writing-plans` **ou** plano de ondas na Spec scaffold | Preferir **uma** Spec scaffold se o time já trabalha com ela; plan Superpowers só se precisar de código por step |
| Implementação | `/hands-on` **ou** Superpowers `subagent-driven-development` | Spec/plan com checkboxes |
| Bug difícil | Superpowers `systematic-debugging` | Reprodução + teste de regressão |
| Antes de “pronto” | Superpowers `verification-before-completion` | Saída real de test/build |
| Review final | `/review` + (opcional) Superpowers code-review | Diff + critérios da Spec |

**Regras do modo Rigor**

- Não pule o gate humano (`Status: approved`).
- Não rode SDD e `/hands-on` na mesma feature.
- Após brainstorm Superpowers, **não** deixe o design só em `docs/superpowers/` se o time usa scaffold — copie o essencial para `docs/specs/`.
- TDD estrito e evidência de testes **obrigatórios** neste modo.

```text
# Exemplo rigor (ambiguidade → implementação controlada)
brainstorming (Superpowers) → aprovar design
/spec  (consolidar em docs/specs/… Status: review)
# humano: approved
/hands-on docs/specs/…   # ou SDD se plano Superpowers
/review
verification-before-completion
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

Se em 15 minutos o fix não está claro → **saia da emergência** e use `systematic-debugging` (Rigor).

---

## Superpowers — quando puxar (e quando não)

| Skill Superpowers | Quando | Quando **não** |
|-------------------|--------|----------------|
| `brainstorming` | Escopo ambíguo, várias abordagens válidas | TASK clara no backlog |
| `writing-plans` | Plano com muitos steps e risco de drift | Spec scaffold com ondas já suficiente |
| `subagent-driven-development` | Feature grande, review por tarefa vale o custo | 2–3 tarefas batch no `/back` |
| `systematic-debugging` | Bug sem causa óbvia | Typo / null óbvio |
| `test-driven-development` | Comportamento novo crítico | Config/chore sem lógica |
| `verification-before-completion` | Antes de dizer “pronto” / merge | — (quase sempre barato e útil) |
| `using-superpowers` full auto | Evitar neste repo como default | — |

---

## Mapa rápido de comandos scaffold

| Comando | Modo típico |
|---------|-------------|
| `/retomar` | Todo início de sessão |
| `/spec` | Econômico e Rigor |
| `/back` `/front` | Econômico (batch) |
| `/hands-on` | Econômico ampliado / Rigor leve |
| `/review` | Todos (obrigatório em Rigor e em emergência sensível) |
| `/checkpoint` | Todo fim de sessão |
| `/groom` | Feature nova sem reprocessar backlog inteiro |
| `/backlog` | Início de produto / replan |

---

## Anti-padrões caros

1. Carregar Superpowers + todos os skills do scaffold no mesmo turno “por precaução”.
2. Brainstorm formal para “adicionar um campo no form”.
3. Um subagente por checkbox de 2 minutos.
4. Dois orquestradores (hands-on + SDD) na mesma Spec.
5. Sessão longa sem checkpoint → próximo chat redescobre o mundo.
6. Implementar com `Status: review` ainda na Spec.

---

## Decisão em 10 segundos

```text
Ambíguo ou crítico?  → Rigor
Prod quebrado / 1 fix óbvio? → Emergência (depois regularize)
Senão → Econômico
```
