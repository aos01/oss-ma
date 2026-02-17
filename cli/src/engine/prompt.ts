// cli/src/engine/prompt.ts

import { input, select } from "@inquirer/prompts";
import type { TemplateQuestion } from "./loadTemplate.js";

export async function askQuestions(
  questions: TemplateQuestion[] | undefined,
  opts: { yes?: boolean } = {}
): Promise<Record<string, string>> {
  if (!questions?.length) return {};

  // --yes : no interaction, use defaults
  if (opts.yes) {
    const answers: Record<string, string> = {};
    for (const q of questions) answers[q.name] = String(q.default ?? "");
    return answers;
  }

  const out: Record<string, string> = {};

  for (const q of questions) {
    try {
      if (q.choices?.length) {
        const answer = await select({
          message: q.message,
          default: q.default,
          choices: q.choices.map((c) => ({ name: c, value: c })),
        });
        out[q.name] = String(answer);
      } else {
        const answer = await input({
          message: q.message,
          default: String(q.default ?? ""),
        });
        out[q.name] = answer.trim() || String(q.default ?? "");
      }
    } catch {
      // User cancelled (Ctrl+C) → fallback to default
      out[q.name] = String(q.default ?? "");
    }
  }

  return out;
}