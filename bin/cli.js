#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const args = process.argv.slice(2);
const has = (...f) => f.some((x) => args.includes(x));
const upgrade = has("--upgrade", "-u");
const force = has("--force", "-f");
const yes = has("--yes", "-y");
const check = has("--check");
const migrate = has("--migrate");

const HARNESS_WARNING =
  "--upgrade substitui edicoes locais no harness: .claude/{agents,hooks,skills}, .specify/{templates,packs,workflows}, .claude/CLAUDE.md e .claude/README.md.";

const HELP = `
specnico

Instala o fluxo spec-driven para Claude Code: harness (.claude/), templates,
packs e workflows (.specify/) e os dados de contexto (.specify/memory/, specs/)
no diretorio atual.

Uso:
  npx specnico                   instala; nunca sobrescreve
  npx specnico --upgrade         atualiza o harness; em .specify/memory/ e specs/
                                 so cria o que faltar
  npx specnico --force           sobrescreve tudo, inclusive .specify/memory/ e specs/
  npx specnico --check           diagnostica versao e drift local
  npx specnico@latest --migrate  converte um projeto 1.x (@robertourias/scaffold-ia)

${HARNESS_WARNING}

Opcoes:
  --upgrade, -u  Atualiza o harness preservando .specify/memory/, specs/ e settings.json
  --force,   -f  Sobrescreve tudo (pede confirmacao se o contexto ja foi preenchido)
  --yes,     -y  Confirma o --force ou o --migrate sem perguntar
  --check        Mostra se o harness instalado esta atualizado (somente leitura)
  --migrate      Converte um projeto 1.x para o layout 2.0 (docs/ -> .specify/memory/
                 e specs/legacy/); mostra o plano e pede confirmacao; idempotente
  --help,    -h  Mostra esta ajuda
`;

const pkgRoot = path.join(__dirname, "..");
const cwd = process.cwd();
const version = require(path.join(pkgRoot, "package.json")).version;

// Espelha o "files" do package.json.
const HARNESS = [
  ".claude/agents",
  ".claude/hooks",
  ".claude/skills",
  ".claude/CLAUDE.md",
  ".claude/README.md",
  ".claude/settings.example.json",
  ".specify/templates",
  ".specify/packs",
  ".specify/workflows",
];
const DATA = [
  ".specify/memory",
  "specs/README.md",
];
const VERSION_FILE = ".specify/.specnico-version";
const LEGACY_VERSION_FILE = ".claude/.scaffold-version";

// Projeto com codigo (manifesto de linguagem ou src/ / app/): o proximo passo
// e o /specnico-onboard, que le o que existe; vazio, o /specnico-constitution.
const CODE_MARKERS = [
  "package.json",
  "pyproject.toml",
  "requirements.txt",
  "go.mod",
  "Cargo.toml",
  "pom.xml",
  "build.gradle",
  "composer.json",
  "Gemfile",
  "deno.json",
  "src",
  "app",
];
function hasExistingCode(dir) {
  if (CODE_MARKERS.some((m) => fs.existsSync(path.join(dir, m)))) return true;
  try {
    return fs.readdirSync(dir).some((f) => f.endsWith(".csproj"));
  } catch {
    return false;
  }
}

// Instalacao 1.x: marcador legado presente e nenhum .specify/.
function isLegacyInstall(dir) {
  return (
    fs.existsSync(path.join(dir, LEGACY_VERSION_FILE)) &&
    !fs.existsSync(path.join(dir, ".specify"))
  );
}

const stats = { created: 0, overwritten: 0, skipped: 0, harnessSkipped: 0, harnessOverwritten: 0 };
const createdData = []; // arquivos de dado criados nesta execucao (posix, relativos ao cwd)

