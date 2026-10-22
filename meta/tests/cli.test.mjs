import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  writeFileSync,
  existsSync,
  rmSync,
  mkdirSync,
  cpSync,
  readdirSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CLI = path.join(root, "bin/cli.js");
const VERSION = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")).version;
const SRC_SPEC = readFileSync(path.join(root, ".claude/skills/specnico-spec/SKILL.md"), "utf8");

const { isLegacyInstall, VERSION_FILE, LEGACY_VERSION_FILE } = createRequire(import.meta.url)(CLI);

const run = (cwd, ...args) =>
  spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: "utf8", input: "" });
const tmp = () => mkdtempSync(path.join(tmpdir(), "scaffold-cli-"));
const read = (dir, p) => readFileSync(path.join(dir, p), "utf8");
const fill = (dir) => writeFileSync(path.join(dir, ".specify/memory/product.md"), "# Produto\nPREENCHIDO\n");

test("instalação limpa copia harness e docs e grava versão", () => {
  const dir = tmp();
  const r = run(dir);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(existsSync(path.join(dir, ".claude/skills/specnico-spec/SKILL.md")));
  assert.ok(existsSync(path.join(dir, ".claude/skills/specnico-approve/SKILL.md")));
  assert.ok(!existsSync(path.join(dir, ".claude/commands")));
  assert.ok(!existsSync(path.join(dir, ".claude/skills/approve")));
  assert.ok(existsSync(path.join(dir, ".specify/templates/spec-template.md")));
  assert.ok(existsSync(path.join(dir, ".specify/packs/typescript/pack.json")));
  assert.ok(existsSync(path.join(dir, ".specify/packs/nextjs/README.md")));
  assert.ok(existsSync(path.join(dir, ".specify/workflows/sdd.md")));
  assert.ok(!existsSync(path.join(dir, ".claude/context-index.md")));
  assert.ok(existsSync(path.join(dir, ".specify/memory/product.md")));
  assert.ok(existsSync(path.join(dir, "specs/README.md")));
  assert.ok(!existsSync(path.join(dir, "docs")));
  assert.equal(read(dir, ".specify/.specnico-version").trim(), VERSION);
  assert.ok(!existsSync(path.join(dir, ".claude/settings.local.json")));
  assert.ok(!existsSync(path.join(dir, "meta")));
  assert.ok(!existsSync(path.join(dir, "CLAUDE.md")));
});

test("reinstalação sem flag não sobrescreve", () => {
  const dir = tmp();
  run(dir);
  writeFileSync(path.join(dir, ".claude/skills/specnico-spec/SKILL.md"), "LOCAL");
  assert.equal(run(dir).status, 0);
  assert.equal(read(dir, ".claude/skills/specnico-spec/SKILL.md"), "LOCAL");
});

test("--check diagnostica instalação atualizada e drift local", () => {
  const dir = tmp();
  run(dir);
  let r = run(dir, "--check");
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /sem drift local/);
  writeFileSync(path.join(dir, ".claude/skills/specnico-spec/SKILL.md"), "LOCAL");
  r = run(dir, "--check");
  assert.equal(r.status, 1);
  assert.match(r.stdout, /Drift no harness: 1 arquivo/);
});

test("--upgrade atualiza harness e preserva contexto e settings", () => {
  const dir = tmp();
  run(dir);
  writeFileSync(path.join(dir, ".claude/skills/specnico-spec/SKILL.md"), "VELHO");
  fill(dir);
  writeFileSync(path.join(dir, ".claude/settings.json"), "{}");
  writeFileSync(path.join(dir, ".specify/.specnico-version"), "0.9.0\n");
  rmSync(path.join(dir, ".specify/memory/decisions.md"));
  const r = run(dir, "--upgrade");
  assert.equal(r.status, 0, r.stderr);
  assert.equal(read(dir, ".claude/skills/specnico-spec/SKILL.md"), SRC_SPEC);
  assert.equal(read(dir, ".specify/memory/product.md"), "# Produto\nPREENCHIDO\n");
  assert.equal(read(dir, ".claude/settings.json"), "{}");
  assert.ok(existsSync(path.join(dir, ".specify/memory/decisions.md")));
  assert.match(r.stdout, /0\.9\.0/);
  assert.match(r.stdout, new RegExp(VERSION.replace(/\./g, "\\.")));
  assert.equal(read(dir, ".specify/.specnico-version").trim(), VERSION);
});

