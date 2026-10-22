# Conventions

> **Status do arquivo:** vazio — preencha conforme o projeto evolui.

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

- Branch de Spec: `spec/NNN-slug` (criada pelo `/specnico-spec`); o `/specnico-fix` commita no branch atual (use `fix/<slug>` se quiser isolar); demais: `feat/` `chore/` `refactor/` `docs/`
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`); mensagens do fluxo em `.specify/workflows/git-flow.md`
- Stage sempre por caminho explícito — nunca `git add -A`, `git add .` nem `git commit -a`
- PRs: manter abaixo de 400 linhas — features grandes viram PRs sequenciais

### Estado do trabalho

Não há protocolo de checkpoint: o estado vive em `.specify/state.json` (Spec
ativa e fase), nos checkboxes do `tasks.md` e no `git log`. Decisões entram em
`.specify/memory/decisions.md` durante o `/specnico-plan`. Todo comando
`specnico-*` lê o `state.json` ao começar.

## Monorepo (apps/packages)

Em projeto monorepo, **toda documentação vive em `.specify/` e `specs/` na
raiz** — nunca dentro de `apps/<app>/` ou `packages/<pkg>/`. Código e
documentação não se misturam. Não duplique conteúdo entre níveis — cada fato
mora em exatamente um lugar.

**Global (`.specify/memory/`):** constituição (identidade, CN, GR, comandos de
verificação, lista de projetos no campo `**Projetos:**`), produto, backlog,
arquitetura, convenções e decisões que atravessam apps/packages.

**Por projeto (`.specify/memory/projects/<apps-x>.md`, ex: `apps-api.md`):**
- Propósito, stack e packs que diferem do global, comandos de verificação
  próprios e decisões que só fazem sentido dentro daquele app/package.
- Criado pelo `/specnico-plan` do item de arquitetura do app/package no backlog
  (um item por app/package), que também registra o projeto na constituição.
- **Não recrie** constituição, produto ou backlog por projeto — são sempre globais.

**Specs:** `specs/` é plano, sem subpasta por projeto. O escopo de uma Spec é o
campo `**Escopo:**` do `spec.md` (`raiz`, `apps/api` ou lista).

**Regra de conflito:** decisão em `.specify/memory/projects/<apps-x>.md`
sobrepõe a equivalente em `.specify/memory/decisions.md` só dentro daquele
projeto — não é uma decisão nova para o monorepo inteiro.

**Economia de contexto:** com escopo resolvido, leia a constituição **mais** o
arquivo de `projects/` daquele escopo. Nunca leia o arquivo de outro projeto só
para completar contexto.

## Backlog em Monorepo

O backlog é único (`.specify/memory/product-backlog.md`), com a coluna
**Escopo** listando os projetos tocados por item. Item que toca vários projetos
é **um item só** — o fan-out por projeto acontece no `tasks.md` (campo `Agente:`
e `Arquivos:` de cada tarefa), não duplicando o item no backlog.

## Comentários

- Comente o **POR QUÊ**, não o QUÊ — o código mostra o quê; comentários explicam restrições ocultas e regras de negócio não-óbvias.
- TSDoc apenas para APIs públicas de pacotes compartilhados.

## Linting

- ESLint: configurado em `packages/config/eslint`
- Prettier + Husky + lint-staged rodam no commit
- CI bloqueia merge se lint ou type-check falhar
- Nunca desabilite regras de ESLint sem comentário explicando o motivo

## UI

> Decisões de design system e padrões de componentes para o frontend. Preencha as seções `<!-- TODO -->` com suas escolhas reais — quanto mais específico, menos o agente vai inventar.

### Design System

**Component library**: <!-- TODO: ex: "shadcn/ui sobre Radix UI — sem MUI, sem Chakra" -->
**Styling solution**: <!-- TODO: ex: "Tailwind CSS — sem CSS Modules, sem styled-components" -->
**Icon library**: <!-- TODO: ex: "Lucide React — sem Heroicons" -->
**Design tokens source**: <!-- TODO: ex: "Figma / tokens.css na raiz do packages/ui" -->

### Color Tokens

Use variáveis semânticas — nunca valores hex diretos em componentes.

<!-- TODO: preencha com seus tokens reais -->
```css
--color-primary        /* cor principal da marca, com variantes hover e active */
--color-success / --color-warning / --color-error / --color-info
--color-text-primary / --color-text-secondary / --color-text-disabled
--color-border / --color-background / --color-surface
```

Dark mode: todas as cores devem suportar dark mode via CSS variables ou classes `dark:` do Tailwind. Contraste mínimo: 4.5:1 para texto normal, 3:1 para texto grande.

### Espaçamento & Layout

- Grid de 4px — todos os valores de espaçamento são múltiplos de 4 (usar escala Tailwind)
- Breakpoints: padrão Tailwind (`sm` / `md` / `lg` / `xl` / `2xl`)
- Max-width: conteúdo `max-w-7xl` centralizado; prose `max-w-prose`; formulários `max-w-md` ou `max-w-lg`
- Layouts de página: CSS Grid; layouts de componente: Flexbox

### Tipografia

<!-- TODO: preencha com suas fontes reais -->
```
Headings: [Fonte], pesos 600/700
Body:     [Fonte], pesos 400/500
Mono:     [Fonte] (blocos de código, conteúdo técnico)
```

Usar escala de tipo do Tailwind (`text-sm`, `text-base`, `text-lg` etc.) — sem tamanhos de fonte customizados salvo exceção justificada.

### Padrões de Componentes

#### Buttons

Quatro variantes: `primary` (máximo um por seção de tela), `secondary`, `destructive` (sempre pedir confirmação antes de executar), `ghost`.
Sempre exibir loading state durante ações assíncronas (spinner ou skeleton).

#### Forms

- Sempre associar inputs a labels visíveis — nunca usar placeholder como substituto de label
- Validar no blur, não no keystroke
- Erros inline ao lado do campo; campos obrigatórios marcados com `*`

#### Empty & Error States

Toda lista ou tabela exige ambos:
- **Empty state:** ícone + título + descrição + botão de ação
- **Error state:** título + descrição + botão de retry

#### Loading States

- Áreas de conteúdo: skeleton screens preferidos sobre spinners
- Ações de botão e áreas pequenas: spinner

### Motion

- Sempre respeitar `prefers-reduced-motion` — todas as animações devem poder ser desativadas
- Durações: fast=100ms, normal=200ms, slow=350ms
- Animar apenas `transform` e `opacity` — nunca propriedades de layout (`width`, `height`)

### Accessibility Baseline

- Cor nunca deve ser o único diferenciador — sempre adicionar texto ou ícone
- `outline: none` é proibido — focus rings devem ser sempre visíveis
- Modals: capturar foco ao abrir, restaurar ao fechar
- Touch targets: mínimo 44×44px em mobile
- Ícones usados sozinhos: exigem `aria-label` ou `title`
