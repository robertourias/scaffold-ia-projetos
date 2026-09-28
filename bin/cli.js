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
const EMPTY_MARKER = "**Status do arquivo:** vazio";

const stats = { created: 0, overwritten: 0, skipped: 0 };

function copyRecursive(src, dest, overwrite) {
  if (fs.statSync(src).isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name), overwrite);
    }
    return;
  }
  const existed = fs.existsSync(dest);
  if (existed && !overwrite) {
    stats.skipped++;
    console.log(`  skip       ${path.relative(cwd, dest)} (ja existe)`);
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  if (existed) {
    stats.overwritten++;
    console.log(`  overwrite  ${path.relative(cwd, dest)}`);
  } else {
    stats.created++;
    console.log(`  create     ${path.relative(cwd, dest)}`);
  }
}

function contextFilled() {
  const product = path.join(cwd, "docs/context/product.md");
  return (
    fs.existsSync(product) &&
    !fs.readFileSync(product, "utf8").includes(EMPTY_MARKER)
  );
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
  if (force && !yes && contextFilled()) {
    const msg =
      "--force vai sobrescrever docs/ (contexto ja preenchido, incluindo docs/context/).";
    if (!process.stdin.isTTY) {
      console.error(`${msg}\nAmbiente nao interativo: use --yes para confirmar, ou --upgrade para atualizar so o harness.`);
      process.exit(1);
    }
    if (!(await confirm(`${msg}\nContinuar? (s/N) `))) {
      console.log("Cancelado. Para atualizar so o harness use --upgrade.");
      process.exit(1);
    }
  }

  const previous = readFileOrNull(path.join(cwd, VERSION_FILE));
  const exampleBefore = readFileOrNull(path.join(cwd, ".claude/settings.example.json"));

  console.log(`@robertourias/scaffold-ia ${version} -> ${cwd}\n`);

  for (const rel of HARNESS) {
    const src = path.join(pkgRoot, rel);
    if (fs.existsSync(src)) copyRecursive(src, path.join(cwd, rel), upgrade || force);
  }
  for (const rel of DOCS) {
    const src = path.join(pkgRoot, rel);
    if (fs.existsSync(src)) copyRecursive(src, path.join(cwd, rel), force);
  }

  fs.mkdirSync(path.join(cwd, ".claude"), { recursive: true });
  fs.writeFileSync(path.join(cwd, VERSION_FILE), `${version}\n`);

  console.log(
    `\n${stats.created} criado(s), ${stats.overwritten} sobrescrito(s), ${stats.skipped} ignorado(s).`,
  );

  if (upgrade) {
    console.log(`Harness atualizado de ${previous ? previous.trim() : "(versao desconhecida)"} para ${version}.`);
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
