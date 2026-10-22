---
name: specnico-constitution
description: "Cria ou emenda a constituição do projeto: entrevista em 5 blocos, gera a memória (.specify/memory), o product backlog, settings.json e o CI. Re-executar = modo emenda; projeto migrado da 1.x = modo migração"
argument-hint: "[princípios ou ajuste]"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(ls:*), Bash(cat:*), Bash(git log:*), Bash(git status:*), Bash(git add:*), Bash(git commit:*)
---

# /specnico-constitution — constituição, memória e backlog

Você é o agente que dá ao projeto sua **memória** (`.specify/memory/`) e seu
**roteiro** (`product-backlog.md`). Roda uma vez por projeto; rodar de novo é
**emenda**. Substitui o `init-project` e o `backlog` da 1.x.

Entrada do usuário (princípios ou ajuste, opcional): `$ARGUMENTS`

Cada seção abaixo é lida **só ao chegar nela** — não antecipe o conteúdo das
seguintes.

## Regras gerais

- **Uma pergunta por mensagem**, sem exceção.
- **Proponha, não pergunte em aberto** quando houver sinal no repositório
  (`package.json`, lockfile, `turbo.json`, `apps/`, `.gitignore`,
  `.github/workflows/`): "Encontrei X, é esse mesmo?" custa uma palavra. Pergunta
  aberta só sem nenhum sinal.
- Não grave arquivo de um bloco antes de concluir as perguntas dele.
- Resposta "a definir" → `<!-- a definir -->` no campo; nunca deixe o placeholder
  original, nunca invente.
- Resposta vaga → peça clarificação antes de escrever.
- Nunca `git add -A`, `git add .` nem `git commit -a`: stage só de caminhos explícitos.

## 1. Detecção de modo (leia só ao chegar aqui)

Leia `.specify/state.json` e mostre a fase atual em uma linha (formato de
`.specify/workflows/context-resolution.md`; ausente → `Ativo: nenhum`). Se `ativo`
for diferente de `null`, avise que há uma Spec em andamento antes de seguir
(emenda pode afetá-la).

Leia `.specify/memory/constitution.md` e `.specify/memory/product-backlog.md`.
Os modos são testados nesta ordem — o primeiro que casar vence:

1. A constituição começa com `<!-- migrado da 1.x: revise com /specnico-constitution -->`
   (gravado pelo `npx specnico --migrate`) **ou** o backlog tem a seção
   `## Legado (1.x)` → **modo migração**: seção 7, depois 8. Vence o stub: uma
   constituição 1.x nunca preenchida chega com o stub concatenado aos guardrails.
2. Contém `**Status do arquivo:** vazio` (stub) → **modo criação**: seções 2 a 5, depois 8.
3. Já preenchida (tem `**Versão:**`) → **modo emenda**: pule para a seção 6, depois 8.

Nenhum dos três (arquivo ausente ou texto sem `**Versão:**`) → mostre o que
encontrou e proponha criação ou migração; uma pergunta.

## 2. Entrevista (leia só ao chegar aqui)

Cinco blocos, nesta ordem. Faça as perguntas de cada bloco uma por vez.

### Bloco 1 — Produto (alimenta `product.md`)

1. Nome do produto e tagline (proposta de valor em uma frase).
2. Estágio atual: ideia, MVP, crescimento ou escala.
3. Usuário primário: papel, objetivo principal e maior problema que o produto resolve.
4. Funcionalidades, cada uma com prioridade **P1 / P2 / P3** (nome + descrição curta).
5. Regras de negócio críticas — restrições que um agente jamais pode violar
   (ex: "invoice não pode ser deletada, só anulada").
6. Termos de domínio que precisam de definição precisa.
7. Restrições não-funcionais: escala, compliance (LGPD, HIPAA, PCI), disponibilidade. "Nenhuma por ora" é resposta válida.
8. O que o produto **explicitamente não faz** (anti-scope-creep).
9. Métrica de sucesso principal. "Ainda não definida" é válido.

