import path from "node:path";
import fs from "fs-extra";
import YAML from "yaml";
import { getResourcesRoot } from "../../utils/path.js";

export type PackSpec = {
  name: string;
  version: string;
  description?: string;
  appliesTo?: {
    templates?: string[];
  };
  enforcement?: {
    level: "strict" | "advisory";
  };
};

export type LoadedPack = {
  spec: PackSpec;
  packDir: string;
  filesDir: string | null;
  rulesDir: string | null;
};

export async function loadPack(packName: string): Promise<LoadedPack> {
  const packsRoot = path.join(getResourcesRoot(), "packs");

  const packDir = path.join(packsRoot, packName);
  const packYaml = path.join(packDir, "pack.yaml");

  if (!(await fs.pathExists(packYaml))) {
    throw new Error(`Pack not found: ${packName} (expected: ${packYaml})`);
  }

  const raw = await fs.readFile(packYaml, "utf8");
  const spec = YAML.parse(raw) as PackSpec;

  if (!spec?.name || !spec?.version) {
    throw new Error(`Invalid pack.yaml (missing name/version): ${packYaml}`);
  }

  const filesCandidate = path.join(packDir, "files");
  const rulesCandidate = path.join(packDir, "rules");

  const filesDir = (await fs.pathExists(filesCandidate)) ? filesCandidate : null;
  const rulesDir = (await fs.pathExists(rulesCandidate)) ? rulesCandidate : null;

  return { spec, packDir, filesDir, rulesDir };
}