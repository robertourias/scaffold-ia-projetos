# Prompt: Bootstrap Retroativo de Documentação

> Use este prompt em um projeto **existente** que ainda não usa o
> `scaffold-ia-projetos`, ou que usa parcialmente. Diferente do fluxo de
> "Migração" do README (que só reorganiza arquivos genéricos pra economizar
> tokens), este prompt **gera o conteúdo** de `docs/context/` e
> `docs/architecture/` a partir da análise real do código — não deixa
> placeholder pra você preencher depois.

Cole este documento inteiro no Claude Code (ou outra ferramenta agêntica),
rodando na raiz do projeto que você quer documentar.

---

Você é o PLANNER. Seu trabalho é fazer um bootstrap retroativo completo da
documentação deste projeto, seguindo a estrutura do `scaffold-ia-projetos`,
a partir da análise do código real. Não implemente nada, não corrija bugs,
não invente informação — apenas documente o que já existe, e marque com
`[INFERIDO — confirmar]` qualquer coisa que você não conseguir verificar
com confiança no código, no `package.json`, nos configs, ou no `git log`.

## Passo 0 — Preparação

1. Verifique se `docs/` já existe parcialmente. Se sim, **nunca sobrescreva**
   um arquivo já preenchido — pule e liste no resumo final.
2. Se você tiver acesso local ao repositório `scaffold-ia-projetos` (pergunte
   o caminho ao usuário se não foi informado), copie os arquivos **genéricos**
   de lá sem alteração:
   - `docs/skills/*.md` (planner, backend, frontend, quality, supabase — são
     papéis de agente, não específicos deste produto)
   - `docs/specs/spec-template.md`
   - `docs/workflows/feature-delivery.md`, `release-process.md`,
     `playbook-tokens-qualidade.md`
   - `docs/commands/*.md` e `docs/commands/README.md`
   - `docs/comparativo-scaffold-vs-superpowers.md`
   - `.claude/CLAUDE.md` (Claude Code) e/ou `AGENTS.md` (Cursor/Copilot/Codex)
   - **`.claude/commands/*.md`** — os shims que ativam os slash commands no
     Claude Code (`/init-project`, `/backlog`, `/spec`, `/back`, `/front`,
     `/review`, `/hands-on`, `/retomar`, `/checkpoint`, `/commit`). **Sem
     isso o projeto fica com a documentação em `docs/commands/` mas nenhum
     slash command funciona** — é o erro mais comum de um bootstrap
     incompleto. Cada shim é uma linha só, no formato:
     ```
     Leia docs/commands/<nome>.md e execute as instruções, substituindo $ARGUMENTS por: $ARGUMENTS
     ```
     (`checkpoint.md`, `retomar.md` e `commit.md` não recebem `$ARGUMENTS` —
     confira o texto exato de cada shim no repositório do scaffold antes de
     copiar).
3. Se não tiver acesso ao repositório do scaffold, gere esses arquivos
   seguindo fielmente a estrutura documentada no README do
   `scaffold-ia-projetos` (papéis, templates de spec, fases 0-7 de entrega) —
   eles são reutilizáveis entre projetos e não dependem deste código específico.
   Isso inclui gerar os shims de `.claude/commands/*.md` também — um por
   comando listado em `docs/commands/README.md`, seguindo o formato acima.
4. Crie as pastas: `docs/archive/`, `docs/context/domains/`, `docs/changelog/`.

## Passo 1 — `docs/context/product.md`

Leia `README.md`, `package.json` (name/description), rotas/páginas principais
e, se houver, qualquer doc de produto existente (Notion exportado, etc. — se
o usuário fornecer). Preencha:
- O que o produto faz (1-2 parágrafos)
- Quem são os usuários (inferido de nomes de entidades/rotas — ex: presença
  de `tenantId` sugere multi-tenant; rotas `/coach`/`/aluno` sugerem dois
  perfis de usuário)
- Regras de negócio de alto nível **apenas as que você conseguir confirmar**
  no código (validações, condicionais de domínio, constraints de banco)

Se o produto tiver múltiplos domínios de negócio grandes, fragmente em
`docs/context/domains/<dominio>.md` (ex: `auth.md`, `payments.md`) e deixe
`product.md` só com visão geral + links — não deixe um arquivo monolítico.

## Passo 2 — `docs/context/conventions.md`

Analise o código real (não assuma padrão de mercado) para inferir:
- Convenção de nomenclatura de arquivos/pastas observada
- Convenção de commits (leia `git log --oneline -30` — Conventional Commits?
  outro padrão?)
- Ordem de imports, uso de path aliases
- Padrões de branch, se identificáveis no histórico

## Passo 3 — `docs/context/decisions.md`