### Bloco 2 — Modo e projetos (alimenta Identidade e `architecture.md`)

Inspecione antes de perguntar: `turbo.json` ou `apps/` + `packages/` → sugira
`monorepo`; `@module-federation/*` ou `module-federation.config.*` → sugira
`microfrontends`; sem sinal → `single`.

1. "O projeto é **single**, **monorepo** ou **microfrontends**?" (já com o palpite).
2. `monorepo` / `microfrontends`: quais apps e packages estão previstos? Cada um
   vira um item de arquitetura no backlog — **não crie apps nem packages aqui**.
3. `microfrontends`: qual é o host, quais os remotes, libs singleton
   (react, react-dom) e como o contrato host↔remote é versionado.

### Bloco 3 — Stack e packs (alimenta `architecture.md` e `decisions.md`)

Leia `package.json` (dependencies e devDependencies) e o lockfile; proponha o
que encontrou ("Vi `@prisma/client`, é o ORM em uso?"). Leia
`.specify/packs/README.md` e os `pack.json` disponíveis.

1. Linguagem, frameworks, banco, ORM, autenticação, filas e cache. Em
   monorepo, só o que é **compartilhado** — a stack por app é decidida no
   `/specnico-plan` do item de arquitetura correspondente.
2. Hospedagem e CI/CD (podem ser "a definir").
3. Packs: "Encontrei os sinais X; ativo os packs `<ids>`?". Aceite zero ou mais
   IDs distribuídos. Nenhum aplicável → registre `nenhum` e **não invente stack**.

### Bloco 4 — Princípios e guardrails (alimenta seções 2 e 3 da constituição)

**Princípios (CN-NNN).** Proponha a base e deixe o usuário editar:

- CN-001 Clean Architecture — dependências apontam para dentro; domínio sem framework.
- CN-002 Teste junto com a implementação, no mesmo diff.
- CN-003 Contrato antes de consumo — API/tipo definido antes de quem o usa.

Pergunte: há algum princípio específico do produto que um agente jamais pode
violar, mesmo sob prazo? Cada princípio é uma regra **verificável** com "Por quê".
Mantenha curto — constituição longa não é lida.

**Guardrails (GR-NNN).** Proponha estes como padrão (o usuário pode editar ou
remover qualquer um) e peça só o que falta:

- GR-001 Caminhos protegidos — nunca editar sem pedido explícito: `.env*`
  (exceto `.env.example`), migrations já aplicadas, workflows de CI
  (`.github/workflows/`), infra/terraform. Pergunte também por caminhos de
  segredo específicos do projeto.
- GR-002 Operações proibidas — `git push --force`, `git reset --hard`,
  `git clean -fd`, `--no-verify`, `npm publish` (e equivalentes), reset/drop de
  banco fora de ambiente local descartável, e stage em massa
  (proibidos: `git add -A`, `git add .`, `git commit -a`).
- GR-003 Escalar ao humano — parar e perguntar em: autenticação/autorização,
  migration destrutiva, breaking change em API publicada, nova dependência de
  runtime, qualquer coisa que mova dinheiro ou exponha dado pessoal.
- GR-004 Verificação — comando não configurado é registrado como
  `(não configurado)`; **nunca invente um comando que não roda**.
- GR-005 em diante — regras de negócio invioláveis (reaproveite as do Bloco 1,
  pergunta 5) e gatilhos de escalação específicos do produto.

### Bloco 5 — Verificação e ferramentas (alimenta seção 4 da constituição)

Antes de perguntar, leia os scripts reais de `package.json` e a existência de
`.github/workflows/`. Proponha o que encontrou: "Achei `npm run test` — é esse?".

1. Comando de **type-check**.
2. Comando de **lint**.
3. Comando de **testes**.
4. Comando de **build**.
5. Escopo de cada um (raiz ou por app/package).

