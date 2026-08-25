# Comparativo: Scaffold (`docs/` + comandos) vs Superpowers

> Objetivo: avaliar **economia de tokens** e **qualidade do processo** ao codar com este scaffold versus a lib Superpowers.  
> Playbook operacional (modos econômico / rigor / emergência): [`.claude/workflows/playbook-tokens-qualidade.md`](workflows/playbook-tokens-qualidade.md)

---

## Em uma frase

| Sistema | O que é |
|--------|---------|
| **Este scaffold** | Sistema de **produto + papéis** (planner / back / front / review) com memória em `docs/`, lazy load e fluxo de entrega do monorepo |
| **Superpowers** | Sistema de **processo genérico** (brainstorm → plano detalhado → TDD → subagentes + review por tarefa) para qualquer codebase |

São camadas diferentes: o scaffold carrega **o que** construir e **como o time trabalha neste repo**; Superpowers impõe **como o agente deve se comportar** em qualquer repo.

---

## Fluxos lado a lado

```text
SCAFFOLD (este projeto)
init-project → backlog → /spec → ⛔ Status: approved → /hands-on | /back | /front → /review → /checkpoint
                           (spec + plano unificados num arquivo)

SUPERPOWERS
brainstorm (gate) → design doc → writing-plans (plano com código) → SDD ou executing-plans
  → implementer por tarefa → reviewer por tarefa → review final → finishing-branch
```

| Etapa | Scaffold | Superpowers |
|-------|----------|-------------|
| Descoberta | 1 pergunta por vez no `/spec` (pula se backlog/TASK já clara) | Brainstorm **obrigatório** em qualquer trabalho criativo (hard gate) |
| Spec + plano | **Um** doc (`docs/specs/…`) com regras + ondas | Design em `docs/superpowers/specs/` **depois** plano separado com **código completo por step** |
| Implementação | `/back` `/front` (batch) ou `/hands-on` (ondas paralelas) | Subagent **fresco** por tarefa + **review** após cada uma |
| Memória entre sessões | `/checkpoint` + `/retomar` (estado comprimido) | Ledger SDD + git; menos “produto”, mais “branch em andamento” |
| Qualidade | Review em 2 estágios + skills de papel | TDD iron law + verification-before-completion + review per task |
| Escopo | Stack do monorepo (Next / Nest, Clean Architecture) | Agnóstico de stack |

---

## Economia de tokens

### Carga de instruções (ordem de grandeza)

Medições aproximadas no ambiente do scaffold (markdown ~4 chars/token):

| Carga | Scaffold | Superpowers |
|-------|----------|-------------|
| Skills/comandos no total | ~61 KB (~15k tokens se tudo entrasse de uma vez) | ~331 KB (~85k tokens se tudo) |
| Skill/comando “pesado” típico | `hands-on` ~1.2k tok; `/back` + skill + conventions ~2.7k tok no 1º load | `subagent-driven-development` ~5.4k tok; `brainstorming` ~2.6k; TDD skill completa bem maior |
| Padrão de leitura | **Lazy**: “já li nesta conversa → não releia” | **Must invoke** se ~1% de chance se aplicar — tende a puxar processo completo |

### Design consciente de tokens no scaffold

1. **Lazy loading** explícito em `back`, `front`, `spec`, `review`
2. **Papéis estreitos** — backend não carrega `ui-guidelines`; review só carrega o que o diff pede
3. **Batching** — várias tarefas pequenas numa resposta
4. **Planejamento unificado** — spec + plano no mesmo arquivo (menos turns)
5. **Checkpoint comprimido** — `current-state.md` enxuto; detalhe no changelog/spec
6. **Respostas curtas** no planner (“não repita regras, aplique”)
7. **`/hands-on`** empurra orquestração para subagente — protege o contexto da sessão principal

### Onde Superpowers custa caro (de propósito)

1. **Brainstorm + 2–3 abordagens + seções aprovadas** — muitos turns antes de código
2. **Planos com código completo** por step — plano grande = tokens na escrita e na re-leitura
3. **SDD**: implementer + reviewer **por tarefa** + loops de fix — qualidade alta, custo multiplicado
4. **Handoff por arquivo** (task-brief, review-package) — isola contexto, mas adiciona turns de tooling
5. **Auto-ativação** (“se 1% aplicar, use”) — risco de over-process em tarefa trivial

**Resumo tokens:** no dia a dia de feature no monorepo, o **scaffold gasta bem menos**. Superpowers **compra qualidade com tokens e turns** — especialmente no design e no review por tarefa.

---

## Qualidade do processo

| Dimensão | Scaffold | Superpowers |
|----------|----------|-------------|
| Gate humano | Forte: `Status: approved` antes de codar | Forte: aprovação de design **e** da spec escrita |
| Alinhamento ao produto | **Alto** — `product.md`, backlog, decisions, architecture | **Baixo** sozinho — não conhece o domínio Nest/Next do repo |
| Disciplina de implementação | Boa se a spec estiver clara; testes “junto”, não iron law | **Máxima** — TDD + verification + review por task |
| Detecção de desvio da spec | Review no fim (e checkboxes na Spec) | Review **após cada tarefa** + review da branch |
| Debugging | Depende do agente + skills de domínio | `systematic-debugging` estruturado |
| Over-engineering do processo | Baixo/médio | Alto se seguir tudo em tarefas pequenas |
| Risco de “código sem spec” | Baixo se o fluxo for seguido | Muito baixo (hard gates) |
| Risco de “processo sem domínio” | Baixo | Alto se usar só Superpowers neste repo |

