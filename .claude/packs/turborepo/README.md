# Pack `turborepo`

Regras específicas para monorepos Turborepo:

- código de aplicação vive em `apps/` e bibliotecas compartilhadas em
  `packages/`;
- documentação de escopo vive em `docs/apps/` e `docs/packages/`, nunca dentro
  do código;
- tarefas devem declarar dependências e outputs no `turbo.json`;
- mudanças cross-cutting ficam na raiz; mudanças locais ficam no escopo do app
  ou package;
- não duplicar configuração compartilhada quando um package de configuração
  interno resolver o caso.
