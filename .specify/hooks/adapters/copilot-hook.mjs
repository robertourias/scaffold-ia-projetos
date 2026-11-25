#!/usr/bin/env node
/**
 * Adapter de hooks do Specnico para GitHub Copilot (.github/hooks/specnico.json).
 * Uso: node .specify/hooks/adapters/copilot-hook.mjs <spec-gate|verify-file|verify-project>
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
  let args = p?.tool_input ?? p?.toolArgs ?? p?.input ?? {};
  if (typeof args === "string") {
    try {
      args = JSON.parse(args);
    } catch {
      args = {};
    }
  }
  return {
    root: p?.cwd || process.cwd(),
    filePath: args?.file_path ?? args?.filePath ?? args?.path ?? p?.file_path,
    content: args?.content ?? args?.file_text ?? args?.newText,
    oldString: args?.old_string ?? args?.oldString ?? args?.old_str,
    newString: args?.new_string ?? args?.newString ?? args?.new_str,
    replaceAll: args?.replace_all ?? args?.replaceAll ?? false,
    edits: args?.edits,
    alreadyBlocked: Boolean(p?.stop_hook_active),
  };
}

const input = extractInput(payload);

if (kind === "spec-gate") {
  const res = evaluateSpecGate(input);
  if (res.decision === "ask") {
    process.stdout.write(
      JSON.stringify({
        permissionDecision: "ask",
        permissionDecisionReason: res.reason,
      }),
    );
    ok();
  }
  if (res.decision === "block") {
    process.stdout.write(
      JSON.stringify({
        permissionDecision: "deny",
        permissionDecisionReason: res.message.trim(),
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
