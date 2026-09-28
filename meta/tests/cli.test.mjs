import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CLI = path.join(root, "bin/cli.js");
const VERSION = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")).version;
const SRC_SPEC = readFileSync(path.join(root, ".claude/commands/spec.md"), "utf8");

const run = (cwd, ...args) =>
  spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: "utf8", input: "" });
const tmp = () => mkdtempSync(path.join(tmpdir(), "scaffold-cli-"));
const read = (dir, p) => readFileSync(path.join(dir, p), "utf8");
const fill = (dir) => writeFileSync(path.join(dir, "docs/context/product.md"), "# Produto\nPREENCHIDO\n");

test("instalação limpa copia harness e docs e grava versão", () => {
  const dir = tmp();
  const r = run(dir);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(existsSync(path.join(dir, ".claude/commands/spec.md")));
  assert.ok(existsSync(path.join(dir, ".claude/skills/approve/SKILL.md")));
  assert.ok(existsSync(path.join(dir, "docs/context/product.md")));
  assert.equal(read(dir, ".claude/.scaffold-version").trim(), VERSION);
  assert.ok(!existsSync(path.join(dir, ".claude/settings.local.json")));
  assert.ok(!existsSync(path.join(dir, "meta")));
  assert.ok(!existsSync(path.join(dir, "CLAUDE.md")));
});

test("reinstalação sem flag não sobrescreve", () => {
  const dir = tmp();
  run(dir);
  writeFileSync(path.join(dir, ".claude/commands/spec.md"), "LOCAL");
  assert.equal(run(dir).status, 0);
  assert.equal(read(dir, ".claude/commands/spec.md"), "LOCAL");
});

test("--upgrade atualiza harness e preserva contexto e settings", () => {
  const dir = tmp();
  run(dir);
  writeFileSync(path.join(dir, ".claude/commands/spec.md"), "VELHO");
  fill(dir);
  writeFileSync(path.join(dir, ".claude/settings.json"), "{}");
  writeFileSync(path.join(dir, ".claude/.scaffold-version"), "0.9.0\n");
  rmSync(path.join(dir, "docs/context/decisions.md"));
  const r = run(dir, "--upgrade");
  assert.equal(r.status, 0, r.stderr);
  assert.equal(read(dir, ".claude/commands/spec.md"), SRC_SPEC);
  assert.equal(read(dir, "docs/context/product.md"), "# Produto\nPREENCHIDO\n");
  assert.equal(read(dir, ".claude/settings.json"), "{}");
  assert.ok(existsSync(path.join(dir, "docs/context/decisions.md")));
  assert.match(r.stdout, /0\.9\.0/);
  assert.match(r.stdout, new RegExp(VERSION.replace(/\./g, "\\.")));
  assert.equal(read(dir, ".claude/.scaffold-version").trim(), VERSION);
});

test("--upgrade em instalação sem .scaffold-version (1.0.0) funciona", () => {
  const dir = tmp();
  run(dir);
  rmSync(path.join(dir, ".claude/.scaffold-version"));
  const r = run(dir, "--upgrade");
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /desconhecida/);
});

test("--force não interativo com contexto preenchido recusa sem --yes", () => {
  const dir = tmp();
  run(dir);
  fill(dir);
  const r = run(dir, "--force");
  assert.equal(r.status, 1);
  assert.equal(read(dir, "docs/context/product.md"), "# Produto\nPREENCHIDO\n");
});

test("--force --yes sobrescreve contexto", () => {
  const dir = tmp();
  run(dir);
  fill(dir);
  assert.equal(run(dir, "--force", "--yes").status, 0);
  assert.match(read(dir, "docs/context/product.md"), /Status do arquivo:\*\* vazio/);
});

test("--upgrade e --force juntos → erro", () => {
  const dir = tmp();
  mkdirSync(path.join(dir, "x"));
  assert.equal(run(dir, "--upgrade", "--force").status, 1);
});

test("--force não interativo com docs/ divergente fora de product.md recusa sem --yes", () => {
  const dir = tmp();
  run(dir);
  rmSync(path.join(dir, "docs/context/product.md"));
  writeFileSync(path.join(dir, "docs/context/decisions.md"), "PREENCHIDO\n");
  const r = run(dir, "--force");
  assert.equal(r.status, 1);
  assert.equal(read(dir, "docs/context/decisions.md"), "PREENCHIDO\n");
});

test("reinstalação sem flag não regrava .scaffold-version; --upgrade regrava", () => {
  const dir = tmp();
  run(dir);
  writeFileSync(path.join(dir, ".claude/.scaffold-version"), "0.9.0\n");
  assert.equal(run(dir).status, 0);
  assert.equal(read(dir, ".claude/.scaffold-version").trim(), "0.9.0");
  const r = run(dir, "--upgrade");
  assert.equal(r.status, 0, r.stderr);
  assert.equal(read(dir, ".claude/.scaffold-version").trim(), VERSION);
});

test("--upgrade sem mudanças não imprime overwrite; com mudança imprime só o arquivo alterado", () => {
  const dir = tmp();
  run(dir);
  let r = run(dir, "--upgrade");
  assert.equal(r.status, 0, r.stderr);
  assert.ok(!/overwrite/.test(r.stdout));

  writeFileSync(path.join(dir, ".claude/commands/spec.md"), "LOCAL");
  r = run(dir, "--upgrade");
  assert.equal(r.status, 0, r.stderr);
  const overwriteLines = r.stdout.split("\n").filter((l) => l.includes("overwrite"));
  assert.equal(overwriteLines.length, 1);
  assert.match(overwriteLines[0], /commands[\\/]spec\.md/);
});