test("--upgrade em instalação sem .specnico-version (1.0.0) funciona", () => {
  const dir = tmp();
  run(dir);
  rmSync(path.join(dir, ".specify/.specnico-version"));
  const r = run(dir, "--upgrade");
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /desconhecida/);
});

test("--force não interativo com contexto preenchido recusa sem --yes", () => {
  const dir = tmp();
  run(dir);
  fill(dir);
  const r = run(dir, "--force");
  assert.equal(r.status, 1);
  assert.equal(read(dir, ".specify/memory/product.md"), "# Produto\nPREENCHIDO\n");
});

test("--force --yes sobrescreve contexto", () => {
  const dir = tmp();
  run(dir);
  fill(dir);
  assert.equal(run(dir, "--force", "--yes").status, 0);
  assert.match(read(dir, ".specify/memory/product.md"), /Status do arquivo:\*\* vazio/);
});

test("--upgrade e --force juntos → erro", () => {
  const dir = tmp();
  mkdirSync(path.join(dir, "x"));
  assert.equal(run(dir, "--upgrade", "--force").status, 1);
});

test("--force não interativo com .specify/memory/ divergente fora de product.md recusa sem --yes", () => {
  const dir = tmp();
  run(dir);
  rmSync(path.join(dir, ".specify/memory/product.md"));
  writeFileSync(path.join(dir, ".specify/memory/decisions.md"), "PREENCHIDO\n");
  const r = run(dir, "--force");
  assert.equal(r.status, 1);
  assert.equal(read(dir, ".specify/memory/decisions.md"), "PREENCHIDO\n");
});

test("reinstalação sem flag não regrava .specnico-version; --upgrade regrava", () => {
  const dir = tmp();
  run(dir);
  writeFileSync(path.join(dir, ".specify/.specnico-version"), "0.9.0\n");
  assert.equal(run(dir).status, 0);
  assert.equal(read(dir, ".specify/.specnico-version").trim(), "0.9.0");
  const r = run(dir, "--upgrade");
  assert.equal(r.status, 0, r.stderr);
  assert.equal(read(dir, ".specify/.specnico-version").trim(), VERSION);
});

test("--upgrade sem mudanças não imprime overwrite; com mudança imprime só o arquivo alterado", () => {
  const dir = tmp();
  run(dir);
  let r = run(dir, "--upgrade");
  assert.equal(r.status, 0, r.stderr);
  assert.ok(!/overwrite/.test(r.stdout));

  writeFileSync(path.join(dir, ".claude/skills/specnico-spec/SKILL.md"), "LOCAL");
  r = run(dir, "--upgrade");
  assert.equal(r.status, 0, r.stderr);
  const overwriteLines = r.stdout.split("\n").filter((l) => l.includes("overwrite"));
  assert.equal(overwriteLines.length, 1);
  assert.match(overwriteLines[0], /specnico-spec[\\/]SKILL\.md/);
});

test("--upgrade não sobrescreve arquivo instalado só com line endings CRLF", () => {
  const dir = tmp();
  run(dir);
  const specPath = path.join(dir, ".claude/skills/specnico-spec/SKILL.md");
  writeFileSync(specPath, readFileSync(specPath, "utf8").replace(/\n/g, "\r\n"));
  const r = run(dir, "--upgrade");
  assert.equal(r.status, 0, r.stderr);
  const overwriteLines = r.stdout
    .split("\n")
    .filter((l) => l.includes("overwrite") && /specnico-spec[\\/]SKILL\.md/.test(l));
  assert.equal(overwriteLines.length, 0);
});

