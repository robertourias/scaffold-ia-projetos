"use strict";

const path = require("path");
const { readText } = require("./shared");
const { renderClaude } = require("./claude");
const { renderCopilot } = require("./copilot");
const { renderGemini } = require("./gemini");

const VALID_TARGETS = ["claude", "copilot", "gemini"];

const RENDERERS = {
  claude: renderClaude,
  copilot: renderCopilot,
  gemini: renderGemini,
};

function parseTargets(raw, existing = []) {
  if (!raw || typeof raw !== "string") {
    throw new Error(
      `--target requer um valor: ${VALID_TARGETS.join(", ")} ou all.`,
    );
  }
  const tokens = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) {
    throw new Error(
      `--target vazio. Use: ${VALID_TARGETS.join(", ")} ou all.`,
    );
  }

  const additive = tokens.every((t) => t.startsWith("+"));
  const selected = new Set(additive ? existing : []);

  for (const rawTok of tokens) {
    const tok = rawTok.startsWith("+") ? rawTok.slice(1) : rawTok;
    if (tok === "all") {
      for (const v of VALID_TARGETS) selected.add(v);
      continue;
    }
    if (!VALID_TARGETS.includes(tok)) {
      throw new Error(
        `Target desconhecido: "${tok}". Validos: ${VALID_TARGETS.join(", ")}, all.`,
      );
    }
    selected.add(tok);
  }

  return VALID_TARGETS.filter((v) => selected.has(v));
}

function renderHarness(pkgRoot, targets) {
  const agentsMd = readText(path.join(pkgRoot, "core", "AGENTS.md"));
  const out = [{ rel: "AGENTS.md", content: agentsMd }];
  const seen = new Set(["AGENTS.md"]);

  for (const target of targets) {
    const fn = RENDERERS[target];
    if (!fn) continue;
    for (const file of fn(pkgRoot)) {
      if (seen.has(file.rel)) continue;
      seen.add(file.rel);
      out.push(file);
    }
  }
  return out;
}

module.exports = {
  VALID_TARGETS,
  parseTargets,
  renderHarness,
};