**Qualidade de produto** (decisões certas, stack correta): scaffold.  
**Qualidade de engenharia** (TDD, prova, review isolado): Superpowers tem teto mais alto.

---

## Quando cada um brilha

### Prefira só o scaffold quando…

- Feature típica do monorepo (CRUD, tela, use case, migration)
- Backlog já existe e a TASK é clara
- Quer **máximo de features por custo de tokens**
- Precisa **retomar sessão** barato (`/retomar` + `current-state`)
- Trabalha com **escopo** `apps/X` / `packages/Y`
- Spec boa + batch de tarefas pequenas é suficiente

### Prefira Superpowers (ou trechos) quando…

- Problema **ambíguo** ou multi-subsistema → `brainstorming`
- Bug **difícil** → `systematic-debugging`
- Plano grande e risco de drift → `writing-plans` + `subagent-driven-development`
- Precisa **forçar** TDD e evidência de verificação
- Revisão de PR / branch crítica → code-review + `verification-before-completion`

### Evite

| Evitar | Por quê |
|--------|---------|
| Superpowers full stack em todo commit | Estoura tokens sem ganho proporcional |
| Scaffold sem `/spec` / sem approval | Volta a “vibe code” com papéis de fantasia |
| Carregar todas as `.claude/skills` + todos os Superpowers no mesmo turn | Pior dos dois mundos |
| SDD + `/hands-on` ao mesmo tempo sem regra | Dois orquestradores, contexto e git confusos |

---

## Modelo híbrido (recomendado)

Use o **scaffold como sistema operacional do projeto** e Superpowers como **ferramentas sob demanda**:

```text
Memória + domínio + papéis  =  scaffold (sempre)
Processo genérico pesado    =  Superpowers (só quando o risco justificar)
```

| Situação | Receita |
|----------|---------|
| ~80% do trabalho diário | `/spec` → approve → `/back`/`/front` (batch) → `/review` → `/checkpoint` |
| Feature grande, tarefas independentes | Spec com ondas + `/hands-on` |
| Feature ambígua / UX / arquitetura | Superpowers `brainstorming` → traduzir para `docs/specs/` |
| Bug teimoso | `systematic-debugging` |
| “Terminei, confio” sem rodar testes | `verification-before-completion` |
| Plano de 10+ tarefas com risco de drift | SDD **ou** hands-on — **um** orquestrador |

**Regra de ouro:** a memória barata é **arquivo em disco** (`docs/`), não histórico de chat.

Detalhamento dos modos **Econômico / Rigor / Emergência**:  
[`.claude/workflows/playbook-tokens-qualidade.md`](workflows/playbook-tokens-qualidade.md)

---

## Scorecard (tokens ↓ + qualidade ↑)

| Critério | Scaffold | Superpowers | Vencedor p/ meta tokens+qualidade sustentável |
|----------|:--------:|:-----------:|:---------------------------------------------:|
| Tokens por feature típica | ★★★★★ | ★★☆☆☆ | Scaffold |
| Qualidade de processo genérico | ★★★☆☆ | ★★★★★ | Superpowers |
| Qualidade alinhada ao produto | ★★★★★ | ★★☆☆☆ | Scaffold |
| Retomada de sessão | ★★★★★ | ★★★☆☆ | Scaffold |
| Parallelismo com controle | ★★★★☆ (`/hands-on`) | ★★★★☆ (SDD + parallel agents) | Empate / scaffold mais barato |
| Disciplina TDD/verificação | ★★★☆☆ | ★★★★★ | Superpowers |
| Overkill em tarefa pequena | Baixo | Alto | Scaffold |
| Portabilidade p/ outro repo | Média (precisa do monorepo/docs) | Alta | Superpowers |

### Veredito

- **Produtividade sustentável em produto real:** scaffold como default; Superpowers pontual.
- **Máxima qualidade de engenharia a qualquer custo de tokens:** Superpowers full (brainstorm → plan com código → SDD).
- **Híbrido:** melhor custo/benefício para a maioria dos times que usam este scaffold.

---

## Checklist rápido “estou economizando bem?”

- [ ] Não li `product.md` inteiro em tarefa de CSS
- [ ] Spec tem ondas; usei `/hands-on` só se 2+ tarefas independentes
- [ ] Agrupei 2–3 tarefas mecânicas no mesmo `/back` ou `/front`
- [ ] Fiz `/checkpoint` antes de fechar; comecei com `/retomar`
- [ ] Superpowers só se: ambiguidade, bug hard, ou feature de alto risco
- [ ] Um orquestrador por feature (hands-on **ou** SDD)

---

## Referências neste repo

| Recurso | Caminho |
|---------|---------|
| Playbook operacional | [`.claude/workflows/playbook-tokens-qualidade.md`](workflows/playbook-tokens-qualidade.md) |
| Comandos | [`.claude/README.md`](README.md) |
| Entrega de feature | [`.claude/workflows/feature-delivery.md`](workflows/feature-delivery.md) |
| Papéis (skills) | [`.claude/skills/`](skills/) |
| README do scaffold | [`README.md`](../README.md) |
