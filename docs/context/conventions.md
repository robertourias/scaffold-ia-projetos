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

Em projeto monorepo, `docs/` tem dois níveis. Não duplique conteúdo entre eles — cada fato mora em exatamente um lugar.

**`docs/` na raiz — nível monorepo:**
- Visão do produto como um todo, decisões que atravessam apps/packages, infraestrutura compartilhada, lista de projetos (`docs/architecture/overview.md`, seção "Projetos do Monorepo"), guardrails e constituição globais.
- Specs de feature que tocam mais de um app/package, ou que não pertencem a nenhum específico.

**`$SCOPE/docs/` (ex: `apps/api/docs/`, `packages/ui/docs/`) — nível do app/package:**
- Mesma árvore da raiz, só que local: `context/decisions.md`, `context/current-state.md`, `architecture/backend.md` ou `architecture/frontend.md`, `specs/`.
- Decisões e specs que só fazem sentido dentro daquele app/package (ex: uma decisão de cache que só existe na API).
- **Não recrie** `guardrails.md`, `constitution.md` ou `product.md` no escopo local — esses são sempre globais.
- Não precisa ser criado antecipadamente: `/spec`, `/back`, `/front` e `/checkpoint` criam os arquivos em `$SCOPE/docs/` na primeira vez que geram algo com escopo, exatamente como fariam na raiz.

**Regra de conflito:** decisão em `$SCOPE/docs/context/decisions.md` sobrepõe a equivalente em `docs/context/decisions.md` só dentro daquele escopo — não é uma decisão nova para o monorepo inteiro.

**`docs/apps/<nome>.md` e `docs/packages/<nome>.md` — índice raiz por projeto:**
- Um arquivo por app/package, direto em `docs/apps/` ou `docs/packages/` na raiz (não dentro de `$SCOPE/docs/`).
- Conteúdo mínimo: propósito em 1-2 frases, stack (só se diferir da tabela geral do overview), link para `$SCOPE/docs/` (specs, decisions, arquitetura local daquele app/package).
- **Criado automaticamente** por `/spec`, `/back`, `/front` ou `/checkpoint` na primeira vez que rodam com aquele `$SCOPE`, se o arquivo ainda não existir — mesmo gatilho que já cria `$SCOPE/docs/`.
- A tabela "Projetos do Monorepo" em `docs/architecture/overview.md` linka para este arquivo na coluna "Docs próprios", em vez de apontar direto para `$SCOPE/docs/`.

Template mínimo (`docs/apps/<nome>.md` ou `docs/packages/<nome>.md`):

```markdown
# <nome>

**Tipo:** app | package compartilhado
**Propósito:** [uma frase]
**Stack:** [só liste o que diferir da tabela geral em docs/architecture/overview.md]

Docs locais (specs, decisions, arquitetura): `$SCOPE/docs/` — ex: `apps/<nome>/docs/`
```

**Economia de contexto:** ao trabalhar com `$SCOPE` informado, leia o "sempre carregado" da raiz (guardrails, constitution) **mais** os arquivos equivalentes de `$SCOPE/docs/`, se existirem. Nunca leia `docs/` ou `$SCOPE/docs/` de um app/package diferente do que está em foco — isso é contexto que não serve à tarefa e só custa tokens.

## Comentários

- Comente o **POR QUÊ**, não o QUÊ — o código mostra o quê; comentários explicam restrições ocultas e regras de negócio não-óbvias.
- TSDoc apenas para APIs públicas de pacotes compartilhados.

## Linting

- ESLint: configurado em `packages/config/eslint`
- Prettier + Husky + lint-staged rodam no commit
- CI bloqueia merge se lint ou type-check falhar
- Nunca desabilite regras de ESLint sem comentário explicando o motivo
