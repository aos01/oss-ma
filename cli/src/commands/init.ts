// cli/src/commands/init.ts

import path from "node:path";
import fs from "fs-extra";
import { Command } from "commander";
import { loadTemplate } from "../engine/loadTemplate.js";
import { askQuestions } from "../engine/prompt.js";
import { copyAndRenderDir } from "../engine/copy.js";
import { writeTemplateLock } from "../engine/lock.js";
import { runHooks } from "../engine/hooks.js";
import { initProject } from "../engine/initProject.js";

function nowVars() {
  const d = new Date();
  const isoDate = d.toISOString();
  const date = isoDate.slice(0, 10);
  const year = String(d.getUTCFullYear());
  return { isoDate, date, year };
}

export const initCommand = new Command("init")
  .argument("<template>", "Template name (e.g. react-ts)")
  .argument("<dir>", "Destination directory")
  .option("--no-hooks", "Do not run post-generate hooks")
  .option("--yes", "Use defaults, no prompts")
  .option("--pack <name...>", "Apply one or more packs")
  .option("--force", "Overwrite destination directory if not empty")
  .description("Generate a new project from a template")
  .action(
  async (
    templateName: string,
    dir: string,
    opts: { hooks: boolean; yes?: boolean; pack?: string[]; force?: boolean }
  ) => {
    const res = await initProject({
      templateName,
      destDir: dir,
      packs: opts.pack,
      noHooks: !opts.hooks,
      yes: !!opts.yes,
      force: !!opts.force
    });

    console.log("\n✅ Project generated");
    console.log(`- Path: ${res.destDir}`);
  }
);

// import path from "node:path";
// import fs from "fs-extra";
// import { Command } from "commander";
// import { loadTemplate } from "../engine/loadTemplate.js";
// import { askQuestions } from "../engine/prompt.js";
// import { copyAndRenderDir } from "../engine/copy.js";
// import { writeTemplateLock } from "../engine/lock.js";
// import { runHooks } from "../engine/hooks.js";
// import { initProject } from "../engine/initProject.js";

// function nowVars() {
//   const d = new Date();
//   const isoDate = d.toISOString();
//   const date = isoDate.slice(0, 10);
//   const year = String(d.getUTCFullYear());
//   return { isoDate, date, year };
// }

// export const initCommand = new Command("init")
//   .argument("<template>", "Template name (e.g. react-ts)")
//   .argument("<dir>", "Destination directory")
//   .option("--no-hooks", "Do not run post-generate hooks")
//   .option("--yes", "Use defaults, no prompts")
//   .description("Generate a new project from a template")
//   .action(async (templateName: string, dir: string, opts: { hooks: boolean; yes?: boolean }) => {
//     const { spec, filesDir } = await loadTemplate(templateName);

//     const answers = await askQuestions(spec.questions, { yes: opts.yes });

//     const pm = answers.packageManager || "npm";

//     // system vars
//     const sys = nowVars();
//     const vars: Record<string, string> = {
//       ...answers,
//       ...sys,
//       templateName: spec.name,
//       templateVersion: spec.version
//     };

//     const destDir = path.resolve(process.cwd(), dir);
//     if (await fs.pathExists(destDir)) {
//       const content = await fs.readdir(destDir);
//       if (content.length > 0) {
//         throw new Error(`Destination not empty: ${destDir}`);
//       }
//     }
//     await fs.ensureDir(destDir);

//     // copy + render template files
//     await copyAndRenderDir(filesDir, destDir, vars);

//     // force lock (overwrites any template.lock from files/)
//     await writeTemplateLock({
//       destDir,
//       template: spec.name,
//       version: spec.version,
//       options: answers,
//       generatedAt: sys.isoDate
//     });

//     // hooks
//     if (opts.hooks) {
//       const cmds = spec.hooks?.postGenerate?.map((h) => {
//         // allow {{var}} in hook command
//         return h.run.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);
//       });
//       await runHooks(cmds, destDir);
//     }

//     console.log("\n✅ Project generated");
//     console.log(`- Template: ${spec.name}@${spec.version}`);
//     console.log(`- Path: ${destDir}`);
//     console.log("\nNext:");
//     console.log(`  cd ${dir}`);
//     console.log(`  ${pm} run dev`);
//   });
