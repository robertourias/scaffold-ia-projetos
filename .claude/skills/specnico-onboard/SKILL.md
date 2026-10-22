---
name: specnico-onboard
description: "Lê um projeto existente e preenche a memória do specnico (constituição, produto, arquitetura, convenções, decisões, backlog com features done) e o resumo de onboarding em .specify/memory/overview.md. Re-executar = sincroniza o que mudou no código"
argument-hint: "[área ou caminho para focar]"
allowed-tools: Read, Write, Edit, Grep, Glob, Agent, Bash(ls:*), Bash(git log:*), Bash(git diff:*), Bash(git rev-parse:*), Bash(git status:*), Bash(git ls-files:*)
---

# /specnico-onboard — leitura de um projeto existente

Você é o agente que chega a um projeto que **já existe**, lê o que encontra e
deixa o specnico pronto para trabalhar nele: a memória em `.specify/memory/`,
o product backlog com o que já foi entregue e um resumo de onboarding para os
humanos em `.specify/memory/overview.md`. Para projeto novo, o caminho é o
`/specnico-constitution`.

Entrada do usuário (área ou caminho para focar, opcional): `$ARGUMENTS`

Cada seção abaixo é lida **só ao chegar nela** — não antecipe o conteúdo das
seguintes.

## Regras gerais

- **Grave direto, sem perguntas.** O humano revisa depois. O que não dá para
  inferir com evidência leva `<!-- a revisar: specnico-onboard -->` no campo e
  entra em "A revisar" do `overview.md`.
- **Nunca invente.** Comando que não existe → `(não configurado)`; feature,
  regra de negócio ou decisão sem evidência no repositório → não entra (ou
  entra como "a revisar", dizendo o que falta).
- **Segredos:** nunca leia `.env*` (exceto `.env.example`), `*.pem` nem
  `*.key`. Variáveis de ambiente são citadas **por nome**, a partir de
  `.env.example` ou do código; nunca valores.
- **Escreve só** em `.specify/memory/`, `.specify/state.json` e
  `.claude/settings.json` (este só se não existir). Não altera código, o
  `README.md` do repositório nem o CI.
- **Arquivo com conteúdo real não é sobrescrito.** Na primeira leitura (e na
  sincronização sem base), antes de gravar cada arquivo da memória, procure
  `**Status do arquivo:** vazio`: com o marcador (stub) → grave; sem ele (ex:
  `product.md` escrito à mão com a constituição ainda vazia) → não toque e
  registre em "A revisar" o que teria escrito ali. Na sincronização, a regra é
  outra: edite só os campos listados em "Fonte" do `overview.md` (seção 5).
- Sem commit: tudo fica no working tree para a revisão humana.

## 1. Detecção de modo (leia só ao chegar aqui)

Leia `.specify/state.json` e mostre a fase atual em uma linha (formato de
`.specify/workflows/context-resolution.md`; ausente → `Ativo: nenhum`). Se
`ativo` for diferente de `null`, avise que há uma Spec em andamento e siga —
esta skill não toca em `specs/`.

Leia `.specify/memory/constitution.md`, `.specify/memory/product-backlog.md`
e `.specify/memory/overview.md` (se existir). O primeiro caso que casar vence:

1. A constituição começa com
   `<!-- migrado da 1.x: revise com /specnico-constitution -->` **ou** o
   backlog tem a seção `## Legado (1.x)` → **pare**: o projeto veio da 1.x e
   a conversão é do `/specnico-constitution` (modo migração). Diga isso em
   uma linha e encerre com `Próximo: /specnico-constitution`.
2. Constituição com `**Status do arquivo:** vazio` → **primeira leitura**:
   seções 2, 3 e 4, depois 6.
3. `overview.md` existe com `**Última leitura:**` → **sincronização**:
   seção 5, depois 6.
4. Constituição preenchida (tem `**Versão:**`) e sem `overview.md` — o projeto
   passou pela entrevista → **sincronização sem base**: seção 2; grave o
   `overview.md` (seção 3, último item); no backlog, só acrescente features
   `done` que ainda não estão lá (seção 4); na constituição, preencha só
   Identidade, Packs e comandos da seção 4 que estejam vazios ou
   `(não configurado)`. Depois seção 6.
5. Nenhum dos anteriores — constituição sem o stub e sem `**Versão:**`
   (instalação do Spec Kit, texto escrito à mão) ou `overview.md` sem
   `**Última leitura:**` → **sincronização sem base** como no caso 4, mas sem
   tocar na constituição: registre em "A revisar" o que teria preenchido nela.

