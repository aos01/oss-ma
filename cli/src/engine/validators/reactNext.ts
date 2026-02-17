// cli/src/engine/validators/reactNext.ts

import path from "node:path";
import fs from "fs-extra";
import type { CheckIssue } from "./standard.js";

async function readJson(p: string) {
  const raw = await fs.readFile(p, "utf8");
  return JSON.parse(raw);
}

function detectUnpinnedActions(content: string): string[] {
  const unpinned: string[] = [];
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^\s*-?\s*uses:\s+([^\s@]+)@([^\s#]+)/);
    if (!m) continue;
    const ref = m[2];
    if (!/^[0-9a-f]{40}$/.test(ref)) unpinned.push(line.trim());
  }
  return unpinned;
}

export async function validateReactNext(projectPath: string): Promise<CheckIssue[]> {
  const issues: CheckIssue[] = [];

  // ── package.json scripts ──────────────────────────────────────────────────
  const pkgPath = path.join(projectPath, "package.json");
  if (!(await fs.pathExists(pkgPath))) {
    issues.push({ code: "MISSING_FILE", message: "Missing package.json", path: "package.json" });
    return issues;
  }

  const pkg = await readJson(pkgPath);
  const scripts = pkg?.scripts ?? {};
  const deps = { ...pkg?.dependencies, ...pkg?.devDependencies };

  const requiredScripts = ["dev", "build", "lint", "format", "test", "typecheck"];
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

  // ── Next.js required deps ─────────────────────────────────────────────────
  const requiredDeps = ["next", "react", "react-dom"];
  for (const dep of requiredDeps) {
    if (!deps[dep]) {
      issues.push({
        code: "MISSING_DEP",
        message: `Missing required dependency: "${dep}"`,
        path: "package.json",
        hint: `Run: npm install ${dep}`
      });
    }
  }

  // ── App Router structure ──────────────────────────────────────────────────
  const requiredFiles = [
    "src/app/layout.tsx",
    "src/app/page.tsx",
    "src/app/globals.css",
    "next.config.mjs",
    "tsconfig.json",
  ];

  for (const f of requiredFiles) {
    if (!(await fs.pathExists(path.join(projectPath, f)))) {
      issues.push({
        code: "MISSING_FILE",
        message: `Missing required file: ${f}`,
        path: f
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
    if (!(await fs.pathExists(path.join(projectPath, f)))) {
      issues.push({
        code: "MISSING_SECURE_FILE",
        message: `Missing security file: ${f}`,
        path: f
      });
    }
  }

  // ── codeql.yml checks ─────────────────────────────────────────────────────
  const codeqlPath = path.join(projectPath, ".github/workflows/codeql.yml");
  if (await fs.pathExists(codeqlPath)) {
    const codeqlContent = await fs.readFile(codeqlPath, "utf8");

    if (!codeqlContent.includes("security-extended")) {
      issues.push({
        code: "CODEQL_WEAK_QUERIES",
        message: 'codeql.yml does not use "security-extended" queries',
        path: ".github/workflows/codeql.yml",
        hint: "Add: queries: security-extended under the init step"
      });
    }

    if (!codeqlContent.includes("schedule")) {
      issues.push({
        code: "CODEQL_NO_SCHEDULE",
        message: "codeql.yml has no scheduled scan",
        path: ".github/workflows/codeql.yml",
        hint: "Add a weekly cron schedule"
      });
    }

    const unpinned = detectUnpinnedActions(codeqlContent);
    for (const line of unpinned) {
      issues.push({
        code: "UNPINNED_ACTION",
        message: `GitHub Action not pinned by SHA: ${line}`,
        path: ".github/workflows/codeql.yml",
        hint: "Pin actions by full 40-char commit SHA"
      });
    }
  }

  // ── ci.yml checks ─────────────────────────────────────────────────────────
  const ciPath = path.join(projectPath, ".github/workflows/ci.yml");
  if (await fs.pathExists(ciPath)) {
    const ciContent = await fs.readFile(ciPath, "utf8");

    if (!ciContent.includes("npm audit")) {
      issues.push({
        code: "MISSING_AUDIT_STEP",
        message: 'ci.yml does not run "npm audit"',
        path: ".github/workflows/ci.yml",
        hint: "Add a step: run: npm audit --audit-level=high"
      });
    }

    const unpinned = detectUnpinnedActions(ciContent);
    for (const line of unpinned) {
      issues.push({
        code: "UNPINNED_ACTION",
        message: `GitHub Action not pinned by SHA: ${line}`,
        path: ".github/workflows/ci.yml",
        hint: "Pin actions by full 40-char commit SHA"
      });
    }
  }

  // ── TypeScript strict mode ─────────────────────────────────────────────────
  const tsconfigPath = path.join(projectPath, "tsconfig.json");
  if (await fs.pathExists(tsconfigPath)) {
    const tsconfig = await readJson(tsconfigPath);
    if (!tsconfig?.compilerOptions?.strict) {
      issues.push({
        code: "TS_STRICT_DISABLED",
        message: 'tsconfig.json does not have "strict": true',
        path: "tsconfig.json",
        hint: 'Add "strict": true under compilerOptions'
      });
    }
  }

  return issues;
}