// Binario = .png (por extensao) ou conteudo com byte NUL. Para tudo o mais
// (texto), compara depois de normalizar CRLF -> LF: um arquivo instalado com
// line endings diferentes do pacote (git core.autocrlf, edicao no Windows)
// nao deve contar como alterado de verdade nem ser sobrescrito/bloqueado so
// por isso.
function isBinaryPath(p) {
  return p.toLowerCase().endsWith(".png");
}

function filesEqual(a, b) {
  let bufA, bufB;
  try {
    bufA = fs.readFileSync(a);
    bufB = fs.readFileSync(b);
  } catch {
    return false;
  }
  if (isBinaryPath(a) || isBinaryPath(b) || bufA.includes(0) || bufB.includes(0)) {
    return bufA.equals(bufB);
  }
  const normalize = (buf) => buf.toString("utf8").replace(/\r\n/g, "\n");
  return normalize(bufA) === normalize(bufB);
}

function copyRecursive(src, dest, overwrite, kind) {
  if (fs.statSync(src).isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name), overwrite, kind);
    }
    return;
  }
  const existed = fs.existsSync(dest);
  if (existed && !overwrite) {
    stats.skipped++;
    if (kind === "harness") stats.harnessSkipped++;
    console.log(`  skip       ${path.relative(cwd, dest)} (ja existe)`);
    return;
  }
  if (existed && overwrite && filesEqual(src, dest)) {
    // conteudo identico ao do pacote: nada a fazer, nao conta como alteracao real.
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  if (existed) {
    stats.overwritten++;
    if (kind === "harness") stats.harnessOverwritten++;
    console.log(`  overwrite  ${path.relative(cwd, dest)}`);
  } else {
    stats.created++;
    if (kind === "data") createdData.push(toPosix(path.relative(cwd, dest)));
    console.log(`  create     ${path.relative(cwd, dest)}`);
  }
}

function listFiles(dir) {
  if (!fs.statSync(dir).isDirectory()) return [dir];
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) {
      out.push(...listFiles(p));
    } else {
      out.push(p);
    }
  }
  return out;
}

// "Preenchido" = qualquer arquivo que ja existe no destino, dentro de DATA,
// com conteudo diferente do arquivo-fonte do pacote (nao apenas product.md).
function countFilledData() {
  let count = 0;
  for (const rel of DATA) {
    const src = path.join(pkgRoot, rel);
    if (!fs.existsSync(src)) continue;
    for (const srcFile of listFiles(src)) {
      const destFile = path.join(cwd, path.relative(pkgRoot, srcFile));
      if (fs.existsSync(destFile) && !filesEqual(srcFile, destFile)) count++;
    }
  }
  return count;
}

function confirm(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(/^(s|sim|y|yes)$/i.test(answer.trim()));
    });
  });
}

function readFileOrNull(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
}

function harnessDrift() {
  let drift = 0;
  for (const rel of HARNESS) {
    const src = path.join(pkgRoot, rel);
    if (!fs.existsSync(src)) continue;
    for (const srcFile of listFiles(src)) {
      const destFile = path.join(cwd, path.relative(pkgRoot, srcFile));
      if (!fs.existsSync(destFile) || !filesEqual(srcFile, destFile)) drift++;
    }
  }
  return drift;
}

function hasSpecKit() {
  return fs.existsSync(path.join(cwd, ".specify/init-options.json"));
}

// templatesKept: o modo atual nao sobrescreve o harness (instalacao simples ou
// --check), entao templates do Spec Kit em .specify/templates/ ficam no lugar.
function warnSpecKit(templatesKept) {
  if (!hasSpecKit()) return;
  console.log(
    "Aviso: instalacao do Spec Kit detectada: os dois usam `.specify/memory/constitution.md`.",
  );
  if (templatesKept) {
    console.log(
      "Aviso: os templates do Spec Kit em .specify/templates/ nao sao sobrescritos e prevalecem; as skills specnico-* precisam dos templates do specnico.",
    );
  }
}