test("--force não interativo não recusa quando docs/ diverge só em line endings (CRLF)", () => {
  const dir = tmp();
  run(dir);
  const decisionsPath = path.join(dir, ".specify/memory/decisions.md");
  writeFileSync(decisionsPath, readFileSync(decisionsPath, "utf8").replace(/\n/g, "\r\n"));
  const r = run(dir, "--force");
  assert.equal(r.status, 0, r.stderr);
});

const legacy = () => {
  const dir = tmp();
  mkdirSync(path.join(dir, ".claude"), { recursive: true });
  writeFileSync(path.join(dir, ".claude/.scaffold-version"), "1.2.0\n");
  mkdirSync(path.join(dir, "docs/context"), { recursive: true });
  writeFileSync(path.join(dir, "docs/context/product.md"), "# Produto\n");
  return dir;
};

test("instalação grava .specify/.specnico-version e não .claude/.scaffold-version", () => {
  const dir = tmp();
  assert.equal(run(dir).status, 0);
  assert.ok(existsSync(path.join(dir, ".specify/.specnico-version")));
  assert.ok(!existsSync(path.join(dir, ".claude/.scaffold-version")));
});

test("constantes e isLegacyInstall", () => {
  assert.equal(VERSION_FILE, ".specify/.specnico-version");
  assert.equal(LEGACY_VERSION_FILE, ".claude/.scaffold-version");
  const dir = legacy();
  assert.equal(isLegacyInstall(dir), true);
  mkdirSync(path.join(dir, ".specify"));
  assert.equal(isLegacyInstall(dir), false);
  assert.equal(isLegacyInstall(tmp()), false);
});

test("--upgrade em projeto 1.x recusa e aponta --migrate", () => {
  const dir = legacy();
  const r = run(dir, "--upgrade");
  assert.equal(r.status, 1);
  assert.match(r.stderr, /npx specnico@latest --migrate/);
  assert.ok(!existsSync(path.join(dir, ".specify")));
});

test("--check em projeto 1.x informa instalação 1.x e --migrate", () => {
  const dir = legacy();
  const r = run(dir, "--check");
  assert.equal(r.status, 1);
  assert.match(r.stdout, /--migrate/);
  assert.match(r.stdout, /1\.x/);
});

test("--help cita specnico e não scaffold-ia fora da linha de migração", () => {
  const r = run(tmp(), "--help");
  assert.equal(r.status, 0);
  assert.match(r.stdout, /specnico/);
  const rest = r.stdout.split("\n").filter((l) => !/--migrate/.test(l)).join("\n");
  assert.ok(!/scaffold-ia/.test(rest));
});

test("--check com .specify/init-options.json (Spec Kit) alerta colisão", () => {
  const dir = tmp();
  run(dir);
  writeFileSync(path.join(dir, ".specify/init-options.json"), "{}");
  const r = run(dir, "--check");
  assert.match(r.stdout, /Spec Kit/);
});

test("instalação simples e --force em projeto 1.x recusam e não escrevem nada", () => {
  for (const flags of [[], ["--force"], ["--force", "--yes"]]) {
    const dir = legacy();
    const r = run(dir, ...flags);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /--migrate/);
    assert.ok(!existsSync(path.join(dir, ".specify")));
    assert.ok(!existsSync(path.join(dir, ".claude/skills")));
  }
});

test("--check só com .specify/init-options.json (Spec Kit) alerta colisão", () => {
  const dir = tmp();
  mkdirSync(path.join(dir, ".specify"));
  writeFileSync(path.join(dir, ".specify/init-options.json"), "{}");
  const r = run(dir, "--check");
  assert.match(r.stdout + r.stderr, /Spec Kit/);
});

test("instalação com .specify/init-options.json imprime alerta do Spec Kit", () => {
  const dir = tmp();
  mkdirSync(path.join(dir, ".specify"));
  writeFileSync(path.join(dir, ".specify/init-options.json"), "{}");
  const r = run(dir);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Spec Kit/);
});

// ---------------------------------------------------------------------------
// --migrate 1.x -> 2.0 (a fixture é copiada para um tmp; nunca roda nela)

const FIXTURE_V1 = path.join(root, "meta/tests/fixtures/v1");
const { planMigration, findBlockingSpecs } = createRequire(import.meta.url)(CLI);

