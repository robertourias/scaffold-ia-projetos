"use strict";

const fs = require("fs");
const path = require("path");

function readText(absPath) {
  return fs.readFileSync(absPath, "utf8").replace(/\r\n/g, "\n");
}

function readJson(absPath) {
  return JSON.parse(readText(absPath));
}

function splitFrontmatter(markdown) {
  const m = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { fmLines: [], body: markdown };
  return {
    fmLines: m[1].split("\n").filter((l) => l.trim() !== ""),
    body: m[2],
  };
}

function formatYamlValue(val) {
  if (typeof val === "boolean" || typeof val === "number") return String(val);
  if (Array.isArray(val)) return `[${val.join(", ")}]`;
  return String(val);
}

function renderWithExtras(markdown, extras = {}) {
  const { fmLines, body } = splitFrontmatter(markdown);
  const extraLines = [];
  for (const [k, v] of Object.entries(extras)) {
    if (v === undefined || v === null) continue;
    extraLines.push(`${k}: ${formatYamlValue(v)}`);
  }
  const allFm = [...fmLines, ...extraLines];
  if (allFm.length === 0) return body;
  return `---\n${allFm.join("\n")}\n---\n${body}`;
}

function listCoreSkills(pkgRoot) {
  const dir = path.join(pkgRoot, "core", "skills");
  return fs
    .readdirSync(dir)
    .filter((d) => fs.existsSync(path.join(dir, d, "SKILL.md")))
    .sort();
}

function listCoreAgents(pkgRoot) {
  const dir = path.join(pkgRoot, "core", "agents");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .map((f) => f.replace(/\.md$/, ""))
    .sort();
}

module.exports = {
  readText,
  readJson,
  splitFrontmatter,
  renderWithExtras,
  listCoreSkills,
  listCoreAgents,
};
