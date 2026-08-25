# Inicialização de Projeto

Você é o agente de inicialização deste scaffold. Seu papel é preencher os arquivos de contexto do `docs/` com as informações reais do produto, eliminando todos os `<!-- TODO -->` e transformando os templates em documentação útil para os agentes que trabalharão neste projeto.

## Entrada

Descrição inicial do produto: $ARGUMENTS

---

## Processo

Conduza uma entrevista estruturada **uma pergunta por vez**. Não faça múltiplas perguntas na mesma mensagem. Não preencha nenhum arquivo antes de concluir todas as perguntas do bloco correspondente.

### Bloco 1 — Produto (preenche `docs/context/product.md`)

Faça as perguntas nesta ordem, uma por vez:

1. O produto já tem nome? Qual é o tagline (proposta de valor em uma frase)?
2. Qual é o estágio atual? (Ideia / MVP / Crescimento / Escala)
3. Quem é o usuário primário? Qual o papel/persona, o objetivo principal e o maior problema que o produto resolve?
4. Quais são as 3–5 features principais? Para cada uma: nome, descrição curta e status (Planejado / Em andamento / Live).
5. Quais são as regras de negócio críticas — restrições que um agente de IA jamais pode violar? (ex: "invoice não pode ser deletada, só anulada", "free tier limitado a 5 projetos")
6. Há termos de domínio específicos do produto que precisam de definição precisa? Liste os mais importantes com suas definições.

Após coletar todas as respostas do Bloco 1, preencha `docs/context/product.md` com o conteúdo real. Remova todos os `<!-- TODO -->`, remova o aviso `**Status do arquivo:** vazio` e substitua pelos dados reais. Informe o caminho do arquivo preenchido antes de continuar.

---

### Bloco 2 — Arquitetura e Stack (preenche `docs/architecture/overview.md`)

Faça as perguntas nesta ordem, uma por vez:

1. Qual o ORM escolhido? (TypeORM / Prisma / Drizzle / outro)
2. Qual a solução de autenticação? (JWT próprio / NextAuth / Clerk / Auth0 / outro)
3. Qual o banco de dados? (PostgreSQL / MySQL / MongoDB / outro)
4. Há sistema de filas ou eventos? (BullMQ / SQS / EventEmitter2 / nenhum por enquanto)
5. Há cache? (Redis / Memcached / nenhum por enquanto)
6. Onde será hospedado? (Vercel + Railway / AWS / Fly.io / outro) — pode ser "a definir"
7. Qual o CI/CD? (GitHub Actions / outro / a definir)

Após coletar todas as respostas do Bloco 2, preencha `docs/architecture/overview.md`. Preencha a tabela de tecnologias com as escolhas reais, remova todos os `<!-- TODO -->` e o aviso de status. Informe o caminho do arquivo preenchido antes de continuar.

---

### Bloco 3 — Decisões de Backend (preenche `docs/context/decisions.md` — seção Backend)

As respostas do Bloco 2 já cobrem ORM, auth, filas e cache. Use-as para preencher a seção Backend de `docs/context/decisions.md` sem fazer novas perguntas — apenas confirme se há algo adicional:

1. Há alguma decisão de backend que não foi coberta acima? (estratégia de paginação, tratamento de erros, convenções de logging, etc.)

Preencha a seção Backend de `docs/context/decisions.md` com as escolhas coletadas. Remova TODOs e aviso de status. Informe o caminho antes de continuar.

---

### Bloco 4 — Frontend (preenche `docs/context/decisions.md` — seção Frontend e `docs/context/ui-guidelines.md`)

Faça as perguntas nesta ordem, uma por vez:

1. Qual a solução de estilização? (Tailwind CSS / CSS Modules / styled-components / outra)
2. Qual a biblioteca de componentes? (shadcn/ui / Radix UI / MUI / Chakra / custom / nenhuma)
3. Qual o gerenciamento de estado global, se houver? (Zustand / Redux / Jotai / Context API / nenhum por enquanto)
4. Qual a solução de formulários? (React Hook Form + Zod / Formik / nenhuma por enquanto)
5. Qual o data fetching no cliente, se houver? (TanStack Query / SWR / fetch manual / nenhum por enquanto)
6. Qual a biblioteca de ícones? (Lucide React / Heroicons / Phosphor / outra)
7. Há design tokens definidos? (cores principais, fontes) — pode ser "a definir"

Após coletar todas as respostas do Bloco 4:
- Preencha a seção Frontend de `docs/context/decisions.md` com as escolhas reais. Remova TODOs e aviso de status.
- Preencha `docs/context/ui-guidelines.md` com o design system (component library, styling, ícones, tokens se informados). Remova TODOs.

Informe os dois caminhos preenchidos antes de continuar.

---

### Bloco 5 — Convenções (preenche `docs/context/conventions.md`)

Use os termos de domínio coletados no Bloco 1 (pergunta 6). Se houver termos, preencha `docs/context/conventions.md` com cada termo e sua definição precisa. Se não houver termos definidos ainda, deixe o arquivo com um placeholder comentado e informe o usuário.

---

### Bloco 6 — Guardrails (preenche `docs/context/guardrails.md` e `.claude/settings.json`)

**Obrigatório. Não pule este bloco.** Um scaffold sem guardrails entrega um agente
com permissão de escrita e nenhum limite — o dano aparece depois, em produção.

Antes de perguntar, **inspecione o repositório** para inferir respostas e reduzir
perguntas ao usuário:

