# Prompt: Atualizar Harness para a Versão Atual do Scaffold

> Use este prompt num projeto que **já usa** uma versão anterior do
> `scaffold-ia-projetos` e ficou para trás — estrutura antiga
> (`docs/commands/`, `docs/skills/`, `docs/workflows/`, `docs/prompts/`,
> `AGENTS.md`), sem guardrails/constituição, sem subagentes, sem hooks, ou
> com comandos que não existem mais na versão atual.
>
> Diferente do [bootstrap retroativo](retroactive-documentation.md) (que
> **gera** conteúdo de produto a partir da análise do código de um projeto
> que nunca usou o scaffold), este prompt **migra a estrutura do harness**
> — o conteúdo de produto que você já escreveu em `docs/context/` nunca é
> sobrescrito.

Cole este documento inteiro no Claude Code, rodando na raiz do projeto que
você quer atualizar.

---

Você é o PLANNER. Seu trabalho é levar o harness deste projeto (`.claude/` e
a organização de `docs/`) para a versão atual do `scaffold-ia-projetos`,
preservando **integralmente** o conteúdo de produto que já foi escrito.

**Regra absoluta: nunca sobrescreva sem diff explícito e confirmação.**
Arquivos de harness (comandos, skills, agents, hooks, templates, workflows,
prompts) são substituídos pela versão atual — eles não têm customização de
produto, só de fluxo. Arquivos de produto (`docs/context/*.md` já
preenchidos, `docs/architecture/*.md` já preenchidos, specs ativas,
`docs/archive/`, `docs/features/`, `docs/changelog/`) **nunca são
sobrescritos** — são só lidos, e complementados quando faltar algo novo.

## Passo 0 — Diagnóstico (não altera nada ainda)

Verifique cada sinal e classifique a distância da versão atual:

| Sinal encontrado | Significa |
|-------------------|-----------|
| `docs/commands/`, `docs/skills/`, `docs/workflows/`, `docs/prompts/` existem | Harness pré-consolidação — comandos e skills ainda espalhados em `docs/` em vez de `.claude/` |
| `AGENTS.md` na raiz | Versão com suporte multi-ferramenta (Cursor/Copilot/Codex) — descontinuado |
| `docs/specs/spec-template.md` existe (não `.claude/templates/`) | Template ainda não migrado |
| `.claude/skills/` não existe, ou existe mas sem `SKILL.md` com frontmatter YAML | Skills de papel ausentes ou em formato antigo (arquivo solto tipo `docs/skills/backend.md`) |
| `.claude/agents/` não existe | Sem subagentes — `/hands-on`, se existir, roda tudo inline |
| `.claude/hooks/` não existe, ou `.claude/settings.json` sem bloco `hooks` | Sem verificação automática nem gate de Spec mecânico |
| `docs/context/guardrails.md` não existe | Sem guardrails — projeto roda sem limites de permissão nem definição de "pronto" |
| `docs/context/constitution.md` não existe | Sem princípios arquiteturais não-negociáveis |
| `.claude/commands/commit.md` existe, ou `/commit` é mencionado em `.claude/README.md` / `README.md` | Comando descontinuado — removido, sem substituto (commit volta a ser manual) |
| `docs/context/product.md` sem seção "Restrições Não-Funcionais" | `/init-project` desta versão nunca rodou (ou rodou numa versão anterior ao Bloco 1 estendido) |
| `.claude/settings.json` (do usuário, não o example) com `"defaultMode": "auto"` | Bug de versão muito antiga — `"auto"` não é um valor válido de `defaultMode` |

Monte um resumo do que falta **antes** de tocar em qualquer arquivo e
apresente ao usuário. Pare e peça confirmação para prosseguir — este prompt
remove arquivos antigos, não é só aditivo.

**Antes de prosseguir, confirme que a working tree está limpa**
(`git status --short` sem saída). Se houver mudanças não commitadas, peça
para o usuário commitar ou stash antes de continuar — esta migração toca
muitos arquivos e um `git diff` sujo dificulta revisar o que foi automático.

## Passo 1 — Atualizar `.claude/` (harness)

Se você tiver acesso local ao repositório `scaffold-ia-projetos` (pergunte o
caminho se não foi informado), copie a pasta `.claude/` inteira de lá,
**sobrescrevendo** a `.claude/` deste projeto — exceto os dois arquivos
abaixo, que são específicos deste projeto e nunca vêm do scaffold:

- `.claude/settings.json` (não é o mesmo que `settings.example.json` — ver Passo 4)
- `.claude/settings.local.json`, se existir (preferência pessoal, já ignorado pelo git)

Se não tiver acesso ao repositório, regenere `.claude/` seguindo fielmente a
estrutura documentada no `README.md` do `scaffold-ia-projetos` (comandos,
subagentes, skills de papel, hooks de verificação, templates de spec) — são
reutilizáveis entre projetos e não dependem deste código específico.

## Passo 2 — Remover estruturas obsoletas de `docs/`

Liste, **não delete ainda**, os candidatos a remoção com base no diagnóstico
do Passo 0: `docs/commands/`, `docs/skills/`, `docs/workflows/`,
`docs/prompts/`, `docs/specs/spec-template.md`, `AGENTS.md`.

Para cada um, verifique se o conteúdo é genérico (igual ou quase igual ao que
já foi copiado para `.claude/` no Passo 1) ou se tem customização real deste
projeto:

