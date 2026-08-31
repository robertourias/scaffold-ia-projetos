# Conventions

> Decisões específicas de padrão deste projeto. Naming básico (PascalCase para tipos, camelCase para variáveis, snake_case para DB) segue os defaults da comunidade TypeScript/React/SQL — aqui ficam apenas desvios e decisões explícitas.

## Arquivos & Diretórios

```
kebab-case/          diretórios e a maioria dos arquivos
PascalCase.tsx       componentes React
kebab-case.spec.ts   testes backend
PascalCase.test.tsx  testes frontend
```

## TypeScript — decisões do projeto

- `IPrefix` para interfaces — **somente na camada de domínio** (ex: `IUsersRepository`). Nunca em application layer ou frontend.
- `_prefixPrivate` para campos privados de classe no backend (onde `#private` quebra injeção de dependência).
- Named exports preferred — default exports apenas para pages e layouts do Next.js.
- Evite `as` para type casting — use type predicates para narrowing em runtime.

## Ordem de imports

```ts
// 1. Node built-ins
// 2. Pacotes externos
// 3. Pacotes internos do monorepo (@packages/*)
// 4. Imports absolutos da aplicação (@/)
// 5. Imports relativos
```

## API Endpoints

```
/resources           plural nouns para coleções
/resources/:id       recurso único
/resources/:id/sub   recursos aninhados
kebab-case           paths com múltiplas palavras (/user-profiles)
```

## Git & PRs

- Branches: `feat/` `fix/` `chore/` `refactor/` `docs/`
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`)
- PRs: manter abaixo de 400 linhas — features grandes viram PRs sequenciais

### Protocolo de Checkpoint (obrigatório)

Antes de encerrar a sessão de trabalho ou ao concluir marcos importantes:

1. **Executar `/checkpoint`** — para atualizar a memória persistente (`docs/context/current-state.md` e o changelog correspondente) e comprimir o contexto.
2. **Commit manual** — inclua no seu commit do Git os arquivos de documentação atualizados por esta etapa junto com os arquivos de código.

Não pule este protocolo para manter a IA sempre sintonizada com o estado real do projeto.

## Documentação em Monorepo (apps/packages)

Em projeto monorepo, **toda documentação vive em `docs/` na raiz** — nunca
dentro de `apps/<app>/` ou `packages/<pkg>/`. Código e documentação não se
misturam. O que muda por escopo é o **subdiretório dentro de `docs/`**, não a
raiz onde ela é gerada. Não duplique conteúdo entre níveis — cada fato mora
em exatamente um lugar.

**`docs/` raiz, sem subpasta de escopo — nível monorepo:**
- Visão do produto como um todo, decisões que atravessam apps/packages, infraestrutura compartilhada, lista de projetos (`docs/architecture/overview.md`, seção "Projetos do Monorepo"), guardrails e constituição globais, changelog (`docs/changelog/`, sempre único para o monorepo inteiro, mesmo com `$SCOPE`).
- Specs de feature que tocam mais de um app/package, ou que não pertencem a nenhum específico.
- **Comando rodado sem `$SCOPE`** (manutenção geral, sem app/package informado) → atualiza a documentação **global** aqui, mesmo que o código tocado esteja dentro de um app/package. Antes de escrever, verifique se o que está sendo documentado é cross-cutting (fica na raiz) ou específico de um projeto identificável pelos arquivos alterados (nesse caso, infira o `$SCOPE` e documente em `docs/$SCOPE/`, avisando qual local foi escolhido).

**`docs/$SCOPE/` (ex: `docs/apps/api/`, `docs/packages/ui/`) — nível do app/package:**
- Mesma árvore da raiz, só que dentro do subdiretório do projeto: `context/decisions.md`, `context/current-state.md`, `context/backlog.md`, `architecture/backend.md` ou `architecture/frontend.md`, `specs/`, `archive/`.
- Decisões e specs que só fazem sentido dentro daquele app/package (ex: uma decisão de cache que só existe na API).
- **Não recrie** `guardrails.md`, `constitution.md`, `product.md` ou `changelog/` dentro de `docs/$SCOPE/` — esses são sempre globais, na raiz de `docs/`.
- Não precisa ser criado antecipadamente: `/spec`, `/back`, `/front`, `/review`, `/retomar` e `/checkpoint` criam os arquivos em `docs/$SCOPE/` na primeira vez que geram algo com aquele escopo, exatamente como fariam na raiz.
- **Nunca crie `apps/<app>/docs/` ou `packages/<pkg>/docs/`** — documentação dentro da pasta de código do projeto se perde do índice central e não é o que este scaffold espera. Se encontrar uma dessas pastas (harness antigo), veja `.claude/prompts/upgrade-harness.md` para migrar o conteúdo para `docs/$SCOPE/`.

**Regra de conflito:** decisão em `docs/$SCOPE/context/decisions.md` sobrepõe a equivalente em `docs/context/decisions.md` só dentro daquele escopo — não é uma decisão nova para o monorepo inteiro.

**`docs/$SCOPE/README.md` — índice do projeto:**
- Um `README.md` dentro da própria pasta de escopo (`docs/apps/<nome>/README.md` ou `docs/packages/<nome>/README.md`).
- Conteúdo mínimo: propósito em 1-2 frases, stack (só se diferir da tabela geral do overview), link para os subdiretórios locais (`context/`, `architecture/`, `specs/`).
- **Criado automaticamente** por `/spec`, `/back`, `/front` ou `/checkpoint` na primeira vez que rodam com aquele `$SCOPE`, se o arquivo ainda não existir — mesmo gatilho que já cria `docs/$SCOPE/`.
- A tabela "Projetos do Monorepo" em `docs/architecture/overview.md` linka para este README na coluna "Docs próprios".

Template mínimo (`docs/apps/<nome>/README.md` ou `docs/packages/<nome>/README.md`):

```markdown
# <nome>

