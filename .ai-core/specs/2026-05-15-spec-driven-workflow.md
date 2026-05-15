# Spec: Spec-Driven Workflow com Gate Humano

**Status:** approved
**Data:** 2026-05-15
**Autor:** Claude (brainstorm session)

---

## Problema

O fluxo de entrega atual (`feature-delivery.md`) começa diretamente no Plan — o planner.agent recebe um requisito e já decompõe em tarefas técnicas sem passar por uma fase de alinhamento de escopo e aprovação humana. Isso gera dois problemas recorrentes em projetos com agentes de IA:

1. **Planos criados sobre premissas não validadas**: o agente assume o escopo, e o humano descobre o desvio tarde — após código já escrito.
2. **Revisão de código com critérios misturados**: funcional e qualidade no mesmo checklist, sem ordem de prioridade, faz o reviewer perder tempo em styling quando há bugs lógicos presentes.

O objetivo é inserir uma fase de Spec com gate humano explícito antes do plan, e separar o checklist de revisão em dois estágios sequenciais.

---

## Cenários de Usuário

- **P1 (crítico):** Como desenvolvedor usando um agente de IA, quero que o agente pare e aguarde minha aprovação antes de criar o plano técnico, para que eu valide o escopo antes de qualquer implementação.
- **P1 (crítico):** Como reviewer, quero verificar primeiro se o código está correto funcionalmente antes de avaliar qualidade, para não perder tempo em convenções quando há bugs.
- **P2 (importante):** Como contribuidor novo ao projeto, quero encontrar um template de spec em `.ai-core/specs/` para saber o formato esperado ao descrever uma nova feature.
- **P2 (importante):** Como planner agent, quero ler um spec com status `approved` como entrada obrigatória, para que meu plano técnico esteja sempre ancorado em escopo validado.
- **P3 (nice-to-have):** Como tech lead, quero que specs anteriores fiquem em `.ai-core/specs/` como histórico de decisões de produto, para consulta futura.

---

## Requisitos Funcionais

- **FR-001:** O `feature-delivery.md` deve conter uma Fase 0 (Spec) que precede a Fase 1 (Plan), com gate explícito de aprovação humana entre as duas.
- **FR-002:** O `planner.agent.md` deve definir dois modos de operação mutuamente exclusivos: Modo Spec (sem spec aprovado) e Modo Plan (com spec aprovado), sem misturá-los.
- **FR-003:** No Modo Spec, o planner deve gerar `.ai-core/specs/YYYY-MM-DD-<topic>.md` com `status: draft` e parar — sem criar tasks nem API contracts.
- **FR-004:** No Modo Plan, o planner deve ler o spec aprovado como entrada obrigatória e rejeitar início de plan se `status` não for `approved`.
- **FR-005:** O `.ai-core/specs/` deve conter um `spec-template.md` com a estrutura híbrida (Problem Statement + User Scenarios + FR-NNN + Success Criteria + Risks).
- **FR-006:** O `reviewer.agent.md` deve separar o checklist em Estágio 1 (Funcional) e Estágio 2 (Qualidade), com regra explícita: bloqueador no Estágio 1 encerra a revisão antes do Estágio 2 começar.
- **FR-007:** Os severity labels existentes (🔴 BLOCKER, 🟡 WARNING, 🟢 SUGGESTION, 💡 NOTE) devem ser mantidos e aplicados dentro de cada estágio.
- **FR-008:** Todas as mudanças devem ser agnósticas de ferramenta — sem referências a Claude Code, GitHub Copilot ou qualquer agente específico.

---

## Critérios de Sucesso

- [ ] Um agente lendo `feature-delivery.md` sabe que não pode iniciar o plan sem um spec com `status: approved`
- [ ] O `planner.agent.md` descreve comportamento diferente para Modo Spec vs Modo Plan de forma que não há ambiguidade
- [ ] O `reviewer.agent.md` tem dois estágios nomeados e a regra de bloqueio do Estágio 1 está explícita
- [ ] `.ai-core/specs/spec-template.md` existe e contém todos os campos do formato híbrido
- [ ] Nenhum arquivo modificado referencia ferramenta específica (Claude, Copilot, etc.)

---

## Fora do Escopo

- Automação do gate (CI check, webhook, etc.) — o gate é inteiramente manual/textual nesta iteração
- Validação de formato do spec por script — o agente lê e interpreta o campo `status`
- Migração de features existentes para retroativamente ter specs — apenas novas features a partir desta mudança
- Alteração dos agents de backend, frontend ou dos arquivos de contexto/decisões

---

## Riscos e Premissas

- **Premissa:** Agentes que executam neste projeto leem `CLAUDE.md` → carregam `feature-delivery.md` → respeitam o fluxo definido. Se um agente ignorar `feature-delivery.md`, o gate não funciona.
- **Premissa:** O humano sabe que deve alterar `status: draft` → `status: approved` para desbloquear o plan. Isso deve estar documentado explicitamente no `spec-template.md` e no `planner.agent.md`.
- **Risco:** O planner pode "escorregar" para o Modo Plan mesmo sem spec aprovado se o requisito vier muito detalhado. Mitigação: a regra no `planner.agent.md` deve ser prescritiva — checar a existência do campo `status: approved` antes de qualquer decomposição.
- **Risco:** Dois estágios no reviewer podem fazer reviews mais longas se o reviewer sempre completar ambos mesmo com bloqueadores no Estágio 1. Mitigação: regra explícita de encerramento antecipado quando há 🔴 BLOCKER no Estágio 1.
