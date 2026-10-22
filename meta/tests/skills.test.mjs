import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SKILLS_DIR = path.join(root, ".claude/skills");
const SKILLS = readdirSync(SKILLS_DIR).filter((d) => d.startsWith("specnico-"));
const skillText = (d) =>
  readFileSync(path.join(SKILLS_DIR, d, "SKILL.md"), "utf8").replace(/\r\n/g, "\n");
const frontmatter = (d) => {
  const m = skillText(d).match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(m, `${d}: frontmatter ausente`);
  return m[1];
};

const ESPERADAS = [
  "specnico-constitution",
  "specnico-spec",
  "specnico-clarify",
  "specnico-plan",
  "specnico-analyze",
  "specnico-approve",
  "specnico-implement",
  "specnico-converge",
  "specnico-review",
  "specnico-fix",
  "specnico-onboard",
];

test("existem exatamente as 11 skills specnico-*", () => {
  assert.deepEqual([...SKILLS].sort(), [...ESPERADAS].sort());
});

test("comandos 1.x removidos: sem .claude/commands nem skills sem prefixo fora dos papéis", () => {
  assert.ok(!existsSync(path.join(root, ".claude/commands")), ".claude/commands ainda existe");
  const PAPEIS = ["backend", "frontend", "planner", "quality", "verification"];
  const outras = readdirSync(SKILLS_DIR).filter((d) => !d.startsWith("specnico-"));
  assert.deepEqual(outras.sort(), [...PAPEIS].sort());
});

test("toda skill specnico-* tem name = pasta e description", () => {
  for (const d of SKILLS) {
    assert.ok(existsSync(path.join(SKILLS_DIR, d, "SKILL.md")), `${d}: SKILL.md ausente`);
    const fm = frontmatter(d);
    const name = fm.match(/^name:\s*(.+)$/m);
    assert.ok(name && name[1].trim() === d, `${d}: name deve ser igual à pasta`);
    const desc = fm.match(/^description:\s*(.+)$/m);
    assert.ok(desc && desc[1].trim().length > 0, `${d}: description ausente`);
  }
});

test("specnico-approve, se existir, tem disable-model-invocation: true", () => {
  if (!SKILLS.includes("specnico-approve")) return;
  assert.match(frontmatter("specnico-approve"), /^disable-model-invocation:\s*true\s*$/m);
});