`$ARGUMENTS` com área ou caminho → leia o projeto inteiro mesmo assim, mas
aprofunde ali (mais detalhe em arquitetura, regras e pontos de atenção).

## 2. Leitura (leia só ao chegar aqui)

Fontes, nesta ordem de confiança:

1. **Manifestos:** `package.json` (scripts, dependencies, devDependencies,
   `engines`, `workspaces`), lockfile, `turbo.json`, `pnpm-workspace.yaml`,
   `tsconfig*`, `docker-compose*`, `Dockerfile`, `.nvmrc`; equivalentes de
   outras linguagens (`pyproject.toml`, `requirements.txt`, `go.mod`,
   `Cargo.toml`, `pom.xml`, `build.gradle`, `composer.json`, `Gemfile`,
   `*.csproj`).
2. **CI:** `.github/workflows/` (comandos que de fato rodam).
3. **Docs existentes:** `README.md`, `docs/`, `CONTRIBUTING.md`, ADRs.
4. **Estrutura:** `git ls-files` (ou `ls` sem git) — pastas de domínio,
   camadas, apps/packages, testes.
5. **Histórico:** `git log` — idade, ritmo e as áreas mais tocadas.
6. **Código:** pontos de entrada, rotas, telas, comandos, entidades,
   validações, migrations.

Packs: leia `.specify/packs/README.md` e os `pack.json`; ative só os packs
cujos sinais aparecem nos manifestos. Nenhum aplicável → `nenhum`.

**Repositório grande** (monorepo com vários apps, ou mais código do que cabe
numa leitura): despache subagentes `Explore` (somente leitura), um por área —
por app/package em monorepo —, todos na mesma resposta, pedindo de cada um
stack, módulos, regras de negócio com caminho, features observáveis, comandos
e pontos de atenção, **com os arquivos de evidência**. Consolide você mesmo.

Para cada campo que vai gravar, anote os arquivos de evidência — eles formam
a tabela "Fonte" do `overview.md` (seção 3).

## 3. Gravação da memória (leia só ao chegar aqui)

Leia os templates em `.specify/templates/` e preencha, removendo os
`<!-- TODO -->` e o aviso `**Status do arquivo:** vazio` de cada arquivo
gravado (lembre: arquivo sem o aviso não é sobrescrito — vai para
"A revisar").

| Arquivo | Conteúdo |
|---|---|
| `.specify/memory/constitution.md` | De `constitution-template.md`: Versão `1.0.0`, Ratificada e Última emenda = hoje. §1 Identidade (nome, Modo — `single`, `monorepo` ou `microfrontends` pelos sinais —, Projetos, Packs ativos). §2 CN-001 a CN-003 e §3 GR-001 a GR-004 com o texto padrão do `/specnico-constitution` (Blocos 4 e 5), cada um com `<!-- a revisar: specnico-onboard -->` — princípios e guardrails são decisão humana. GR-005 em diante só para regra de negócio inviolável **com evidência** no código (ex: invoice só é anulada, nunca deletada), também a revisar. §4 comandos de type-check, lint, testes e build **só os que existem** (scripts, CI), senão `(não configurado)`. §5 Governança como no template |
| `.specify/memory/product.md` | De `product-template.md`: nome e descrição (README, manifesto), usuários e features **observáveis** (rotas, telas, comandos, endpoints), termos de domínio (entidades). Estágio, métrica de sucesso, não-escopo e restrições não-funcionais → `<!-- a definir -->` |
| `.specify/memory/architecture.md` | Preserve a estrutura e as seções de referência do arquivo (arquitetura de referência, Monorepo); preencha Modo, packs, tabela de tecnologias real, camadas/módulos e como conversam; monorepo: tabela "Projetos do Monorepo" preenchida. Desvio da arquitetura de referência vira nota, nunca correção |
| `.specify/memory/conventions.md` | Preserve a estrutura e as seções existentes (inclusive `## UI` e Monorepo, que outras skills e packs citam); acrescente as convenções **observadas** (nomes, estrutura de pastas, padrão de testes, lint) e os termos de domínio. Divergência do padrão vira nota, não substituição |
| `.specify/memory/decisions.md` | Preserve os ADRs padrão do arquivo; acrescente um ADR "Stack existente (inferida pelo onboard)" com a stack e os packs, no próximo número livre |
| `.specify/memory/projects/<apps-x>.md` | Só monorepo: um por app/package (ex: `apps-api.md`), com stack e responsabilidade |
| `.specify/memory/product-backlog.md` | Seção 4 |
| `.specify/state.json` | Crie se faltar: `{ "versao": 1, "ativo": null, "atualizado": "<ISO 8601 de agora>" }`; se existir, só `atualizado` |
| `.claude/settings.json` | **Só se não existir:** copie `.claude/settings.example.json`; em `permissions.allow`, mantenha só comandos de verificação que existem e o gerenciador de pacotes real (pelo lockfile). Valide o JSON. Existente → não toque |
| `.specify/memory/overview.md` | Por último, de `overview-template.md` — abaixo |

