"use strict";

const path = require("path");
const {
  readText,
  readJson,
  renderWithExtras,
  listCoreSkills,
  listCoreAgents,
} = require("./shared");

const GEMINI_MD = `# Google AI Pro Context — Antigravity & Gemini CLI (Specnico)

Siga estritamente o guia canônico do projeto em \`AGENTS.md\` na raiz do repositório.

## Notas para Antigravity e Gemini CLI

- **Skills compartilhadas (padrão aberto Agent Skills):** \`.agents/skills/\` (descobertas nativamente tanto pelo Antigravity quanto pelo Gemini CLI).
- **Subagentes (Gemini CLI):** \`.gemini/agents/\` (\`backend\`, \`frontend\`, \`planner\`, \`reviewer\`, \`runner\`). O subagente \`runner\` roda em \`model: gemini-2.5-flash\` sem ferramentas de edição.
- **Economia de tokens (Antigravity e Gemini CLI):** na thread principal, sempre delegue comandos verbosos (\`test\`, \`build\`, \`lint\`, \`type-check\`) para um subagente \`runner\` (modelo econômico \`flash\`, somente leitura + terminal) e retorne apenas status, contagens e erros em \`arquivo:linha\`.
- **Paralelismo:** dispare subagentes em paralelo na mesma rodada para 2+ rotinas independentes sem escrita concorrente.
- **Hooks:**
  - **Antigravity:** \`.agents/hooks.json\`
  - **Gemini CLI:** copie \`.gemini/settings.example.json\` para \`.gemini/settings.json\`
  - Ambos delegam para \`.specify/hooks/adapters/gemini-hook.mjs\` (núcleo em \`.specify/hooks/core/\`).
- **Commit só com confirmação:** nunca faça \`git commit\` sem mostrar mensagem e arquivos e esperar confirmação explícita.
`;

function renderGemini(pkgRoot) {
  const cfg = readJson(path.join(pkgRoot, "core", "platforms", "gemini.json"));
  const geminiSettings = readText(
    path.join(pkgRoot, "core", "platforms", "gemini-settings.example.json"),
  );
  const antigravityHooks = readText(
    path.join(pkgRoot, "core", "platforms", "antigravity-hooks.json"),
  );
  const agentsReadme = readText(path.join(pkgRoot, "core", "agents", "README.md"));

  const files = [
    { rel: "GEMINI.md", content: GEMINI_MD },
    { rel: ".agents/hooks.json", content: antigravityHooks },
    { rel: ".gemini/agents/README.md", content: agentsReadme },
    { rel: ".gemini/settings.example.json", content: geminiSettings },
  ];

  for (const name of listCoreSkills(pkgRoot)) {
    const src = readText(path.join(pkgRoot, "core", "skills", name, "SKILL.md"));
    files.push({
      rel: `.agents/skills/${name}/SKILL.md`,
      content: src,
    });
  }

  for (const name of listCoreAgents(pkgRoot)) {
    const src = readText(path.join(pkgRoot, "core", "agents", `${name}.md`));
    const extras = cfg.agents?.[name] || {};
    files.push({
      rel: `.gemini/agents/${name}.md`,
      content: renderWithExtras(src, extras),
    });
  }

  return files;
}

module.exports = { renderGemini };