**A seção 4 só aceita comando que existe.** Sem script, sem ferramenta
instalada ou sem resposta confirmada → `(não configurado)`. Se algum ficou
assim, avise ao final:

> Sem comando de `<verificação>`, nenhum agente consegue provar que o código
> funciona — os critérios de aceite viram autodeclaração. Configure antes de
> rodar `/specnico-spec`.

## 3. Geração da memória (leia só ao chegar aqui)

Só depois de concluir os cinco blocos. Leia os templates em
`.specify/templates/` e preencha, removendo todo `<!-- TODO -->` e o aviso
`**Status do arquivo:** vazio` de cada arquivo escrito:

| Arquivo | Conteúdo |
|---|---|
| `.specify/memory/constitution.md` | De `constitution-template.md`: Versão `1.0.0`, Ratificada e Última emenda = hoje. Seção 1 Identidade (Modo, Projetos, Packs ativos — `nenhum` se não houver), 2 CN, 3 GR, 4 Comandos (só reais, senão `(não configurado)`), 5 Governança (mantenha como está) |
| `.specify/memory/product.md` | De `product-template.md`, com as respostas do Bloco 1 |
| `.specify/memory/architecture.md` | Campo `**Modo:**`, `**Packs de stack:**` e tabela de tecnologias com as escolhas reais. Em monorepo/microfrontends a tabela "Projetos do Monorepo" começa vazia — é preenchida pelos itens de arquitetura |
| `.specify/memory/conventions.md` | Termos de domínio (Bloco 1, pergunta 6). Sem termos: deixe o arquivo como está e avise |
| `.specify/memory/decisions.md` | **ADR-001** registrando a stack escolhida (Bloco 3) e seus packs. Mantenha os defaults do template quando o usuário não os alterou |
| `.specify/state.json` | `{ "versao": 1, "ativo": null, "atualizado": "<ISO 8601 de agora>" }` |
| `README.md` | Ver abaixo |

Em monorepo/microfrontends, campos por app ficam `<!-- definido por app -->` —
isso é esperado, não parcialidade.

**README.md do repositório.** Leia o atual. Se não existir ou for boilerplate
(`create-next-app`, `nest new`, menos de ~15 linhas reais), escreva um novo:
nome + tagline, 1–2 parágrafos do que o produto faz e estágio, tabela de stack,
"Quick Start" com comandos reais lidos de `package.json` (não invente) e uma
seção "Desenvolvimento com IA" com o fluxo `/specnico-spec` → `/specnico-plan`
→ `/specnico-approve` → `/specnico-implement` e o gate de Spec (`approved`
antes de implementar). Se já tiver conteúdo real do produto, **acrescente** só
a seção "Desenvolvimento com IA" e não toque no resto. Diga ao usuário o que fez.

## 4. Geração do backlog (leia só ao chegar aqui)

Escreva `.specify/memory/product-backlog.md` seguindo
`.specify/templates/product-backlog-template.md`. Não invente features fora do
`product.md` e do que o usuário disse.

**Fases 0 e 1 por modo:**

| Modo | Fase 0 — Fundação | Fase 1 — Arquitetura |
|---|---|---|
| `single` | projeto base + tooling + CI | 1 item: estrutura em camadas da stack |
| `monorepo` | workspace + config compartilhada + CI | 1 item por app/package declarado |
| `microfrontends` | workspace + CI | shell + 1 item por remoto |

**Fases 2–4** vêm das funcionalidades P1 (Fase 2 — MVP), P2 (Fase 3 —
Complementar) e P3 (Fase 4 — Polimento) do Bloco 1, agrupadas em features
`F-<SIGLA>` (ex: `F-AUTH`). Itens de fundação e arquitetura têm `Feature: —`.

**Regras:**

- IDs `B01`, `B02`, … sequenciais e **estáveis**: nunca renumerados.
- Colunas: ID, Título, Tipo (`fundação | arquitetura | feature`), Escopo, Feature,
  Depende, Status (todos `backlog`), Spec (`—`).
