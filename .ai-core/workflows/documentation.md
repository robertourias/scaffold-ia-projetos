# Documentation Workflow

> Convenções para manter a documentação técnica sincronizada com o código.  
> **Gatilho:** executar após cada push ou merge para `main`.

---

## Estrutura de documentação por app

```
apps/<app-name>/docs/
├── CHANGELOG.md          ← histórico versionado de todas as mudanças
└── features/
    └── <feature-name>.md ← um arquivo por feature significativa
```

**Regra de localização:**
- Documentação de um app específico → dentro de `apps/<app-name>/docs/`
- Feature que cruza dois ou mais apps → `docs/` na raiz do monorepo
- Contexto para agentes de IA → `.ai-core/` (não duplicar aqui)

---

## Após push / merge para `main`

### 1. Para cada **nova feature** entregue

Criar ou atualizar `docs/features/<feature-name>.md` com:

```markdown
# Feature: <Nome>

**Status:** Live | In Progress | Deprecated
**Data:** YYYY-MM-DD
**Spec:** .ai-core/specs/<arquivo>.md  ← se existir

## O que é
[1-2 parágrafos descrevendo o propósito e o valor para o usuário]

## Arquitetura / Arquivos
[Tabela ou diagrama dos arquivos envolvidos e suas responsabilidades]

## Decisões de implementação
[Por quê escolhemos esta abordagem — o que seria diferente e por quê não]

## Variáveis de ambiente
[Tabela de env vars necessárias, onde configurar, se obrigatórias]

## Limitações conhecidas
[O que ficou fora do escopo e pode ser evoluído]
```

### 2. Atualizar `CHANGELOG.md`

Mover os itens da seção `[Unreleased]` para uma entrada versionada:

```markdown
## [X.Y.Z] — YYYY-MM-DD

### Adicionado
- Descrição da feature (link para docs/features/<feature>.md)

### Alterado
- O que mudou em features existentes

### Corrigido
- Bugs corrigidos

### Removido
- O que foi deletado
```

**Convenção de versão (semver simplificado):**

| Mudança | Versão |
|---------|--------|
| Nova feature visível ao usuário | Minor (0.X.0) |
| Bug fix, ajuste de UX, refactor | Patch (0.0.X) |
| Redesign, mudança breaking de API | Major (X.0.0) |

### 3. Para **bug fixes** e **melhorias menores**

Não exigem arquivo em `docs/features/`. Basta atualizar o `CHANGELOG.md` na seção `[Unreleased]` com uma linha descritiva.

### 4. Para **remoção de código**

Registrar no `CHANGELOG.md` em `### Removido` com o motivo. Se o código removido tinha doc em `features/`, marcar o arquivo com `**Status:** Removed` em vez de deletá-lo — histórico importa.

---

## Checklist pós-merge

```
- [ ] Nova feature → docs/features/<nome>.md criado ou atualizado
- [ ] CHANGELOG.md → [Unreleased] atualizado com o que mudou
- [ ] Env vars novas → adicionadas ao .env.example com instrução de preenchimento
- [ ] Se for release → [Unreleased] movido para versão com data
- [ ] Se feature cruzar apps → doc criada em docs/ na raiz do monorepo
```

---

## Referências

- Formato de CHANGELOG: `apps/web-nico.dev.br/docs/CHANGELOG.md`
- Exemplo de feature doc: `apps/web-nico.dev.br/docs/features/ai-chat-widget.md`
- Workflow de release: `.ai-core/workflows/release-process.md`
- Workflow de entrega: `.ai-core/workflows/feature-delivery.md`
