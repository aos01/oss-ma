// cli/src/engine/loadTemplate.ts

import path from "node:path";
import fs from "fs-extra";
import YAML from "yaml";
import { getResourcesRoot } from "../utils/path.js";

export type TemplateQuestion = {
  name: string;
  message: string;
  default?: string;
  choices?: string[];
};

export type TemplateHook = { run: string };

export type TemplateSpec = {
  name: string;
  version: string;
  description?: string;
  questions?: TemplateQuestion[];
  hooks?: {
    postGenerate?: TemplateHook[];
  };
};

export type LoadedTemplate = {
  spec: TemplateSpec;
  templateDir: string;
  filesDir: string;
};

export async function loadTemplate(templateName: string): Promise<LoadedTemplate> {
  const resourcesRoot = getResourcesRoot();

  const templateDir = path.join(resourcesRoot, "templates", templateName);
  const templateYamlPath = path.join(templateDir, "template.yaml");
  const filesDir = path.join(templateDir, "files");

  if (!(await fs.pathExists(templateYamlPath))) {
    throw new Error(`Template not found: ${templateYamlPath}`);
  }
  if (!(await fs.pathExists(filesDir))) {
    throw new Error(`Template files folder not found: ${filesDir}`);
  }

  const raw = await fs.readFile(templateYamlPath, "utf8");
  const spec = YAML.parse(raw) as TemplateSpec;

  if (!spec?.name || !spec?.version) {
    throw new Error(`Invalid template.yaml: missing name/version (${templateYamlPath})`);
  }

  return { spec, templateDir, filesDir };
}

// import path from "node:path";
// import fs from "fs-extra";
// import YAML from "yaml";
// import { findUp } from "../utils/findUp.js";

// export type TemplateQuestion = {
//   name: string;
//   message: string;
//   default?: string;
//   choices?: string[];
// };

// export type TemplateHook = { run: string };

// export type TemplateSpec = {
//   name: string;
//   version: string;
//   description?: string;
//   questions?: TemplateQuestion[];
//   hooks?: {
//     postGenerate?: TemplateHook[];
//   };
// };

// export type LoadedTemplate = {
//   spec: TemplateSpec;
//   templateDir: string;
//   filesDir: string;
// };

// export async function loadTemplate(templateName: string): Promise<LoadedTemplate> {
//   const schemaPath = await findUp(process.cwd(), "standard.schema.json");
//   const repoRoot = schemaPath ? path.dirname(schemaPath) : null;

//   if (!repoRoot) {
//     throw new Error(`Cannot locate repo root (standard.schema.json not found upward from: ${process.cwd()})`);
//   }

//   const templateDir = path.join(repoRoot, "templates", templateName);
//   const templateYamlPath = path.join(templateDir, "template.yaml");
//   const filesDir = path.join(templateDir, "files");

//   if (!(await fs.pathExists(templateYamlPath))) {
//     throw new Error(`Template not found: ${templateYamlPath}`);
//   }
//   if (!(await fs.pathExists(filesDir))) {
//     throw new Error(`Template files folder not found: ${filesDir}`);
//   }

//   const raw = await fs.readFile(templateYamlPath, "utf8");
//   const spec = YAML.parse(raw) as TemplateSpec;

//   if (!spec?.name || !spec?.version) {
//     throw new Error(`Invalid template.yaml: missing name/version (${templateYamlPath})`);
//   }

//   return { spec, templateDir, filesDir };
// }

// // export async function loadTemplate(templateName: string): Promise<LoadedTemplate> {
// //   // CLI is at: template-platform/cli
// //   // templates are at: template-platform/templates/<name>
// //   const repoRoot = path.resolve(process.cwd(), ".."); // assumes we run from cli/
// //   const templateDir = path.join(repoRoot, "templates", templateName);
// //   const templateYamlPath = path.join(templateDir, "template.yaml");
// //   const filesDir = path.join(templateDir, "files");

// //   if (!(await fs.pathExists(templateYamlPath))) {
// //     throw new Error(`Template not found: ${templateYamlPath}`);
// //   }
// //   if (!(await fs.pathExists(filesDir))) {
// //     throw new Error(`Template files folder not found: ${filesDir}`);
// //   }

// //   const raw = await fs.readFile(templateYamlPath, "utf8");
// //   const spec = YAML.parse(raw) as TemplateSpec;

// //   if (!spec?.name || !spec?.version) {
// //     throw new Error(`Invalid template.yaml: missing name/version (${templateYamlPath})`);
// //   }

// //   return { spec, templateDir, filesDir };
// // }