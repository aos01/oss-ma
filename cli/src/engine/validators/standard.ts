// cli/src/engine/validators/standard.ts

import path from "node:path";
import fs from "fs-extra";
import { getResourcesRoot } from "../../utils/path.js";

export type StandardSchema = {
  version: string;
  requiredFiles: string[];
  requiredDirs: string[];
  readmeRequiredHeadings: string[];
  requiredAdrFiles: string[];
  requiredActions?: string[];
};

export type CheckIssue = {
  code: string;
  message: string;
  path?: string;
  hint?: string;
};

export type CheckResult = {
  ok: boolean;
  schemaVersion: string;
  projectPath: string;
  issues: CheckIssue[];
};

async function fileExists(p: string) {
  try {
    const stat = await fs.stat(p);
    return stat.isFile();
  } catch {
    return false;
  }
}

async function dirExists(p: string) {
  try {
    const stat = await fs.stat(p);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

function extractMarkdownHeadings(md: string): string[] {
  // Extract headings like: ## Overview
  const lines = md.split(/\r?\n/);
  const headings: string[] = [];
  for (const line of lines) {
    const m = line.match(/^\s{0,3}#{1,6}\s+(.+?)\s*$/);
    if (m) headings.push(m[1].trim());
  }
  return headings;
}

export async function loadStandardSchema(): Promise<{ schema: StandardSchema; schemaPath: string }> {
  const schemaPath = path.join(getResourcesRoot(), "standard.schema.json");

  if (!(await fs.pathExists(schemaPath))) {
    throw new Error(`standard.schema.json not found in resources: ${schemaPath}`);
  }

  const raw = await fs.readFile(schemaPath, "utf8");
  const schema = JSON.parse(raw) as StandardSchema;

  if (!schema?.version || !Array.isArray(schema.requiredFiles) || !Array.isArray(schema.requiredDirs)) {
    throw new Error(`Invalid standard.schema.json: ${schemaPath}`);
  }

  return { schema, schemaPath };
}

export async function checkAgainstStandard(projectPath: string, schema: StandardSchema): Promise<CheckResult> {
  const issues: CheckIssue[] = [];
  const abs = path.resolve(projectPath);

  // Required files
  for (const rel of schema.requiredFiles ?? []) {
    const p = path.join(abs, rel);
    if (!(await fileExists(p))) {
      issues.push({
        code: "MISSING_FILE",
        message: `Missing required file: ${rel}`,
        path: rel
      });
    }
  }

  // Required dirs
  for (const rel of schema.requiredDirs ?? []) {
    const p = path.join(abs, rel);
    if (!(await dirExists(p))) {
      issues.push({
        code: "MISSING_DIR",
        message: `Missing required directory: ${rel}`,
        path: rel
      });
    }
  }

  // Required ADR files
  for (const rel of schema.requiredAdrFiles ?? []) {
    const p = path.join(abs, rel);
    if (!(await fileExists(p))) {
      issues.push({
        code: "MISSING_ADR",
        message: `Missing ADR file: ${rel}`,
        path: rel
      });
    }
  }

  // README headings
  const readmePath = path.join(abs, "README.md");
  if (await fileExists(readmePath)) {
    const md = await fs.readFile(readmePath, "utf8");
    const headings = extractMarkdownHeadings(md).map((h) => h.toLowerCase());

    for (const required of schema.readmeRequiredHeadings ?? []) {
      const ok = headings.includes(required.toLowerCase());
      if (!ok) {
        issues.push({
          code: "README_MISSING_HEADING",
          message: `README missing heading: "${required}"`,
          path: "README.md",
          hint: `Add a markdown heading like: "## ${required}"`
        });
      }
    }
  } else {
    // (already flagged as missing file, but add a hint)
    issues.push({
      code: "README_UNREADABLE",
      message: "README.md could not be read",
      path: "README.md"
    });
  }

  return {
    ok: issues.length === 0,
    schemaVersion: schema.version,
    projectPath: abs,
    issues
  };
}