test("nenhuma skill specnico-* instrui git add -A / git add . / git commit -a", () => {
  const proibido = /git add (-A|--all|\.(\s|$|`))|git commit\s+(-\w*a\w*|--all)\b/;
  for (const d of SKILLS) {
    const linhas = skillText(d).split("\n");
    linhas.forEach((l, i) => {
      // Menções em contexto de proibição ("nunca ...") são permitidas.
      if (proibido.test(l) && !/nunca|não|proibid/i.test(l)) {
        assert.fail(`${d}:${i + 1}: instrui comando proibido → ${l.trim()}`);
      }
    });
  }
});

test("toda skill specnico-* termina com 'Próximo:' ou declara que encerra o fluxo", () => {
  // Uma das 3 últimas linhas não vazias deve conter "Próximo:" ou "encerra o fluxo".
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

test("marcador de migração do CLI é o mesmo que o specnico-constitution detecta", async () => {
  const { createRequire } = await import("node:module");
  const { MIGRATION_MARKER, LEGACY_BACKLOG_SECTION } = createRequire(import.meta.url)(
    path.join(root, "bin/cli.js"),
  );
  assert.equal(MIGRATION_MARKER, "<!-- migrado da 1.x: revise com /specnico-constitution -->");
  assert.equal(LEGACY_BACKLOG_SECTION, "## Legado (1.x)");
  const skill = skillText("specnico-constitution");
  assert.ok(skill.includes(MIGRATION_MARKER), "skill não cita o marcador exato do CLI");
  assert.ok(skill.includes(LEGACY_BACKLOG_SECTION), "skill não cita a seção do backlog legado");
  assert.match(skill, /\*\*modo migração\*\*/);
});

const allowed = (d) => {
  const m = frontmatter(d).match(/^allowed-tools:\s*(.+)$/m);
  return m ? m[1].split(/,\s*(?![^()]*\))/).map((t) => t.trim()) : [];
};

test("specnico-review e specnico-analyze removem Edit/Write/MultiEdit/NotebookEdit (disallowed-tools)", () => {
  for (const d of ["specnico-review", "specnico-analyze"]) {
    const m = frontmatter(d).match(/^disallowed-tools:\s*(.+)$/m);
    assert.ok(m, `${d}: disallowed-tools ausente`);
    const tools = m[1].split(",").map((t) => t.trim());
    for (const t of ["Edit", "Write", "MultiEdit", "NotebookEdit"]) assert.ok(tools.includes(t), `${d}: falta ${t}`);
    for (const t of ["Edit", "Write"]) assert.ok(!allowed(d).includes(t), `${d}: allowed-tools concede ${t}`);
  }
});

test("nenhuma skill specnico-* concede Bash sem prefixo nem symbolic-ref com curinga", () => {
  for (const d of SKILLS) {
    const tools = allowed(d);
    assert.ok(!tools.includes("Bash"), `${d}: Bash sem prefixo em allowed-tools`);
    for (const t of tools) {
      assert.ok(!/^Bash\(git symbolic-ref[^)]*:\*\)$/.test(t), `${d}: ${t} permite gravar HEAD`);
    }
  }
  assert.ok(allowed("specnico-implement").includes("Bash(gh pr create:*)"));
});

test("specnico-onboard: contrato do design", async () => {
  const { createRequire } = await import("node:module");
  const { MIGRATION_MARKER, LEGACY_BACKLOG_SECTION } = createRequire(import.meta.url)(
    path.join(root, "bin/cli.js"),
  );
  const skill = skillText("specnico-onboard");
  for (const s of [
    MIGRATION_MARKER,
    LEGACY_BACKLOG_SECTION,
    "<!-- a revisar: specnico-onboard -->",
    "**Última leitura:**",
    "overview-template.md",
    ".specify/memory/overview.md",
    "**Gerado por:** /specnico-onboard",
    "**Status do arquivo:** vazio",
    ".env.example",
  ]) {
    assert.ok(skill.includes(s), `specnico-onboard não cita ${s}`);
  }
  const tools = allowed("specnico-onboard");
  assert.ok(tools.includes("Agent"), "specnico-onboard: falta Agent");
  const LEITURA = ["ls", "git log", "git diff", "git rev-parse", "git status", "git ls-files"];
  for (const t of tools.filter((t) => t.startsWith("Bash("))) {
    const cmd = t.slice(5, -1).replace(/:\*$/, "");
    assert.ok(
      LEITURA.some((p) => cmd === p || cmd.startsWith(`${p} `)),
      `specnico-onboard: ${t} não é somente leitura`,
    );
  }
});

test("specnico-constitution reconhece o marcador a revisar do onboard", () => {
  assert.ok(skillText("specnico-constitution").includes("<!-- a revisar: specnico-onboard -->"));
});

test("specnico-onboard: sincronização edita campos da Fonte, preserva seções de referência e tem fallback", () => {
  const skill = skillText("specnico-onboard");
  // Regra de não sobrescrever vale para gravar o arquivo inteiro na primeira leitura.
  assert.match(skill, /primeira leitura/);
  assert.match(skill, /só os campos listados em "Fonte"/);
  // architecture/conventions/decisions não são stubs vazios: seções de referência ficam.
  assert.ok(skill.includes("## UI"), "não preserva ## UI");
  assert.match(skill, /preserve a estrutura/i);
  // Constituição sem stub nem **Versão:** (Spec Kit, escrita à mão) tem caso próprio.
  assert.match(skill, /5\. Nenhum dos anteriores/);
  // Sync ignora o harness e lista arquivos não rastreados um a um.
  assert.ok(skill.includes("git status --porcelain -uall"), "git status sem -uall");
  assert.match(skill, /ignorando `\.specify\/`, `specs\/` e `\.claude\/`/);
});