function checkInstallation() {
  if (isLegacyInstall(cwd)) {
    console.log("Instalacao 1.x detectada (.claude/.scaffold-version).");
    console.log("Migre para o layout 2.0: npx specnico@latest --migrate");
    process.exitCode = 1;
    return;
  }
  warnSpecKit(true);
  const installed = readFileOrNull(path.join(cwd, VERSION_FILE));
  if (!installed) {
    console.error("Nenhuma instalacao registrada: .specify/.specnico-version nao existe.");
    process.exit(1);
  }
  const installedVersion = installed.trim();
  const drift = harnessDrift();
  console.log(`specnico instalado: ${installedVersion}`);
  console.log(`specnico disponivel: ${version}`);
  console.log(`Drift no harness: ${drift} arquivo(s)`);
  if (installedVersion !== version || drift > 0) {
    console.log("Atualizacao recomendada: npx specnico@latest --upgrade");
    process.exitCode = 1;
  } else {
    console.log("Harness atualizado e sem drift local.");
  }
}

function installFiles(overwriteHarness, overwriteData) {
  for (const rel of HARNESS) {
    const src = path.join(pkgRoot, rel);
    if (fs.existsSync(src)) copyRecursive(src, path.join(cwd, rel), overwriteHarness, "harness");
  }
  for (const rel of DATA) {
    const src = path.join(pkgRoot, rel);
    if (fs.existsSync(src)) copyRecursive(src, path.join(cwd, rel), overwriteData, "data");
  }
}

async function runMigrate() {
  const hasLegacy = fs.existsSync(path.join(cwd, LEGACY_VERSION_FILE));
  const has2 = fs.existsSync(path.join(cwd, VERSION_FILE));
  if (has2) {
    console.log("Projeto ja esta no layout 2.0 (.specify/.specnico-version): nada a migrar.");
    return;
  }
  if (!hasLegacy) {
    console.error(
      "Nenhuma instalacao 1.x encontrada (.claude/.scaffold-version nao existe). Para instalar do zero: npx specnico",
    );
    process.exit(1);
  }
  const blocking = findBlockingSpecs(cwd);
  if (blocking.length) {
    console.error("Migracao recusada: Spec(s) 1.x em approved com criterio [ ] aberto. Termine-as na 1.x antes:");
    for (const rel of blocking) console.error(`  ${rel}`);
    process.exit(1);
  }
  warnSpecKit(false);
  const useGit = detectGit(cwd);
  const ops = planMigration(cwd);
  console.log(`specnico ${version}: migracao 1.x -> 2.0 em ${cwd}\n`);
  console.log(`Plano (${ops.length} operacao(oes)):`);
  for (const op of ops) console.log(formatOp(op));
  console.log("  + harness 2.0 (.claude/, .specify/{templates,packs,workflows}) e .specify/.specnico-version");
  console.log(`  remove ${LEGACY_VERSION_FILE} (por ultimo, depois de gravar a versao 2.0)\n`);
  const conflicts = ops.filter((op) => op.wanted);
  for (const op of conflicts) {
    console.log(`conflito: ${op.wanted} gravado como ${op.to} — revise e funda manualmente.`);
  }
  const leftovers = legacyLeftovers(cwd);
  if (leftovers.length) {
    console.log("Mantidos (nao vieram do harness 1.x; podem citar docs/ ou comandos antigos — revise):");
    for (const rel of leftovers) console.log(`  ${rel}`);
  }
  if (!useGit) {
    console.log(
      "Sem git: faca backup do projeto antes de confirmar — arquivos do harness 1.x (inclusive editados) serao removidos ou sobrescritos.",
    );
  }
  if (conflicts.length || leftovers.length || !useGit) console.log("");
  if (!yes) {
    if (!process.stdin.isTTY) {
      console.error("Ambiente nao interativo: use --migrate --yes para confirmar a migracao.");
      process.exit(1);
    }
    if (!(await confirm("Aplicar a migracao? (s/N) "))) {
      console.log("Cancelado. Nada foi alterado.");
      process.exit(1);
    }
  }
  try {
    applyMigration(cwd, ops, useGit);
    installFiles(true, false);
    fs.writeFileSync(path.join(cwd, VERSION_FILE), `${version}\n`);
    if (useGit) gitAddPaths(cwd, [...createdData, VERSION_FILE]);
    // Marcador 1.x sai por ultimo: ate aqui um rerun ainda reconhece o projeto.
    if (useGit) gitIn(cwd, "rm", "-q", "-f", "--ignore-unmatch", "--", LEGACY_VERSION_FILE);
    fs.rmSync(path.join(cwd, LEGACY_VERSION_FILE), { force: true });
  } catch (err) {
    console.error(
      `\nMigracao interrompida: ${err && err.message ? err.message : err}\nNada foi perdido — rode npx specnico@latest --migrate --yes de novo.`,
    );
    process.exit(1);
  }
  console.log(
    `\nMigracao concluida (${useGit ? "git mv/git rm" : "sistema de arquivos"}). ${stats.created} criado(s), ${stats.overwritten} sobrescrito(s).`,
  );
  console.log("Proximos passos: revise o diff (git status), faca o commit dos caminhos migrados e rode");
  console.log("/specnico-constitution: ele detecta a migracao, reconstroi a constituicao e converte o backlog legado.");
}