**Tipo:** app | package compartilhado
**Propósito:** [uma frase]
**Stack:** [só liste o que diferir da tabela geral em docs/architecture/overview.md]

Docs locais (specs, decisions, arquitetura): nesta mesma pasta —
`context/`, `architecture/`, `specs/`.
```

**Economia de contexto:** ao trabalhar com `$SCOPE` informado, leia o "sempre carregado" da raiz (guardrails, constitution) **mais** os arquivos equivalentes de `docs/$SCOPE/`, se existirem. Nunca leia `docs/<outro-scope>/` de um app/package diferente do que está em foco — isso é contexto que não serve à tarefa e só custa tokens.

## Backlog em Monorepo

Produto com mais de um projeto (ex: web, api, bff) pode ter tarefas que
pertencem a um projeto só e tarefas que exigem mudança em vários ao mesmo
tempo. Critério de colocação — decidido por `/backlog` e `/groom` no momento
em que a tarefa é criada, não depois:

- **Toca 1 projeto só** → `docs/apps/<nome>/context/backlog.md` ou
  `docs/packages/<nome>/context/backlog.md`. IDs prefixados pelo nome do
  projeto em maiúsculas: `API-TASK01`, `WEB-TASK03`, `UI-TASK02`. Numeração
  independente por arquivo.
- **Toca 2+ projetos** (ex: feature que muda web, api e bff juntos) →
  `docs/context/product-backlog.md` (root), sem prefixo (`TASK01`, `TASK02`,
  ...), com uma coluna **"Projetos"** listando todos os escopos envolvidos.
  Gera **uma única TASK** — não duplique a mesma feature nos backlogs de
  escopo; o fan-out por projeto acontece dentro do Plano de Implementação
  quando `/spec` roda sobre essa TASK (ondas por `Agente`/arquivo, convenção
  já usada pelo `/hands-on`).

Dependência entre tarefas de arquivos diferentes referencia o ID completo na
coluna Dependências (ex: `API-TASK05` dependendo do root `TASK02`).

`/spec $SCOPE TASKXX` já resolve o `$SCOPE` do mesmo jeito que resolve para
specs e decisions — sem escopo lê o backlog root, com escopo lê
`docs/$SCOPE/context/backlog.md`.

## Comentários

- Comente o **POR QUÊ**, não o QUÊ — o código mostra o quê; comentários explicam restrições ocultas e regras de negócio não-óbvias.
- TSDoc apenas para APIs públicas de pacotes compartilhados.

## Linting

- ESLint: configurado em `packages/config/eslint`
- Prettier + Husky + lint-staged rodam no commit
- CI bloqueia merge se lint ou type-check falhar
- Nunca desabilite regras de ESLint sem comentário explicando o motivo
