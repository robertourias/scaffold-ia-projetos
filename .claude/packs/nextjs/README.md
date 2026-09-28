# Pack `nextjs`

Regras específicas para aplicações Next.js:

- use o App Router e Server Components por padrão;
- marque componentes como `use client` apenas quando houver interatividade,
  APIs do browser ou estado local;
- use `next/image` com dimensões ou `fill` + `sizes`, e `next/font` para fontes;
- preserve HTML semântico, teclado e estados de carregamento/erro;
- meça bundle e Core Web Vitals antes de otimizações que aumentem complexidade.

As regras genéricas de frontend continuam em `.claude/skills/frontend` e as
decisões do projeto em `docs/context/decisions.md`.
