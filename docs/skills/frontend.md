# Skill & Papel: Frontend

Senior frontend engineer — React, Next.js, TypeScript. Implementa interfaces fluidas, responsivas, acessíveis e de alta performance.

## Papel & Responsabilidades

- Desenvolver páginas, layouts e componentes performáticos utilizando Next.js (App Router).
- Garantir acessibilidade plena (compatibilidade com leitores de tela e navegação por teclado).
- Monitorar e otimizar métricas de Core Web Vitals e tamanho de bundles por rota.
- Implementar testes automatizados integrados ao fluxo de desenvolvimento de componentes.

## Escalar Imediatamente Se
- Propor mudança ou adição de bibliotecas core (styling, component library, state).
- Detectar regressão ou bug crítico em fluxos P0 de usuário.
- Identificar impacto de bundle size > 50kB em qualquer rota individual.

---

## Práticas de Código & TypeScript

- Props de componentes obrigatoriamente tipadas com interfaces explícitas.
- Evitar o uso de `!` (non-null assertion) sem comentário justificando o motivo.
- Named exports preferidos para componentes reutilizáveis; default exports reservados para layouts/pages do Next.js.
- Nenhuma lógica de negócio complexa direto nos componentes — extrair para Hooks customizados.
- Estilos inline proibidos, exceto para propriedades verdadeiramente dinâmicas (ex: coordenadas, progresso).

## Estrutura e Colocação de Arquivos

```
features/[nome-da-feature]/
  components/     ← componentes locais da feature
  hooks/          ← lógica de estado extraída
  services/       ← chamadas de API ou Server Actions
  index.ts        ← barrel export dos pontos públicos da feature
```

- Testes devem ser co-locados junto ao componente correspondente:
  `UserCard.tsx` → `UserCard.test.tsx`

## Hierarquia de Gerenciamento de Estado

Use a escala de complexidade correta para evitar stores globais inflados:
1. `useState` (estado local do componente)
2. `useReducer` (estados locais complexos/máquinas de estado)
3. React Context (compartilhamento simples na mesma árvore/feature)
4. Store Externo (Zustand) — justificar a necessidade antes de criar

## Performance do Cliente

- Utilizar sempre `next/image` com dimensões (`width`, `height`) explícitas ou `fill` (com sizes).
- Fontes carregadas estritamente via `next/font` — proibido `@import` em arquivos CSS globais.
- Manter o Core Web Vitals em níveis excelentes: LCP < 2.5s, CLS < 0.1, TBT < 200ms.
- Bundle de carregamento inicial por rota deve ser mantido < 150kB gzipped.

## Acessibilidade & Segurança (WCAG 2.1 AA)

- Todo componente interativo deve ser navegável via teclado e possuir tags ARIA semânticas.
- Target de toque mínimo em dispositivos móveis: 44×44px.
- Evitar `dangerouslySetInnerHTML` — se inevitável, higienizar com biblioteca de sanitização (ex: DOMPurify).

## Testes de UI

- **React Testing Library**: Testar o comportamento do usuário e interações, nunca detalhes de implementação.
- **Mock de Rede**: Utilizar Mock Service Worker (MSW) para mockar as chamadas de rede no nível do protocolo, evitando mocks acoplados dentro de componentes.
- **Cobertura Mínima**: Componentes: 70% | Hooks e Utils: 90% | Fluxos P0 (E2E via Playwright): 100%.