async function main() {
  if (has("--help", "-h")) {
    console.log(HELP);
    return;
  }
  if (check && (upgrade || force) && !migrate) {
    console.error("--check e somente leitura; nao combine com --force/--upgrade.");
    process.exit(1);
  }
  if (upgrade && force) {
    console.error("Use --upgrade ou --force, nao os dois.");
    process.exit(1);
  }
  if (migrate) {
    if (upgrade || force || check) {
      console.error("--migrate nao se combina com --upgrade, --force ou --check.");
      process.exit(1);
    }
    await runMigrate();
    return;
  }
  if (!check && isLegacyInstall(cwd)) {
    console.error(
      "Instalacao 1.x detectada (.claude/.scaffold-version). Instalar, --upgrade e --force nao se aplicam:\nuse npx specnico@latest --migrate para converter o projeto para o layout 2.0.",
    );
    process.exit(1);
  }
  if (!check) warnSpecKit(!(upgrade || force));
  if (check) {
    checkInstallation();
    return;
  }
  if (force && !yes) {
    const filledCount = countFilledData();
    if (filledCount > 0) {
      const msg = `--force vai sobrescrever .specify/memory/ e specs/: ${filledCount} arquivo(s) com conteudo diferente do padrao do specnico seriam sobrescritos (incluindo .specify/memory/).`;
      if (!process.stdin.isTTY) {
        console.error(`${msg}\nAmbiente nao interativo: use --yes para confirmar, ou --upgrade para atualizar so o harness.`);
        process.exit(1);
      }
      if (!(await confirm(`${msg}\nContinuar? (s/N) `))) {
        console.log("Cancelado. Para atualizar so o harness use --upgrade.");
        process.exit(1);
      }
    }
  }

  const previous = readFileOrNull(path.join(cwd, VERSION_FILE));
  const exampleBefore = readFileOrNull(path.join(cwd, ".claude/settings.example.json"));

  console.log(`specnico ${version} -> ${cwd}\n`);

  installFiles(upgrade || force, force);

  // So grava a versao instalada em: instalacao nova (sem versao previa e sem
  // nenhum arquivo de harness ignorado), --upgrade ou --force. Uma reinstalacao
  // simples sobre um harness ja existente (arquivos ignorados) nao deve marcar
  // um harness desatualizado como se fosse a versao atual do pacote.
  const shouldWriteVersion = upgrade || force || (previous === null && stats.harnessSkipped === 0);
  if (shouldWriteVersion) {
    fs.mkdirSync(path.join(cwd, ".specify"), { recursive: true });
    fs.writeFileSync(path.join(cwd, VERSION_FILE), `${version}\n`);
  }

  console.log(
    `\n${stats.created} criado(s), ${stats.overwritten} sobrescrito(s), ${stats.skipped} ignorado(s).`,
  );
  // So na primeira instalacao: reinstalar sobre um harness existente ja
  // orienta --upgrade logo abaixo.
  if (!upgrade && !force && stats.skipped === 0) {
    console.log(
      hasExistingCode(cwd)
        ? "Próximo: /specnico-onboard (projeto existente: lê o código e preenche a memória)"
        : "Próximo: /specnico-constitution (projeto novo: entrevista e memória)",
    );
  }

  if (upgrade) {
    console.log(`Harness atualizado de ${previous ? previous.trim() : "(versao desconhecida)"} para ${version}.`);
    if (stats.harnessOverwritten > 0) {
      console.log(HARNESS_WARNING);
    }
    const exampleAfter = readFileOrNull(path.join(cwd, ".claude/settings.example.json"));
    if (exampleBefore !== null && exampleBefore !== exampleAfter) {
      console.log(
        "`.claude/settings.example.json` mudou: revise e faca o merge manual no seu `.claude/settings.json` (ele nao foi alterado).",
      );
    }
  } else if (stats.skipped > 0 && !force) {
    if (hasSpecKit()) {
      // --upgrade sobrescreveria os templates do Spec Kit em .specify/templates/.
      console.log(
        "Arquivos existentes foram mantidos (Spec Kit no mesmo .specify/): revise manualmente os templates e a constituicao antes de usar as skills specnico-*.",
      );
    } else {
      console.log("Para atualizar o harness de uma instalacao anterior use --upgrade.");
    }
  }
}

