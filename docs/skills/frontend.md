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

## Performance do Cliente e Otimizações de React

### 1. Prevenção de Re-renders Desnecessários
- **Evitar Premature Optimization**: Não aplique `React.memo`, `useMemo` ou `useCallback` indiscriminadamente. Aplique quando:
  - Um componente filho re-renderiza com alta frequência com props idênticas complexas (objetos, arrays ou funções).
  - A computação interna de um valor for de alto custo computacional (> 1ms por render).
- **Memoização Estratégica**:
  - Use `React.memo` para evitar re-renders de componentes puros cujas props não mudaram frequentemente.
  - Use `useCallback` para manter estabilidade referencial de funções passadas como props para filhos memoizados.
  - Use `useMemo` para garantir estabilidade referencial de objetos/arrays passados como dependências ou props, e para salvar cálculos custosos.
- **Colocalização de Estado**: Mantenha o estado o mais próximo possível de onde ele é consumido. Evite elevar o estado globalmente ou para pais distantes se apenas uma subárvore pequena o consome.

### 2. Code Splitting & Lazy Loading (Carregamento sob Demanda)
- **Divisão de Código Limpa**: Reduza o bundle inicial isolando partes pesadas e não críticas da UI (ex: modais/diálogos complexos, editores Rich Text, gráficos, tabelas pesadas).
- **Next.js (App Router / Pages)**: Utilize `next/dynamic` com `{ ssr: false }` para componentes pesados do lado do cliente que não afetam o SEO do primeiro render.
- **React Padrão / SPAs**: Use `React.lazy()` combinado com `<Suspense fallback={<LoadingSpinner />}>` para carregar dinamicamente componentes importados sob demanda ou em nível de rota secundária.

### 3. Virtualização de Listas Grandes
- **Evitar Sobrecarga do DOM**: Nunca renderize listas com grande quantidade de dados (> 100 itens) ou com componentes de linha pesados diretamente no DOM de uma só vez.
- **Uso de `react-window`**:
  - Implemente `FixedSizeList` ou `VariableSizeList` da biblioteca `react-window` para renderizar exclusivamente a janela visível de elementos (windowing) na tela.
  - Garanta placeholders ou loaders de esqueleto suaves durante rolagem rápida se necessário.

### 4. Concorrência e UI Altamente Responsiva (React 18+)
- **`useTransition`**: Use para marcar transições de estado não urgentes (ex: aplicar filtros de busca complexos, trocar abas de relatórios). Isso permite que interações urgentes (ex: clique, digitação) interrompam a renderização pesada em segundo plano e mantenham a UI responsiva.
  ```typescript
  const [isPending, startTransition] = useTransition();
  
  const handleFilterChange = (val: string) => {
    startTransition(() => {
      setFilterTerm(val);
    });
  };
  ```
- **`useDeferredValue`**: Use para diferir um valor pesado derivado de entradas de alta velocidade (como inputs text), garantindo que a entrada do usuário não apresente latência de render.

### 5. Medição de Desempenho ("Meça o que Importa")
- **Análise do Peso Real (Bundle Analyzer)**: Utilize `@next/bundle-analyzer` (ou `webpack-bundle-analyzer`/`vite-bundle-visualizer`) regularmente para inspecionar os pacotes gerados, identificar dependências duplicadas, vazamentos de bibliotecas de terceiros ou oportunidades de code-splitting.
- **Core Web Vitals & Lighthouse**:
  - Monitore e otimize as métricas chave: LCP (Largest Contentful Paint) < 2.5s, INP (Interaction to Next Paint) < 200ms e CLS (Cumulative Layout Shift) < 0.1.
  - Faça auditorias rotineiras via Lighthouse local ou no CI/CD simulando conexões móveis lentas para garantir consistência.
- **Imagens e Fontes**:
  - Utilizar sempre `next/image` com dimensões (`width`, `height`) explícitas ou `fill` (com sizes).
  - Fontes carregadas estritamente via `next/font` — proibido `@import` em arquivos CSS globais.
- **Limites de Tamanho**: O bundle de carregamento inicial por rota deve ser mantido < 150kB gzipped.

## HTML Semântico

Use sempre o elemento que descreve o **significado** do conteúdo, não apenas sua aparência. `<div>`/`<span>` são último recurso, quando não existe equivalente semântico.

### Mapeamento por tipo de conteúdo

| Conteúdo | Elemento |
|---|---|
| Estrutura da página (cabeçalho, navegação, conteúdo principal, rodapé, complementar) | `<header>`, `<nav>`, `<main>`, `<footer>`, `<aside>` |
| Seção temática com título próprio | `<section>` (sempre acompanhada de um heading `h1`-`h6`) |
| Conteúdo autônomo e reutilizável (post, card de produto, comentário) | `<article>` |
| Lista de itens | `<ul>` / `<ol>` + `<li>` (nunca `<div>` repetido) |
| Imagem, vídeo ou gráfico com legenda | `<figure>` + `<figcaption>` |
| Dados tabulares | `<table>`, `<thead>`, `<tbody>`, `<th scope="col\|row">` |
| Ação que dispara comportamento (JS) | `<button type="button">` |
| Navegação para outra página/âncora | `<a href="...">` |
| Campo de formulário | `<label htmlFor="...">` associado ao input |
| Data ou hora | `<time dateTime="...">` |
| Citação | `<blockquote>` / `<q>` + `<cite>` |
| Destaque de texto | `<strong>` (importância) / `<em>` (ênfase) — nunca `<b>`/`<i>` |
| Termo técnico com definição | `<dfn>` |
| Diálogo ou modal | `<dialog>` |
| Conteúdo expansível (FAQ, accordion) | `<details>` + `<summary>` |
| Progresso ou medição | `<progress>` / `<meter>` |

### Regras

- Hierarquia de headings (`h1`→`h6`) sequencial e única por página — não pular níveis para fins de estilo.
- Apenas um `<main>` por página; múltiplos `<nav>` exigem `aria-label` distinto.
- `<a>` sempre navega (possui `href`); para disparar JS sem navegação, usar `<button>`.
- Antes de criar um `<div>`/`<span>`, verificar se existe elemento semântico equivalente para o conteúdo.

## Acessibilidade & Segurança (WCAG 2.1 AA)

- Todo componente interativo deve ser navegável via teclado e possuir tags ARIA semânticas.
- Target de toque mínimo em dispositivos móveis: 44×44px.
- Evitar `dangerouslySetInnerHTML` — se inevitável, higienizar com biblioteca de sanitização (ex: DOMPurify).
- `alt` obrigatório em `<img>`; `alt=""` apenas para imagens puramente decorativas.

## Testes de UI

- **React Testing Library**: Testar o comportamento do usuário e interações, nunca detalhes de implementação.
- **Mock de Rede**: Utilizar Mock Service Worker (MSW) para mockar as chamadas de rede no nível do protocolo, evitando mocks acoplados dentro de componentes.
- **Cobertura Mínima**: Componentes: 70% | Hooks e Utils: 90% | Fluxos P0 (E2E via Playwright): 100%.

## Economia de Tokens e Respostas
- Pratique lazy loading rigoroso de contexto: carregue apenas o Tier necessário para a tarefa (Tier 1: convenções/plano, Tier 2: produto, Tier 3: arquitetura completa).
- Agrupe (batch) tarefas pequenas se forem solicitadas de uma vez, processando-as sequencialmente sem paradas para permissão.
- Entregue o código final. Não explique o código, não ensine conceitos e não faça introduções/conclusões em linguagem natural.
