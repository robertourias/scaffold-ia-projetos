import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(import.meta.url);
const { renderHarness } = require(path.join(root, "bin/adapters"));
const { MIGRATION_MARKER, LEGACY_BACKLOG_SECTION } = require(path.join(root, "bin/cli.js"));

const SKILLS_DIR = path.join(root, "core/skills");
const AGENTS_DIR = path.join(root, "core/agents");
const SKILLS = readdirSync(SKILLS_DIR).filter((d) => d.startsWith("jarvis-"));
const AGENTS = readdirSync(AGENTS_DIR)
  .filter((f) => f.endsWith(".md") && f !== "README.md")
  .map((f) => f.replace(/\.md$/, ""));

const skillText = (d) =>
  readFileSync(path.join(SKILLS_DIR, d, "SKILL.md"), "utf8").replace(/\r\n/g, "\n");
const agentText = (a) =>
  readFileSync(path.join(AGENTS_DIR, `${a}.md`), "utf8").replace(/\r\n/g, "\n");
const fmOf = (text, label) => {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(m, `${label}: frontmatter ausente`);
  return m[1];
};

const renderedClaude = new Map(renderHarness(root, ["claude"]).map((f) => [f.rel, f.content]));
const renderedCopilot = new Map(renderHarness(root, ["copilot"]).map((f) => [f.rel, f.content]));
const renderedGemini = new Map(renderHarness(root, ["gemini"]).map((f) => [f.rel, f.content]));

const claudeSkillFm = (d) => fmOf(renderedClaude.get(`.claude/skills/${d}/SKILL.md`), `claude:${d}`);
const allowed = (d) => {
  const m = claudeSkillFm(d).match(/^allowed-tools:\s*(.+)$/m);
  return m ? m[1].split(/,\s*(?![^()]*\))/).map((t) => t.trim()) : [];
};

const ESPERADAS = [
  "jarvis-constitution",
  "jarvis-specify",
  "jarvis-clarify",
  "jarvis-plan",
  "jarvis-tasks",
  "jarvis-analyze",
  "jarvis-implement",
  "jarvis-converge",
  "jarvis-review",
  "jarvis-fix",
  "jarvis-onboard",
];

test("existem exatamente as 11 skills jarvis-* e 5 papéis no núcleo canônico", () => {
  assert.deepEqual([...SKILLS].sort(), [...ESPERADAS].sort());
  const PAPEIS = ["backend", "frontend", "planner", "quality", "verification"];
  const outras = readdirSync(SKILLS_DIR).filter((d) => !d.startsWith("jarvis-"));
  assert.deepEqual(outras.sort(), [...PAPEIS].sort());
});

test("existem exatamente os 5 subagentes canônicos incluindo runner", () => {
  assert.deepEqual([...AGENTS].sort(), ["backend", "frontend", "planner", "reviewer", "runner"]);
  const runner = agentText("runner");
  assert.match(runner, /nunca edita arquivos/i);
  assert.match(runner, /Status: PASS \| FAIL \| NOT_CONFIGURED/);
  assert.match(runner, /máximo 15 linhas/i);
});

test("toda skill jarvis-* tem name = pasta e description", () => {
  for (const d of SKILLS) {
    assert.ok(existsSync(path.join(SKILLS_DIR, d, "SKILL.md")), `${d}: SKILL.md ausente`);
    const fm = fmOf(skillText(d), d);
    const name = fm.match(/^name:\s*(.+)$/m);
    assert.ok(name && name[1].trim() === d, `${d}: name deve ser igual à pasta`);
    const desc = fm.match(/^description:\s*(.+)$/m);
    assert.ok(desc && desc[1].trim().length > 0, `${d}: description ausente`);
  }
});

test("núcleo canônico não vaza .claude/CLAUDE.md nem .claude/agents/", () => {
  const agentsMd = readFileSync(path.join(root, "core/AGENTS.md"), "utf8");
  assert.ok(!agentsMd.includes(".claude/CLAUDE.md"));
  assert.ok(!agentsMd.includes(".claude/agents/"));
  assert.match(agentsMd, /runner/);
  assert.match(agentsMd, /paralel/i);
  for (const d of readdirSync(SKILLS_DIR)) {
    const t = skillText(d);
    assert.ok(!t.includes(".claude/CLAUDE.md"), `${d}: cita .claude/CLAUDE.md`);
    assert.ok(!t.includes(".claude/agents/"), `${d}: cita .claude/agents/`);
  }
  for (const a of AGENTS) {
    const t = agentText(a);
    assert.ok(!t.includes(".claude/CLAUDE.md"), `agent ${a}: cita .claude/CLAUDE.md`);
    assert.ok(!t.includes(".claude/agents/"), `agent ${a}: cita .claude/agents/`);
  }
});

test("skills de execução e revisão integram o subagente runner", () => {
  for (const d of ["jarvis-implement", "jarvis-fix", "jarvis-converge", "jarvis-review", "verification"]) {
    assert.match(skillText(d), /`runner`/, `${d}: deve citar o subagente runner`);
  }
});