const v1 = () => {
  const dir = path.join(tmp(), "proj com espaco");
  cpSync(FIXTURE_V1, dir, { recursive: true });
  return dir;
};

const snapshot = (dir) => {
  const out = {};
  const walk = (d) => {
    for (const name of readdirSync(d).sort()) {
      if (name === ".git") continue;
      const p = path.join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else out[path.relative(dir, p).split(path.sep).join("/")] = readFileSync(p, "utf8");
    }
  };
  walk(dir);
  return out;
};

const fixtureText = (rel) => readFileSync(path.join(FIXTURE_V1, rel), "utf8");

function assertMigrated(dir) {
  assert.ok(!existsSync(path.join(dir, "docs")), "docs/ deve sumir");
  assert.ok(!existsSync(path.join(dir, ".claude/commands")));
  assert.ok(!existsSync(path.join(dir, ".claude/context-index.md")));
  assert.ok(!existsSync(path.join(dir, ".claude/.scaffold-version")));
  for (const f of ["product", "conventions", "decisions", "architecture", "constitution", "product-backlog"]) {
    assert.ok(existsSync(path.join(dir, `.specify/memory/${f}.md`)), f);
  }
  assert.equal(read(dir, ".specify/memory/product.md"), fixtureText("docs/context/product.md"));
  assert.equal(read(dir, ".specify/memory/decisions.md"), fixtureText("docs/context/decisions.md"));
  const constitution = read(dir, ".specify/memory/constitution.md");
  assert.match(constitution, /<!-- migrado da 1\.x: revise com \/specnico-constitution -->/);
  assert.ok(constitution.includes(fixtureText("docs/context/constitution.md")));
  assert.ok(constitution.includes(fixtureText("docs/context/guardrails.md")));
  const conventions = read(dir, ".specify/memory/conventions.md");
  assert.ok(conventions.includes(fixtureText("docs/context/conventions.md")));
  assert.match(conventions, /^## UI$/m);
  assert.ok(conventions.includes(fixtureText("docs/context/ui-guidelines.md")));
  const arch = read(dir, ".specify/memory/architecture.md");
  assert.ok(arch.includes(fixtureText("docs/architecture/overview.md")));
  assert.ok(arch.includes(fixtureText("docs/architecture/backend.md")));
  assert.ok(arch.indexOf("TEXTO-ARQUITETURA") < arch.indexOf("TEXTO-ARQ-BACKEND"), "overview primeiro");
  assert.ok(
    read(dir, ".specify/memory/projects/apps-api.md").includes(fixtureText("docs/apps/api/context/decisions.md")),
  );
  assert.equal(read(dir, "specs/legacy/2026-01-01-a.md"), fixtureText("docs/specs/2026-01-01-a.md"));
  assert.equal(read(dir, "specs/legacy/2025-12-01-b.md"), fixtureText("docs/archive/2025-12-01-b.md"));
  assert.equal(read(dir, "specs/legacy/features/x.md"), fixtureText("docs/features/x.md"));
  assert.equal(
    read(dir, "specs/legacy/features/nota com espaco.md"),
    fixtureText("docs/features/nota com espaco.md"),
  );
  assert.ok(read(dir, "specs/legacy/current-state-1x.md").includes(fixtureText("docs/context/current-state.md")));
  const backlog = read(dir, ".specify/memory/product-backlog.md");
  assert.match(backlog, /^## Legado \(1\.x\)$/m);
  assert.ok(backlog.includes(fixtureText("docs/context/product-backlog.md")));
  const state = JSON.parse(read(dir, ".specify/state.json"));
  assert.equal(state.versao, 1);
  assert.equal(state.ativo, null);
  assert.ok(!Number.isNaN(Date.parse(state.atualizado)));
  assert.equal(read(dir, ".specify/.specnico-version").trim(), VERSION);
  // harness 2.0 instalado
  assert.ok(existsSync(path.join(dir, ".claude/skills/specnico-spec/SKILL.md")));
  assert.ok(existsSync(path.join(dir, ".specify/templates/spec-template.md")));
  assert.ok(existsSync(path.join(dir, "specs/README.md")));
}

test("--migrate --yes converte fixture 1.x para o layout 2.0", () => {
  const dir = v1();
  const r = run(dir, "--migrate", "--yes");
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /move docs\/context\/product\.md -> \.specify\/memory\/product\.md/);
  assert.match(
    r.stdout,
    /concat \[docs\/context\/constitution\.md, docs\/context\/guardrails\.md\] -> \.specify\/memory\/constitution\.md/,
  );
  assertMigrated(dir);
});

test("--migrate --yes em repositório git usa git mv (caminho com espaço)", () => {
  const dir = v1();
  const git = (...a) => spawnSync("git", a, { cwd: dir, encoding: "utf8" });
  assert.equal(git("init", "-q").status, 0);
  assert.equal(git("add", "--", ".").status, 0);
  const c = git("-c", "user.email=t@t", "-c", "user.name=t", "-c", "commit.gpgsign=false", "commit", "-q", "-m", "1.x");
  assert.equal(c.status, 0, c.stderr);
  const r = run(dir, "--migrate", "--yes");
  assert.equal(r.status, 0, r.stderr);
  assertMigrated(dir);
  const status = git("status", "--porcelain").stdout;
  assert.match(status, /^R {2}docs\/context\/product\.md -> \.specify\/memory\/product\.md$/m);
  assert.match(status, /^R {2}"docs\/features\/nota com espaco\.md" -> "specs\/legacy\/features\/nota com espaco\.md"$/m);
  assert.match(status, /^D {2}docs\/context\/guardrails\.md$/m);
  // destinos de concat/write e dados criados ficam staged: um commit simples não perde texto.
  const untracked = status.split("\n").filter((l) => /^\?\? "?(\.specify\/memory|\.specify\/state\.json|specs\/)/.test(l));
  assert.deepEqual(untracked, []);
  assert.match(status, /^A {2}\.specify\/memory\/constitution\.md$/m);
  assert.match(status, /^A {2}specs\/legacy\/current-state-1x\.md$/m);
  assert.match(status, /^A {2}\.specify\/state\.json$/m);
});

test("--migrate interrompido mantém o marcador 1.x e pode ser retomado", () => {
  const dir = v1();
  // .specify/templates como ARQUIVO faz o install do harness falhar depois dos ops.
  mkdirSync(path.join(dir, ".specify"), { recursive: true });
  writeFileSync(path.join(dir, ".specify/templates"), "bloqueio");
  const r = run(dir, "--migrate", "--yes");
  assert.equal(r.status, 1);
  assert.match(r.stderr, /interrompida/);
  assert.match(r.stderr, /npx specnico@latest --migrate --yes/);
  assert.ok(!/^\s+at /m.test(r.stderr), "sem stack trace");
  assert.ok(existsSync(path.join(dir, ".claude/.scaffold-version")), "marcador 1.x preservado");
  assert.ok(!existsSync(path.join(dir, ".specify/.specnico-version")));
  rmSync(path.join(dir, ".specify/templates"));
  const again = run(dir, "--migrate", "--yes");
  assert.equal(again.status, 0, again.stderr);
  assertMigrated(dir);
});

test("--migrate: plano não remove o marcador 1.x nos ops; avisa sem git e lista restos", () => {
  const dir = v1();
  writeFileSync(path.join(dir, ".claude/commands/meu-comando.md"), "# meu docs/context\n");
  assert.ok(!planMigration(dir).some((o) => o.from === ".claude/.scaffold-version"));
  const r = run(dir, "--migrate", "--yes");
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /backup/i);
  assert.match(r.stdout, /\.claude\/commands\/meu-comando\.md/);
});

test("--migrate com Spec Kit alerta e anota conflito de destino", () => {
  const dir = v1();
  mkdirSync(path.join(dir, ".specify/memory"), { recursive: true });
  writeFileSync(path.join(dir, ".specify/init-options.json"), "{}");
  writeFileSync(path.join(dir, ".specify/memory/constitution.md"), "# Spec Kit\n");
  const r = run(dir, "--migrate", "--yes");
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Spec Kit/);
  assert.match(r.stdout, /conflito: \.specify\/memory\/constitution\.md gravado como \.specify\/memory\/constitution-2\.md/);
  assert.equal(read(dir, ".specify/memory/constitution.md"), "# Spec Kit\n");
  assert.ok(read(dir, ".specify/memory/constitution-2.md").includes("TEXTO-GUARDRAILS"));
});

