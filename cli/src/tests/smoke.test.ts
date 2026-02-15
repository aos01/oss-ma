import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "fs-extra";

import { initProject } from "../engine/initProject.js";
import { loadStandardSchema, checkAgainstStandard } from "../engine/validators/standard.js";
import { readTemplateLock } from "../engine/readLock.js";
import { validateReactTs } from "../engine/validators/reactTs.js";

async function exists(p: string) {
  return fs.pathExists(p);
}

test("smoke: init react-ts then check passes", async () => {
  const tmpRoot = path.join(process.cwd(), ".tmp-tests");
  const appDir = path.join(tmpRoot, "app-ok");

  await fs.remove(tmpRoot);
  await fs.ensureDir(tmpRoot);

  await initProject({
    templateName: "react-ts",
    destDir: appDir,
    noHooks: true,
    yes: true
  });

  // required files quick check
  assert.ok(await exists(path.join(appDir, "README.md")));
  assert.ok(await exists(path.join(appDir, "template.lock")));
  assert.ok(await exists(path.join(appDir, ".github", "workflows", "ci.yml")));

  const { schema } = await loadStandardSchema();
  const standard = await checkAgainstStandard(appDir, schema);
  assert.equal(standard.ok, true, JSON.stringify(standard.issues, null, 2));

  const lock = await readTemplateLock(appDir);
  assert.ok(lock);
  assert.equal(lock!.template, "react-ts");

  const extra = await validateReactTs(appDir);
  assert.equal(extra.length, 0, JSON.stringify(extra, null, 2));
});

test("smoke: check fails when required file is missing", async () => {
  const tmpRoot = path.join(process.cwd(), ".tmp-tests");
  const appDir = path.join(tmpRoot, "app-ko");

  await fs.remove(tmpRoot);
  await fs.ensureDir(tmpRoot);

  await initProject({
    templateName: "react-ts",
    destDir: appDir,
    noHooks: true,
    yes: true
  });

  // break it
  await fs.remove(path.join(appDir, "README.md"));

  const { schema } = await loadStandardSchema();
  const standard = await checkAgainstStandard(appDir, schema);

  assert.equal(standard.ok, false);
  assert.ok(standard.issues.some((i) => i.code === "MISSING_FILE" && i.path === "README.md"));
});