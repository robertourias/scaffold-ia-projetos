#!/usr/bin/env node
/**
 * PostToolUse hook — lint do arquivo que acabou de ser editado.
 *
 * Matcher esperado: Edit|Write|MultiEdit
 *
 * Filosofia: fail open. Se o projeto não tem ESLint instalado, ou o arquivo não
 * é lintável, o hook sai em silêncio com código 0. Um scaffold copiado para um
 * projeto sem tooling nunca pode quebrar o fluxo do agente.
 *
 * Quando encontra erro de lint, sai com código 2 e escreve no stderr — o
 * Claude Code injeta esse stderr de volta no contexto do agente, que corrige
 * antes de seguir.
 *
 * Desligar: SCAFFOLD_VERIFY=0
 */
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

const LINTABLE = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const TIMEOUT_MS = 30_000;

const ok = () => process.exit(0);

if (process.env.SCAFFOLD_VERIFY === "0") ok();

let payload;
try {
  payload = JSON.parse(readFileSync(0, "utf8"));
} catch {
  ok(); // sem payload válido não há o que verificar
}

const file = payload?.tool_input?.file_path;
if (!file || !existsSync(file)) ok();
if (!LINTABLE.has(path.extname(file))) ok();

const cwd = payload.cwd || process.cwd();

// Sobe a árvore procurando o package.json mais próximo que resolva o ESLint.
// Cobre monorepo: apps/web pode ter eslint próprio, ou herdar da raiz.
function findEslint(startDir) {
  let dir = path.resolve(startDir);
  for (let i = 0; i < 10; i++) {
    const pkg = path.join(dir, "package.json");
    if (existsSync(pkg)) {
      try {
        return { bin: createRequire(pkg).resolve("eslint/bin/eslint.js"), dir };
      } catch {
        /* este package.json não resolve eslint — continua subindo */
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

const found = findEslint(path.dirname(file));
if (!found) ok(); // projeto sem ESLint — nada a fazer

try {
  execFileSync(
    process.execPath,
    [found.bin, "--no-error-on-unmatched-pattern", "--format", "compact", file],
    { cwd: found.dir, timeout: TIMEOUT_MS, stdio: ["ignore", "pipe", "pipe"] },
  );
  ok();
} catch (err) {
  // ESLint sai 1 quando há erro; 2 quando a própria config está quebrada.
  // Config quebrada não é culpa da edição — não bloqueia o agente.
  if (err.status !== 1) ok();

  const out = `${err.stdout ?? ""}${err.stderr ?? ""}`.trim();
  if (!out) ok();

  process.stderr.write(
    `[guardrail] ESLint reprovou ${path.relative(cwd, file)}:\n\n${out}\n\n` +
      `Corrija antes de marcar qualquer Critério de Aceite como [x].\n`,
  );
  process.exit(2);
}
