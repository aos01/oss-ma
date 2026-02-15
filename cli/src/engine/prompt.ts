// cli/src/engine/prompt.ts

import prompts from "prompts";
import type { TemplateQuestion } from "./loadTemplate.js";

export async function askQuestions(
  questions: TemplateQuestion[] | undefined,
  opts: { yes?: boolean } = {}
): Promise<Record<string, string>> {
  if (!questions?.length) return {};

  // --yes : aucune interaction, on prend les defaults
  if (opts.yes) {
    const answers: Record<string, string> = {};
    for (const q of questions) answers[q.name] = String(q.default ?? "");
    return answers;
  }

  const defs = questions.map((q) => {
    const base: any = {
      name: q.name,
      message: q.message,
      initial: q.default
    };

    if (q.choices?.length) {
      return { type: "select", ...base, choices: q.choices.map((c) => ({ title: c, value: c })) };
    }
    return { type: "text", ...base };
  });

  // Sur certains terminaux Windows, prompts peut déclencher onCancel inopinément.
  // Stratégie: si cancel -> fallback sur defaults au lieu de crash.
  const res = (await prompts(defs, {
    onCancel: () => true
  })) as Record<string, unknown>;

  const out: Record<string, string> = {};
  for (const q of questions) {
    const v = res[q.name];
    out[q.name] = v !== undefined && v !== null && String(v).length > 0 ? String(v) : String(q.default ?? "");
  }
  return out;
}


// import prompts from "prompts";
// import type { TemplateQuestion } from "./loadTemplate.js";

// export async function askQuestions(
//   questions: TemplateQuestion[] | undefined,
//   opts: { yes?: boolean } = {}
// ): Promise<Record<string, string>> {
//   if (!questions?.length) return {};

//   if (opts.yes) {
//     const answers: Record<string, string> = {};
//     for (const q of questions) {
//       answers[q.name] = String(q.default ?? "");
//     }
//     return answers;
//   }

//   const defs = questions.map((q) => {
//     const base: any = {
//       name: q.name,
//       message: q.message,
//       initial: q.default
//     };

//     if (q.choices?.length) {
//       return { type: "select", ...base, choices: q.choices.map((c) => ({ title: c, value: c })) };
//     }

//     return { type: "text", ...base };
//   });

//   const res = await prompts(defs, {
//     onCancel: () => {
//       throw new Error("Cancelled by user.");
//     }
//   });

//   return res as Record<string, string>;
// }