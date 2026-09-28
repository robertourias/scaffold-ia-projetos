#!/usr/bin/env node
// Verificações determinísticas do próprio pacote: contrato de packs, arquivos
// publicados e sincronização entre package.json e o instalador.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const cli = readFileSync(path.join(root, "bin/cli.js"), "utf8");
const packsRoot = path.join(root, ".claude", "packs");
const packsReadme = readFileSync(path.join(packsRoot, "README.md"), "utf8");
const failures = [];
const fail = (message) => failures.push(message);

for (const entry of pkg.files) {
  if (!existsSync(path.join(root, entry))) fail(`package.json.files ausente: ${entry}`);
}

const harnessMatch = cli.match(/const HARNESS = \[([\s\S]*?)\];/);
if (!harnessMatch) fail("CLI não declara a lista HARNESS");
else {
  const cliHarness = [...harnessMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  for (const entry of cliHarness) {
    if (!pkg.files.includes(entry)) fail(`HARNESS não está em package.json.files: ${entry}`);
  }
  for (const entry of pkg.files.filter((x) => x.startsWith(".claude/"))) {
    if (!cliHarness.includes(entry) && entry !== ".claude/settings.example.json") {
      fail(`entrada .claude não copiada pela CLI: ${entry}`);
    }
  }
}

const packDirs = readdirSync(packsRoot).filter((name) => statSync(path.join(packsRoot, name)).isDirectory());
for (const id of packDirs) {
  const dir = path.join(packsRoot, id);
  const manifestPath = path.join(dir, "pack.json");
  const readmePath = path.join(dir, "README.md");
  if (!existsSync(manifestPath)) {
    fail(`pack sem pack.json: ${id}`);
    continue;
  }
  if (!existsSync(readmePath)) fail(`pack sem README.md: ${id}`);
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    for (const field of ["id", "name", "version", "description", "appliesTo"]) {
      if (!manifest[field] || (Array.isArray(manifest[field]) && !manifest[field].length)) {
        fail(`pack ${id} sem campo válido: ${field}`);
      }
    }
    if (manifest.id !== id) fail(`pack id divergente: diretório ${id}, manifest ${manifest.id}`);
    if (!packsReadme.includes(`\`${id}\``)) fail(`pack não listado em packs/README.md: ${id}`);
  } catch (error) {
    fail(`pack.json inválido em ${id}: ${error.message}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`check-maintenance: ok (${packDirs.length} pack(s), ${pkg.files.length} entradas publicadas)`);
