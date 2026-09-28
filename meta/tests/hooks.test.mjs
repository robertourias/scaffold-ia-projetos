import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
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

test("Edit old_string review → new_string approved (sem **Status:** no new_string) → ask", () => {
  const cwd = project();
  const r = run(cwd, { file_path: "docs/specs/s.md", old_string: "review", new_string: "approved" });
  assert.equal(r.code, 0);
  const json = JSON.parse(r.out);
  assert.equal(json.hookSpecificOutput.hookEventName, "PreToolUse");
  assert.equal(json.hookSpecificOutput.permissionDecision, "ask");
});

test("Edit review → **Status:** Approved (maiúsculo) → ask", () => {
  const cwd = project();
  const r = run(cwd, {
    file_path: "docs/specs/s.md",
    old_string: "**Status:** review",
    new_string: "**Status:** Approved",
  });
  assert.equal(r.code, 0);
  const json = JSON.parse(r.out);
  assert.equal(json.hookSpecificOutput.permissionDecision, "ask");
});

test("Edit review → **Status:** done → ask", () => {
  const cwd = project();
  const r = run(cwd, {
    file_path: "docs/specs/s.md",
    old_string: "**Status:** review",
    new_string: "**Status:** done",
  });
  assert.equal(r.code, 0);
  const json = JSON.parse(r.out);
  assert.equal(json.hookSpecificOutput.permissionDecision, "ask");
});

test("Write removendo a linha Status de Spec em review → ask", () => {
  const cwd = project();
  const r = run(cwd, {
    file_path: "docs/specs/s.md",
    content: "# Spec\n\n## 6. Plano\n\n### Tarefa 1: T1\n- **Arquivos:** `src/a.ts`\n",
  });
  assert.equal(r.code, 0);
  const json = JSON.parse(r.out);
  assert.equal(json.hookSpecificOutput.permissionDecision, "ask");
});

test("Write de Spec NOVA já em review → libera sem ask", () => {
  const cwd = project();
  const r = run(cwd, {
    file_path: "docs/specs/new.md",
    content: "# Nova\n\n**Status:** review\n",
  });
  assert.equal(r.code, 0);
  assert.equal(r.out.trim(), "");
});

test("Edit marcando checkbox em Spec já approved → libera sem ask", () => {
  const cwd = project({ status: "approved" });
  // Regra 3 compara o conteúdo normativo antes/depois: para exercitar de fato
  // a marcação de um checkbox (e não a adição de um critério novo), o
  // checkbox precisa já existir no arquivo antes da edição sob teste.
  const specPath = path.join(cwd, "docs/specs/s.md");
  writeFileSync(specPath, readFileSync(specPath, "utf8") + "- [ ] critério\n");
  const r = run(cwd, {
    file_path: "docs/specs/s.md",
    old_string: "- [ ] critério",
    new_string: "- [x] critério",
  });
  assert.equal(r.code, 0);
  assert.equal(r.out.trim(), "");
});

test("Spec review com Arquivos: só em prosa (template) → bloqueia qualquer código", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "spec-gate-"));
  mkdirSync(path.join(dir, "docs/context"), { recursive: true });
  mkdirSync(path.join(dir, "docs/specs"), { recursive: true });
  writeFileSync(
    path.join(dir, "docs/specs/s.md"),
    "# Spec\n\n**Status:** review\n\n## 6. Plano\n\n" +
      "> **Propriedade de arquivos:** duas tarefas da mesma onda não podem declarar\n" +
      "> o mesmo caminho no campo `Arquivos:`. Elas rodam em paralelo na mesma working\n" +
      "> tree e se sobrescrevem em silêncio.\n",
  );
  writeFileSync(
    path.join(dir, "docs/context/current-state.md"),
    "# Status\n\n**Spec ativo:** docs/specs/s.md\n",
  );
  const r = run(dir, { file_path: "src/any.ts", new_string: "x" });
  assert.equal(r.code, 2);
});

test("Edit new_string com padrão de substituição ($&) → ask, não interpretado como regex replacement", () => {
  const cwd = project();
  const r = run(cwd, { file_path: "docs/specs/s.md", old_string: "review", new_string: "$&" });
  assert.equal(r.code, 0);
  const json = JSON.parse(r.out);
  assert.equal(json.hookSpecificOutput.permissionDecision, "ask");
});

test("MultiEdit new_string com padrão de substituição ($&) → ask", () => {
  const cwd = project();
  const r = run(cwd, {
    file_path: "docs/specs/s.md",
    edits: [{ old_string: "review", new_string: "$&" }],
  });
  assert.equal(r.code, 0);
  const json = JSON.parse(r.out);
  assert.equal(json.hookSpecificOutput.permissionDecision, "ask");
});