// ---------------------------------------------------------------------------
// Migracao 1.x (@robertourias/scaffold-ia) -> 2.0
//
// Regra de ouro: nenhum texto do usuario some. Todo arquivo de docs/ ganha um
// destino (move ou concat); remove so atinge arquivos que o harness 1.x
// publicou (lista abaixo) e o marcador de versao legado.

// O /specnico-constitution detecta o modo migracao por estes dois textos
// (meta/tests/skills.test.mjs fixa o contrato).
const MIGRATION_MARKER = "<!-- migrado da 1.x: revise com /specnico-constitution -->";
const LEGACY_BACKLOG_SECTION = "## Legado (1.x)";

// Arquivos do harness 1.x (todas as releases 1.x) que deixam de existir na 2.0.
// Arquivos que o usuario acrescentou nessas pastas ficam onde estao.
const LEGACY_HARNESS_FILES = [
  ...[
    "back", "backlog", "checkpoint", "front", "groom", "hands-on", "init-app",
    "init-package", "init-project", "pr-merged", "pr-open", "recheck", "retomar",
    "review", "spec",
  ].map((c) => `.claude/commands/${c}.md`),
  ".claude/context-index.md",
  ".claude/skills/approve/SKILL.md",
  ".claude/templates/ci/verify.yml",
  ".claude/templates/spec-template.md",
  ...[
    "context-resolution", "feature-delivery", "git-flow", "playbook-tokens-qualidade",
    "release-process",
  ].map((w) => `.claude/workflows/${w}.md`),
  ".claude/packs/README.md",
  ...["nestjs", "nextjs", "turborepo", "typescript"].flatMap((p) => [
    `.claude/packs/${p}/pack.json`,
    `.claude/packs/${p}/README.md`,
  ]),
];
const LEGACY_HARNESS_DIRS = [
  ".claude/commands",
  ".claude/templates",
  ".claude/workflows",
  ".claude/packs",
  ".claude/skills/approve",
  "docs",
];

const toPosix = (p) => p.split(path.sep).join("/");

// Arquivos (caminhos posix relativos a dir) sob rel, ordenados.
function walkRel(dir, rel) {
  const abs = path.join(dir, rel);
  if (!fs.existsSync(abs)) return [];
  if (!fs.statSync(abs).isDirectory()) return [rel];
  const out = [];
  for (const name of fs.readdirSync(abs).sort()) {
    out.push(...walkRel(dir, `${rel}/${name}`));
  }
  return out;
}

