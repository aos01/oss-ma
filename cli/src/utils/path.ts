import { fileURLToPath } from "node:url";
import path from "node:path";

/**
 * Absolute path to the installed CLI package root (folder containing dist/ and resources/).
 * Works with: local dev, npm install, and npx.
 */
export function getCliPackageRoot(): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // dist/utils/path.js -> dist/utils -> dist -> (package root)
  return path.resolve(__dirname, "../../");
}

/**
 * Absolute path to published runtime assets.
 */
export function getResourcesRoot(): string {
  return path.join(getCliPackageRoot(), "resources");
}