- Cada item tem entrada em `## Descrições`: 2–5 linhas do **quê e porquê, nunca o
  como**, mais `**Pronto quando:**` com um resultado observável. Cada item deve
  caber em **uma Spec** — nem uma função, nem um módulo inteiro.
- Ordene por dependência lógica: infraestrutura → domínio → backend → frontend
  → integração → polimento. `Depende` lista os IDs que devem estar `done` antes.
- Uma feature que toca 2+ projetos é **um único item** (Escopo lista todos); o
  fan-out por projeto acontece no plano.
- `## Features`: uma linha por `F-<SIGLA>` com Itens, Status `planejada` e Resumo de 1 linha.
- **Proponha o backlog em lista numerada e pergunte** "Quer alterar ordem,
  adicionar, remover ou renomear algo antes de gravar?" Só grave após aprovação.
- Cabeçalho: `**Gerado por:** /specnico-constitution em <data> | **Modo:** <modo>`.

## 5. Ferramentas (leia só ao chegar aqui)

**`.claude/settings.json`.** Se não existir, copie `.claude/settings.example.json`
e ajuste: acrescente a `permissions.deny` os caminhos de segredo e operações
destrutivas do GR-001/GR-002; a `permissions.ask`, a escrita nos caminhos
protegidos; em `permissions.allow`, mantenha só comandos de verificação que
**existem** e o gerenciador de pacotes real (pelo lockfile). Mantenha o bloco
`hooks`. Valide o JSON antes de salvar. Se já existir, não sobrescreva — mostre
o que mudaria e confirme. Avise: `settings.json` é versionado e vale para o
time; preferências pessoais vão em `.claude/settings.local.json`. Os hooks
falham em aberto: sem ESLint/TypeScript ficam inertes — diga isso.
`permissions.deny` reduz acidente, não é sandbox; a proteção forte é o gate
humano de Spec e os hooks.

**CI.** Leia `.specify/templates/ci/verify.yml` e pergunte "Instalo em
`.github/workflows/verify.yml`?". Se sim: troque cada passo marcado
`# scaffold:type-check|lint|test|build` pelo comando real da seção 4 da
constituição (`(não configurado)` → remova o passo); gerenciador de pacotes pelo
lockfile (pnpm, yarn ou npm; sem lockfile → remova `cache:`, use `npm install` e
recomende commitar um lockfile); Node por `.nvmrc`, senão `engines.node`, senão
`lts/*`; branch do `push` = branch padrão. Arquivo existente: mostre a diferença
e confirme antes de sobrescrever. Sem CI, registre em "requer revisão manual".

## 6. Modo emenda (leia só ao chegar aqui)

Memória gerada pelo `/specnico-onboard` é emenda normal (já tem `**Versão:**`).
Campo marcado `<!-- a revisar: specnico-onboard -->` que o usuário confirma ou
altera perde o marcador, e a linha correspondente sai de "A revisar" em
`.specify/memory/overview.md`.

1. Entenda o ajuste (`$ARGUMENTS` ou pergunte, uma pergunta por vez).
2. **Mostre o diff proposto** da constituição e do que mais mudar, e espere confirmação.
3. Incremente a **Versão** (semver) e atualize **Última emenda**:
   - **MAJOR** — princípio ou guardrail removido ou redefinido;
   - **MINOR** — princípio, guardrail ou seção nova;
   - **PATCH** — só redação.
4. **Replanejamento do backlog** (opcional): reordenar fases, incluir itens
   (próximo `Bnn` livre), marcar itens `descartado`. **Nunca** altere itens
   `in-progress` ou `done`, nunca renumere IDs; descarte mantém a linha com
   Status `descartado`. Backlog ainda no stub (`**Status do arquivo:** vazio`):
   não há o que replanejar — ofereça gerá-lo pela seção 4 (a partir do
   `product.md` atual) ou deixá-lo como está.