- **Genérico** → seguro remover.
- **Customizado** (alguém editou o texto do comando, ou a skill tem trecho
  específico deste produto) → **não remova**. Aponte a diferença ao usuário
  e pergunte se a customização deve ser portada para o arquivo equivalente
  em `.claude/` antes de remover o antigo.

Só remova após listar tudo e o usuário confirmar.

## Passo 3 — Preencher guardrails e constituição, se ausentes

Se `docs/context/guardrails.md` ou `docs/context/constitution.md` não
existirem (ou existirem só como template vazio, nunca preenchido), rode
agora o equivalente aos **Blocos 6 e 7 de `/init-project`**: inspecione o
repositório (scripts de `package.json`, `.gitignore`, migrations, CI) antes
de perguntar, colete os comandos de verificação reais, caminhos protegidos,
regras `GR-XXX` e princípios `CN-XXX`, e preencha os dois arquivos.

Isso é preenchimento de **produto** (específico deste projeto) — pergunte,
não copie de outro lugar.

## Passo 4 — Sincronizar `.claude/settings.json`

**Nunca sobrescreva `settings.json` do usuário direto** — ele pode ter
customizações (deny/ask/allow adicionais específicos deste projeto). Faça um
merge:

1. Leia o `.claude/settings.json` atual (se existir) e o novo
   `.claude/settings.example.json` (copiado no Passo 1).
2. Se o `settings.json` atual não tiver o bloco `hooks` — acrescente (versões
   anteriores aos hooks de verificação não tinham). Confirme que
   `.claude/hooks/*.mjs` foi copiado no Passo 1.
3. Se `defaultMode` estiver como `"auto"` — **corrija**. Não é um valor
   válido; use `"acceptEdits"` (ou o que o `settings.example.json` atual
   traz) e avise o usuário que era um bug de versão antiga.
4. Preserve todo `deny`/`ask`/`allow` que já existia no `settings.json` do
   usuário e não está no `example.json` — é customização deste projeto, não
   descarte. Acrescente as entradas novas do `example.json` que ainda não
   estão lá.
5. Valide o JSON resultante antes de salvar.

## Passo 5 — Completar `docs/context/product.md`

Se faltarem as seções "Restrições Não-Funcionais", "Out of Scope" ou
"Metrics & Success Criteria" (adicionadas ao template numa versão mais
recente do Bloco 1 de `/init-project`), faça as 3 perguntas correspondentes
— uma por vez, mesmo padrão do `/init-project`:

1. Há restrições não-funcionais (escala, compliance, disponibilidade) que a arquitetura precisa respeitar?
2. O que este produto explicitamente não faz?
3. Qual é a métrica de sucesso principal?

Resposta "ainda não definida" é válida — marque `<!-- a definir -->`, não
invente.

## Passo 6 — README do projeto

Se o `README.md` da raiz não tiver uma seção "Desenvolvimento com IA"
apontando para `.claude/README.md` e listando os slash commands do dia a
dia, acrescente-a ao final — mesmo critério do Bloco 8 de `/init-project`:
**acrescenta, nunca substitui** conteúdo existente.

## Passo 7 — Verificação final

Rode esta checklist mecânica antes de reportar sucesso:

- `.claude/commands/*.md` — todos com frontmatter YAML válido (`description`
  entre aspas se contiver `:`)
- `.claude/skills/*/SKILL.md` — todos com frontmatter `name` + `description`
- `.claude/agents/*.md` — `reviewer.md` sem `Edit`/`Write` em `tools:`
- `.claude/hooks/*.mjs` — sintaxe válida (`node --check`)
- `.claude/settings.json` — JSON válido
- Nenhum link markdown quebrado em `docs/` ou `.claude/` (procure por
  referências a caminhos que não existem mais, ex: `docs/skills/`,
  `docs/commands/`, `/commit`)

Se algo falhar, corrija antes de reportar — não entregue migração
parcialmente quebrada.

## Passo 8 — Confirmar

Encerre com um resumo estruturado:

```
✅ .claude/ atualizado para a versão atual do scaffold
🗑️ Removido: [lista de docs/commands/, docs/skills/, etc. — ou "nada, tudo tinha customização, ver abaixo"]
⚠️ Customização preservada (não removida automaticamente): [lista ou "nenhuma"]
🛡️ Guardrails: [já existia | gerado agora] — [n] regras GR-XXX
📜 Constituição: [já existia | gerada agora] — [n] princípios CN-XXX
⚙️ settings.json: [merge feito | já estava atualizado] — defaultMode corrigido: [sim/não aplicável]
📄 product.md: [seções novas preenchidas | já estava completo]
📄 README.md: [seção "Desenvolvimento com IA" adicionada | já existia]
✅ Verificação final: [passou | itens corrigidos: lista]

Próximo passo sugerido: revisar o diff (`git diff --stat`) e commitar.
```

## Regras

- Nunca sobrescreva `docs/context/*.md`, `docs/architecture/*.md`, specs
  ativas, `docs/archive/`, `docs/features/` ou `docs/changelog/` — são
  conteúdo de produto, não harness.
- Nunca delete um arquivo com customização sem apontar a diferença e pedir
  confirmação primeiro.
- Nunca sobrescreva `.claude/settings.json` do usuário sem fazer merge —
  ver Passo 4.
- Working tree suja → pare e peça para commitar/stash antes de prosseguir.
- Se o diagnóstico do Passo 0 não encontrar **nenhum** sinal de estrutura
  antiga (harness já está na versão atual), diga isso e não faça nada — não
  invente trabalho.