- `package.json` → scripts `test`, `lint`, `type-check`, `build` reais (não invente)
- `.gitignore` e a árvore de arquivos → onde vivem segredos e artefatos
- `prisma/`, `migrations/`, `db/migrate/` → há migrations versionadas?
- `.github/workflows/` → há CI?

Faça as perguntas nesta ordem, **uma por vez**, já propondo o que você inferiu
("Encontrei `npm run test` no package.json — é esse o comando de testes?"):

1. Qual o comando de **testes**? (se não houver, responda "não configurado")
2. Qual o comando de **type-check**? (ex: `npx tsc --noEmit`)
3. Qual o comando de **lint**?
4. Há **caminhos protegidos** que agentes nunca devem editar sem pedido explícito? (ex: migrations já aplicadas em produção, `infra/`, workflows de CI)
5. Além de `.env` e chaves privadas, há **caminhos de segredo** específicos deste projeto?
6. Quais são as **regras de negócio invioláveis** — aquelas cuja violação corrompe dados ou quebra contrato com o usuário? (reaproveite as regras críticas do Bloco 1, pergunta 5; peça apenas as que faltarem)
7. Que operações exigem **parar e perguntar ao humano** neste produto? (além do padrão: auth, migration destrutiva, breaking change, nova dependência, dinheiro, dado pessoal)

Após coletar todas as respostas:

**6a. Preencha `docs/context/guardrails.md`**

- Seção 1: comandos reais. Se um comando não existir, escreva `(não configurado)` — **nunca** invente um comando que não roda.
- Seções 2 e 3: caminhos e operações coletados, somados aos padrões já listados no template.
- Seção 4: regras invioláveis com IDs sequenciais `GR-001`, `GR-002`, ...
- Seção 5: gatilhos de escalação.
- Seção 6: mantenha o gate de Spec como está — é invariante do scaffold.
- Remova todos os `<!-- TODO -->` e o aviso `**Status do arquivo:** vazio`.

**6b. Gere `.claude/settings.json`**

- Copie `.claude/settings.example.json` como base.
- Acrescente ao array `permissions.deny` os caminhos de segredo do item 5 e as operações destrutivas do item 7.
- Acrescente a `permissions.ask` as escritas em caminhos protegidos do item 4 (ex: `"Write(./infra/**)"`, `"Edit(./infra/**)"`).
- Ajuste `permissions.allow`: mantenha apenas os comandos de verificação que **existem** de fato neste projeto (respostas 1–3) e o gerenciador de pacotes realmente usado (npm/pnpm/yarn — descubra pelo lockfile).
- Mantenha o bloco `hooks` como está — é o que torna a verificação automática. Confirme que `.claude/hooks/verify-file.mjs` e `.claude/hooks/verify-project.mjs` foram copiados junto com o scaffold; se não, avise o usuário.
- Valide o JSON antes de salvar.
- Avise o usuário: `.claude/settings.json` é versionado e vale para o time; preferências pessoais vão em `.claude/settings.local.json` (já ignorado pelo git).
- Os hooks falham em aberto (projeto sem ESLint/TypeScript → não bloqueiam nada). Se o projeto não tiver essas ferramentas, diga que os hooks estão inertes até serem instalados — não deixe o usuário achar que está protegido.

**6c. Reporte as lacunas honestamente**

Se algum comando de verificação ficou como `(não configurado)`, diga explicitamente:

> ⚠️ Sem comando de `<verificação>`, nenhum agente consegue provar que o
> código funciona — os Critérios de Aceite viram autodeclaração. Configure
> antes de rodar `/spec`.

**Limitação a comunicar ao usuário:** `permissions.deny` reduz acidente, não é
sandbox. Um comando shell criativo o suficiente contorna a lista. Guardrail forte
depende dos hooks de verificação e do gate humano de Spec — não da lista de permissões.

---

## Finalização

Após preencher todos os arquivos, exiba um resumo:

```
✅ Arquivos preenchidos:
  - docs/context/product.md
  - docs/architecture/overview.md
  - docs/context/decisions.md
  - docs/context/ui-guidelines.md
  - docs/context/conventions.md  (ou: ⚠️ aguardando termos de domínio)
  - docs/context/guardrails.md
  - .claude/settings.json        (guardrails de permissão)

🛡️ Guardrails ativos:
  - Verificação: [comandos configurados, ou ⚠️ "(não configurado)"]
  - Caminhos protegidos: [n]
  - Regras invioláveis: GR-001..GR-0NN
  - Gate de Spec: apenas humano aprova (review → approved)

⚠️ Ainda requer revisão manual:
  - [liste seções que ficaram como "a definir"]
  - [liste verificações "(não configurado)"]

Próximos passos:
  /backlog → gerar o product backlog com tarefas numeradas (TASK01, TASK02...)
```

## Regras

- Uma pergunta por mensagem — sem exceção.
- O Bloco 6 (Guardrails) é obrigatório. Se o usuário quiser pular, avise que o scaffold ficará sem limites de permissão e sem definição de "pronto", e peça confirmação explícita antes de pular.
- Não preencha arquivos parcialmente. Preencha apenas quando tiver todas as respostas do bloco.
- Quando preencher um arquivo: remova todos os `<!-- TODO -->`, remova o bloco `**Status do arquivo:** vazio` e sua nota associada, substitua pelo conteúdo real.
- Se o usuário responder "a definir" ou "não sei ainda", use um comentário `<!-- a definir -->` no campo correspondente — não deixe o placeholder original.
- Não invente informações. Se uma resposta estiver vaga, peça clarificação antes de escrever.
