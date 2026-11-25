/**
 * Núcleo puro (agnóstico de plataforma) do hook verify-project.
 *
 * Roda type-check do projeto quando algum .ts/.tsx mudou em relação ao HEAD.
 * Filosofia: fail-open. Respeita alreadyBlocked para evitar loop de turno.
 */
import { readFileSync, existsSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

const TIMEOUT_MS = 180_000;

export function evaluateVerifyProject({
  root = process.cwd(),
  alreadyBlocked = false,
  env = process.env,
} = {}) {
  if (env.SPECNICO_VERIFY === "0" || env.SCAFFOLD_VERIFY === "0") {
    return { decision: "allow" };
  }
  if (alreadyBlocked) return { decision: "allow" };

  const git = spawnSync("git", ["diff", "--name-only", "HEAD"], {
    cwd: root,
    encoding: "utf8",
    timeout: 15_000,
  });
  if (git.status !== 0) return { decision: "allow" };

  const untracked = spawnSync(
    "git",
    ["ls-files", "--others", "--exclude-standard"],
    { cwd: root, encoding: "utf8", timeout: 15_000 },
  );

  const changed = `${git.stdout}\n${untracked.stdout ?? ""}`
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (!changed.some((f) => f.endsWith(".ts") || f.endsWith(".tsx"))) {
    return { decision: "allow" };
  }

  const pkgPath = path.join(root, "package.json");
  if (!existsSync(pkgPath)) return { decision: "allow" };

  let pkg;
  try {
    pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  } catch {
    return { decision: "allow" };
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
      shell: true,
    });
  } else {
    if (!existsSync(path.join(root, "tsconfig.json"))) return { decision: "allow" };
    let tsc;
    try {
      tsc = createRequire(pkgPath).resolve("typescript/bin/tsc");
    } catch {
      return { decision: "allow" };
    }
    try {
      execFileSync(process.execPath, [tsc, "--noEmit"], {
        cwd: root,
        timeout: TIMEOUT_MS,
        stdio: ["ignore", "pipe", "pipe"],
      });
      return { decision: "allow" };
    } catch (err) {
      result = { status: err.status ?? 1, stdout: err.stdout, stderr: err.stderr };
    }
  }

  if (!result || result.status === 0) return { decision: "allow" };

  const out = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
  const trimmed = out.split("\n").slice(0, 40).join("\n");

  return {
    decision: "block",
    message:
      `[guardrail] Type-check reprovou. O turno não pode ser encerrado com o ` +
      `projeto quebrado:\n\n${trimmed}\n\n` +
      `Corrija os erros acima. Se forem pré-existentes e não relacionados a esta ` +
      `tarefa, diga isso explicitamente ao usuário em vez de ignorar em silêncio.\n`,
  };
}
