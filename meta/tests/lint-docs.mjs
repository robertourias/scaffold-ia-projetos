#!/usr/bin/env node
// Lint dos docs do harness: frontmatter de comandos/skills/agentes e
// referências a arquivos (links relativos e caminhos citados em crases).
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SKIP_DIRS = new Set(["node_modules", ".git", "meta", ".superpowers"]);
// Existem só no projeto do usuário (gerados por comandos) ou são exemplos.
const IGNORE_PREFIXES = [
  "docs/apps/",
  "docs/packages/",
  "docs/changelog/",
  ".claude/settings.json",
  ".claude/settings.local.json",
  ".claude/.scaffold-version",
  // Estrutura legada citada só em instruções de migração (README.md) — não existe no template atual.
  "docs/commands/",
  "docs/skills/",
  "docs/workflows/",
];
// `{` entra no placeholder pq `docs/{context,architecture,specs}` é notação de
// brace-expansion (múltiplos caminhos), não um caminho literal a validar.
const PLACEHOLDER = /[$<*[{]|YYYY|\.\.\.|\d{4}-\d{2}-\d{2}/;

const failures = [];
const relOf = (p) => path.relative(root, p).split(path.sep).join("/");
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    if (SKIP_DIRS.has(name)) return [];
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) return walk(p);
    return p.endsWith(".md") ? [p] : [];
  });

// 1. Frontmatter
const mdIn = (dir, filter = () => true) =>
  readdirSync(path.join(root, dir))
    .filter((f) => f.endsWith(".md") && filter(f))
    .map((f) => `${dir}/${f}`);
const fmTargets = [
  ...mdIn(".claude/commands"),
  ...mdIn(".claude/agents", (f) => f !== "README.md"),
  ...readdirSync(path.join(root, ".claude/skills"))
    .map((d) => `.claude/skills/${d}/SKILL.md`)
    .filter((f) => existsSync(path.join(root, f))),
];
for (const f of fmTargets) {
  const text = readFileSync(path.join(root, f), "utf8").replace(/\r\n/g, "\n");
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) {
    failures.push(`${f}: frontmatter ausente ou não fechado`);
    continue;
  }
  const desc = m[1].match(/^description:\s*(.*)$/m);
  if (!desc || !desc[1].trim()) {
    failures.push(`${f}: description ausente`);
    continue;
  }
  const v = desc[1].trim();
  if (!/^["']/.test(v) && /:\s/.test(v)) {
    failures.push(`${f}: description com ": " precisa estar entre aspas`);
  }
}

// 2. Referências
for (const file of walk(root)) {
  const rel = relOf(file);
  let inFence = false;
  readFileSync(file, "utf8")
    .split(/\r?\n/)
    .forEach((line, i) => {
      if (/^\s*```/.test(line)) {
        inFence = !inFence;
        return;
      }
      if (inFence) return;
      for (const [, target] of line.matchAll(/\]\(([^)\s]+)\)/g)) {
        if (/^(https?:|mailto:|#)/.test(target)) continue;
        const clean = decodeURI(target.split("#")[0]);
        if (!clean || PLACEHOLDER.test(clean)) continue;
        if (!existsSync(path.resolve(path.dirname(file), clean))) {
          failures.push(`${rel}:${i + 1}: link quebrado → ${target}`);
        }
      }
      for (const [, p] of line.matchAll(/`((?:\.claude|docs)\/[^`\s]+)`/g)) {
        const clean = p.split("#")[0].replace(/[):,.]+$/, "");
        if (PLACEHOLDER.test(clean)) continue;
        if (IGNORE_PREFIXES.some((x) => clean.startsWith(x))) continue;
        if (!existsSync(path.join(root, clean))) {
          failures.push(`${rel}:${i + 1}: caminho inexistente → ${p}`);
        }
      }
    });
}

if (failures.length) {
  console.error(failures.join("\n"));
  console.error(`\n${failures.length} problema(s).`);
  process.exit(1);
}
console.log("lint-docs: ok");
