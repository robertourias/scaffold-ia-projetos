# UI Guidelines

> Decisões de design system e padrões de componentes para o frontend. Preencha as seções `<!-- TODO -->` com suas escolhas reais — quanto mais específico, menos o agente vai inventar.

## Design System

**Component library**: <!-- TODO: ex: "shadcn/ui sobre Radix UI — sem MUI, sem Chakra" -->
**Styling solution**: <!-- TODO: ex: "Tailwind CSS — sem CSS Modules, sem styled-components" -->
**Icon library**: <!-- TODO: ex: "Lucide React — sem Heroicons" -->
**Design tokens source**: <!-- TODO: ex: "Figma / tokens.css na raiz do packages/ui" -->

## Color Tokens

Use variáveis semânticas — nunca valores hex diretos em componentes.

<!-- TODO: preencha com seus tokens reais -->
```css
--color-primary        /* cor principal da marca, com variantes hover e active */
--color-success / --color-warning / --color-error / --color-info
--color-text-primary / --color-text-secondary / --color-text-disabled
--color-border / --color-background / --color-surface
```

Dark mode: todas as cores devem suportar dark mode via CSS variables ou classes `dark:` do Tailwind. Contraste mínimo: 4.5:1 para texto normal, 3:1 para texto grande.

## Espaçamento & Layout

- Grid de 4px — todos os valores de espaçamento são múltiplos de 4 (usar escala Tailwind)
- Breakpoints: padrão Tailwind (`sm` / `md` / `lg` / `xl` / `2xl`)
- Max-width: conteúdo `max-w-7xl` centralizado; prose `max-w-prose`; formulários `max-w-md` ou `max-w-lg`
- Layouts de página: CSS Grid; layouts de componente: Flexbox

## Tipografia

<!-- TODO: preencha com suas fontes reais -->
```
Headings: [Fonte], pesos 600/700
Body:     [Fonte], pesos 400/500
Mono:     [Fonte] (blocos de código, conteúdo técnico)
```

Usar escala de tipo do Tailwind (`text-sm`, `text-base`, `text-lg` etc.) — sem tamanhos de fonte customizados salvo exceção justificada.

## Padrões de Componentes

### Buttons

Quatro variantes: `primary` (máximo um por seção de tela), `secondary`, `destructive` (sempre pedir confirmação antes de executar), `ghost`.
Sempre exibir loading state durante ações assíncronas (spinner ou skeleton).

### Forms

- Sempre associar inputs a labels visíveis — nunca usar placeholder como substituto de label
- Validar no blur, não no keystroke
- Erros inline ao lado do campo; campos obrigatórios marcados com `*`

### Empty & Error States

Toda lista ou tabela exige ambos:
- **Empty state:** ícone + título + descrição + botão de ação
- **Error state:** título + descrição + botão de retry

### Loading States

- Áreas de conteúdo: skeleton screens preferidos sobre spinners
- Ações de botão e áreas pequenas: spinner

## Motion

- Sempre respeitar `prefers-reduced-motion` — todas as animações devem poder ser desativadas
- Durações: fast=100ms, normal=200ms, slow=350ms
- Animar apenas `transform` e `opacity` — nunca propriedades de layout (`width`, `height`)

## Accessibility Baseline

- Cor nunca deve ser o único diferenciador — sempre adicionar texto ou ícone
- `outline: none` é proibido — focus rings devem ser sempre visíveis
- Modals: capturar foco ao abrir, restaurar ao fechar
- Touch targets: mínimo 44×44px em mobile
- Ícones usados sozinhos: exigem `aria-label` ou `title`
