#!/usr/bin/env node
/**
 * Adapter de hooks do Specnico para Google AI Pro (Gemini CLI e Antigravity).
 * Uso: node .specify/hooks/adapters/gemini-hook.mjs <spec-gate|verify-file|verify-project>
 */
import { readFileSync } from "node:fs";
import { evaluateSpecGate } from "../core/spec-gate.mjs";
import { evaluateVerifyFile } from "../core/verify-file.mjs";
import { evaluateVerifyProject } from "../core/verify-project.mjs";

const ok = () => process.exit(0);
const kind = process.argv[2];
if (!kind) ok();

let payload;
try {
  payload = JSON.parse(readFileSync(0, "utf8"));
} catch {
  ok();
}

function extractInput(p) {
  const args = p?.tool_input ?? p?.tool_args ?? p?.args ?? p?.input ?? {};
  return {
    root: p?.cwd || process.cwd(),
    filePath:
      args?.file_path ??
      args?.Path ??
      args?.TargetFile ??
      args?.path ??
      p?.file_path,
    content: args?.content ?? args?.Content ?? args?.CodeContent,
    oldString: args?.old_string ?? args?.Target ?? args?.TargetContent,
    newString: args?.new_string ?? args?.Replacement ?? args?.ReplacementContent,
    replaceAll: args?.replace_all ?? args?.AllowMultiple ?? false,
    edits: args?.edits ?? args?.ReplacementChunks,
    alreadyBlocked: Boolean(p?.stop_hook_active || p?.already_blocked),
  };
}

const input = extractInput(payload);

if (kind === "spec-gate") {
  const res = evaluateSpecGate(input);
  if (res.decision === "ask") {
    process.stdout.write(
      JSON.stringify({
        decision: "ask",
        reason: res.reason,
      }),
    );
    ok();
  }
  if (res.decision === "block") {
    process.stdout.write(
      JSON.stringify({
        decision: "deny",
        reason: res.message.trim(),
      }),
    );
    process.stderr.write(res.message);
    process.exit(2);
  }
  ok();
}

if (kind === "verify-file") {
  const res = evaluateVerifyFile(input);
  if (res.decision === "block") {
    process.stderr.write(res.message);
    process.exit(2);
  }
  ok();
}

if (kind === "verify-project") {
  const res = evaluateVerifyProject(input);
  if (res.decision === "block") {
    process.stderr.write(res.message);
    process.exit(2);
  }
  ok();
}

ok();