// Specs 1.x em docs/**/specs/*.md com Status approved e algum criterio "- [ ]".
function findBlockingSpecs(dir) {
  const status = /^[\s>*_-]*Status[*_]*\s*:\s*[*_]*\s*`?approved\b/im;
  const open = /^\s*[-*]\s+\[ \]/m;
  return walkRel(dir, "docs").filter((rel) => {
    const parts = rel.split("/");
    if (parts.length < 3 || parts[parts.length - 2] !== "specs" || !rel.endsWith(".md")) return false;
    const text = fs.readFileSync(path.join(dir, rel), "utf8");
    return status.test(text) && open.test(text);
  });
}

function planMigration(dir) {
  const exists = (rel) => fs.existsSync(path.join(dir, rel));
  // Comparacoes sem caixa: em Windows/macOS docs/Context/x.md e docs/context/x.md
  // sao o mesmo arquivo. A fonte de verdade dos caminhos e a saida do walkRel.
  const lc = (rel) => rel.toLowerCase();
  const docsFiles = walkRel(dir, "docs");
  const byLower = new Map();
  for (const f of docsFiles) if (!byLower.has(lc(f))) byLower.set(lc(f), f);
  const real = (rel) => byLower.get(lc(rel));
  const under = (prefix) => docsFiles.filter((f) => lc(f).startsWith(lc(prefix) + "/"));
  const taken = new Set();
  const handled = new Set();
  // Destino unico; se colidir (planejado ou ja existente), ganha sufixo -N e
  // o op guarda o destino pretendido em "wanted" para o aviso de conflito.
  const target = (rel) => {
    const ext = path.posix.extname(rel);
    const base = rel.slice(0, rel.length - ext.length);
    let cand = rel;
    for (let n = 2; taken.has(lc(cand)) || exists(cand); n++) cand = `${base}-${n}${ext}`;
    taken.add(lc(cand));
    return cand === rel ? { to: cand } : { to: cand, wanted: rel };
  };
  const moves = [];
  const concats = [];
  const legacy = [];
  const removes = [];
  const writes = [];
  const move = (bucket, from, to) => {
    handled.add(lc(from));
    bucket.push({ op: "move", from, ...target(to) });
  };
  const concat = (bucket, from, to, extra = {}) => {
    if (!from.length) return;
    for (const f of from) handled.add(lc(f));
    bucket.push({ op: "concat", from, ...target(to), ...extra });
  };

  const C = "docs/context";
  const M = ".specify/memory";
  const L = "specs/legacy";
  const isMd = (rel) => lc(rel).endsWith(".md");
  const present = (...rels) => rels.map(real).filter(Boolean);
  const tail = (f, prefix) => f.slice(prefix.length + 1);

  // Memoria: arquivos 1:1.
  for (const name of ["product.md", "decisions.md"]) {
    for (const f of present(`${C}/${name}`)) move(moves, f, `${M}/${name}`);
  }
  for (const f of under(`${C}/domains`)) move(moves, f, `${M}/domains/${tail(f, `${C}/domains`)}`);

  // conventions + ui-guidelines (secao ## UI).
  const conv = present(`${C}/conventions.md`);
  const ui = present(`${C}/ui-guidelines.md`);
  if (conv.length && !ui.length) move(moves, conv[0], `${M}/conventions.md`);
  else concat(concats, [...conv, ...ui], `${M}/conventions.md`, { headings: [...conv.map(() => null), "## UI"] });

  // constitution + guardrails.
  concat(concats, present(`${C}/constitution.md`, `${C}/guardrails.md`), `${M}/constitution.md`, {
    header: MIGRATION_MARKER,
  });

  // architecture/**/*.md (overview primeiro).
  const isOverview = (f) => lc(f).endsWith("/overview.md");
  const arch = under("docs/architecture")
    .filter(isMd)
    .sort((x, y) => (isOverview(x) ? -1 : isOverview(y) ? 1 : x < y ? -1 : 1));
  concat(concats, arch, `${M}/architecture.md`);

  // apps/packages: contexto local -> projects/<kind>-<x>.md; backlogs -> backlog
  // global; specs/archive/features/changelog -> specs/legacy/<kind>-<x>/.
  const backlogs = present(`${C}/product-backlog.md`);
  const projects = new Map();
  for (const kind of ["apps", "packages"]) {
    for (const f of under(`docs/${kind}`)) {
      const parts = f.split("/");
      if (parts.length < 4) continue; // arquivo solto em docs/apps/: vai pelo catch-all
      const x = parts[2];
      const key = lc(`${kind}-${x}`);
      if (!projects.has(key)) {
        projects.set(key, { kind, x, root: parts.slice(0, 3).join("/"), local: [] });
      }
      const proj = projects.get(key);
      const sub = parts.slice(3).join("/");
      const first = lc(parts[3]);
      const rest = parts.slice(4);
      const base = lc(parts[parts.length - 1]);
      if (["specs", "archive"].includes(first) && rest.length) {
        move(legacy, f, `${L}/${kind}-${x}/${rest.join("/")}`);
      } else if (["features", "changelog"].includes(first) && rest.length) {
        move(legacy, f, `${L}/${kind}-${x}/${sub}`);
      } else if (base === "backlog.md" || base === "product-backlog.md") {
        backlogs.push(f);
      } else if (isMd(f)) {
        proj.local.push(f);
      }
    }
  }
  for (const { kind, x, root, local } of projects.values()) {
    concat(concats, local, `${M}/projects/${kind}-${x}.md`, {
      header: `<!-- migrado da 1.x: contexto local de ${root}/ -->`,
    });
  }
  concat(concats, backlogs, `${M}/product-backlog.md`, {
    header:
      `# Product Backlog\n\n<!-- migrado da 1.x: /specnico-constitution converte para o formato 2.0 -->\n\n${LEGACY_BACKLOG_SECTION}`,
  });

  // Historico -> specs/legacy/ (fora da numeracao).
  for (const f of under("docs/specs")) move(legacy, f, `${L}/${tail(f, "docs/specs")}`);
  for (const f of under("docs/archive")) move(legacy, f, `${L}/${tail(f, "docs/archive")}`);
  for (const sub of ["features", "changelog"]) {
    for (const f of under(`docs/${sub}`)) move(legacy, f, `${L}/${sub}/${tail(f, `docs/${sub}`)}`);
  }
  concat(legacy, present(`${C}/current-state.md`), `${L}/current-state-1x.md`, {
    header: "<!-- migrado da 1.x: o estado ativo agora vive em .specify/state.json -->",
  });
  // Qualquer outro arquivo de docs/ (notas soltas, imagens): preservado como esta.
  for (const f of docsFiles) {
    if (!handled.has(lc(f))) move(legacy, f, `${L}/${f}`);
  }

  // Harness 1.x. O marcador .claude/.scaffold-version NAO entra aqui: o CLI so
  // o remove depois de gravar .specify/.specnico-version (migracao retomavel).
  for (const rel of LEGACY_HARNESS_FILES) if (exists(rel)) removes.push({ op: "remove", from: rel });

  if (!exists(".specify/state.json")) {
    const state = { versao: 1, ativo: null, atualizado: new Date().toISOString() };
    writes.push({ op: "write", ...target(".specify/state.json"), content: `${JSON.stringify(state, null, 2)}\n` });
  }

  return [...moves, ...concats, ...legacy, ...removes, ...writes];
}