test("--migrate tolera variação de caixa em docs/ e remove BOM nos concats", () => {
  const dir = path.join(tmp(), "caixa");
  mkdirSync(path.join(dir, ".claude"), { recursive: true });
  writeFileSync(path.join(dir, ".claude/.scaffold-version"), "1.2.0\n");
  mkdirSync(path.join(dir, "docs/Context"), { recursive: true });
  writeFileSync(path.join(dir, "docs/Context/Product.md"), "# Produto CAIXA\n");
  writeFileSync(path.join(dir, "docs/Context/Notas.md"), "# Notas CAIXA\n");
  writeFileSync(path.join(dir, "docs/Context/Guardrails.md"), "﻿# Guardrails BOM\n");
  const r = run(dir, "--migrate", "--yes");
  assert.equal(r.status, 0, r.stderr);
  assert.equal(read(dir, ".specify/memory/product.md"), "# Produto CAIXA\n");
  const constitution = read(dir, ".specify/memory/constitution.md");
  assert.ok(constitution.includes("# Guardrails BOM"));
  assert.ok(!constitution.includes("﻿"));
  assert.ok(Object.values(snapshot(dir)).join("\n").includes("# Notas CAIXA"));
  assert.ok(!existsSync(path.join(dir, "docs")));
});

test("--migrate segunda vez → 'nada a migrar', sem mudanças", () => {
  const dir = v1();
  assert.equal(run(dir, "--migrate", "--yes").status, 0);
  const before = snapshot(dir);
  const r = run(dir, "--migrate", "--yes");
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /nada a migrar/i);
  assert.deepEqual(snapshot(dir), before);
});

