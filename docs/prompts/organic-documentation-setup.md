# Prompt: Ativar Documentação Orgânica no Workflow

> Diferente do bootstrap retroativo (`retroactive-documentation.md`), este
> prompt não gera conteúdo — ele **modifica os papéis e comandos que você já
> usa todo dia** para que a documentação pare de acumular drift no futuro.
> Rode uma vez no `scaffold-ia-projetos` (pra todo projeto novo já nascer
> com isso) e uma vez em cada projeto existente que já usa o scaffold
> (ex: FitFlow) pra ativar imediatamente.

Cole no Claude Code, na raiz do repositório (scaffold ou projeto existente).

---

Você é o PLANNER. Aplique os 4 ajustes abaixo nos arquivos indicados. São
edições pequenas e cirúrgicas — não reescreva os arquivos inteiros, apenas
insira o conteúdo novo no ponto indicado. Se algum arquivo já tiver uma
seção equivalente, não duplique — apenas confirme que o conteúdo já cobre
o mesmo objetivo.

## Ajuste 1 — `docs/skills/backend.md`

Insira logo após a seção `## Escalar Imediatamente Se`:

```markdown
## Documentação Inline (Obrigatório)

Se a tarefa introduzir uma decisão que diverge do que já está registrado em
`docs/context/decisions.md` — nova lib, nova dependência de infra, mudança
de padrão arquitetural, trade-off relevante — adicione a linha
correspondente em `decisions.md` **no mesmo diff**, não deixe para uma
sessão de documentação separada.

Decisões pontuais de implementação (nome de variável, escolha entre dois
algoritmos equivalentes sem impacto arquitetural) não precisam ser
promovidas — usar bom senso.
```

## Ajuste 2 — `docs/skills/frontend.md`

Insira logo após a seção `## Escalar Imediatamente Se`:

```markdown
## Documentação Inline (Obrigatório)

Se a tarefa introduzir um token de design novo (cor, radius, tipografia) ou
um padrão de componente reutilizável ainda não documentado, adicione a
entrada correspondente em `docs/context/ui-guidelines.md` **no mesmo diff**,
seguindo o padrão de entrada datada já usado no arquivo (ex: "Identidade
visual (2026-07-03)").

Ajuste de estilo local a um único componente, sem intenção de reuso, não
precisa ser promovido.
```

## Ajuste 3 — `docs/skills/quality.md`

Na seção `### Estágio 2 — Qualidade & Padrões`, adicione uma nova subseção
antes de `#### Geral & Tipagem`:

```markdown
#### Documentação
- [ ] Se o diff introduziu decisão técnica nova (lib, padrão, trade-off),
      ela está em `docs/context/decisions.md` — não só implementada no
      código sem registro.
- [ ] Se o diff introduziu token/padrão de design novo, ele está em
      `docs/context/ui-guidelines.md`.
```

Trate itens não marcados aqui como 🟡 WARNING, não 🔴 BLOCKER — não deve
travar o merge, mas deve aparecer na revisão.

## Ajuste 4 — `docs/commands/checkpoint.md`

Insira um novo passo entre o atual "Passo 2 — Atualizar current-state.md" e
"Passo 3 — Atualizar CHANGELOG":

```markdown
## Passo 2.5 — Sincronização leve de arquitetura

Antes de salvar o estado, verifique rapidamente:

1. A seção "Decisões desta sessão" que você acabou de escrever em
   `current-state.md` tem algum item que deveria estar em
   `docs/context/decisions.md` mas não foi promovido durante a
   implementação (rede de segurança para o que passou despercebido no
   Ajuste 1/2 dos papéis de backend/frontend)?
2. Se sim, promova agora seguindo o mesmo critério: decisão estrutural →
   `decisions.md` no domínio certo; detalhe de design → `ui-guidelines.md`.
3. Se o volume de decisões pendentes for grande (ex: primeira vez rodando
   isso num projeto com histórico acumulado), pare e sugira rodar o comando
   `/architecture` completo em vez de tentar promover tudo inline aqui.
```

Renumere os passos seguintes do arquivo (antigo Passo 3 em diante) de
acordo.

## Ajuste 5 — `docs/workflows/feature-delivery.md`

Na "Definition of Done", troque a linha atual:

```
- [ ] `docs/architecture/overview.md` updated if any architectural decision was made
```

Por uma redação que remove a ambiguidade do "if" — a checagem já é feita
pelo reviewer (Ajuste 3), então isso vira apenas um lembrete redundante, não
uma nova responsabilidade:

```
- [ ] `docs/architecture/overview.md` e `context/decisions.md` refletem
      qualquer decisão arquitetural desta feature (checado no /review,
      Ajuste "Documentação" do quality.md)
```

## Regras

- Não duplique seções se o arquivo já tiver conteúdo equivalente — apenas
  confirme e pule.
- Não altere nenhum outro conteúdo desses 5 arquivos além do indicado.
- Ao final, mostre um resumo de quais dos 5 ajustes foram aplicados, quais
  já existiam (pulados), e o diff de cada arquivo alterado.