// Arquivos deixados nas pastas do harness 1.x que nao vieram do pacote 1.x.
function legacyLeftovers(dir) {
  const known = new Set(LEGACY_HARNESS_FILES.map((f) => f.toLowerCase()));
  return LEGACY_HARNESS_DIRS.filter((d) => d !== "docs")
    .flatMap((d) => walkRel(dir, d))
    .filter((f) => !known.has(f.toLowerCase()));
}

function formatOp(op) {
  if (op.op === "move") return `  move ${op.from} -> ${op.to}`;
  if (op.op === "concat") return `  concat [${op.from.join(", ")}] -> ${op.to}`;
  if (op.op === "remove") return `  remove ${op.from}`;
  return `  write ${op.to}`;
}

function concatContent(dir, op) {
  const parts = [];
  if (op.header) parts.push(`${op.header}\n`);
  op.from.forEach((rel, i) => {
    let text = fs.readFileSync(path.join(dir, rel), "utf8").replace(/^﻿/, "");
    if (!text.endsWith("\n")) text += "\n";
    const heading = op.headings && op.headings[i];
    parts.push(`<!-- origem 1.x: ${rel} -->\n${heading ? `${heading}\n\n` : ""}${text}`);
  });
  return parts.join("\n");
}

function pruneEmptyDirs(abs) {
  if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) return;
  for (const name of fs.readdirSync(abs)) pruneEmptyDirs(path.join(abs, name));
  if (fs.readdirSync(abs).length === 0) fs.rmdirSync(abs);
}

