# /specnico-onboard — design

**Status:** implementado
**Data:** 2026-10-22
**Base:** specnico 2.0.0 (main `23d97b4`)

## 1. Intenção

Quem instala o specnico num projeto que **já existe** hoje precisa passar pela
entrevista de 5 blocos do `/specnico-constitution` — feita para projeto novo —
e ainda assim não ganha uma visão do código que encontrou. O
`/specnico-onboard` resolve as duas coisas numa execução:

1. **Lê o repositório** e preenche, sem perguntar, os documentos que o
   `/specnico-constitution` preenche (memória em `.specify/memory/` e product
   backlog).
2. **Gera um resumo de onboarding** para o humano se familiarizar com o
   projeto. O que o usuário quer saber primeiro, nas palavras dele:
   **arquitetura, stack, como rodar e onde ficam as regras de negócio**.

## 2. Decisões do usuário

- **Grava direto, revisão depois.** Nada de confirmação item a item. O que for
  inferido é gravado; o que não dá para inferir entra marcado "a revisar".
- **Resumo em arquivo, não no chat.** O chat informa só o caminho do arquivo
  gerado. (Pedido explícito: "não precisa apresentar no chat, somente informar
  local do arquivo".)
- **Features existentes entram no backlog como `done`.**
- **Rodar de novo = atualizar só o que mudou no código** desde a última
  leitura. Campo inferido cuja evidência mudou é **sobrescrito com o valor
  novo**, mesmo que o usuário o tenha revisado. O que não é inferido do código
  (CN, GR, ADRs, itens existentes do backlog) nunca é tocado.
- **Nome:** `/specnico-onboard`.

## 3. Objetivos, não-objetivos, anti-objetivos

**Objetivos**
- Zero perguntas no caminho feliz.
- Memória utilizável pelas demais skills logo depois (constituição com
  `**Versão:**`, Identidade, Packs, seção 4 de comandos reais; backlog no
  formato do template).
- `overview.md` legível por qualquer pessoa do time, não só pelo agente.

**Não-objetivos**
- Não altera código do projeto, nem `README.md` do repositório, nem cria CI.
- Não substitui o `/specnico-constitution`: ajustes de princípios,
  guardrails e backlog futuro continuam lá (modo emenda).
- Não planeja trabalho futuro: o backlog ganha só o que **já existe** (`done`).

**Anti-objetivos (falha mesmo funcionando)**
- Inventar: comando que não roda, feature que não existe, regra de negócio sem
  evidência no código. Sem evidência → `(não configurado)` / "a revisar".
- Ler ou citar valores de segredo (`.env*`, `*.pem`, `*.key` — negados no
  `settings.example.json`). O resumo cita **nomes** de variáveis a partir de
  `.env.example` ou do código, nunca valores.
- Apagar ou sobrescrever numa re-execução o que **não** é inferido do código
  (CN, GR, ADRs, itens do backlog) ou um campo inferido cuja evidência não
  mudou.
- Despejar o resumo no chat.

## 4. Comportamento

### 4.1 Detecção de modo

Lê `.specify/state.json` (mostra a fase em uma linha, como as demais skills) e
`.specify/memory/constitution.md`, nesta ordem:

1. Marcador de migração 1.x (`<!-- migrado da 1.x: …`) ou backlog com
   `## Legado (1.x)` → **para** e aponta `/specnico-constitution` (modo
   migração). *Minha decisão: a migração já tem dono; dois caminhos para o
   mesmo legado divergiriam.*
2. Constituição no stub (`**Status do arquivo:** vazio`) → **primeira leitura**.
3. `.specify/memory/overview.md` existe com `**Última leitura:**` →
   **sincronização** (4.4).
4. Constituição preenchida sem `overview.md` (projeto que passou pela
   entrevista) → **sincronização sem base**: gera `overview.md`, acrescenta ao
   backlog só features `done` que ainda não estão lá, e não toca na
   constituição além de Identidade/Packs/seção 4 vazios ou `(não configurado)`.
   *Minha decisão.*

`ativo` diferente de `null` → avisa que há Spec em andamento e segue (só
escreve em `.specify/memory/`).

### 4.2 Leitura (primeira vez)

Fontes, nesta ordem de confiança: manifestos (`package.json`, lockfile,
`turbo.json`, `pnpm-workspace.yaml`, `tsconfig*`, `docker-compose*`,
`Dockerfile`, equivalentes de outras linguagens), CI (`.github/workflows/`),
`README.md`/docs existentes, estrutura de pastas, `git log` (idade, ritmo,
áreas mais tocadas) e, por fim, o código.

Repositório grande: a skill pode despachar subagentes somente leitura
(`Explore`) por área (ex: um por app do monorepo) e consolidar. *Minha
decisão; o critério de "grande" fica com o builder.*

### 4.3 O que grava

| Arquivo | Conteúdo inferido | "A revisar" quando |
|---|---|---|
| `constitution.md` | Formato do `constitution-template.md`, Versão `1.0.0`. §1 Identidade (nome, Modo, Projetos, Packs ativos pelos sinais de `.specify/packs/*/pack.json`); §2 CN = base padrão do constitution (CN-001..003); §3 GR = padrões GR-001..004 do constitution + GR por regra de negócio inviolável **com evidência** no código; §4 comandos só reais (scripts existentes), senão `(não configurado)`; §5 governança do template | CN/GR sempre marcados "a revisar" (são decisão humana) |
| `product.md` | Nome, descrição (README/manifesto), usuários e features **observáveis** (rotas, telas, comandos, endpoints), termos de domínio (nomes de entidades) | estágio, métrica de sucesso, não-escopo, restrições não-funcionais → `<!-- a definir -->` |
| `architecture.md` | Modo, packs, tabela de tecnologias real, camadas/módulos e como se comunicam; monorepo: tabela de projetos preenchida | desvios da arquitetura de referência viram nota, não correção |
| `conventions.md` | Convenções **observadas** (nomes, estrutura de pastas, padrão de testes, lint) e termos de domínio | — |
| `decisions.md` | ADR-001 "Stack existente (inferida pelo onboard)" | — |
| `projects/<x>.md` | Só monorepo: um por app/package, com stack e responsabilidade | — |
| `product-backlog.md` | Ver 4.3.1 | — |
| `overview.md` | Ver 4.3.2 | — |
| `state.json` | Cria se faltar (`ativo: null`); atualiza `atualizado` | — |
| `.claude/settings.json` | **Só se não existir**: cópia do `settings.example.json` com o gerenciador de pacotes real e só comandos de verificação reais em `allow`. Existente → não toca. *Minha decisão: o deny de segredos protege a própria leitura do onboard.* | — |

**Arquivo com conteúdo real não é sobrescrito.** Antes de gravar cada arquivo,
a skill verifica o marcador `**Status do arquivo:** vazio`: stub → grava;
conteúdo real (ex: `product.md` escrito à mão, instalação via Spec Kit,
entrevista interrompida) → não toca e lista, na seção "A revisar" do
`overview.md`, o que teria inferido para aquele arquivo. *Minha decisão
(anti-objetivo "apagar o que o usuário editou").*

Tudo marcado "a revisar" recebe o comentário `<!-- a revisar: specnico-onboard -->`
e é listado na seção "A revisar" do `overview.md`.

#### 4.3.1 Backlog

- Formato do `product-backlog-template.md`. Cabeçalho:
  `**Gerado por:** /specnico-onboard em <data> | **Modo:** <modo>`.
- Itens existentes com Status `done`, Spec `—`: fundação/arquitetura em Fases
  0 e 1; cada feature observável em Fase 2, agrupada em `F-<SIGLA>`. Cada item
  com entrada em `## Descrições` (o quê/porquê) e **`Pronto quando:`**
  descrevendo o que já é observável.
- `## Features`: uma linha por `F-<SIGLA>` com Status `live` (o valor que o
  `/specnico-converge` usa para feature concluída).
- **Chave de deduplicação** (re-execução e sincronização sem base): um item
  existente é "a mesma feature" quando compartilha o `F-<SIGLA>` **ou** algum
  caminho de evidência registrado em "Fonte" (rota, módulo, pasta). Casou →
  não acrescenta. Item renomeado ou fundido pelo usuário continua casando pela
  evidência. *Minha decisão.*
- Nenhum item `backlog` é criado — o futuro é do `/specnico-constitution`
  (emenda) ou do `/specnico-spec` com texto livre.
- Granularidade: um item = o que caberia numa Spec (nem função, nem o sistema
  inteiro). Projeto enorme: agrupar por feature e preferir menos itens.

#### 4.3.2 `overview.md`

Arquivo novo, `.specify/memory/overview.md`, para humanos. Seções, nesta ordem
(as quatro primeiras são o que o usuário pediu primeiro):

1. **Arquitetura** — estilo, camadas/módulos, como as partes conversam;
   monorepo: mapa apps/packages. Diagrama Mermaid opcional.
2. **Stack** — linguagem, frameworks, banco/ORM, auth, infra, versões.
3. **Como rodar** — pré-requisitos (Node via `.nvmrc`/`engines`, Docker…),
   instalar, variáveis de ambiente **por nome** (de `.env.example`), subir em
   dev, testar, build. Só comandos que existem.
4. **Onde ficam as regras de negócio** — caminhos (`src/domain/…`,
   services, validators, migrations) com 1 linha cada do que governam.
5. **Features** — lista ligada aos `F-<SIGLA>`/`Bnn` do backlog.
6. **Pontos de atenção** — partes frágeis/sem teste, dívidas visíveis
   (TODO/FIXME concentrados), dependências desatualizadas óbvias, configs
   sensíveis (sem valores).
7. **A revisar** — tudo marcado `<!-- a revisar: specnico-onboard -->`, com
   arquivo e campo.
8. **Fonte** — `**Última leitura:** <commit curto> em <data>` e a lista de
   evidências usadas (arquivos lidos por seção). É a âncora da sincronização.

### 4.4 Sincronização (re-execução)

- Base: commit em `**Última leitura:**`. Calcula `git diff --name-only
  <base>..HEAD` (mais working tree não commitada, ignorando `.specify/` e
  `specs/`).
- Um campo inferido só é recalculado se **alguma evidência dele mudou** (a
  lista "Fonte" mapeia campo → arquivos). Evidência intacta → campo intacto,
  mesmo que o usuário o tenha editado.
- Evidência mudou → o campo é **sobrescrito com o valor novo**, mesmo que o
  usuário o tenha revisado ou editado (decisão do usuário: o código é a
  verdade para o que é inferido). O valor anterior não some em silêncio: o
  campo volta a levar `<!-- a revisar: specnico-onboard -->` e entra numa
  subseção "Atualizados nesta leitura" de "A revisar" com valor antigo → novo.
  *O registro antigo → novo é minha decisão.*
- Nunca toca em: CN, GR, ADRs, itens existentes do backlog, nada que não
  carregue a origem do onboard.
- Backlog: só acrescenta features `done` novas (próximo `Bnn` livre).
- `overview.md` é regenerado nas seções cuja evidência mudou; "Fonte" e
  `**Última leitura:**` sempre atualizam.
- Base inexistente (rebase/force-push apagou o commit) → trata como
  sincronização sem base (4.1 item 4) e avisa.
- Nada mudou → diz isso em uma linha e não escreve.
- Sem git (ou repositório sem commits) → `**Última leitura:** sem git em
  <data>`; toda re-execução é leitura completa, ainda respeitando "arquivo com
  conteúdo real não é sobrescrito" e a chave de deduplicação. *Minha decisão.*

### 4.5 Saída no chat

Só isto:

```
Ativo: nenhum
Onboarding gravado em .specify/memory/overview.md (N itens a revisar).
Próximo: revise os itens "a revisar"; ajuste com /specnico-constitution (emenda); depois /specnico-spec <requisito>
```

Sem commit: os arquivos ficam no working tree para a revisão humana. *Minha
decisão — o usuário pediu para revisar depois; commit antes da revisão
inverteria isso.*

## 5. Restrições

- Skill em `.claude/skills/specnico-onboard/SKILL.md`, no estilo das demais
  (`allowed-tools` explícitos, seções "leia só ao chegar aqui", termina com
  `Próximo:`). `allowed-tools`: `Read, Write, Edit, Grep, Glob, Agent` e Bash só
  leitura (`ls`, `git log`, `git diff`, `git rev-parse`, `git status`,
  `git ls-files`); `disallowed-tools` não se aplica (precisa escrever em
  `.specify/memory/`).
- Escreve **só** em `.specify/memory/`, `.specify/state.json` e
  `.claude/settings.json` (se ausente).
- Português, como o resto do harness.
- Fluxo documentado passa a ter duas entradas:
  projeto novo → `/specnico-constitution`; projeto existente →
  `/specnico-onboard` → (revisão) → `/specnico-constitution` emenda opcional.

## 6. O que muda além da skill

- `.specify/templates/overview-template.md` (novo) com as 8 seções.
- `/specnico-constitution`: modo emenda reconhece memória gerada pelo onboard
  (Versão `1.0.0` normal — nada especial além de não estranhar
  `<!-- a revisar: specnico-onboard -->`, que a emenda remove ao confirmar o
  campo).
- `bin/cli.js`: mensagem pós-instalação sugere `/specnico-onboard` quando o
  diretório já tem código (manifesto ou `src/`), senão `/specnico-constitution`.
- Docs: `README.md` (utilização + fluxo), `.claude/README.md` (tabela de
  skills), `.claude/CLAUDE.md` (lista de comandos e fluxo), diagrama
  `meta/assets/fluxo-workflow.mmd`/`.png`, changelog e `releases.md` (2.1.0).
- Testes: `meta/tests/skills.test.mjs` (11 skills; frontmatter; `Próximo:`),
  `templates.test.mjs` (overview-template), `cli.test.mjs` (mensagem
  pós-instalação), lint-docs (comando citado existe).
- Versão: `2.1.0` (feature nova, sem quebra).

## 7. Deixado para o builder

- Heurística de "repositório grande" e divisão dos subagentes.
- Sinais por linguagem além de Node (Python, Go, Java…) — cobrir pelo menos
  os manifestos mais comuns, sem prometer pack que não existe.
- Granularidade exata dos itens `done` do backlog.
- Formato do mapa campo → evidência em "Fonte".
