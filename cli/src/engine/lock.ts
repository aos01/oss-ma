// cli/src/engine/lock.ts

import path from "node:path";
import crypto from "node:crypto";
import fs from "fs-extra";

/**
 * Recursively collect all file paths under a directory.
 */
async function collectFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await collectFiles(full)));
    } else if (entry.isFile()) {
      results.push(full);
    }
  }

  return results.sort(); // deterministic order
}

/**
 * Compute SHA-256 of a single file's content.
 */
async function hashFile(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath);
  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * Compute a manifest of { relativePath -> sha256 } for all files in destDir.
 * Excludes template.lock itself to avoid circular dependency.
 */
export async function computeFilesHash(
  destDir: string
): Promise<Record<string, string>> {
  const abs = path.resolve(destDir);
  const files = await collectFiles(abs);
  const manifest: Record<string, string> = {};

  for (const filePath of files) {
    const rel = path.relative(abs, filePath).replace(/\\/g, "/");
    if (rel === "template.lock") continue; // exclude lock file itself
    manifest[rel] = await hashFile(filePath);
  }

  return manifest;
}

export async function writeTemplateLock(params: {
  destDir: string;
  template: string;
  version: string;
  options: Record<string, string>;
  packs?: string[];
  generatedAt: string;
}): Promise<void> {
  const lockPath = path.join(params.destDir, "template.lock");

  // Compute integrity manifest of all generated files
  const filesIntegrity = await computeFilesHash(params.destDir);

  const data = {
    template: params.template,
    version: params.version,
    options: params.options,
    packs: params.packs ?? [],
    generatedAt: params.generatedAt,
    filesIntegrity
  };

  await fs.writeFile(lockPath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

// import path from "node:path";
// import fs from "fs-extra";

// export async function writeTemplateLock(params: {
//   destDir: string;
//   template: string;
//   version: string;
//   options: Record<string, string>;
//   packs?: string[];
//   generatedAt: string;
// }): Promise<void> {
//   const lockPath = path.join(params.destDir, "template.lock");
//   const data = {
//     template: params.template,
//     version: params.version,
//     options: params.options,
//     packs: params.packs ?? [],
//     generatedAt: params.generatedAt
//   };
//   await fs.writeFile(lockPath, JSON.stringify(data, null, 2) + "\n", "utf8");
// }


// import path from "node:path";
// import fs from "fs-extra";

// export async function writeTemplateLock(params: {
//   destDir: string;
//   template: string;
//   version: string;
//   options: Record<string, string>;
//   packs?: string[];
//   generatedAt: string;
// }) {
//   const lockPath = path.join(params.destDir, "template.lock");

//   const data = {
//     template: params.template,
//     version: params.version,
//     options: params.options,
//     packs: params.packs ?? [],
//     generatedAt: params.generatedAt
//   };

//   await fs.writeFile(lockPath, JSON.stringify(data, null, 2) + "\n", "utf8");
// }


// // export async function writeTemplateLock(params: {
// //   destDir: string;
// //   template: string;
// //   version: string;
// //   options: Record<string, string>;
// //   generatedAt: string;
// // }): Promise<void> {
// //   const lockPath = path.join(params.destDir, "template.lock");
// //   const data = {
// //     template: params.template,
// //     version: params.version,
// //     options: params.options,
// //     generatedAt: params.generatedAt
// //   };
// //   await fs.writeFile(lockPath, JSON.stringify(data, null, 2) + "\n", "utf8");
// // }