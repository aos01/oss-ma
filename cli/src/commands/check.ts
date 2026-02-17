// cli/src/commands/check.ts

import { Command } from "commander";
import path from "node:path";
import crypto from "node:crypto";
import fs from "fs-extra";
import pc from "picocolors";
import { loadStandardSchema, checkAgainstStandard } from "../engine/validators/standard.js";
import { readTemplateLock } from "../engine/readLock.js";
import { validateReactTs } from "../engine/validators/reactTs.js";
import { validateReactNext } from "../engine/validators/reactNext.js";
import { loadPack } from "../engine/packs/loadPack.js";
import { validatePackRules } from "../engine/packs/validatePackRules.js";
import type { CheckIssue } from "../engine/validators/standard.js";

// ── Integrity helpers ────────────────────────────────────────────────────────

async function hashFile(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath);
  return crypto.createHash("sha256").update(content).digest("hex");
}

async function collectFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...(await collectFiles(full)));
    else if (entry.isFile()) results.push(full);
  }
  return results.sort();
}

async function verifyIntegrity(
  projectPath: string,
  manifest: Record<string, string>
): Promise<CheckIssue[]> {
  const issues: CheckIssue[] = [];
  const abs = path.resolve(projectPath);

  for (const [rel, expectedHash] of Object.entries(manifest)) {
    const filePath = path.join(abs, rel);

    if (!(await fs.pathExists(filePath))) {
      issues.push({
        code: "INTEGRITY_MISSING_FILE",
        message: `File was deleted after generation: ${rel}`,
        path: rel,
        hint: "Restore the file or re-generate the project"
      });
      continue;
    }

    const actualHash = await hashFile(filePath);
    if (actualHash !== expectedHash) {
      issues.push({
        code: "INTEGRITY_MODIFIED_FILE",
        message: `File modified after generation: ${rel}`,
        path: rel,
        hint: "If intentional, re-run init to update template.lock"
      });
    }
  }

  const allFiles = await collectFiles(abs);
  const manifestKeys = new Set(Object.keys(manifest));

  for (const filePath of allFiles) {
    const rel = path.relative(abs, filePath).replace(/\\/g, "/");
    if (rel === "template.lock") continue;
    if (!manifestKeys.has(rel)) {
      issues.push({
        code: "INTEGRITY_ADDED_FILE",
        message: `File added after generation: ${rel}`,
        path: rel,
        hint: "Expected for normal development. Re-run init to update template.lock if needed"
      });
    }
  }

  return issues;
}

// ── Output ───────────────────────────────────────────────────────────────────

function printHuman(
  result: Awaited<ReturnType<typeof checkAgainstStandard>> & {
    schemaVersion: string;
    template?: string;
  }
) {
  const templateLabel = result.template ? pc.gray(` [${result.template}]`) : "";

  if (result.ok) {
    console.log(pc.green(`✅ OK — Standard v${result.schemaVersion}${templateLabel}`));
    console.log(`Project: ${result.projectPath}`);
    return;
  }

  console.log(pc.red(`❌ FAILED — Standard v${result.schemaVersion}${templateLabel}`));
  console.log(`Project: ${result.projectPath}`);
  console.log("");

  for (const issue of result.issues) {
    console.log(
      `${pc.red("•")} ${issue.message}${issue.path ? pc.gray(` (${issue.path})`) : ""}`
    );
    if (issue.hint) console.log(`  ${pc.gray("hint:")} ${issue.hint}`);
  }

  console.log("");
  console.log(pc.yellow(`Total issues: ${result.issues.length}`));
}

// ── Command ──────────────────────────────────────────────────────────────────

export const checkCommand = new Command("check")
  .option("--path <path>", "Project path", ".")
  .option("--json", "JSON output")
  .option("--skip-integrity", "Skip template.lock integrity verification")
  .description("Check a project against the standard")
  .action(async (opts: { path: string; json?: boolean; skipIntegrity?: boolean }) => {
    try {
      // 1) Standard
      const { schema } = await loadStandardSchema();
      const standardResult = await checkAgainstStandard(opts.path, schema);

      // 2) Lock
      const lock = await readTemplateLock(standardResult.projectPath);

      // 3) Integrity
      let integrityIssues: CheckIssue[] = [];
      if (!opts.skipIntegrity && lock?.filesIntegrity) {
        integrityIssues = await verifyIntegrity(standardResult.projectPath, lock.filesIntegrity);
      }

      // 4) Template-specific validation
      let templateIssues: CheckIssue[] = [];
      if (lock?.template === "react-ts") {
        templateIssues = await validateReactTs(standardResult.projectPath);
      } else if (lock?.template === "react-next") {
        templateIssues = await validateReactNext(standardResult.projectPath);
      }

      // 5) Packs
      let packIssues: CheckIssue[] = [];
      if (lock?.packs?.length) {
        for (const packName of lock.packs) {
          const pack = await loadPack(packName);
          const issues = await validatePackRules(pack, standardResult.projectPath);
          const level = pack.spec.enforcement?.level ?? "strict";

          if (level === "advisory") {
            packIssues.push(
              ...issues.map((i: CheckIssue) => ({
                ...i,
                code: `PACK_WARNING:${i.code}`,
                message: `${i.message} (advisory)`
              }))
            );
          } else {
            packIssues.push(...issues);
          }
        }
      }

      // 6) Combine
      const blockingIntegrityIssues = integrityIssues.filter(
        (i) => i.code !== "INTEGRITY_ADDED_FILE"
      );
      const advisoryIntegrityIssues = integrityIssues.filter(
        (i) => i.code === "INTEGRITY_ADDED_FILE"
      );
      const blockingPackIssues = packIssues.filter(
        (i) => !String(i.code).startsWith("PACK_WARNING:")
      );

      const issues = [
        ...standardResult.issues,
        ...blockingIntegrityIssues,
        ...advisoryIntegrityIssues,
        ...templateIssues,
        ...packIssues
      ];

      const ok =
        standardResult.issues.length +
          blockingIntegrityIssues.length +
          templateIssues.length +
          blockingPackIssues.length ===
        0;

      const result = { ...standardResult, issues, ok, template: lock?.template };

      if (opts.json) console.log(JSON.stringify(result, null, 2));
      else printHuman(result);

      process.exit(result.ok ? 0 : 1);
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      if (opts.json) console.log(JSON.stringify({ ok: false, error: msg }, null, 2));
      else console.error(pc.red("❌ Error:"), msg);
      process.exit(2);
    }
  });