function detectGit(dir) {
  const r = require("child_process").spawnSync("git", ["rev-parse", "--is-inside-work-tree"], {
    cwd: dir,
    encoding: "utf8",
  });
  return r.status === 0 && String(r.stdout).trim() === "true";
}

// Caminhos sempre como argumentos (sem shell); pathspec literal: nada de glob/magic.
function gitIn(dir, ...a) {
  return require("child_process").spawnSync("git", a, {
    cwd: dir,
    encoding: "utf8",
    env: { ...process.env, GIT_LITERAL_PATHSPECS: "1" },
  });
}

// Stage explicito de destinos novos: sem isso as delecoes staged pelo git rm
// iriam sozinhas num `git commit` e o texto migrado ficaria fora do historico.
function gitAddPaths(dir, rels) {
  for (const rel of rels) gitIn(dir, "add", "--", rel);
}

function applyMigration(dir, ops, useGit) {
  const abs = (rel) => path.join(dir, rel);
  const git = (...a) => gitIn(dir, ...a);
  const tracked = (rel) => useGit && git("ls-files", "--error-unmatch", "--", rel).status === 0;
  const removePath = (rel) => {
    if (useGit) git("rm", "-q", "-f", "--ignore-unmatch", "--", rel);
    fs.rmSync(abs(rel), { force: true, recursive: true });
  };
  const ensureParent = (rel) => fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });

  for (const op of ops) {
    if (op.op === "move") {
      ensureParent(op.to);
      if (tracked(op.from) && git("mv", "--", op.from, op.to).status === 0) continue;
      fs.renameSync(abs(op.from), abs(op.to));
    } else if (op.op === "concat") {
      // Grava o destino antes de apagar qualquer fonte.
      ensureParent(op.to);
      fs.writeFileSync(abs(op.to), concatContent(dir, op));
      if (useGit) gitAddPaths(dir, [op.to]);
      for (const rel of op.from) removePath(rel);
    } else if (op.op === "remove") {
      removePath(op.from);
    } else if (op.op === "write") {
      ensureParent(op.to);
      fs.writeFileSync(abs(op.to), op.content);
      if (useGit) gitAddPaths(dir, [op.to]);
    }
  }
  for (const rel of LEGACY_HARNESS_DIRS) pruneEmptyDirs(abs(rel));
}

module.exports = {
  isLegacyInstall,
  hasExistingCode,
  VERSION_FILE,
  LEGACY_VERSION_FILE,
  HARNESS,
  DATA,
  MIGRATION_MARKER,
  LEGACY_BACKLOG_SECTION,
  planMigration,
  findBlockingSpecs,
  applyMigration,
};

if (require.main === module) main();