test("Spec CRLF + old_string multi-linha com \\n → normaliza e computa → ask", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "spec-gate-"));
  mkdirSync(path.join(dir, "docs/context"), { recursive: true });
  mkdirSync(path.join(dir, "docs/specs"), { recursive: true });
  writeFileSync(
    path.join(dir, "docs/specs/s.md"),
    "# Spec\r\n\r\n**Status:** review\r\n\r\n### Tarefa 1: T1\r\n- **Arquivos:** `src/a.ts`\r\n",
  );
  writeFileSync(
    path.join(dir, "docs/context/current-state.md"),
    "# Status\n\n**Spec ativo:** docs/specs/s.md\n",
  );
  const r = run(dir, {
    file_path: "docs/specs/s.md",
    old_string: "**Status:** review\n\n### Tarefa 1",
    new_string: "**Status:** done\n\n### Tarefa 1",
  });
  assert.equal(r.code, 0);
  const json = JSON.parse(r.out);
  assert.equal(json.hookSpecificOutput.permissionDecision, "ask");
});

test("Spec existente sem linha Status, edição de checkbox → libera sem ask (não é Spec nova)", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "spec-gate-"));
  mkdirSync(path.join(dir, "docs/context"), { recursive: true });
  mkdirSync(path.join(dir, "docs/specs"), { recursive: true });
  writeFileSync(
    path.join(dir, "docs/specs/s.md"),
    "# Spec\n\n## 6. Plano\n\n### Tarefa 1: T1\n- **Arquivos:** `src/a.ts`\n",
  );
  writeFileSync(
    path.join(dir, "docs/context/current-state.md"),
    "# Status\n\n**Spec ativo:** docs/specs/s.md\n",
  );
  const r = run(dir, {
    file_path: "docs/specs/s.md",
    old_string: "### Tarefa 1: T1",
    new_string: "### Tarefa 1: T1\n- [x] critério",
  });
  assert.equal(r.code, 0);
  assert.equal(r.out.trim(), "");
});

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

// --- Regra 3: emendas em Spec aprovada --------------------------------------

const SPEC_APROVADA = [
  "# Spec",
  "",
  "**Status:** approved",
  "**Aprovado por:** Ana em 2026-10-01",
  "",
  "## 3. Requisitos Funcionais",
  "",
  "- **FR-001:** O usuário entra com Google.",
  "",
  "## 6. Plano",
  "",
  "### Tarefa 1: T1",
  "- **Arquivos:** `src/a.ts`",
  "- **Critérios de Aceite:**",
  "  - [ ] Dado X, quando Y, então Z.",
  "",
  "## Notas de Review",
  "",
  "## Emendas",
  "",
].join("\n");

function aprovada(text = SPEC_APROVADA) {
  const dir = project({ status: "approved" });
  writeFileSync(path.join(dir, "docs/specs/s.md"), text);
  return dir;
}

const EMENDA = /Emenda em Spec aprovada/;
const noAsk = (r) => {
  assert.equal(r.code, 0);
  assert.equal(r.out.trim(), "");
};
const askEmenda = (r) => {
  assert.equal(r.code, 0);
  const json = JSON.parse(r.out);
  assert.equal(json.hookSpecificOutput.permissionDecision, "ask");
  assert.match(json.hookSpecificOutput.permissionDecisionReason, EMENDA);
};

test("emenda: marcar checkbox → sem ask", () => {
  const cwd = aprovada();
  noAsk(run(cwd, { file_path: "docs/specs/s.md", old_string: "  - [ ] Dado X", new_string: "  - [x] Dado X" }));
});

test("emenda: anotar Pendência Manual → sem ask", () => {
  const cwd = aprovada();
  noAsk(
    run(cwd, {
      file_path: "docs/specs/s.md",
      old_string: "  - [ ] Dado X, quando Y, então Z.",
      new_string:
        "  - [ ] Dado X, quando Y, então Z.\n    > 🟡 Pendência Manual: testar em iOS real\n    > Instrução: rodar no device e colar evidência",
    }),
  );
});

test("emenda: escrever em Notas de Review e Emendas → sem ask", () => {
  const cwd = aprovada();
  noAsk(
    run(cwd, {
      file_path: "docs/specs/s.md",
      old_string: "## Notas de Review\n",
      new_string: "## Notas de Review\n\n- [onda 1] src/a.ts:10 — nome melhor\n",
    }),
  );
  noAsk(
    run(cwd, {
      file_path: "docs/specs/s.md",
      old_string: "## Emendas\n",
      new_string: "## Emendas\n\n- 2026-10-02 — texto — motivo — Ana\n",
    }),
  );
});

