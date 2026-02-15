import path from "node:path";
import fs from "fs-extra";
import { loadTemplate } from "./loadTemplate.js";
import { askQuestions } from "./prompt.js";
import { copyAndRenderDir } from "./copy.js";
import { writeTemplateLock } from "./lock.js";
import { runHooks, type Hook } from "./hooks.js";
import { loadPack } from "./packs/loadPack.js";
import { applyPackFiles } from "./packs/applyPackFiles.js";

function nowVars() {
  const d = new Date();
  const isoDate = d.toISOString();
  const date = isoDate.slice(0, 10);
  const year = String(d.getUTCFullYear());
  return { isoDate, date, year };
}

export async function initProject(params: {
  templateName: string;
  destDir: string;
  packs?: string[];
  noHooks?: boolean;
  yes?: boolean;
  force?: boolean;
}): Promise<{ destDir: string }> {
  const { spec, filesDir } = await loadTemplate(params.templateName);
  const answers = await askQuestions(spec.questions, { yes: params.yes });

  const sys = nowVars();
  const vars: Record<string, string> = {
    ...answers,
    ...sys,
    templateName: spec.name,
    templateVersion: spec.version
  };

  const destDir = path.resolve(params.destDir);

  // Destination handling
  if (await fs.pathExists(destDir)) {
    const content = await fs.readdir(destDir);
    if (content.length > 0) {
      if (params.force) {
        await fs.emptyDir(destDir);
      } else {
        throw new Error(`Destination not empty: ${destDir} (use --force)`);
      }
    }
  }
  await fs.ensureDir(destDir);

  // 1) Copy + render template files
  await copyAndRenderDir(filesDir, destDir, vars);

  // 2) Apply packs (files + compatibility checks)
  const appliedPacks: string[] = [];
  for (const packName of params.packs ?? []) {
    const pack = await loadPack(packName);

    if (pack.spec.appliesTo?.templates && !pack.spec.appliesTo.templates.includes(spec.name)) {
      throw new Error(`Pack "${packName}" not compatible with template "${spec.name}"`);
    }

    await applyPackFiles(pack, destDir, vars);
    appliedPacks.push(pack.spec.name);
  }

  // 3) Write template.lock (includes packs + file integrity hashes)
  await writeTemplateLock({
    destDir,
    template: spec.name,
    version: spec.version,
    options: answers,
    packs: appliedPacks,
    generatedAt: sys.isoDate
  });

  // 4) Hooks — pass vars so `when` conditions can be evaluated
  if (!params.noHooks) {
    const hooks: Hook[] = (spec.hooks?.postGenerate ?? []).map((h) =>
      typeof h === "string" ? { run: h } : h
    );
    await runHooks(hooks, destDir, vars);
  }

  return { destDir };
}