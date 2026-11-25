"use strict";

const path = require("path");
const {
  readText,
  readJson,
  renderWithExtras,
  listCoreSkills,
  listCoreAgents,
} = require("./shared");

const COPILOT_INSTRUCTIONS = `# GitHub Copilot Instructions (Specnico)

Siga estritamente o guia canônico do projeto em \`AGENTS.md\` na raiz do repositório.

## Pontos essenciais para o Copilot

- **Memória e processo:** leia \`.specify/memory/constitution.md\` e \`.specify/state.json\` primeiro; siga os Tiers de contexto definidos em \`AGENTS.md\`.
- **Economia de tokens (regra dura):** na thread principal, delegue comandos verbosos (\`test\`, \`build\`, \`lint\`, \`type-check\`) ao custom agent \`runner\` (\`.github/agents/runner.agent.md\`) e traga apenas status, contagens e erros em \`arquivo:linha\`.
- **Paralelismo:** sempre dispare em paralelo 2+ rotinas independentes sem escrita concorrente.
- **Skills:** os 11 comandos \`jarvis-*\` e os 5 papéis estão em \`.github/skills/\`.
- **Custom agents:** \`backend\`, \`frontend\`, \`planner\`, \`reviewer\` e \`runner\` estão em \`.github/agents/*.agent.md\`.
- **Hooks:** configurados em \`.github/hooks/specnico.json\` (delegam para \`.specify/hooks/adapters/copilot-hook.mjs\`).
- **Commit só com confirmação:** nunca faça \`git commit\` sem mostrar mensagem e arquivos e receber confirmação explícita.
`;

function renderCopilot(pkgRoot) {
  const cfg = readJson(path.join(pkgRoot, "core", "platforms", "copilot.json"));
  const hooksJson = readText(
    path.join(pkgRoot, "core", "platforms", "copilot-hooks.json"),
  );
  const agentsReadme = readText(path.join(pkgRoot, "core", "agents", "README.md"));

  const files = [
    { rel: ".github/copilot-instructions.md", content: COPILOT_INSTRUCTIONS },
    { rel: ".github/agents/README.md", content: agentsReadme },
    { rel: ".github/hooks/specnico.json", content: hooksJson },
  ];

  for (const name of listCoreSkills(pkgRoot)) {
    const src = readText(path.join(pkgRoot, "core", "skills", name, "SKILL.md"));
    files.push({
      rel: `.github/skills/${name}/SKILL.md`,
      content: src,
    });
  }

  for (const name of listCoreAgents(pkgRoot)) {
    const src = readText(path.join(pkgRoot, "core", "agents", `${name}.md`));
    const extras = cfg.agents?.[name] || {};
    files.push({
      rel: `.github/agents/${name}.agent.md`,
      content: renderWithExtras(src, extras),
    });
  }

  return files;
}

module.exports = { renderCopilot };
