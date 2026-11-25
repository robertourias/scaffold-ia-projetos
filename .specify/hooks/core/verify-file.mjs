/**
 * Núcleo puro (agnóstico de plataforma) do hook verify-file.
 *
 * Roda ESLint (sem --fix) sobre o arquivo recém-editado.
 * Filosofia: fail-open. Retorna { decision: "allow" } sem ESLint, sem arquivo
 * lintável ou se a config do ESLint estiver quebrada.
 */
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

const LINTABLE = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const TIMEOUT_MS = 30_000;

function findEslint(startDir) {
  let dir = path.resolve(startDir);
  for (let i = 0; i < 10; i++) {
    const pkg = path.join(dir, "package.json");
    if (existsSync(pkg)) {
      try {
        return { bin: createRequire(pkg).resolve("eslint/bin/eslint.js"), dir };
      } catch {
        // continua subindo
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

export function evaluateVerifyFile({
  root = process.cwd(),
  filePath,
  env = process.env,
} = {}) {
  if (env.SPECNICO_VERIFY === "0" || env.SCAFFOLD_VERIFY === "0") {
    return { decision: "allow" };
  }
  if (!filePath || typeof filePath !== "string") return { decision: "allow" };

  const absFile = path.resolve(root, filePath);
  if (!existsSync(absFile)) return { decision: "allow" };
  if (!LINTABLE.has(path.extname(absFile))) return { decision: "allow" };

  const found = findEslint(path.dirname(absFile));
  if (!found) return { decision: "allow" };

  try {
    execFileSync(
      process.execPath,
      [found.bin, "--no-error-on-unmatched-pattern", "--format", "compact", absFile],
      { cwd: found.dir, timeout: TIMEOUT_MS, stdio: ["ignore", "pipe", "pipe"] },
    );
    return { decision: "allow" };
  } catch (err) {
    if (err.status !== 1) return { decision: "allow" };
    const out = `${err.stdout ?? ""}${err.stderr ?? ""}`.trim();
    if (!out) return { decision: "allow" };
    return {
      decision: "block",
      message:
        `[guardrail] ESLint reprovou ${path.relative(root, absFile)}:\n\n${out}\n\n` +
        `Corrija antes de marcar qualquer Critério de Aceite como [x].\n`,
    };
  }
}