test("--migrate recusa com Spec approved inacabada e lista o caminho", () => {
  const dir = v1();
  mkdirSync(path.join(dir, "docs/apps/api/specs"), { recursive: true });
  writeFileSync(
    path.join(dir, "docs/apps/api/specs/2026-02-01-c.md"),
    "# C\n\n**Status:** approved\n\n- [x] feito\n- [ ] falta\n",
  );
  writeFileSync(path.join(dir, "docs/specs/2026-02-02-d.md"), "# D\n\n**Status:** approved\n\n- [x] feito\n");
  assert.deepEqual(findBlockingSpecs(dir), ["docs/apps/api/specs/2026-02-01-c.md"]);
  const before = snapshot(dir);
  const r = run(dir, "--migrate", "--yes");
  assert.equal(r.status, 1);
  assert.match(r.stderr, /docs\/apps\/api\/specs\/2026-02-01-c\.md/);
  assert.deepEqual(snapshot(dir), before);
});

test("--migrate sem --yes em ambiente não interativo → recusa", () => {
  const dir = v1();
  const before = snapshot(dir);
  const r = run(dir, "--migrate");
  assert.equal(r.status, 1);
  assert.match(r.stderr, /--yes/);
  assert.deepEqual(snapshot(dir), before);
});

test("--migrate em diretório sem instalação 1.x → erro", () => {
  const dir = tmp();
  const r = run(dir, "--migrate", "--yes");
  assert.equal(r.status, 1);
  assert.match(r.stderr, /1\.x/);
  assert.ok(!existsSync(path.join(dir, ".specify")));
});

