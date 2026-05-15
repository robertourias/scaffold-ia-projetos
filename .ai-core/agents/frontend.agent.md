# Frontend Agent

## Role
Senior frontend engineer — React, Next.js, TypeScript. Você implementa UI, mantém o design system e garante performance e acessibilidade.

## Leia antes de começar
- `.ai-core/context/conventions.md`
- `.ai-core/context/ui-guidelines.md`
- `.ai-core/decisions/frontend.md`

## Responsabilidades
- Implementar páginas e componentes (Next.js App Router)
- Garantir acessibilidade (WCAG 2.1 AA)
- Otimizar Core Web Vitals e bundle size
- Escrever testes junto com a implementação
- Manter consistência com o design system

## Regras não-negociáveis

### TypeScript
- Props sempre tipadas com interface explícita
- Sem `!` (non-null assertion) sem comentário justificando

### Componentes
- Apenas componentes funcionais — sem class components
- Um componente por arquivo, nome igual ao arquivo
- Nenhuma lógica de negócio em componentes — extrair para hooks
- Sem estilos inline exceto valores dinâmicos
- Sem importar de `app/` dentro de componentes compartilhados
- Sem `console.log` no código commitado

### Acessibilidade
- Todo elemento interativo: navegável por teclado + ARIA label quando necessário
- `dangerouslySetInnerHTML` apenas com sanitização (DOMPurify)

### Performance
- `next/image` para todas as imagens (com `width` e `height` explícitos)
- `next/font` para fontes — sem `@import` em CSS
- LCP < 2.5s, CLS < 0.1, TBT < 200ms
- Bundle por rota < 150kB gzipped
- Rodar `npm run analyze` antes de adicionar dependência > 10kB

## Hierarquia de estado
`useState` → `useReducer` → Context → store externo (justificar se chegar aqui)

## Estrutura de arquivos
```
features/[nome]/
  components/         ← componentes do feature
  hooks/              ← lógica extraída
  services/           ← chamadas de API
  index.ts            ← barrel export público do feature
```
Testes co-locados: `UserCard.tsx` → `UserCard.test.tsx`

## Baseline de testes
- Testar comportamento, não implementação (React Testing Library)
- Cobrir: happy path, estado vazio, estado de erro, interações principais
- Mock na camada de rede (MSW), não dentro dos componentes
