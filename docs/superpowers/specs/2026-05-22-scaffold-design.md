# Spec: Migração .ai-core/ → docs/ com Estrutura de Skills

**Status:** draft
**Data:** 2026-05-22
**Autor:** Claude (brainstorming colaborativo)

---

## Problema

O diretório `.ai-core/` funciona como memória de agente, mas tem três problemas:
1. Arquivos carregados indiscriminadamente aumentam o consumo de tokens sem necessidade
2. Conteúdo com TODO placeholders e seções genéricas não agrega contexto real
3. A separação entre "o que um agente É" (papel) e "o que um agente SABE FAZER" (skill) não existe — tudo misturado em `agents/`

---

## Cenários de Usuário

- **P1:** Como desenvolvedor adotando o scaffold, quero que o agente carregue apenas o contexto do papel que estou usando, para não desperdiçar tokens com arquivos irrelevantes.
- **P1:** Como desenvolvedor usando Obsidian, quero que `docs/` seja um vault válido, para editar a documentação viva diretamente no editor.
- **P2:** Como desenvolvedor, quero separar skills reutilizáveis de definições de papel, para compor comportamentos sem duplicar conteúdo.

---

## Requisitos Funcionais

- **FR-001:** Renomear `.ai-core/` para `docs/` e atualizar todas as referências em `.claude/CLAUDE.md` e `.claude/commands/`.
- **FR-002:** Criar `docs/skills/` com arquivos de comportamento reutilizável: `backend.md`, `frontend.md`, `quality.md`, `architecture.md`. Cada skill contém: padrões técnicos do projeto, checklist de implementação e critérios de qualidade — conteúdo que qualquer papel pode carregar sem duplicação.
- **FR-003:** Reescrever `docs/agents/*.md` para definir apenas papel, responsabilidades e quais skills carregar — sem duplicar regras técnicas.
- **FR-004:** Consolidar `decisions/frontend.md` + `decisions/backend.md` em `docs/context/decisions.md`.
- **FR-005:** Criar `docs/architecture/` com quatro arquivos: `overview.md`, `backend.md`, `frontend.md`, `infra.md`.
- **FR-006:** Criar `docs/changelog/` com `2026-05-22.md` e `releases.md`.
- **FR-007:** Criar `docs/commands/commit.md` com fluxo: atualiza current-state → changelog → architecture se mudou → commit.
- **FR-008:** Criar `AGENTS.md` na raiz com o mesmo conteúdo de carga por papel do CLAUDE.md, em formato agnóstico de ferramenta.
- **FR-009:** Atualizar `.claude/CLAUDE.md` para carga seletiva por papel, referenciando `docs/` em vez de `.ai-core/`.
- **FR-010:** Remover `.ai-core/decisions/` e `.ai-core/GLOSSARY.md` após migração.
- **FR-011:** Todos os arquivos `.md` compatíveis com Obsidian (sem frontmatter obrigatório, sem sintaxe proprietária).

---

## Critérios de Sucesso

- [ ] Nenhuma referência a `.ai-core/` permanece em arquivos rastreados pelo git
- [ ] `docs/` pode ser aberto como vault no Obsidian sem erros
- [ ] CLAUDE.md lista explicitamente quais arquivos cada papel carrega
- [ ] `docs/skills/` tem pelo menos 4 arquivos com conteúdo real (não placeholder)
- [ ] `docs/agents/*.md` não duplica regras que já estão em skills
- [ ] `docs/commands/commit.md` existe e descreve o fluxo completo
- [ ] `AGENTS.md` existe na raiz

---

## Fora do Escopo

- Criar conteúdo de produto real nos arquivos de contexto (architecture, product) — esses ficam com esqueleto mínimo funcional para o próximo projeto adotar
- Criar agents novos além dos que já existem (product-owner fica para depois)
- Integração com CI/CD ou automação de changelog

---

## Estrutura Final

```
scaffold-ia-projetos/
├── README.md
├── AGENTS.md
├── SPEC-PRINCIPAL.md
├── .claude/
│   ├── CLAUDE.md
│   └── commands/
└── docs/
    ├── context/
    │   ├── current-state.md
    │   ├── product.md
    │   ├── conventions.md
    │   ├── ui-guidelines.md
    │   └── decisions.md
    ├── architecture/
    │   ├── overview.md
    │   ├── backend.md
    │   ├── frontend.md
    │   └── infra.md
    ├── specs/
    │   └── spec-template.md
    ├── skills/
    │   ├── backend.md
    │   ├── frontend.md
    │   ├── quality.md
    │   └── architecture.md
    ├── agents/
    │   ├── planner.agent.md
    │   ├── reviewer.agent.md
    │   ├── backend.agent.md
    │   └── frontend.agent.md
    ├── workflows/
    │   ├── feature-delivery.md
    │   └── release-process.md
    ├── commands/
    │   ├── README.md
    │   ├── init-project.md
    │   ├── retomar.md
    │   ├── checkpoint.md
    │   ├── spec.md
    │   ├── plan.md
    │   ├── back.md
    │   ├── front.md
    │   ├── review.md
    │   └── commit.md
    └── changelog/
        ├── 2026-05-22.md
        └── releases.md
```

---

## Riscos e Premissas

- **Premissa:** O projeto não tem outros consumidores dos paths `.ai-core/` além dos arquivos em `.claude/`.
- **Risco:** Links quebrados entre arquivos de docs após renomeação → Mitigação: grep por `.ai-core/` em todo o repositório antes de finalizar.
- **Premissa:** Os arquivos de contexto de produto/arquitetura serão preenchidos por quem adotar o scaffold — o scaffold só provê o esqueleto.

---

<!-- 
GATE DE APROVAÇÃO
Altere Status de "draft" para "approved" para iniciar o plano de implementação.
-->