test("jarvis-approve não existe mais: o gate humano é do jarvis-implement (só humano no Claude)", () => {
  assert.ok(!SKILLS.includes("jarvis-approve"));
  assert.match(claudeSkillFm("jarvis-implement"), /^disable-model-invocation:\s*true\s*$/m);
  const skill = skillText("jarvis-implement");
  assert.ok(skill.includes("Gate de aprovação"));
  assert.ok(skill.includes("**Status:** approved"));
});

test("jarvis-plan não gera tasks.md; jarvis-tasks gera", () => {
  const plan = skillText("jarvis-plan");
  assert.ok(!plan.includes("## 4. tasks.md"), "jarvis-plan ainda tem a seção de tarefas");
  assert.ok(plan.includes("Próximo: `/jarvis-tasks`"));
  const tasks = skillText("jarvis-tasks");
  assert.ok(tasks.includes("tasks-template.md"));
  assert.ok(tasks.includes("Arquivos:"));
  assert.ok(tasks.includes("Próximo: `/jarvis-analyze`"));
});

test("nenhuma skill jarvis-* instrui git add -A / git add . / git commit -a", () => {
  const proibido = /git add (-A|--all|\.(\s|$|`))|git commit\s+(-\w*a\w*|--all)\b/;
  for (const d of SKILLS) {
    const linhas = skillText(d).split("\n");
    linhas.forEach((l, i) => {
      if (proibido.test(l) && !/nunca|não|proibid/i.test(l)) {
        assert.fail(`${d}:${i + 1}: instrui comando proibido → ${l.trim()}`);
      }
    });
  }
});

test("toda skill jarvis-* termina com 'Próximo:' ou declara que encerra o fluxo", () => {
  for (const d of SKILLS) {
    const ultimas = skillText(d)
      .split("\n")
      .filter((l) => l.trim() !== "")
      .slice(-3);
    assert.ok(
      ultimas.some((l) => /Próximo:|encerra o fluxo/i.test(l)),
      `${d}: as últimas linhas não trazem 'Próximo:' nem 'encerra o fluxo'`,
    );
  }
});

test("marcador de migração do CLI é o mesmo que o jarvis-constitution detecta", () => {
  assert.equal(MIGRATION_MARKER, "<!-- migrado da 1.x: revise com /jarvis-constitution -->");
  assert.equal(LEGACY_BACKLOG_SECTION, "## Legado (1.x)");
  const skill = skillText("jarvis-constitution");
  assert.ok(skill.includes(MIGRATION_MARKER), "skill não cita o marcador exato do CLI");
  assert.ok(skill.includes(LEGACY_BACKLOG_SECTION), "skill não cita a seção do backlog legado");
  assert.match(skill, /\*\*modo migração\*\*/);
});

test("adapter Claude: jarvis-review e jarvis-analyze removem Edit/Write/MultiEdit/NotebookEdit", () => {
  for (const d of ["jarvis-review", "jarvis-analyze"]) {
    const m = claudeSkillFm(d).match(/^disallowed-tools:\s*(.+)$/m);
    assert.ok(m, `${d}: disallowed-tools ausente`);
    const tools = m[1].split(",").map((t) => t.trim());
    for (const t of ["Edit", "Write", "MultiEdit", "NotebookEdit"]) assert.ok(tools.includes(t), `${d}: falta ${t}`);
    for (const t of ["Edit", "Write"]) assert.ok(!allowed(d).includes(t), `${d}: allowed-tools concede ${t}`);
  }
});

test("adapter Claude: nenhuma skill jarvis-* concede Bash sem prefixo nem symbolic-ref com curinga", () => {
  for (const d of SKILLS) {
    const tools = allowed(d);
    assert.ok(!tools.includes("Bash"), `${d}: Bash sem prefixo em allowed-tools`);
    for (const t of tools) {
      assert.ok(!/^Bash\(git symbolic-ref[^)]*:\*\)$/.test(t), `${d}: ${t} permite gravar HEAD`);
    }
  }
  assert.ok(allowed("jarvis-implement").includes("Bash(gh pr create:*)"));
  assert.ok(allowed("jarvis-fix").includes("Agent"), "jarvis-fix precisa de Agent para despachar runner");
});

test("jarvis-onboard: contrato do design e sync ignora pastas multi-plataforma", () => {
  const skill = skillText("jarvis-onboard");
  for (const s of [
    MIGRATION_MARKER,
    LEGACY_BACKLOG_SECTION,
    "<!-- a revisar: jarvis-onboard -->",
    "**Última leitura:**",
    "overview-template.md",
    ".specify/memory/overview.md",
    "**Gerado por:** /jarvis-onboard",
    "**Status do arquivo:** vazio",
    ".env.example",
    "git status --porcelain -uall",
    "## UI",
  ]) {
    assert.ok(skill.includes(s), `jarvis-onboard não cita ${s}`);
  }
  assert.match(skill, /primeira leitura/);
  assert.match(skill, /só os campos listados em "Fonte"/);
  assert.match(skill, /preserve a estrutura/i);
  assert.match(skill, /5\. Nenhum dos anteriores/);
  for (const dir of [".claude/", ".agents/", ".gemini/", "AGENTS.md", "GEMINI.md"]) {
    assert.ok(skill.includes(dir), `jarvis-onboard sync deve ignorar ${dir}`);
  }
  const tools = allowed("jarvis-onboard");
  assert.ok(tools.includes("Agent"), "jarvis-onboard: falta Agent");
  const LEITURA = ["ls", "git log", "git diff", "git rev-parse", "git status", "git ls-files"];
  for (const t of tools.filter((t) => t.startsWith("Bash("))) {
    const cmd = t.slice(5, -1).replace(/:\*$/, "");
    assert.ok(
      LEITURA.some((p) => cmd === p || cmd.startsWith(`${p} `)),
      `jarvis-onboard: ${t} não é somente leitura`,
    );
  }
});

test("jarvis-constitution reconhece o marcador a revisar do onboard", () => {
  assert.ok(skillText("jarvis-constitution").includes("<!-- a revisar: jarvis-onboard -->"));
});

const COMMITAM = [
  "jarvis-constitution",
  "jarvis-specify",
  "jarvis-clarify",
  "jarvis-plan",
  "jarvis-tasks",
  "jarvis-implement",
  "jarvis-converge",
  "jarvis-fix",
];

test("adapter Claude: nenhuma skill jarvis-* pré-aprova git commit em allowed-tools", () => {
  for (const d of SKILLS) {
    for (const t of allowed(d)) {
      assert.ok(!/^Bash\(git (-C \S+ )?commit/.test(t), `${d}: ${t} pré-aprova commit`);
    }
  }
});

test("toda skill que commita pergunta antes (Posso commitar?)", () => {
  for (const d of COMMITAM) {
    assert.ok(skillText(d).includes("Posso commitar?"), `${d}: não pergunta antes de commitar`);
  }
});

test("adapter Claude: runner usa model haiku sem Edit/Write e settings.example.json mantém git commit em ask", () => {
  const runnerFm = fmOf(renderedClaude.get(".claude/agents/runner.md"), "claude:runner");
  assert.match(runnerFm, /^model:\s*haiku$/m);
  assert.ok(!/\b(Edit|Write)\b/.test(runnerFm), "runner não pode ter Edit/Write");
  const s = JSON.parse(renderedClaude.get(".claude/settings.example.json"));
  assert.ok(s.permissions.ask.includes("Bash(git commit:*)"), "git commit fora de ask");
  assert.ok(!s.permissions.allow.some((t) => t.startsWith("Bash(git commit")), "git commit em allow");
});

test("adapter Copilot: gera .agent.md, .github/skills e hooks válidos (runner/reviewer sem edit)", () => {
  assert.ok(renderedCopilot.has("AGENTS.md"));
  assert.ok(renderedCopilot.has(".github/copilot-instructions.md"));
  assert.ok(renderedCopilot.has(".github/skills/jarvis-implement/SKILL.md"));
  for (const ro of ["runner", "reviewer"]) {
    const fm = fmOf(renderedCopilot.get(`.github/agents/${ro}.agent.md`), `copilot:${ro}`);
    assert.ok(!/\bedit\b/.test(fm), `copilot:${ro} não pode incluir tool edit`);
  }
  const hooks = JSON.parse(renderedCopilot.get(".github/hooks/specnico.json"));
  assert.ok(hooks.hooks.preToolUse.length > 0);
  assert.ok(hooks.hooks.postToolUse.length > 0);
  assert.ok(hooks.hooks.sessionEnd.length > 0);
});

test("adapter Gemini (Antigravity + Gemini CLI): gera GEMINI.md, .agents/skills, .gemini/agents e hooks válidos", () => {
  assert.ok(renderedGemini.has("AGENTS.md"));
  assert.ok(renderedGemini.has("GEMINI.md"));
  assert.ok(renderedGemini.has(".agents/skills/jarvis-implement/SKILL.md"));
  const runnerFm = fmOf(renderedGemini.get(".gemini/agents/runner.md"), "gemini:runner");
  assert.match(runnerFm, /^model:\s*gemini-2\.5-flash$/m);
  assert.ok(!/\b(write_file|replace)\b/.test(runnerFm), "gemini:runner não pode editar arquivos");
  const geminiSettings = JSON.parse(renderedGemini.get(".gemini/settings.example.json"));
  assert.ok(geminiSettings.hooks.BeforeTool.length > 0);
  const agyHooks = JSON.parse(renderedGemini.get(".agents/hooks.json"));
  assert.ok(agyHooks.hooks.PreToolUse.length > 0);
});
