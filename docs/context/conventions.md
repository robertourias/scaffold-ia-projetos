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

## Comentários

- Comente o **POR QUÊ**, não o QUÊ — o código mostra o quê; comentários explicam restrições ocultas e regras de negócio não-óbvias.
- TSDoc apenas para APIs públicas de pacotes compartilhados.

## Linting

- ESLint: configurado em `packages/config/eslint`
- Prettier + Husky + lint-staged rodam no commit
- CI bloqueia merge se lint ou type-check falhar
- Nunca desabilite regras de ESLint sem comentário explicando o motivo
