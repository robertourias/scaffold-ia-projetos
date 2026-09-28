#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const force = args.includes("--force") || args.includes("-f");
const help = args.includes("--help") || args.includes("-h");

if (help) {
  console.log(`
@robertourias/scaffold-ia

Instala o harness (.claude/) e os docs de contexto (docs/) do scaffold
no diretorio atual.

Uso:
  npx @robertourias/scaffold-ia [--force]

Opcoes:
  --force, -f   Sobrescreve arquivos que ja existem no destino
  --help,  -h   Mostra esta ajuda
`);
  process.exit(0);
}

const pkgRoot = path.join(__dirname, "..");
const cwd = process.cwd();
const SOURCES = [".claude", "docs"];

const stats = { created: 0, overwritten: 0, skipped: 0 };

function copyRecursive(src, dest) {
  const st = fs.statSync(src);

  if (st.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
    return;
  }

  const existed = fs.existsSync(dest);
  if (existed && !force) {
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

console.log(`@robertourias/scaffold-ia -> instalando em ${cwd}\n`);

for (const name of SOURCES) {
  const src = path.join(pkgRoot, name);
  if (!fs.existsSync(src)) continue;
  copyRecursive(src, path.join(cwd, name));
}

console.log(
  `\n${stats.created} criado(s), ${stats.overwritten} sobrescrito(s), ${stats.skipped} ignorado(s).`
);

if (stats.skipped > 0 && !force) {
  console.log("Use --force para sobrescrever os arquivos existentes.");
}
