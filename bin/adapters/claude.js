"use strict";

const path = require("path");
const {
  readText,
  readJson,
  renderWithExtras,
  listCoreSkills,
  listCoreAgents,
} = require("./shared");

const CLAUDE_MD = `# Claude Project Context (Specnico)

@../AGENTS.md

---

## Notas específicas do Claude Code

- **Instruções canônicas:** \`AGENTS.md\` na raiz (carregado acima via \`@../AGENTS.md\`).
- **Skills:** \`.claude/skills/\` (11 comandos \`jarvis-*\` + 5 papéis).
- **Subagentes:** \`.claude/agents/\` (\`backend\`, \`frontend\`, \`reviewer\`, \`planner\`, \`runner\`). O subagente \`runner\` roda em \`model: haiku\` sem edição de arquivos.
- **Permissões e hooks:** copie \`.claude/settings.example.json\` para \`.claude/settings.json\` (o \`/jarvis-constitution\` ou \`/jarvis-onboard\` faz isso). Hooks em \`.claude/hooks/\` delegam para \`.specify/hooks/core/\`.
- Referência completa: \`.claude/README.md\` e \`.specify/hooks/README.md\`.
`;

const CLAUDE_README = `# \`.claude/\` — adapter do Specnico para Claude Code

Este diretório contém apenas a camada específica do **Claude Code** gerada pelo
\`npx specnico\` (skills com \`allowed-tools\`, subagentes com \`tools\`/\`model\`,
wrappers de hooks e \`settings.example.json\`).

As instruções canônicas vivem em [\`AGENTS.md\`](../AGENTS.md) na raiz; o
processo (templates, packs, workflows e núcleo dos hooks) vive em \`.specify/\`;
e o dado do projeto vive em \`.specify/memory/\` e \`specs/\`.

## Layout

\`\`\`
AGENTS.md                   ← instruções canônicas compartilhadas entre assistentes
.claude/
  CLAUDE.md                 ← importa ../AGENTS.md + notas do Claude Code
  README.md                 ← este arquivo
  settings.example.json     ← permissões + hooks (copie para settings.json)
  skills/
    jarvis-*/SKILL.md       ← os 11 comandos de fluxo
    backend/ frontend/ planner/ quality/ verification/   ← papéis
  agents/                   ← backend, frontend, reviewer, planner, runner (haiku)
  hooks/                    ← wrappers finos para .specify/hooks/core/*.mjs

.specify/
  hooks/                    ← núcleo puro dos hooks + matriz de paridade
  memory/                   ← dado do projeto (nunca sobrescrito no --upgrade)
  templates/ packs/ workflows/
  state.json  .specnico-version  .specnico-config.json
\`\`\`

Consulte [\`AGENTS.md\`](../AGENTS.md) para tiers de contexto, uso do subagente
\`runner\`, paralelismo e lista de comandos, e [\`.specify/hooks/README.md\`](../.specify/hooks/README.md)
para a matriz de hooks.
`;

const CLAUDE_HOOK_SPEC_GATE = `#!/usr/bin/env node
/**
 * Adapter fino Claude Code (PreToolUse) -> .specify/hooks/core/spec-gate.mjs
 */
import { readFileSync } from "node:fs";
import { evaluateSpecGate } from "../../.specify/hooks/core/spec-gate.mjs";

const ok = () => process.exit(0);
let payload;
try {
  payload = JSON.parse(readFileSync(0, "utf8"));
} catch {
  ok();
}

const input = payload?.tool_input ?? {};
const res = evaluateSpecGate({
  root: payload?.cwd || process.cwd(),
  filePath: input.file_path,
  content: input.content,
  oldString: input.old_string,
  newString: input.new_string,
  replaceAll: input.replace_all,
  edits: input.edits,
});

if (res.decision === "ask") {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "ask",
        permissionDecisionReason: res.reason,
      },
    }),
  );
  ok();
}
if (res.decision === "block") {
  process.stderr.write(res.message);
  process.exit(2);
}
ok();
`;