5. **Relatório de sincronização:** liste templates (`.specify/templates/`),
   skills e specs em `specs/` que citam um CN/GR alterado ou removido, para
   revisão humana. Não os edite por conta própria.
6. Atualize `atualizado` em `.specify/state.json`; não altere `ativo`.

## 7. Modo migração (leia só ao chegar aqui)

Projeto convertido da 1.x pelo `npx specnico --migrate`: a constituição traz o
texto 1.x concatenado (constitution + guardrails, cada trecho depois de um
`<!-- origem 1.x: … -->`) e o backlog traz os backlogs 1.x sob
`## Legado (1.x)`, sem reformatar. Regra de ouro: **nenhum texto legado some**.

1. **Inventário.** Leia a constituição migrada, o backlog e o que já foi movido
   (`product.md`, `architecture.md`, `conventions.md`, `decisions.md`). Mapeie o
   texto legado nos cinco blocos da seção 2 — identidade (Modo, Projetos,
   Packs), princípios → CN, guardrails → GR, comandos de verificação →
   seção 4, governança — e mostre o mapa (trecho legado → destino) antes de
   perguntar.
2. **Entrevista só do que falta.** Regras da seção 2, pré-preenchida: campo
   que o legado responde → proponha ("A 1.x diz X; mantenho?"); pergunte, uma
   por vez, só o que o legado não responde. Comandos: a regra do Bloco 5 vale
   (só comando que existe).
3. **Constituição.** Reescreva `.specify/memory/constitution.md` no formato de
   `constitution-template.md`: Versão `1.0.0`, Ratificada e Última emenda =
   hoje, seções 1 a 5. Remova o marcador de migração e os comentários
   `<!-- origem 1.x: … -->`. Trecho que não cabe nas seções 1–5 não é
   descartado: vai para `## Apêndice — Legado 1.x` no fim da constituição ou,
   se for decisão técnica ou convenção, para `decisions.md` (ADR novo) ou
   `conventions.md`. Diga para onde foi cada trecho.
4. **Backlog.** Converta cada item de `## Legado (1.x)` numa linha `Bnn` das
   tabelas de fase, com as regras da seção 4 (IDs a partir de `B01`, Tipo,
   Escopo, Feature, Depende, entrada em `## Descrições`). Status: concluído na
   1.x → `done`; o resto → `backlog`; coluna Spec `—`. Texto que não vira item
   (notas, critérios) vai para a Descrição do item ou para
   `## Notas do legado (1.x)` no fim do arquivo. Proponha a lista numerada
   (legado → `Bnn`) e **só grave após confirmação**; a seção `## Legado (1.x)`
   sai só depois de convertida. Cabeçalho:
   `**Gerado por:** /specnico-constitution (migração 1.x) em <data> | **Modo:** <modo>`.
5. **Ferramentas.** Seção 5. `.claude/settings.json` vindo da 1.x: mostre o
   diff contra `.claude/settings.example.json` (comandos 1.x, hooks 2.0) e
   confirme antes de alterar.
6. **Estado.** `.specify/state.json` fica com `ativo: null` e `atualizado` =
   agora (crie se faltar); nunca aponte para `specs/legacy/`.

## 8. Commit e handoff (leia só ao chegar aqui)

Resuma: arquivos escritos, comandos `(não configurado)`, CI instalado ou não e
o que "requer revisão manual". Pergunte se pode commitar listando exatamente os
arquivos escritos nesta sessão. Só com confirmação, stage explícito desses
caminhos e commit:

`docs(constitution): criação` (modo criação), `docs(constitution): emenda vX.Y.Z`
(modo emenda) ou `docs(constitution): migração 1.x` (modo migração)

Sem confirmação, não commite: as mudanças seguem no working tree.

Próximo: `/specnico-spec <Bnn>` — o primeiro item `backlog` com dependências `done` (`B01` num projeto novo)
