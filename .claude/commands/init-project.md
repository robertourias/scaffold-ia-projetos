---
description: "Inicializa o scaffold: entrevista em 8 blocos, preenche docs/ em profundidade, gera guardrails do projeto e o README do repositório"
argument-hint: "[descrição do produto]"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(ls:*), Bash(cat:*), Bash(git log:*)
---

# Inicialização de Projeto

Você é o agente de inicialização deste scaffold. Seu papel é preencher os arquivos de contexto do `docs/` com as informações reais do produto, eliminando todos os `<!-- TODO -->` e transformando os templates em documentação útil para os agentes que trabalharão neste projeto. No final, também atualiza o `README.md` do repositório — quem chega no projeto pela primeira vez não deveria precisar abrir `.claude/` para entender do que se trata.

## Entrada

Descrição inicial do produto: $ARGUMENTS

---

## Processo

Conduza uma entrevista estruturada **uma pergunta por vez**. Não faça múltiplas perguntas na mesma mensagem. Não preencha nenhum arquivo antes de concluir todas as perguntas do bloco correspondente.

**Proponha, não pergunte em aberto quando houver como inferir.** Antes de cada bloco com sinal disponível no repositório (`package.json`, lockfile, estrutura de pastas, `.gitignore`), inspecione primeiro e ofereça o palpite como pergunta de confirmação — "Encontrei X no package.json, é esse mesmo?" custa uma resposta de uma palavra; "qual é o X?" custa o usuário digitar o que você já podia ter lido. Pergunta em aberto só quando não há nenhum sinal para inferir de.

### Bloco 1 — Produto (preenche `docs/context/product.md`)

Faça as perguntas nesta ordem, uma por vez:

1. O produto já tem nome? Qual é o tagline (proposta de valor em uma frase)?
2. Qual é o estágio atual? (Ideia / MVP / Crescimento / Escala)
3. Quem é o usuário primário? Qual o papel/persona, o objetivo principal e o maior problema que o produto resolve?
4. Quais são as 3–5 features principais? Para cada uma: nome, descrição curta e status (Planejado / Em andamento / Live).
5. Quais são as regras de negócio críticas — restrições que um agente de IA jamais pode violar? (ex: "invoice não pode ser deletada, só anulada", "free tier limitado a 5 projetos")
6. Há termos de domínio específicos do produto que precisam de definição precisa? Liste os mais importantes com suas definições.
7. Há **restrições não-funcionais** que a arquitetura precisa respeitar desde o início — escala esperada (ex: 100 vs 100k usuários), compliance/regulação (LGPD, HIPAA, PCI), disponibilidade exigida? Se nada disso importa ainda nesta fase, responda "nenhuma por enquanto".
8. O que este produto **explicitamente não faz** — o que fica de fora para não virar scope creep depois? Pode ser "ainda não decidido".
9. Qual é a **métrica de sucesso principal**? (ex: usuários ativos semanais, taxa de conversão, retenção D7) Pode ser "ainda não definida".

Após coletar todas as respostas do Bloco 1, preencha `docs/context/product.md` com o conteúdo real, incluindo as seções "Restrições Não-Funcionais", "Out of Scope" e "Metrics & Success Criteria" com as respostas 7–9. Remova todos os `<!-- TODO -->`, remova o aviso `**Status do arquivo:** vazio` e substitua pelos dados reais. Seções que o usuário pulou (ex: "User Journeys", "Competitive Context") ficam com `<!-- a definir -->` — não invente conteúdo para preenchê-las. Informe o caminho do arquivo preenchido antes de continuar.

---

### Bloco 2 — Arquitetura e Stack (preenche `docs/architecture/overview.md`)

Antes de perguntar, leia `package.json` (dependencies + devDependencies) e o
lockfile presente. Se já houver `typeorm`, `prisma`, `@auth/*`, `pg`, `redis`,
`bullmq` etc. instalados, **proponha o que encontrou** em vez de perguntar às
cegas — "Vi `@prisma/client` no package.json, é o ORM em uso?".

Faça as perguntas nesta ordem, uma por vez:

1. Qual o ORM escolhido? (TypeORM / Prisma / Drizzle / outro)
2. Qual a solução de autenticação? (JWT próprio / NextAuth / Clerk / Auth0 / outro)
3. Qual o banco de dados? (PostgreSQL / MySQL / MongoDB / outro)
4. Há sistema de filas ou eventos? (BullMQ / SQS / EventEmitter2 / nenhum por enquanto)
5. Há cache? (Redis / Memcached / nenhum por enquanto)
6. Onde será hospedado? (Vercel + Railway / AWS / Fly.io / outro) — pode ser "a definir"
7. Qual o CI/CD? (GitHub Actions / outro / a definir)

Após coletar todas as respostas do Bloco 2, preencha `docs/architecture/overview.md`. Preencha a tabela de tecnologias com as escolhas reais, remova todos os `<!-- TODO -->` e o aviso de status. Informe o caminho do arquivo preenchido antes de continuar.

**Sincronize a estrutura do monorepo em `.claude/CLAUDE.md`.** A seção
"Estrutura do monorepo" desse arquivo vem com um exemplo fixo
(`apps/web`, `apps/api`, `packages/ui`...) que não é atualizado em nenhum
outro lugar — se este projeto tiver uma estrutura diferente (monorepo com
outros nomes de app, ou nem for monorepo), essa seção fica incorreta para
sempre. Liste `apps/` e `packages/` (se existirem) e substitua o bloco pela
estrutura real. Se o projeto não for monorepo, substitua por uma árvore de
`src/` de alto nível ou remova a seção — não deixe o exemplo genérico.

---

### Bloco 3 — Decisões de Backend (preenche `docs/context/decisions.md` — seção Backend)

As respostas do Bloco 2 já cobrem ORM, auth, filas e cache. Use-as para preencher a seção Backend de `docs/context/decisions.md` sem fazer novas perguntas sobre stack — apenas confirme o que falta e as **diretrizes de implementação**, que o template já traz com defaults sensatos:

1. Há alguma decisão de backend que não foi coberta acima? (estratégia de paginação, tratamento de erros, convenções de logging, etc.)
2. O template de `decisions.md` já assume: filtro global de exceções com shape de resposta consistente, paginação cursor-based, e cobertura de teste mínima de 90% em use cases / 80% em controllers / 60% em repositórios. Esses defaults servem, ou este projeto tem necessidade diferente (ex: coverage bar mais baixo no início, ou requisito de auditoria que muda o tratamento de erro)?

Preencha a seção Backend de `docs/context/decisions.md` com as escolhas coletadas — se a resposta 2 for "servem", apenas confirme os defaults já presentes no template sem reescrevê-los; se houver customização, substitua o trecho relevante. Remova TODOs e aviso de status. Informe o caminho antes de continuar.

---

### Bloco 4 — Frontend (preenche `docs/context/decisions.md` — seção Frontend e `docs/context/ui-guidelines.md`)

Antes de perguntar, leia `package.json`. Se já houver `tailwindcss`,
`@radix-ui/*`, `zustand`, `react-hook-form`, `@tanstack/react-query` etc.
instalados, proponha o que encontrou em vez de perguntar às cegas.

Faça as perguntas nesta ordem, uma por vez:

1. Qual a solução de estilização? (Tailwind CSS / CSS Modules / styled-components / outra)
2. Qual a biblioteca de componentes? (shadcn/ui / Radix UI / MUI / Chakra / custom / nenhuma)
3. Qual o gerenciamento de estado global, se houver? (Zustand / Redux / Jotai / Context API / nenhum por enquanto)
4. Qual a solução de formulários? (React Hook Form + Zod / Formik / nenhuma por enquanto)
5. Qual o data fetching no cliente, se houver? (TanStack Query / SWR / fetch manual / nenhum por enquanto)
6. Qual a biblioteca de ícones? (Lucide React / Heroicons / Phosphor / outra)
7. Há design tokens definidos? (cores principais, fontes) — pode ser "a definir"
8. O template de `decisions.md` já assume: React Testing Library + Jest, MSW para mock de rede, Playwright para E2E, cobertura mínima de 70% em componentes / 90% em hooks e utils / 100% nos fluxos P0 (E2E). Esses defaults servem, ou há necessidade diferente?

Após coletar todas as respostas do Bloco 4:
- Preencha a seção Frontend de `docs/context/decisions.md` com as escolhas reais das perguntas 1–6, mais a confirmação/customização da pergunta 8. Remova TODOs e aviso de status.
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

### Bloco 7 — Constituição (preenche `docs/context/constitution.md`)

