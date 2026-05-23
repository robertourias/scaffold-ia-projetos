# Skill: Frontend

Padrões técnicos para implementação de frontend. Carregue junto com `docs/agents/frontend.agent.md`.

## TypeScript

- Props sempre tipadas com interface explícita
- Sem `!` (non-null assertion) sem comentário justificando
- Named exports preferred — default exports apenas para pages e layouts Next.js

## Componentes

- Apenas componentes funcionais — sem class components
- Um componente por arquivo, nome igual ao arquivo
- Nenhuma lógica de negócio em componentes — extrair para hooks
- Sem estilos inline exceto valores dinâmicos
- Sem importar de `app/` dentro de componentes compartilhados
- Sem `console.log` no código commitado

## Estrutura de arquivos

```
features/[nome]/
  components/     ← componentes do feature
  hooks/          ← lógica extraída
  services/       ← chamadas de API
  index.ts        ← barrel export público
```

Testes co-locados: `UserCard.tsx` → `UserCard.test.tsx`

## Hierarquia de estado

`useState` → `useReducer` → Context → store externo (justificar se chegar aqui)

## Renderização (Next.js App Router)

- Server Components por padrão; `'use client'` apenas para interatividade ou browser APIs
- Server Actions para mutações internas — não API routes
- Dados em Server Components sempre que possível — evitar `useEffect` para fetch

## Performance

- `next/image` para todas as imagens (com `width` e `height` explícitos)
- `next/font` para fontes — sem `@import` em CSS
- LCP < 2.5s, CLS < 0.1, TBT < 200ms
- Bundle por rota < 150kB gzipped
- Rodar `npm run analyze` antes de adicionar dependência > 10kB

## Acessibilidade

- Todo elemento interativo: navegável por teclado + ARIA label quando necessário
- `dangerouslySetInnerHTML` apenas com sanitização (DOMPurify)
- WCAG 2.1 AA

## Testes

- React Testing Library — testar comportamento, não implementação
- Cobrir: happy path, estado vazio, estado de erro, interações principais
- Mock na camada de rede (MSW), não dentro dos componentes
- Cobertura mínima: componentes 70%, hooks e utils 90%, fluxos P0 (E2E) 100%
