# Pacotes de stack

O núcleo do scaffold (`commands/`, `workflows/`, `hooks/` e as regras de
processo) é agnóstico de framework. Regras específicas de tecnologia vivem
em pacotes nesta pasta.

## Contrato

Cada pacote deve ter:

- `pack.json` com `id`, `name`, `version`, `description` e `appliesTo`;
- `README.md` com decisões, comandos e limites específicos da stack;
- nenhum arquivo deve alterar silenciosamente o núcleo ou sobrescrever docs do
  projeto consumidor.

`appliesTo` é informativo e ajuda `/init-project` a propor packs; a escolha
final é do usuário. Packs ativos são registrados em
`docs/architecture/overview.md`, na seção **Packs de stack**.

## Packs distribuídos

| ID | Uso |
| --- | --- |
| `typescript` | TypeScript estrito, testes e organização básica |
| `nextjs` | Next.js App Router, React e acessibilidade |
| `nestjs` | NestJS, APIs, validação e camadas |
| `turborepo` | Monorepo Turborepo e tarefas incrementais |

Um projeto pode ativar apenas `typescript`, combinar `typescript` + `nextjs`
ou `nestjs`, ou escolher outra stack. Não assuma que um pack está ativo só
porque está distribuído no scaffold.
