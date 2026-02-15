// cli/src/engine/copy.ts

import path from "node:path";
import fs from "fs-extra";
import { renderString } from "./render.js";

/**
 * Extensions treated as text files (template rendering applies).
 */
const TEXT_EXT = new Set<string>([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".yml",
  ".yaml",
  ".html",
  ".css",
  ".scss",
  ".txt",
  ".env",
  ".editorconfig",
  ".gitattributes",
  ".cjs",
  ".mjs"
]);

/**
 * Files that ship without dot but must be generated as dotfiles.
 * (npm packaging limitation workaround)
 */
const DOTFILE_MAP: Record<string, string> = {
  "gitignore":       ".gitignore",
  "editorconfig":    ".editorconfig",
  "gitattributes":   ".gitattributes",
  "prettierrc.json": ".prettierrc.json",
  "env":             ".env",
  "env.example":     ".env.example",
  "nvmrc":           ".nvmrc",
  "node-version":    ".node-version",
};

/**
 * Prevent path traversal: ensure target stays inside baseDir.
 */
function safeJoin(baseDir: string, ...parts: string[]): string {
  const base = path.resolve(baseDir) + path.sep;
  const target = path.resolve(baseDir, ...parts);
  if (!target.startsWith(base)) {
    throw new Error(`Path traversal detected: ${target}`);
  }
  return target;
}

/**
 * Reject symlinks to prevent escaping the project directory.
 */
async function assertNoSymlink(p: string): Promise<void> {
  const st = await fs.lstat(p);
  if (st.isSymbolicLink()) {
    throw new Error(`Symlink not allowed in template/pack: ${p}`);
  }
}

/**
 * Map template filename → destination filename (dotfiles handling).
 */
function mapDestName(name: string): string {
  if (name.startsWith(".")) return name;
  return DOTFILE_MAP[name] ?? name;
}

/**
 * Detect whether a file should be treated as text.
 */
function isTextFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  if (TEXT_EXT.has(ext)) return true;

  const base = path.basename(filePath);
  // Special cases without extension
  if (base === "Dockerfile") return true;
  if (base === "gitignore") return true;
  if (base === "editorconfig") return true;
  if (base === "gitattributes") return true;
  if (base === "nvmrc") return true;
  if (base === "node-version") return true;

  return false;
}

/**
 * Copy a single file with rendering if applicable.
 * - No symlinks
 * - No overwrite
 */
async function copyOne(
  srcPath: string,
  destPath: string,
  vars: Record<string, string>
): Promise<void> {
  await assertNoSymlink(srcPath);

  if (await fs.pathExists(destPath)) {
    throw new Error(`Refusing to overwrite existing file: ${destPath}`);
  }

  await fs.ensureDir(path.dirname(destPath));

  if (isTextFile(srcPath)) {
    const raw = await fs.readFile(srcPath, "utf8");
    const rendered = renderString(raw, vars);
    await fs.writeFile(destPath, rendered, "utf8");
  } else {
    await fs.copyFile(srcPath, destPath);
  }
}

/**
 * Recursively copy and render a directory.
 * Security guarantees:
 * - No path traversal
 * - No symlinks
 * - No overwrite
 */
export async function copyAndRenderDir(
  srcDir: string,
  destDir: string,
  vars: Record<string, string>
): Promise<void> {
  await fs.ensureDir(destDir);

  const entries = await fs.readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    await assertNoSymlink(srcPath);

    const destName = mapDestName(entry.name);
    const destPath = safeJoin(destDir, destName);

    if (entry.isDirectory()) {
      await copyAndRenderDir(srcPath, destPath, vars);
      continue;
    }

    if (!entry.isFile()) continue;

    await copyOne(srcPath, destPath, vars);
  }
}