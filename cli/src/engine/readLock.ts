// cli/src/engine/readLock.ts

import path from "node:path";
import fs from "fs-extra";

export type TemplateLock = {
  template: string;
  version: string;
  options?: Record<string, string>;
  packs?: string[];
  generatedAt?: string;
  /**
   * SHA-256 integrity manifest of all files at generation time.
   * Key: relative path (forward slashes), Value: sha256 hex digest.
   * Present from template-platform v1.0.6+
   */
  filesIntegrity?: Record<string, string>;
};

export async function readTemplateLock(projectPath: string): Promise<TemplateLock | null> {
  const p = path.join(projectPath, "template.lock");
  if (!(await fs.pathExists(p))) return null;

  const raw = await fs.readFile(p, "utf8");
  return JSON.parse(raw) as TemplateLock;
}

// import path from "node:path";
// import fs from "fs-extra";

// export type TemplateLock = {
//   template: string;
//   version: string;
//   options?: Record<string, string>;
//   packs?: string[];
//   generatedAt?: string;
// };

// export async function readTemplateLock(projectPath: string): Promise<TemplateLock | null> {
//   const p = path.join(projectPath, "template.lock");
//   if (!(await fs.pathExists(p))) return null;

//   const raw = await fs.readFile(p, "utf8");
//   return JSON.parse(raw) as TemplateLock;
// }