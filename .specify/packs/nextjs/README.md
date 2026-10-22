# Pack `nextjs`

Regras específicas para aplicações Next.js:

- use o App Router e Server Components por padrão;
- marque componentes como `use client` apenas quando houver interatividade,
  APIs do browser ou estado local;
- use `next/image` com dimensões ou `fill` + `sizes`, e `next/font` para fontes;
- preserve HTML semântico, teclado e estados de carregamento/erro;
- meça bundle e Core Web Vitals antes de otimizações que aumentem complexidade.

As regras genéricas de frontend continuam em `.claude/skills/frontend` e as
decisões do projeto em `.specify/memory/decisions.md`.

## Passos no fluxo SDD

Ao planejar (`/specnico-plan`) e implementar (`/specnico-implement`) tarefas
de frontend Next.js, cubra, nesta ordem de dependência:

1. **Dados** — tipos TypeScript para as respostas da API; função de
   serviço/fetch; handler MSW para mock local enquanto o backend não existe.
2. **Componentes** — seguindo a skill `frontend` e a seção `## UI` de
   `.specify/memory/conventions.md`; todos os estados (carregando, vazio, erro,
   dados); testes de componente.
3. **Página/rota** — `metadata` da rota; `loading.tsx` e `error.tsx` em rota
   que busca dados.
4. **Integração** — trocar o mock MSW pelo backend real; caminho feliz e casos
   de erro ponta a ponta; responsividade (375px e 768px) e acessibilidade
   (teclado, leitor de tela).

Gate da onda: testes de componente verdes; a feature funciona contra os mocks.