A partir de `package.json` (dependências reais), arquivos de config
(`next.config`, `nest-cli`, `docker-compose`, CI files) e estrutura de pastas,
liste as decisões técnicas já tomadas, organizadas por domínio (Backend,
Frontend, Infra, etc.), no mesmo estilo direto usado no scaffold — bullet
curto, sem prosa longa. Exemplo de formato:

```markdown
## Backend
### ORM e banco
- ORM: **[detectado]**
- Banco: **[detectado]** (hospedado em [detectado, se identificável])
```

Não invente justificativa que não está documentada em lugar nenhum — se não
houver como saber o "porquê" de uma escolha, registre só o "o quê".

## Passo 4 — `docs/context/ui-guidelines.md` (se houver frontend)

Leia o config do Tailwind (ou equivalente), variáveis CSS/design tokens, e a
biblioteca de componentes usada (`package.json`). Documente:
- Design tokens reais (cores, radius, tipografia) — não invente valores
- Biblioteca de componentes e ícones em uso
- Padrões de estado observados no código (loading/error/empty), se houver
  um padrão consistente identificável

Se o projeto usa uma ferramenta de design externa (Figma, Pencil.dev, etc.),
apenas referencie o arquivo/link — não tente reconstruir os tokens de lá.

## Passo 5 — `docs/architecture/overview.md`, `backend.md`, `frontend.md`, `infra.md`

- **overview.md**: tabela de stack (camada → tecnologia, real, não genérica),
  diagrama de fluxo de dados em texto, tabela de "Decisões registradas" com
  **datas reais inferidas do git log** (data do commit que introduziu cada
  peça — se não conseguir inferir, deixe em branco e sinalize), Bounded
  Contexts reais identificados na estrutura de pastas/módulos, e um `Status`
  que reflita o estado real do projeto (não copie "Desenvolvimento inicial"
  se o código já está avançado).
- **backend.md / frontend.md**: estrutura de camadas real (ex: Clean
  Architecture com pastas `domain/application/infrastructure/presentation`,
  ou outra que você observar), padrões de módulo, convenções específicas.
- **infra.md**: pipeline de CI/CD real (leia `.github/workflows/`), estratégia
  de deploy, variáveis de ambiente esperadas (`.env.example`), runbook básico
  se houver processo de deploy documentado em algum lugar do código/scripts.

## Passo 6 — `docs/specs/`

Não invente specs históricos. Em vez disso, gere **um único spec-baseline**:
`docs/specs/YYYY-MM-DD-baseline-retroativo.md` (data de hoje), usando
`spec-template.md`, com `Status: baseline (documentado retroativamente)`,
listando as features principais já implementadas como "Cenários de Usuário"
e "Requisitos Funcionais" — isso dá um ponto de partida legível sem fingir
que houve um processo de spec formal no passado. Mova este spec-baseline
direto para `docs/archive/` (não é uma spec em andamento).

## Passo 7 — `docs/context/current-state.md`

Preencha seguindo o formato do `/checkpoint`: resumo de progresso global,
resumo da última sessão (= "bootstrap de documentação retroativa realizado"),
próximos passos imediatos reais (baseado em TODOs no código, issues abertas,
ou lacunas óbvias), e "(nenhum)" nas seções sem conteúdo real.

## Passo 8 — `docs/changelog/`

Crie `docs/changelog/YYYY-MM-DD-bootstrap-documentacao.md` registrando que a
documentação retroativa foi gerada nesta data, a partir de qual commit
(`git rev-parse HEAD`), e um resumo do que foi criado.

## Passo 9 — Confirmar

Encerre com um resumo estruturado:

```
✅ Arquivos genéricos copiados/gerados: [lista]
✅ Slash commands ativos (.claude/commands/*.md): [lista ou ⚠️ pendente]
✅ docs/context/ preenchido: [arquivos]
✅ docs/architecture/ preenchido: [arquivos]
📋 docs/specs/ — baseline retroativo criado e arquivado
📌 Itens marcados [INFERIDO — confirmar]: [lista completa, por arquivo]
⏭ Próximo passo sugerido: revisar os itens marcados e rodar /init-project
  apenas se quiser reconduzir a entrevista de contexto do zero
```

## Regras gerais

- Precisão > completude. Prefira `[INFERIDO — confirmar]` a inventar uma
  regra de negócio, uma data, ou uma justificativa de decisão.
- Nunca sobrescreva um arquivo `docs/` já existente e preenchido — só
  complemente lacunas ou sinalize conflito.
- Este prompt documenta o presente do código, não reconstrói o histórico de
  decisões perdido — isso é aceitável e deve ser comunicado claramente no
  resumo final, não escondido atrás de datas inventadas.