test("emenda: Spec antiga ganha seções novas no fim → sem ask", () => {
  const antiga = SPEC_APROVADA.split("## Notas de Review")[0].trimEnd() + "\n";
  const cwd = aprovada(antiga);
  noAsk(
    run(cwd, {
      file_path: "docs/specs/s.md",
      content: antiga + "\n## Emendas\n\n- 2026-10-02 — x — y — Ana\n",
    }),
  );
});

test("emenda: approved → done com Concluído em → sem ask", () => {
  const cwd = aprovada();
  noAsk(
    run(cwd, {
      file_path: "docs/specs/s.md",
      old_string: "**Status:** approved\n",
      new_string: "**Status:** done\n**Concluído em:** 2026-10-05\n",
    }),
  );
});

test("emenda: mudar texto de FR → ask de emenda", () => {
  const cwd = aprovada();
  askEmenda(
    run(cwd, {
      file_path: "docs/specs/s.md",
      old_string: "entra com Google.",
      new_string: "entra com Google e Apple.",
    }),
  );
});

test("emenda: adicionar tarefa → ask de emenda", () => {
  const cwd = aprovada();
  askEmenda(
    run(cwd, {
      file_path: "docs/specs/s.md",
      old_string: "## Notas de Review",
      new_string: "### Tarefa 2: T2\n- **Arquivos:** `src/b.ts`\n\n## Notas de Review",
    }),
  );
});

test("emenda: Spec aprovada em CRLF, só checkbox → sem ask", () => {
  const cwd = aprovada(SPEC_APROVADA.replace(/\n/g, "\r\n"));
  noAsk(run(cwd, { file_path: "docs/specs/s.md", old_string: "  - [ ] Dado X", new_string: "  - [x] Dado X" }));
});

test("emenda: Spec em review não usa regra 3 (edição de FR → sem ask)", () => {
  const cwd = aprovada(SPEC_APROVADA.replace("**Status:** approved", "**Status:** review"));
  noAsk(run(cwd, { file_path: "docs/specs/s.md", old_string: "entra com Google.", new_string: "entra com Apple." }));
});

// --- Regra 3, fix round 1: pendência ✅, linha em branco, seção numerada ----

const SPEC_COM_PENDENCIA = SPEC_APROVADA.replace(
  "  - [ ] Dado X, quando Y, então Z.\n",
  "  - [ ] Dado X, quando Y, então Z.\n    > 🟡 Pendência Manual: testar em iOS real\n    > Instrução: rodar no device e colar evidência\n",
);

test("emenda: /recheck troca 🟡 por ✅ e marca [x] → sem ask", () => {
  const cwd = aprovada(SPEC_COM_PENDENCIA);
  noAsk(
    run(cwd, {
      file_path: "docs/specs/s.md",
      old_string:
        "  - [ ] Dado X, quando Y, então Z.\n    > 🟡 Pendência Manual: testar em iOS real\n    > Instrução: rodar no device e colar evidência",
      new_string:
        "  - [x] Dado X, quando Y, então Z.\n    > ✅ Pendência Manual resolvida em 2026-10-10 via /recheck: testado em device real, sem falhas.",
    }),
  );
});

test("emenda: MultiEdit /recheck fecha pendência e conclui approved→done → sem ask", () => {
  const cwd = aprovada(SPEC_COM_PENDENCIA);
  noAsk(
    run(cwd, {
      file_path: "docs/specs/s.md",
      edits: [
        {
          old_string:
            "  - [ ] Dado X, quando Y, então Z.\n    > 🟡 Pendência Manual: testar em iOS real\n    > Instrução: rodar no device e colar evidência",
          new_string:
            "  - [x] Dado X, quando Y, então Z.\n    > ✅ Pendência Manual resolvida em 2026-10-10 via /recheck: testado em device real, sem falhas.",
        },
        {
          old_string: "**Status:** approved\n",
          new_string: "**Status:** done\n**Concluído em:** 2026-10-10\n",
        },
      ],
    }),
  );
});

test("emenda: linha em branco inserida entre duas linhas → sem ask", () => {
  const cwd = aprovada();
  noAsk(
    run(cwd, {
      file_path: "docs/specs/s.md",
      old_string: "- **Arquivos:** `src/a.ts`\n- **Critérios de Aceite:**",
      new_string: "- **Arquivos:** `src/a.ts`\n\n- **Critérios de Aceite:**",
    }),
  );
});

test("emenda: seção numerada '## 9. Emendas' recebe entrada → sem ask", () => {
  const texto = SPEC_APROVADA.replace("## Emendas", "## 9. Emendas");
  const cwd = aprovada(texto);
  noAsk(
    run(cwd, {
      file_path: "docs/specs/s.md",
      old_string: "## 9. Emendas\n",
      new_string: "## 9. Emendas\n\n- 2026-10-02 — texto — motivo — Ana\n",
    }),
  );
});
