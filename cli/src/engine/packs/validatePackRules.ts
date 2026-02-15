import path from "node:path";
import fs from "fs-extra";
import type { LoadedPack } from "./loadPack.js";
import type { CheckIssue } from "../validators/standard.js";

type PackRules = {
  requiredFiles?: string[];
  requiredScripts?: string[];
  forbiddenPatterns?: string[];
};

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

async function collectSourceFiles(dir: string): Promise<string[]> {
  if (!(await fs.pathExists(dir))) return [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out: string[] = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await collectSourceFiles(full)));
    else if (e.isFile()) out.push(full);
  }
  return out;
}

export async function validatePackRules(
  pack: LoadedPack,
  projectDir: string
): Promise<CheckIssue[]> {
  const issues: CheckIssue[] = [];
  if (!pack.rulesDir) return issues;

  const rulesPath = path.join(pack.rulesDir, "rules.json");
  if (!(await fs.pathExists(rulesPath))) return issues;

  const rules = await readJson<PackRules>(rulesPath);

  // 1) requiredFiles
  for (const rel of rules.requiredFiles ?? []) {
    const abs = path.join(projectDir, rel);
    if (!(await fs.pathExists(abs))) {
      issues.push({
        code: "PACK_MISSING_FILE",
        message: `[${pack.spec.name}] Missing required file: ${rel}`,
        path: rel
      });
    }
  }

  // 2) requiredScripts
  if (rules.requiredScripts?.length) {
    const pkgPath = path.join(projectDir, "package.json");
    if (await fs.pathExists(pkgPath)) {
      const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
      const scripts = pkg?.scripts ?? {};
      for (const s of rules.requiredScripts) {
        if (!scripts[s]) {
          issues.push({
            code: "PACK_MISSING_SCRIPT",
            message: `[${pack.spec.name}] Missing required script: "${s}"`,
            path: "package.json"
          });
        }
      }
    } else {
      issues.push({
        code: "PACK_MISSING_PACKAGE_JSON",
        message: `[${pack.spec.name}] package.json is required to validate scripts`,
        path: "package.json"
      });
    }
  }

  // 3) forbiddenPatterns (simple scan in src/**/*.ts(x))
  if (rules.forbiddenPatterns?.length) {
    const srcDir = path.join(projectDir, "src");
    const files = await collectSourceFiles(srcDir);

    for (const f of files) {
      if (!/\.(ts|tsx|js|jsx)$/.test(f)) continue;
      const content = await fs.readFile(f, "utf8");
      for (const pattern of rules.forbiddenPatterns) {
        if (content.includes(pattern)) {
          issues.push({
            code: "PACK_FORBIDDEN_PATTERN",
            message: `[${pack.spec.name}] Forbidden pattern "${pattern}" found`,
            path: path.relative(projectDir, f).replace(/\\/g, "/")
          });
        }
      }
    }
  }

  return issues;
}