# Pack `typescript`

Base de linguagem, independente de runtime ou framework:

- mantenha `strict` ativo e tipos de retorno explícitos em APIs públicas;
- não use `any` sem justificativa local;
- mantenha testes próximos ao código e execute o comando real registrado em
  `docs/context/guardrails.md`;
- não adicione dependências ou ferramentas de build sem registrar a decisão em
  `docs/context/decisions.md`.

Este pack não escolhe Node, React, NestJS, Next.js ou um gerenciador de
pacotes. Combine-o com um pack de runtime/framework quando necessário.
