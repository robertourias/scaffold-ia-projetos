# Harness: tokens e manutenção (sub-projeto D)

**Status:** implemented
**Data:** 2026-09-28

Parte D da evolução do harness (A endurecimento → B fluxo SDD v2 → C núcleo
agnóstico + packs de stack → D tokens/manutenção). Depende do contrato de
packs introduzido em C e dos hooks/testes estabilizados em A e B.

## Objetivo

Reduzir o custo de contexto das sessões sem perder os gates de segurança e
criar uma rotina automatizada que detecte drift no harness, documentação
desatualizada e artefatos não publicados antes de uma release.

## Problema

O scaffold já recomenda lazy loading e possui um playbook de tokens, mas essas
regras ainda dependem de disciplina do agente. A manutenção também é
fragmentada: referências, manifestos de pack, arquivos incluídos no npm,
versão instalada e documentação podem divergir sem um diagnóstico único.

## Decisões

1. O núcleo continua sem telemetria, dependência externa ou contagem artificial
   de tokens. O harness só fornece regras e verificações determinísticas.
2. A economia de contexto será orientada por tiers explícitos e por um índice
   curto de contexto; comandos carregam o mínimo necessário e apontam para
   arquivos sob demanda.
3. A manutenção será uma verificação local reproduzível (`npm test`/script
   Node), executada também no `prepublishOnly`. Falhas são acionáveis e
   identificam arquivo e regra.
4. Packs são descobertos pelo `pack.json`; cada pack deve ser validado, estar
   incluído no pacote npm e não pode introduzir referências quebradas.
5. Atualizações do harness continuam conservadoras: `--upgrade` atualiza o
   harness, preserva docs/settings do consumidor e não executa migração
   destrutiva automática.
6. O estado resumido da sessão continua em `docs/context/current-state.md`;
   detalhes históricos ficam no changelog e Specs concluídas no archive.

## Escopo funcional

### 1. Contexto em tiers

Documentar e padronizar três níveis:

- **Tier 1 — execução:** guardrails, constitution, Spec/plano ativo e contexto
  do escopo;
- **Tier 2 — decisão:** product, decisions, conventions, arquitetura relevante
  e pack(s) ativo(s);
- **Tier 3 — referência:** histórico, features concluídas, outras áreas e
  documentação fora do escopo atual.

Comandos e skills devem declarar seu tier de leitura e não recarregar arquivos
de Tier 3 sem motivo. O contexto específico (`docs/$SCOPE/`) sobrepõe o global
quando existir.

### 2. Índice de contexto

Adicionar um índice curto em `.claude/context-index.md` com:

- arquivos sempre carregados;
- arquivos por papel/comando;
- regras para escopo e packs;
- links para workflows de referência.

O índice será documentação do harness, não estado gerado do consumidor.

### 3. Diagnóstico de manutenção

Adicionar um verificador Node sem dependências que valide:

- frontmatter obrigatório de comandos, agentes e skills;
- links e caminhos relativos, incluindo docs de packs;
- JSON válido e contrato de todos os `pack.json`;
- cada pack listado no README e cada pack publicado pelo `package.json`;
- referências a arquivos removidos/legados fora das exceções explícitas;
- ausência de CRLF nos arquivos publicados;
- consistência entre `package.json.files`, CLI e diretórios publicados;
- diagramas/artefatos referenciados que estejam presentes.

O verificador deve produzir saída estável, adequada para CI, e código de saída
diferente de zero em qualquer falha.

### 4. Comandos de manutenção

Adicionar scripts:

- `npm run check` — suíte completa de manutenção e testes;
- `npm run check:docs` — lint de referências/frontmatter;
- `npm run check:package` — validação do conteúdo publicado sem publicar;
- `npm run check:eol` — validação de line endings.

`prepublishOnly` passa a chamar `npm run check` para evitar publicar um pacote
com harness incompleto. O template de CI documenta um passo opcional de
manutenção; `/init-project` não o instala em projetos consumidores porque os
scripts de manutenção pertencem ao repositório do scaffold.

### 5. Retenção e higiene de estado

Atualizar `/checkpoint` e `/retomar` para manter `current-state.md` curto,
com limite documentado de seções e listas. O checkpoint deve apontar para o
último commit/Spec, não copiar histórico extenso. O workflow deve explicar
quando arquivar uma Spec e quando mover informação para `docs/features/`.

### 6. Política de versão e drift

Documentar a diferença entre:

- versão do pacote publicado;
- `.claude/.scaffold-version` instalado no consumidor;
- conteúdo local alterado pelo consumidor.

O diagnóstico deve oferecer uma mensagem clara quando o consumidor estiver
desatualizado, sem sobrescrever nada. A atualização de versão do pacote fica
fora da automação da CLI.

## Fora de escopo

- medição real de tokens consumidos por modelo ou sessão;
- telemetria, chamadas de rede ou serviço de atualização automática;
- migração automática de documentação preenchida pelo usuário;
- reescrita completa dos comandos já estabilizados em B;
- novos packs de framework além dos já distribuídos em C;
- integração de revisão automática em pull request.

## Critérios de aceite

- [x] Um agente consegue identificar o Tier correto sem ler o repositório
      inteiro.
- [x] O índice de contexto não contém caminhos inexistentes.
- [x] O diagnóstico detecta um pack inválido, uma referência quebrada e um
      arquivo ausente do pacote.
- [x] `npm run check` passa em um checkout limpo.
- [x] `npm pack --dry-run` e a verificação de package concordam sobre os
      arquivos publicados.
- [x] `prepublishOnly` falha se qualquer verificação obrigatória falhar.
- [x] `/checkpoint` não duplica histórico longo em `current-state.md`.
- [x] A documentação explica claramente atualização, drift e preservação de
      arquivos locais.

## Verificação prevista

```text
npm run check
npm pack --dry-run
node meta/tests/lint-docs.mjs
node meta/tests/check-eol.mjs
```
