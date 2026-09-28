import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const packsRoot = path.join(root, ".claude", "packs");

test("todos os packs distribuídos respeitam o contrato", () => {
  const dirs = readdirSync(packsRoot).filter((name) => statSync(path.join(packsRoot, name)).isDirectory());
  assert.ok(dirs.length > 0);

  for (const id of dirs) {
    const dir = path.join(packsRoot, id);
    const manifest = JSON.parse(readFileSync(path.join(dir, "pack.json"), "utf8"));
    assert.equal(manifest.id, id);
    assert.match(manifest.name, /\S/);
    assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
    assert.match(manifest.description, /\S/);
    assert.ok(Array.isArray(manifest.appliesTo));
    assert.ok(manifest.appliesTo.length > 0);
    assert.ok(readFileSync(path.join(dir, "README.md"), "utf8").includes(`# Pack \`${id}\``));
  }
});