test("planMigration dá destino a todo arquivo de docs/ e não remove dado do usuário", () => {
  const dir = v1();
  mkdirSync(path.join(dir, "docs/context/domains"), { recursive: true });
  writeFileSync(path.join(dir, "docs/context/domains/pagamentos.md"), "# Pagamentos\n");
  writeFileSync(path.join(dir, "docs/context/notas.md"), "# Notas soltas\n");
  writeFileSync(path.join(dir, "docs/specs/README.md"), "# specs readme\n");
  writeFileSync(path.join(dir, "docs/archive/README.md"), "# archive readme\n");
  mkdirSync(path.join(dir, "docs/apps/api/context/img"), { recursive: true });
  writeFileSync(path.join(dir, "docs/apps/api/context/img/a.png"), "PNG");
  writeFileSync(path.join(dir, "docs/apps/api/context/backlog.md"), "# Backlog api\nTEXTO-BACKLOG-API\n");
  writeFileSync(path.join(dir, ".claude/commands/meu-comando.md"), "# meu\n");
  const ops = planMigration(dir);
  const sources = new Set();
  for (const op of ops) {
    if (op.op === "move" || op.op === "concat") for (const f of [].concat(op.from)) sources.add(f);
  }
  const walk = (d) =>
    readdirSync(path.join(dir, d)).flatMap((n) => {
      const rel = `${d}/${n}`;
      return statSync(path.join(dir, rel)).isDirectory() ? walk(rel) : [rel];
    });
  for (const f of walk("docs")) assert.ok(sources.has(f), `sem destino: ${f}`);
  const removes = ops.filter((o) => o.op === "remove").map((o) => o.from);
  for (const r of removes) assert.ok(!r.startsWith("docs/"), r);
  assert.ok(!removes.includes(".claude/commands/meu-comando.md"));
  const dests = ops.filter((o) => o.to).map((o) => o.to);
  assert.equal(new Set(dests).size, dests.length, "destinos únicos");

  assert.equal(run(dir, "--migrate", "--yes").status, 0);
  assert.equal(read(dir, ".specify/memory/domains/pagamentos.md"), "# Pagamentos\n");
  assert.ok(read(dir, ".specify/memory/product-backlog.md").includes("TEXTO-BACKLOG-API"));
  assert.ok(!read(dir, ".specify/memory/projects/apps-api.md").includes("TEXTO-BACKLOG-API"));
  assert.equal(read(dir, ".claude/commands/meu-comando.md"), "# meu\n");
  assert.ok(!existsSync(path.join(dir, "docs")));
  const all = Object.values(snapshot(dir)).join("\n");
  for (const t of ["# Notas soltas", "# specs readme", "# archive readme"]) assert.ok(all.includes(t), t);
  assert.ok(Object.keys(snapshot(dir)).some((k) => k.endsWith("img/a.png")));
});

test("--migrate aponta /specnico-constitution, que detecta a migração (sem 'modo emenda')", () => {
  const dir = v1();
  const r = run(dir, "--migrate", "--yes");
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /\/specnico-constitution/);
  assert.match(r.stdout, /detecta a migracao/);
  assert.ok(!/modo emenda/.test(r.stdout));
  assert.ok(!/modo emenda/.test(read(dir, ".specify/memory/product-backlog.md")));
});

test("--check com --force ou --upgrade → mensagem própria de somente leitura", () => {
  for (const flag of ["--force", "--upgrade"]) {
    const r = run(tmp(), "--check", flag);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /--check e somente leitura; nao combine com --force\/--upgrade/);
  }
});

test("Spec Kit: avisa que os templates dele prevalecem e não sugere --upgrade", () => {
  const dir = tmp();
  mkdirSync(path.join(dir, ".specify/templates"), { recursive: true });
  writeFileSync(path.join(dir, ".specify/init-options.json"), "{}");
  writeFileSync(path.join(dir, ".specify/templates/spec-template.md"), "# Spec Kit\n");
  const r = run(dir);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /\.specify\/templates\/.*prevalecem/);
  assert.match(r.stdout, /skills specnico-\* precisam dos templates do specnico/);
  assert.ok(!/use --upgrade/.test(r.stdout), "não deve sugerir --upgrade com Spec Kit");
  assert.match(r.stdout, /revise manualmente/);
  assert.equal(read(dir, ".specify/templates/spec-template.md"), "# Spec Kit\n");
});

test("reinstalação sem Spec Kit continua sugerindo --upgrade", () => {
  const dir = tmp();
  run(dir);
  const r = run(dir);
  assert.match(r.stdout, /use --upgrade/);
});