**`overview.md`.** É o resumo para humanos. As quatro primeiras seções são o
que quem chega precisa primeiro: **arquitetura, stack, como rodar e onde ficam
as regras de negócio**. Seja concreto (caminhos, comandos reais, nomes de
variáveis). "A revisar" lista cada campo marcado e cada arquivo não
sobrescrito. "Fonte" traz `**Última leitura:** <commit curto> em <data>`
(`git rev-parse --short HEAD`; sem git ou sem commits:
`**Última leitura:** sem git em <data>`) e a tabela campo → arquivo →
evidências.

## 4. Backlog (leia só ao chegar aqui)

Grave `.specify/memory/product-backlog.md` no formato de
`.specify/templates/product-backlog-template.md`, com o cabeçalho
`**Gerado por:** /specnico-onboard em <data> | **Modo:** <modo>`.

- Só o que **já existe**: todo item com Status `done` e Spec `—`. Nenhum item
  `backlog` — o futuro é do `/specnico-constitution` (emenda) ou do
  `/specnico-spec` com texto livre.
- Fundação e arquitetura existentes nas Fases 0 e 1; cada feature observável
  na Fase 2, agrupada em `F-<SIGLA>`. Fases 3 e 4 ficam vazias.
- Cada item tem entrada em `## Descrições` (o quê e porquê, nunca o como) e
  `**Pronto quando:**` descrevendo o que já é observável.
- `## Features`: uma linha por `F-<SIGLA>` com Status `live`.
- Granularidade: um item = o que caberia numa Spec. Projeto grande → agrupe
  por feature e prefira menos itens.
- **Deduplicação** (re-execução e sincronização sem base): um item existente é
  a mesma feature quando compartilha o `F-<SIGLA>` **ou** algum caminho de
  evidência registrado em "Fonte". Casou → não acrescente. Novos itens usam o
  próximo `Bnn` livre; nunca renumere nem altere itens existentes.

## 5. Sincronização (leia só ao chegar aqui)

Rodar de novo atualiza só o que mudou no código desde a última leitura.

1. **Base:** o commit em `**Última leitura:**`. Liste o que mudou com
   `git diff --name-only <base>..HEAD` mais `git status --porcelain -uall`
   (working tree, arquivo a arquivo), ignorando `.specify/`, `specs/` e `.claude/`.
   - Base que não existe mais (rebase, force-push) → avise em uma linha e
     siga como sincronização sem base (seção 1, caso 4).
   - `sem git` → leitura completa, com as mesmas regras de não sobrescrever e
     de deduplicação.
2. **Nada mudou** — nenhum arquivo de evidência da tabela "Fonte" mudou e não
   há código novo fora dela → diga isso em uma linha e não escreva nada.
3. **Recalcule só os campos cuja evidência mudou** (tabela "Fonte"). Evidência
   intacta → campo intacto, mesmo que o humano o tenha editado.
4. **Evidência mudou → sobrescreva o campo com o valor novo**, mesmo que o
   humano o tenha revisado: para o que é inferido, o código é a verdade. O
   campo volta a levar `<!-- a revisar: specnico-onboard -->` e entra em
   "Atualizados nesta leitura" com o valor antigo → novo.
5. **Nunca toque** em CN, GR, ADRs, itens existentes do backlog nem em nada
   que não seja inferido do código.
6. Backlog: só acrescente features `done` novas (regra de deduplicação).
7. `overview.md`: regenere as seções cuja evidência mudou; "Fonte" e
   `**Última leitura:**` sempre atualizam.

## 6. Saída (leia só ao chegar aqui)

Não despeje o resumo no chat. Responda só com:

```
Ativo: <fase atual ou nenhum>
Onboarding gravado em .specify/memory/overview.md (<N> itens a revisar).
```

Na sincronização sem mudanças, a segunda linha é
`Nada mudou desde <commit>: memória e overview.md intactos.`

Próximo: revise os itens "a revisar" em .specify/memory/overview.md; ajuste com /specnico-constitution (emenda); depois /specnico-spec <requisito>
