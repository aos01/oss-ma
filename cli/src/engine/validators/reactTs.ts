// cli/src/engine/validators/reactTs.ts

import path from "node:path";
import fs from "fs-extra";
import type { CheckIssue } from "./standard.js";

async function readJson(p: string) {
  const raw = await fs.readFile(p, "utf8");
  return JSON.parse(raw);
}

/**
 * Detects GitHub Actions steps pinned by tag instead of SHA.
 * Pattern: uses: owner/repo@v1.2.3 (tag) instead of uses: owner/repo@<sha> (40 hex chars)
 */
function detectUnpinnedActions(content: string): string[] {
  const unpinned: string[] = [];
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    // Match: uses: owner/repo@<ref> where ref is NOT a 40-char hex SHA
    const m = line.match(/^\s*-?\s*uses:\s+([^\s@]+)@([^\s#]+)/);
    if (!m) continue;
    const ref = m[2];
    const isSha = /^[0-9a-f]{40}$/.test(ref);
    if (!isSha) {
      unpinned.push(line.trim());
    }
  }
  return unpinned;
}

export async function validateReactTs(projectPath: string): Promise<CheckIssue[]> {
  const issues: CheckIssue[] = [];

  // ── package.json scripts ──────────────────────────────────────────────────
  const pkgPath = path.join(projectPath, "package.json");
  if (!(await fs.pathExists(pkgPath))) {
    issues.push({ code: "MISSING_FILE", message: "Missing package.json", path: "package.json" });
    return issues;
  }

  const pkg = await readJson(pkgPath);
  const scripts = pkg?.scripts ?? {};

  const requiredScripts = ["lint", "format", "test", "build", "typecheck"];
  for (const s of requiredScripts) {
    if (!scripts[s]) {
      issues.push({
        code: "MISSING_SCRIPT",
        message: `Missing npm script: "${s}"`,
        path: "package.json",
        hint: `Add it under scripts: "${s}": "..."`
      });
    }
  }

  // ── Security files ────────────────────────────────────────────────────────
  const secureFiles = [
    ".github/dependabot.yml",
    ".github/workflows/codeql.yml",
    "SECURITY.md"
  ];

  for (const f of secureFiles) {
    const p = path.join(projectPath, f);
    if (!(await fs.pathExists(p))) {
      issues.push({
        code: "MISSING_SECURE_FILE",
        message: `Missing security file: ${f}`,
        path: f
      });
    }
  }

  // ── ci.yml: must contain npm audit ────────────────────────────────────────
  const ciPath = path.join(projectPath, ".github/workflows/ci.yml");
  if (await fs.pathExists(ciPath)) {
    const ciContent = await fs.readFile(ciPath, "utf8");

    if (!ciContent.includes("npm audit")) {
      issues.push({
        code: "MISSING_AUDIT_STEP",
        message: 'ci.yml does not run "npm audit"',
        path: ".github/workflows/ci.yml",
        hint: 'Add a step: run: npm audit --audit-level=high'
      });
    }

    // ── ci.yml: all actions must be pinned by SHA ─────────────────────────
    const unpinned = detectUnpinnedActions(ciContent);
    for (const line of unpinned) {
      issues.push({
        code: "UNPINNED_ACTION",
        message: `GitHub Action not pinned by SHA: ${line}`,
        path: ".github/workflows/ci.yml",
        hint: "Pin actions by full 40-char commit SHA, e.g. actions/checkout@<sha>"
      });
    }
  }

  // ── codeql.yml: must use security-extended queries ───────────────────────
  const codeqlPath = path.join(projectPath, ".github/workflows/codeql.yml");
  if (await fs.pathExists(codeqlPath)) {
    const codeqlContent = await fs.readFile(codeqlPath, "utf8");

    if (!codeqlContent.includes("security-extended")) {
      issues.push({
        code: "CODEQL_WEAK_QUERIES",
        message: 'codeql.yml does not use "security-extended" queries',
        path: ".github/workflows/codeql.yml",
        hint: 'Add: queries: security-extended under the init step'
      });
    }

    // ── codeql.yml: must have a schedule ────────────────────────────────
    if (!codeqlContent.includes("schedule")) {
      issues.push({
        code: "CODEQL_NO_SCHEDULE",
        message: "codeql.yml has no scheduled scan",
        path: ".github/workflows/codeql.yml",
        hint: "Add a weekly cron schedule to catch new CVEs without a PR trigger"
      });
    }
  }

  return issues;
}