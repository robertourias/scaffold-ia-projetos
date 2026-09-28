#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const args = process.argv.slice(2);
const has = (...f) => f.some((x) => args.includes(x));
const upgrade = has("--upgrade", "-u");
const force = has("--force", "-f");
const yes = has("--yes", "-y");

const HARNESS_WARNING =
  "--upgrade substitui edicoes locais no harness: .claude/{agents,commands,hooks,skills,templates,workflows}, .claude/CLAUDE.md e .claude/README.md.";

if (has("--help", "-h")) {
  console.log(`
@robertourias/scaffold-ia

Instala o harness (.claude/) e os docs de contexto (docs/) do scaffold
no diretorio atual.

Uso:
  npx @robertourias/scaffold-ia              instala; nunca sobrescreve
  npx @robertourias/scaffold-ia --upgrade    atualiza o harness (.claude/);
                                             em docs/ so cria o que faltar
  npx @robertourias/scaffold-ia --force      sobrescreve tudo, inclusive docs/

${HARNESS_WARNING}

Opcoes:
  --upgrade, -u  Atualiza o harness preservando docs/ e settings.json
  --force,   -f  Sobrescreve tudo (pede confirmacao se docs/ ja foi preenchido)
  --yes,     -y  Confirma o --force sem perguntar
  --help,    -h  Mostra esta ajuda
`);
  process.exit(0);
}

if (upgrade && force) {
  console.error("Use --upgrade ou --force, nao os dois.");
  process.exit(1);
}

const pkgRoot = path.join(__dirname, "..");
const cwd = process.cwd();
const version = require(path.join(pkgRoot, "package.json")).version;

// Espelha o "files" do package.json.
const HARNESS = [
  ".claude/agents",
  ".claude/commands",
  ".claude/hooks",
  ".claude/skills",
  ".claude/templates",
  ".claude/workflows",
  ".claude/CLAUDE.md",
  ".claude/README.md",
  ".claude/settings.example.json",
];
const DOCS = [
  "docs/architecture",
  "docs/context",
  "docs/features",
  "docs/specs",
  "docs/archive",
];
const VERSION_FILE = ".claude/.scaffold-version";

const stats = { created: 0, overwritten: 0, skipped: 0, harnessSkipped: 0, harnessOverwritten: 0 };

function filesEqual(a, b) {
  try {
    return fs.readFileSync(a).equals(fs.readFileSync(b));
  } catch {
    return false;
  }
}

function copyRecursive(src, dest, overwrite, kind) {
  if (fs.statSync(src).isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name), overwrite, kind);
    }
    return;
  }
  const existed = fs.existsSync(dest);
  if (existed && !overwrite) {
    stats.skipped++;
    if (kind === "harness") stats.harnessSkipped++;
    console.log(`  skip       ${path.relative(cwd, dest)} (ja existe)`);
    return;
  }
  if (existed && overwrite && filesEqual(src, dest)) {
    // conteudo identico ao do pacote: nada a fazer, nao conta como alteracao real.
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  if (existed) {
    stats.overwritten++;
    if (kind === "harness") stats.harnessOverwritten++;
    console.log(`  overwrite  ${path.relative(cwd, dest)}`);
  } else {
    stats.created++;
    console.log(`  create     ${path.relative(cwd, dest)}`);
  }
}

function listFiles(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) {
      out.push(...listFiles(p));
    } else {
      out.push(p);
    }
  }
  return out;
}

// "Preenchido" = qualquer arquivo que ja existe no destino, dentro de DOCS,
// com conteudo diferente do arquivo-fonte do pacote (nao apenas product.md).
function countFilledDocs() {
  let count = 0;
  for (const rel of DOCS) {
    const src = path.join(pkgRoot, rel);
    if (!fs.existsSync(src)) continue;
    for (const srcFile of listFiles(src)) {
      const destFile = path.join(cwd, path.relative(pkgRoot, srcFile));
      if (fs.existsSync(destFile) && !filesEqual(srcFile, destFile)) count++;
    }
  }
  return count;
}

function confirm(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(/^(s|sim|y|yes)$/i.test(answer.trim()));
    });
  });
}

function readFileOrNull(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
}

async function main() {
  if (force && !yes) {
    const filledCount = countFilledDocs();
    if (filledCount > 0) {
      const msg = `--force vai sobrescrever docs/: ${filledCount} arquivo(s) com conteudo diferente do padrao do scaffold seriam sobrescritos (incluindo docs/context/).`;
      if (!process.stdin.isTTY) {
        console.error(`${msg}\nAmbiente nao interativo: use --yes para confirmar, ou --upgrade para atualizar so o harness.`);
        process.exit(1);
      }
      if (!(await confirm(`${msg}\nContinuar? (s/N) `))) {
        console.log("Cancelado. Para atualizar so o harness use --upgrade.");
        process.exit(1);
      }
    }
  }

  const previous = readFileOrNull(path.join(cwd, VERSION_FILE));
  const exampleBefore = readFileOrNull(path.join(cwd, ".claude/settings.example.json"));

  console.log(`@robertourias/scaffold-ia ${version} -> ${cwd}\n`);

  for (const rel of HARNESS) {
    const src = path.join(pkgRoot, rel);
    if (fs.existsSync(src)) copyRecursive(src, path.join(cwd, rel), upgrade || force, "harness");
  }
  for (const rel of DOCS) {
    const src = path.join(pkgRoot, rel);
    if (fs.existsSync(src)) copyRecursive(src, path.join(cwd, rel), force, "docs");
  }

  // So grava a versao instalada em: instalacao nova (sem versao previa e sem
  // nenhum arquivo de harness ignorado), --upgrade ou --force. Uma reinstalacao
  // simples sobre um harness ja existente (arquivos ignorados) nao deve marcar
  // um harness desatualizado como se fosse a versao atual do pacote.
  const shouldWriteVersion = upgrade || force || (previous === null && stats.harnessSkipped === 0);
  if (shouldWriteVersion) {
    fs.mkdirSync(path.join(cwd, ".claude"), { recursive: true });
    fs.writeFileSync(path.join(cwd, VERSION_FILE), `${version}\n`);
  }

  console.log(
    `\n${stats.created} criado(s), ${stats.overwritten} sobrescrito(s), ${stats.skipped} ignorado(s).`,
  );

  if (upgrade) {
    console.log(`Harness atualizado de ${previous ? previous.trim() : "(versao desconhecida)"} para ${version}.`);
    if (stats.harnessOverwritten > 0) {
      console.log(HARNESS_WARNING);
    }
    const exampleAfter = readFileOrNull(path.join(cwd, ".claude/settings.example.json"));
    if (exampleBefore !== null && exampleBefore !== exampleAfter) {
      console.log(
        "`.claude/settings.example.json` mudou: revise e faca o merge manual no seu `.claude/settings.json` (ele nao foi alterado).",
      );
    }
  } else if (stats.skipped > 0 && !force) {
    console.log("Para atualizar o harness de uma instalacao anterior use --upgrade.");
  }
}

main();
