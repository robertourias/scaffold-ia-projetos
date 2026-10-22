#!/usr/bin/env node
// Lint dos docs do harness: frontmatter de skills/agentes e
// referências a arquivos (links relativos e caminhos citados em crases).
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SKIP_DIRS = new Set(["node_modules", ".git", "meta", ".superpowers"]);
// Existem só no projeto do usuário (gerados por comandos) ou são exemplos.
const IGNORE_PREFIXES = [
  ".specify/state.json",
  ".specify/.specnico-version",
  ".specify/memory/projects/",
  ".specify/memory/overview.md",
  "specs/bugs/",
  "specs/legacy/",
  ".claude/settings.json",
  ".claude/settings.local.json",
  ".claude/.scaffold-version",
];
// `{` entra no placeholder pq `.specify/{templates,packs,workflows}` é notação de
// brace-expansion (múltiplos caminhos), não um caminho literal a validar.
// Comandos 1.x removidos na 2.0: só podem aparecer sob um `## ` de migração.
const REMOVED_CMD =
  /(?<![\w.\/-])\/(spec|hands-on|back|front|checkpoint|retomar|groom|recheck|pr-open|pr-merged|init-project|init-app|init-package|backlog|approve|review)(?![\w.-])/;
const MIGRATION_HEADING = /1\.x|Migra/i;
const PLACEHOLDER = /[$<*[{]|YYYY|\.\.\.|\d{4}-\d{2}-\d{2}|NNN/;

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
  let inMigration = false;
  readFileSync(file, "utf8")
    .split(/\r?\n/)
    .forEach((line, i) => {
      if (/^\s*```/.test(line)) {
        inFence = !inFence;
        return;
      }
      if (inFence) return;
      const heading = line.match(/^##\s+(.*)$/);
      if (heading) inMigration = MIGRATION_HEADING.test(heading[1]);
      for (const [, cmd] of line.matchAll(/(?<![\w.\/-])\/(specnico-[a-z]+)(?![\w-])/g)) {
        if (!existsSync(path.join(root, ".claude/skills", cmd, "SKILL.md"))) {
          failures.push(`${rel}:${i + 1}: comando inexistente → /${cmd}`);
        }
      }
      if (!inMigration) {
        const removed = line.match(REMOVED_CMD);
        if (removed) failures.push(`${rel}:${i + 1}: comando removido na 2.0 → /${removed[1]}`);
      }
      for (const [, target] of line.matchAll(/\]\(([^)\s]+)\)/g)) {
        if (/^(https?:|mailto:|#)/.test(target)) continue;
        const clean = decodeURI(target.split("#")[0]);
        if (!clean || PLACEHOLDER.test(clean)) continue;
        if (!existsSync(path.resolve(path.dirname(file), clean))) {
          failures.push(`${rel}:${i + 1}: link quebrado → ${target}`);
        }
      }
      for (const [, p] of line.matchAll(/`((?:\.claude|\.specify|specs)\/[^`\s]+)`/g)) {
        const clean = p.split("#")[0].replace(/[):,.]+$/, "");
        if (PLACEHOLDER.test(clean)) continue;
        if (IGNORE_PREFIXES.some((x) => clean.startsWith(x))) continue;
        if (inMigration) continue; // guia de migração cita caminhos 1.x
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
