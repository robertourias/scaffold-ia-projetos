import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const HOOK = path.join(root, ".claude/hooks/spec-gate.mjs");

function project({ status = "review", arquivos = ["`src/a.ts`", "`src/b.ts`  ← todos os arquivos"], state = true } = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), "spec-gate-"));
  mkdirSync(path.join(dir, "docs/context"), { recursive: true });
  mkdirSync(path.join(dir, "docs/specs"), { recursive: true });
  const tarefas = arquivos
    .map((a, i) => `### Tarefa ${i + 1}: T${i + 1}\n- **Arquivos:** ${a}\n`)
    .join("\n");
  writeFileSync(
    path.join(dir, "docs/specs/s.md"),
    `# Spec\n\n**Status:** ${status}\n\n## 6. Plano\n\n${tarefas}`,
  );
  if (state) {
    writeFileSync(
      path.join(dir, "docs/context/current-state.md"),
      "# Status\n\n**Spec ativo:** docs/specs/s.md\n",
    );
  }
  return dir;
}

function run(cwd, tool_input) {
  const r = spawnSync(process.execPath, [HOOK], {
    input: JSON.stringify({ cwd, tool_name: "Edit", tool_input }),
    encoding: "utf8",
    env: { ...process.env, SCAFFOLD_VERIFY: "1" },
  });
  return { code: r.status, out: r.stdout, err: r.stderr };
}

test("review + arquivo declarado → bloqueia", () => {
  const cwd = project();
  const r = run(cwd, { file_path: "src/a.ts", new_string: "x" });
  assert.equal(r.code, 2);
  assert.match(r.err, /\/approve/);
  assert.doesNotMatch(r.err, /prossiga normalmente/);
});

test("review + arquivo declarado com anotação ← → bloqueia", () => {
  const cwd = project();
  assert.equal(run(cwd, { file_path: "src/b.ts", new_string: "x" }).code, 2);
});

test("review + file_path absoluto → bloqueia", () => {
  const cwd = project();
  assert.equal(run(cwd, { file_path: path.join(cwd, "src", "a.ts"), new_string: "x" }).code, 2);
});

test("review + arquivo não declarado → libera", () => {
  const cwd = project();
  assert.equal(run(cwd, { file_path: "src/outro.ts", new_string: "x" }).code, 0);
});

test("review + Spec sem Arquivos → bloqueia qualquer código", () => {
  const cwd = project({ arquivos: [] });
  assert.equal(run(cwd, { file_path: "src/qualquer.ts", new_string: "x" }).code, 2);
});

test("approved → libera", () => {
  const cwd = project({ status: "approved" });
  assert.equal(run(cwd, { file_path: "src/a.ts", new_string: "x" }).code, 0);
});

test("docs/ e .claude/ → sempre libera", () => {
  const cwd = project();
  assert.equal(run(cwd, { file_path: "docs/context/decisions.md", new_string: "x" }).code, 0);
  assert.equal(run(cwd, { file_path: ".claude/hooks/x.mjs", new_string: "x" }).code, 0);
});

test("sem current-state.md → libera", () => {
  const cwd = project({ state: false });
  assert.equal(run(cwd, { file_path: "src/a.ts", new_string: "x" }).code, 0);
});

for (const [nome, input] of [
  ["Edit", { new_string: "**Status:** approved" }],
  ["Write", { content: "# S\n\n**Status:** approved\n" }],
  ["MultiEdit", { edits: [{ old_string: "a", new_string: "b" }, { old_string: "review", new_string: "**Status:** approved" }] }],
]) {
  test(`${nome} aprovando Spec → ask`, () => {
    const cwd = project();
    const r = run(cwd, { file_path: "docs/specs/s.md", ...input });
    assert.equal(r.code, 0);
    const json = JSON.parse(r.out);
    assert.equal(json.hookSpecificOutput.hookEventName, "PreToolUse");
    assert.equal(json.hookSpecificOutput.permissionDecision, "ask");
  });
}

test("edição de Spec sem aprovar → libera sem ask", () => {
  const cwd = project();
  const r = run(cwd, { file_path: "docs/specs/s.md", new_string: "- [x] critério" });
  assert.equal(r.code, 0);
  assert.equal(r.out.trim(), "");
});

test("SCAFFOLD_VERIFY=0 → libera", () => {
  const cwd = project();
  const r = spawnSync(process.execPath, [HOOK], {
    input: JSON.stringify({ cwd, tool_input: { file_path: "src/a.ts" } }),
    encoding: "utf8",
    env: { ...process.env, SCAFFOLD_VERIFY: "0" },
  });
  assert.equal(r.status, 0);
});
