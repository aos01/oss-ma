import path from "node:path";
import fs from "fs-extra";

export async function findUp(startDir: string, relPath: string): Promise<string | null> {
  let cur = path.resolve(startDir);

  while (true) {
    const candidate = path.join(cur, relPath);
    if (await fs.pathExists(candidate)) return candidate;

    const parent = path.dirname(cur);
    if (parent === cur) return null; // reached filesystem root
    cur = parent;
  }
}