const CLAUDE_HOOK_VERIFY_FILE = `#!/usr/bin/env node
/**
 * Adapter fino Claude Code (PostToolUse) -> .specify/hooks/core/verify-file.mjs
 */
import { readFileSync } from "node:fs";
import { evaluateVerifyFile } from "../../.specify/hooks/core/verify-file.mjs";

const ok = () => process.exit(0);
let payload;
try {
  payload = JSON.parse(readFileSync(0, "utf8"));
} catch {
  ok();
}

const res = evaluateVerifyFile({
  root: payload?.cwd || process.cwd(),
  filePath: payload?.tool_input?.file_path,
});

if (res.decision === "block") {
  process.stderr.write(res.message);
  process.exit(2);
}
ok();
`;

const CLAUDE_HOOK_VERIFY_PROJECT = `#!/usr/bin/env node
/**
 * Adapter fino Claude Code (Stop) -> .specify/hooks/core/verify-project.mjs
 */
import { readFileSync } from "node:fs";
import { evaluateVerifyProject } from "../../.specify/hooks/core/verify-project.mjs";

const ok = () => process.exit(0);
let payload;
try {
  payload = JSON.parse(readFileSync(0, "utf8"));
} catch {
  ok();
}

const res = evaluateVerifyProject({
  root: payload?.cwd || process.cwd(),
  alreadyBlocked: Boolean(payload?.stop_hook_active),
});

if (res.decision === "block") {
  process.stderr.write(res.message);
  process.exit(2);
}
ok();
`;

const CLAUDE_HOOKS_README = `# Hooks do Claude Code

Os scripts deste diretório são wrappers finos que chamam o núcleo compartilhado
em [\`.specify/hooks/core/\`](../../.specify/hooks/README.md).

- \`spec-gate.mjs\` → \`PreToolUse\` (\`Edit|Write|MultiEdit\`)
- \`verify-file.mjs\` → \`PostToolUse\` (\`Edit|Write|MultiEdit\`)
- \`verify-project.mjs\` → \`Stop\`

Documentação completa, contrato e matriz de paridade: [\`.specify/hooks/README.md\`](../../.specify/hooks/README.md).
`;

function renderClaude(pkgRoot) {
  const cfg = readJson(path.join(pkgRoot, "core", "platforms", "claude.json"));
  const settings = readText(
    path.join(pkgRoot, "core", "platforms", "claude-settings.example.json"),
  );
  const agentsReadme = readText(path.join(pkgRoot, "core", "agents", "README.md"));

  const files = [
    { rel: ".claude/CLAUDE.md", content: CLAUDE_MD },
    { rel: ".claude/README.md", content: CLAUDE_README },
    { rel: ".claude/settings.example.json", content: settings },
    { rel: ".claude/agents/README.md", content: agentsReadme },
    { rel: ".claude/hooks/spec-gate.mjs", content: CLAUDE_HOOK_SPEC_GATE },
    { rel: ".claude/hooks/verify-file.mjs", content: CLAUDE_HOOK_VERIFY_FILE },
    { rel: ".claude/hooks/verify-project.mjs", content: CLAUDE_HOOK_VERIFY_PROJECT },
    { rel: ".claude/hooks/README.md", content: CLAUDE_HOOKS_README },
  ];

  for (const name of listCoreSkills(pkgRoot)) {
    const src = readText(path.join(pkgRoot, "core", "skills", name, "SKILL.md"));
    const extras = cfg.skills?.[name] || {};
    files.push({
      rel: `.claude/skills/${name}/SKILL.md`,
      content: renderWithExtras(src, extras),
    });
  }

  for (const name of listCoreAgents(pkgRoot)) {
    const src = readText(path.join(pkgRoot, "core", "agents", `${name}.md`));
    const extras = cfg.agents?.[name] || {};
    files.push({
      rel: `.claude/agents/${name}.md`,
      content: renderWithExtras(src, extras),
    });
  }

  return files;
}

module.exports = { renderClaude };
