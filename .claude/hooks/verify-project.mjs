#!/usr/bin/env node
/**
 * Stop hook — type-check do projeto antes de o agente encerrar o turno.
 *
 * Roda uma vez por turno (não por edição), e só quando há arquivo TypeScript
 * modificado em relação ao HEAD. É o gate que transforma "acho que está pronto"
 * em evidência.
 *
 * Filosofia: fail open. Sem TypeScript, sem tsconfig, sem git, ou sem mudança
 * em .ts/.tsx → sai 0 em silêncio.
 *
 * Proteção contra loop: se `stop_hook_active` vier true, o agente já foi
 * bloqueado uma vez neste turno — sai 0 para não prender a sessão em ciclo.
 *
 * Desligar: SCAFFOLD_VERIFY=0
 */
import { readFileSync, existsSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

const TIMEOUT_MS = 180_000;
const ok = () => process.exit(0);

if (process.env.SCAFFOLD_VERIFY === "0") ok();

let payload;
try {
  payload = JSON.parse(readFileSync(0, "utf8"));
} catch {
  ok();
}

// Já bloqueou uma vez neste turno — não insista.
if (payload?.stop_hook_active) ok();

const root = payload?.cwd || process.cwd();

// --- só roda se houver mudança em TypeScript ---
const git = spawnSync("git", ["diff", "--name-only", "HEAD"], {
  cwd: root,
  encoding: "utf8",
  timeout: 15_000,
});
if (git.status !== 0) ok(); // sem git, ou HEAD inexistente

const untracked = spawnSync(
  "git",
  ["ls-files", "--others", "--exclude-standard"],
  { cwd: root, encoding: "utf8", timeout: 15_000 },
);

const changed = `${git.stdout}\n${untracked.stdout ?? ""}`
  .split("\n")
  .map((l) => l.trim())
  .filter(Boolean);

if (!changed.some((f) => f.endsWith(".ts") || f.endsWith(".tsx"))) ok();

// --- descobre como fazer type-check ---
const pkgPath = path.join(root, "package.json");
if (!existsSync(pkgPath)) ok();

let pkg;
try {
  pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
} catch {
  ok();
}

const script = ["type-check", "typecheck", "tsc"].find(
  (s) => pkg.scripts?.[s],
);

let result;
if (script) {
  const pm = existsSync(path.join(root, "pnpm-lock.yaml"))
    ? "pnpm"
    : existsSync(path.join(root, "yarn.lock"))
      ? "yarn"
      : "npm";
  result = spawnSync(pm, ["run", script], {
    cwd: root,
    encoding: "utf8",
    timeout: TIMEOUT_MS,
    shell: true, // necessário no Windows para resolver npm/pnpm/yarn
  });
} else {
  if (!existsSync(path.join(root, "tsconfig.json"))) ok();
  let tsc;
  try {
    tsc = createRequire(pkgPath).resolve("typescript/bin/tsc");
  } catch {
    ok(); // TypeScript não instalado
  }
  try {
    execFileSync(process.execPath, [tsc, "--noEmit"], {
      cwd: root,
      timeout: TIMEOUT_MS,
      stdio: ["ignore", "pipe", "pipe"],
    });
    ok();
  } catch (err) {
    result = { status: err.status ?? 1, stdout: err.stdout, stderr: err.stderr };
  }
}

if (!result || result.status === 0) ok();

const out = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
const trimmed = out.split("\n").slice(0, 40).join("\n");

process.stderr.write(
  `[guardrail] Type-check reprovou. O turno não pode ser encerrado com o ` +
    `projeto quebrado:\n\n${trimmed}\n\n` +
    `Corrija os erros acima. Se forem pré-existentes e não relacionados a esta ` +
    `tarefa, diga isso explicitamente ao usuário em vez de ignorar em silêncio.\n`,
);
process.exit(2);
