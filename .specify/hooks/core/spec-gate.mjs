/**
 * Núcleo puro (agnóstico de plataforma) do hook spec-gate.
 *
 * Avalia as 3 regras sobre uma edição de arquivo:
 * - Regra 1: autoaprovação de Spec (saída de review sem confirmação humana) → decision: "ask"
 * - Regra 2: implementação antes da aprovação (Spec ativa em review) → decision: "block"
 * - Regra 3: emenda normativa em spec.md ou plan.md de Spec approved → decision: "ask"
 *
 * Filosofia: fail-open. Retorna { decision: "allow" } quando não há state.json,
 * não há Spec ativa, ou quando SPECNICO_VERIFY=0 (alias SCAFFOLD_VERIFY=0).
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const HARNESS_PREFIXES = [
  ".specify/",
  "specs/",
  ".claude/",
  ".agents/",
  ".gemini/",
  ".github/agents/",
  ".github/skills/",
  ".github/hooks/",
];

const HARNESS_FILES = new Set([
  "AGENTS.md",
  "GEMINI.md",
  "CLAUDE.md",
  ".github/copilot-instructions.md",
]);

export function isVerifyDisabled(env = process.env) {
  return env.SPECNICO_VERIFY === "0" || env.SCAFFOLD_VERIFY === "0";
}

export function evaluateSpecGate({
  root = process.cwd(),
  filePath,
  content,
  oldString,
  newString,
  replaceAll,
  edits,
  env = process.env,
} = {}) {
  if (isVerifyDisabled(env)) return { decision: "allow" };
  if (!filePath || typeof filePath !== "string") return { decision: "allow" };

  const toRel = (p) =>
    path.relative(root, path.resolve(root, p)).split(path.sep).join("/");
  const rel = toRel(filePath);
  if (rel.startsWith("..")) return { decision: "allow" };

  // --- Regra 1 e Regra 3: spec.md / plan.md ----------------------------------
  const isSpec = /^specs\/[^/]+\/spec\.md$/.test(rel);
  const isPlan = /^specs\/[^/]+\/plan\.md$/.test(rel);
  if (isSpec || isPlan) {
    const normalizeNL = (s) => s.replace(/\r\n/g, "\n");
    const applyEdit = (text, oldStr, newStr, all) => {
      if (all) return text.split(oldStr).join(newStr);
      const i = text.indexOf(oldStr);
      if (i === -1) return null;
      return text.slice(0, i) + newStr + text.slice(i + oldStr.length);
    };

    const fileAbs = path.resolve(root, filePath);
    const beforeText = existsSync(fileAbs)
      ? normalizeNL(readFileSync(fileAbs, "utf8"))
      : null;
    const beforeStatus =
      beforeText == null
        ? null
        : (beforeText.match(/\*\*Status:\*\*\s*(\S+)/)?.[1] ?? "");

    let afterText = null;
    if (typeof content === "string") {
      afterText = normalizeNL(content);
    } else if (Array.isArray(edits)) {
      if (beforeText != null) {
        let text = beforeText;
        for (const e of edits) {
          const eOld = e?.old_string ?? e?.oldString ?? e?.Target;
          const eNew = e?.new_string ?? e?.newString ?? e?.Replacement;
          const eAll = e?.replace_all ?? e?.replaceAll ?? false;
          if (typeof eOld !== "string" || typeof eNew !== "string") {
            text = null;
            break;
          }
          text = applyEdit(text, normalizeNL(eOld), normalizeNL(eNew), eAll);
          if (text == null) break;
        }
        afterText = text;
      }
    } else if (typeof oldString === "string" && typeof newString === "string") {
      if (beforeText != null) {
        afterText = applyEdit(
          beforeText,
          normalizeNL(oldString),
          normalizeNL(newString),
          replaceAll,
        );
      }
    }

    // Regra 1: autoaprovação
    let shouldAsk = false;
    if (!isSpec) {
      // plan.md: só Regra 3
    } else if (afterText != null) {
      const afterStatus = afterText.match(/\*\*Status:\*\*\s*(\S+)/)?.[1] ?? null;
      shouldAsk =
        afterStatus !== "review" &&
        (beforeStatus === "review" || beforeStatus === null);
    } else {
      const texts = [
        newString,
        content,
        ...(Array.isArray(edits)
          ? edits.map((e) => e?.new_string ?? e?.newString ?? e?.Replacement)
          : []),
      ]
        .filter((t) => typeof t === "string")
        .map(normalizeNL);
      shouldAsk = texts.some((t) => {
        const m = t.match(/\*\*Status:\*\*\s*(\S+)/);
        return m != null && m[1] !== "review";
      });
    }

    if (shouldAsk) {
      return {
        decision: "ask",
        reason: "Aprovação de Spec exige confirmação humana (/jarvis-implement).",
      };
    }

    // Regra 3: emenda em Spec aprovada
    let statusRegra3 = beforeStatus;
    if (isPlan) {
      try {
        const specMd = path.resolve(root, path.dirname(rel), "spec.md");
        statusRegra3 =
          readFileSync(specMd, "utf8").match(/\*\*Status:\*\*\s*(\S+)/)?.[1] ?? "";
      } catch {
        statusRegra3 = null;
      }
    }
    if (statusRegra3 === "approved" && beforeText != null && afterText != null) {
      const normativo = (t) => {
        const out = [];
        let inSecaoLivre = false;
        let inPendencia = false;
        for (const line of t.split("\n")) {
          if (/^## /.test(line)) {
            inSecaoLivre = /^##\s+(?:\d+\.\s*)?(Notas de Review|Emendas)\b/.test(line);
          }
          if (inSecaoLivre) continue;
          if (/^\s*>\s*(🟡|✅) Pendência Manual/.test(line)) {
            inPendencia = true;
            continue;
          }
          if (inPendencia) {
            if (/^\s*>/.test(line)) continue;
            inPendencia = false;
          }
          if (/^\s*\*\*(Status|Aprovado por|Concluído em):\*\*/.test(line)) continue;
          if (!line.trim()) continue;
          out.push(line.replace(/^(\s*[-*]\s+)\[[xX ]\]/, "$1[ ]").trimEnd());
        }
        return out.join("\n").trim();
      };
      if (normativo(beforeText) !== normativo(afterText)) {
        return {
          decision: "ask",
          reason:
            "Emenda em Spec aprovada — registre o que mudou e por quê em ## Emendas.",
        };
      }
    }
  }

  // --- Regra 2: implementação antes da aprovação -----------------------------
  if (HARNESS_FILES.has(rel) || HARNESS_PREFIXES.some((p) => rel.startsWith(p))) {
    return { decision: "allow" };
  }

  let specRef = null;
  try {
    const state = JSON.parse(
      readFileSync(path.join(root, ".specify/state.json"), "utf8"),
    );
    const spec = state?.ativo?.spec;
    if (typeof spec === "string") {
      const ref = spec.trim().replace(/\\/g, "/").replace(/\/+$/, "");
      if (ref.startsWith("specs/") && !ref.split("/").includes("..")) {
        specRef = ref;
      }
    }
  } catch {
    specRef = null;
  }
  if (!specRef) return { decision: "allow" };

  const specDir = path.resolve(root, specRef);
  let specStatus;
  try {
    specStatus = readFileSync(path.join(specDir, "spec.md"), "utf8").match(
      /\*\*Status:\*\*\s*(\S+)/,
    )?.[1];
  } catch {
    return { decision: "allow" };
  }
  if (specStatus !== "review") return { decision: "allow" };

  let tasks = "";
  try {
    tasks = readFileSync(path.join(specDir, "tasks.md"), "utf8");
  } catch {
    tasks = "";
  }

  const declared = new Set();
  for (const [, line] of tasks.matchAll(
    /^\s*(?:[-*]\s*)?\*{0,2}Arquivos:\*{0,2}[ \t]*(.+)$/gm,
  )) {
    const ticked = [...line.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
    const items = ticked.length ? ticked : line.replace(/←.*$/, "").split(",");
    for (const raw of items) {
      const p = raw.trim().replace(/\s*\(.*\)$/, "");
      if (p && !p.startsWith("<") && p !== "—" && p !== "-") declared.add(toRel(p));
    }
  }

  if (declared.size > 0 && !declared.has(rel)) return { decision: "allow" };

  return {
    decision: "block",
    message:
      `[guardrail] Spec ativa "${specRef}" está em Status: review — ainda não ` +
      `foi aprovada por um humano.\n\n` +
      (declared.size > 0
        ? `"${rel}" está declarado no campo Arquivos: dessa Spec. `
        : `Essa Spec não declara Arquivos:, então todo código fica bloqueado. `) +
      `Implementação não começa antes da aprovação: peça ao humano para ` +
      `revisar e rodar /jarvis-implement ${specRef} (ele pede a aprovação).\n`,
  };
}
