#!/usr/bin/env node
// Garante que os arquivos de texto publicados/versionados do harness estão em
// LF puro (sem \r) — .gitattributes normaliza no checkout, mas um arquivo já
// commitado em CRLF (ou criado fora do git) não é pego por ele sozinho.
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const DIRS = [
  "bin",
  ".claude/agents",
  ".claude/commands",
  ".claude/hooks",
  ".claude/skills",
  ".claude/templates",
  ".claude/packs",
  ".claude/workflows",
  "docs/architecture",
  "docs/context",
  "docs/features",
  "docs/specs",
  "docs/archive",
];
const FILES = [
  "package.json",
  "README.md",
  ".claude/CLAUDE.md",
  ".claude/README.md",
  ".claude/settings.example.json",
];

const relOf = (p) => path.relative(root, p).split(path.sep).join("/");

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) return walk(p);
    return [p];
  });
}

const targets = [];
for (const dir of DIRS) {
  const abs = path.join(root, dir);
  try {
    if (statSync(abs).isDirectory()) targets.push(...walk(abs));
  } catch {
    // diretório não existe neste checkout — ignora.
  }
}
for (const file of FILES) {
  const abs = path.join(root, file);
  try {
    if (statSync(abs).isFile()) targets.push(abs);
  } catch {
    // arquivo não existe neste checkout — ignora.
  }
}

const offenders = [];
for (const file of targets) {
  if (file.toLowerCase().endsWith(".png")) continue;
  const content = readFileSync(file, "utf8");
  if (content.includes("\r")) offenders.push(relOf(file));
}

if (offenders.length) {
  console.error("check-eol: arquivo(s) com \\r (CRLF ou CR) encontrado(s):");
  for (const f of offenders.sort()) console.error(`  ${f}`);
  process.exit(1);
}
console.log("check-eol: ok");
