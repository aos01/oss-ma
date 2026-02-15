import path from "node:path";
import fs from "fs-extra";
import { copyAndRenderDir } from "../copy.js";
import type { LoadedPack } from "./loadPack.js";

function safeJoin(baseDir: string, ...parts: string[]): string {
  const base = path.resolve(baseDir) + path.sep;
  const target = path.resolve(baseDir, ...parts);
  if (!target.startsWith(base)) {
    throw new Error(`Path traversal detected: ${target}`);
  }
  return target;
}

async function assertNoSymlink(p: string): Promise<void> {
  const st = await fs.lstat(p);
  if (st.isSymbolicLink()) {
    throw new Error(`Symlink not allowed in pack output: ${p}`);
  }
}

async function mergeDir(srcDir: string, destDir: string, packName: string): Promise<void> {
  await fs.ensureDir(destDir);

  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  for (const e of entries) {
    const src = path.join(srcDir, e.name);
    await assertNoSymlink(src);

    const dest = safeJoin(destDir, e.name);

    if (e.isDirectory()) {
      if (await fs.pathExists(dest)) {
        const stat = await fs.stat(dest);
        if (!stat.isDirectory()) {
          throw new Error(`Pack "${packName}" conflict: destination is a file: ${dest}`);
        }
      }
      await mergeDir(src, dest, packName);
      continue;
    }

    if (e.isFile()) {
      if (await fs.pathExists(dest)) {
        throw new Error(
          `Pack "${packName}" conflict: file already exists: ${path.relative(destDir, dest)}`
        );
      }
      await fs.copyFile(src, dest);
      continue;
    }
  }
}

export async function applyPackFiles(
  pack: LoadedPack,
  projectDir: string,
  vars: Record<string, string>
): Promise<void> {
  if (!pack.filesDir) return;

  const tmpRoot = path.join(projectDir, ".pack-tmp");
  const tmpDir = path.join(tmpRoot, pack.spec.name);

  await fs.remove(tmpDir);
  await fs.ensureDir(tmpDir);

  try {
    await copyAndRenderDir(pack.filesDir, tmpDir, vars);
    await mergeDir(tmpDir, projectDir, pack.spec.name);
  } finally {
    await fs.remove(tmpRoot);
  }
}