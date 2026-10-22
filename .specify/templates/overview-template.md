# Onboarding — <Projeto>

**Gerado por:** /specnico-onboard
**Para quem:** qualquer pessoa chegando ao projeto. Lido por humanos; as skills
usam a memória em `.specify/memory/` como fonte.

Itens que o onboard não confirmou no código levam o marcador
`<!-- a revisar: specnico-onboard -->` no campo e aparecem na seção 7.

## 1. Arquitetura

<!-- Estilo (camadas, hexagonal, MVC, serverless…), módulos e como conversam.
Monorepo: mapa de apps/packages com a responsabilidade de cada um.
Diagrama Mermaid opcional. -->

## 2. Stack

<!-- Linguagem, frameworks, banco/ORM, auth, filas/cache, infra e hospedagem,
com versões quando o manifesto disser. -->

| Camada | Tecnologia | Versão | Evidência |
|--------|------------|--------|-----------|

## 3. Como rodar

<!-- Pré-requisitos (runtime pela .nvmrc/engines, Docker…), instalar, variáveis
de ambiente POR NOME (de .env.example ou do código — nunca valores), subir em
dev, testar e build. Só comandos que existem. -->

## 4. Onde ficam as regras de negócio

<!-- Um caminho por linha (domínio, services, validators, migrations) com o que
ele governa. -->

| Caminho | O que governa |
|---------|---------------|

## 5. Features

<!-- O que o produto já faz, ligado ao backlog (F-<SIGLA> / Bnn, status done). -->

| Feature | Itens | Resumo |
|---------|-------|--------|

## 6. Pontos de atenção

<!-- Partes frágeis ou sem teste, dívidas visíveis (TODO/FIXME concentrados),
dependências desatualizadas óbvias, configs sensíveis (sem valores). -->

## 7. A revisar

<!-- Tudo que leva o marcador a revisar: arquivo, campo e o porquê. Inclui o
que o onboard teria escrito num arquivo que já tinha conteúdo real (não
sobrescrito). -->

| Arquivo | Campo | Motivo |
|---------|-------|--------|

### Atualizados nesta leitura

<!-- Re-execução: campos inferidos sobrescritos porque a evidência mudou. -->

| Arquivo | Campo | Antes | Depois |
|---------|-------|-------|--------|

## 8. Fonte

**Última leitura:** <commit curto> em <data>

<!-- Mapa campo → evidência: a sincronização só recalcula um campo quando um
arquivo listado aqui mudou desde a última leitura. Sem git:
**Última leitura:** sem git em <data>. -->

| Campo | Arquivo | Evidências |
|-------|---------|------------|