**Obrigatório.** Diferente de `guardrails.md` (o que é proibido fazer), este
bloco define **como o sistema deve ser construído** — princípios que uma Spec
violando não deve ser aprovada.

Antes de perguntar, infira da estrutura de pastas já existente (se houver
código): há separação `domain/application/infrastructure/presentation`? Módulos
importam uns aos outros diretamente ou por interface?

Faça as perguntas nesta ordem, uma por vez:

1. Qual a direção de dependência entre camadas? (ex: Clean Architecture — domínio não importa framework; ou outra arquitetura em uso)
2. Testes são obrigatórios no mesmo diff da implementação, ou podem vir depois?
3. Há limite de acoplamento entre módulos? (ex: só se comunicam por interface pública)
4. Há algum princípio arquitetural específico deste produto que um agente jamais pode violar, mesmo sob pressão de prazo?

Preencha `docs/context/constitution.md` com os princípios reais, cada um com ID
sequencial `CN-001`, `CN-002`, ... Remova os `<!-- TODO -->` e o aviso de status.
Mantenha o arquivo curto — constituição longa não é lida.

---

### Bloco 8 — README do repositório (atualiza `README.md`)

Sem pergunta nova — este bloco só **compõe** o `README.md` do projeto a partir
do que já foi coletado nos Blocos 1–7. Quem entra no repositório pela primeira
vez lê o `README.md`, não `.claude/`; se ele continuar sendo o boilerplate do
`create-next-app`/`nest new`, a inicialização deixou a parte mais visível
incompleta.

1. Leia o `README.md` atual na raiz.
2. **Se não existir, ou for claramente boilerplate** (ex: contém "This is a
   [Next.js](...) project bootstrapped with `create-next-app`", ou tem menos
   de ~15 linhas de conteúdo real) — escreva um novo, com:
   - Título = nome do produto (Bloco 1) + tagline
   - 1–2 parágrafos: o que o produto faz (Bloco 1, pergunta 1–3) e estágio atual
   - Tabela de stack (do `architecture/overview.md` recém-preenchido)
   - "Quick Start": comandos de install/dev/test/build reais, lidos de
     `package.json` — não invente comando que não existe
   - Seção "Desenvolvimento com IA" apontando para `.claude/README.md`, com a
     tabela de slash commands mais usados no dia a dia (`/spec`, `/back`,
     `/front`, `/review`, `/checkpoint`, `/retomar`) e uma frase sobre o gate
     de Spec (`Status: approved` antes de implementar)
3. **Se já existir com conteúdo real e específico do produto** (não é
   boilerplate) — não substitua. Em vez disso, **acrescente** (ou atualize se
   já existir desatualizada) apenas a seção "Desenvolvimento com IA" descrita
   acima, ao final do arquivo. Não toque no resto do conteúdo existente sem
   perguntar.
4. Em ambos os casos, informe ao usuário exatamente o que foi feito: arquivo
   reescrito, ou seção específica adicionada/atualizada.

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
  - docs/context/constitution.md
  - .claude/settings.json        (guardrails de permissão)
  - README.md                    (reescrito | seção "Desenvolvimento com IA" adicionada)
  - .claude/CLAUDE.md             (estrutura do monorepo sincronizada com a real)

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
- Os Blocos 6 (Guardrails) e 7 (Constituição) são obrigatórios. Se o usuário quiser pular algum, avise o que fica faltando (limites de permissão e definição de "pronto" no caso do 6; princípios arquiteturais não-negociáveis no caso do 7) e peça confirmação explícita antes de pular.
- O Bloco 8 (README) não tem pergunta própria e não bloqueia nada — mas não pule silenciosamente: se decidir não tocar no README (ex: já é robusto e o usuário não confirmou a seção nova), diga isso explicitamente no resumo final.
- Não preencha arquivos parcialmente. Preencha apenas quando tiver todas as respostas do bloco.
- Quando preencher um arquivo: remova todos os `<!-- TODO -->`, remova o bloco `**Status do arquivo:** vazio` e sua nota associada, substitua pelo conteúdo real.
- Se o usuário responder "a definir" ou "não sei ainda", use um comentário `<!-- a definir -->` no campo correspondente — não deixe o placeholder original.
- Não invente informações. Se uma resposta estiver vaga, peça clarificação antes de escrever.

---

Argumento recebido (`$ARGUMENTS`): $ARGUMENTS

