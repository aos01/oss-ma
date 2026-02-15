//  cli/src/engine/hooks.ts

import { execa } from "execa";

export type Hook = {
  run: string;
  when?: string; // e.g. "{{packageManager}} == npm"
};

/**
 * Safely parse a command string into [executable, ...args].
 * Handles simple quoted strings but does NOT support pipes, redirects,
 * or subshells — intentionally restricted to prevent injection.
 *
 * Examples:
 *   "npm ci --ignore-scripts"        → ["npm", "ci", "--ignore-scripts"]
 *   "git init"                        → ["git", "init"]
 */
export function parseCommand(cmd: string): [string, ...string[]] {
  const args: string[] = [];
  let current = "";
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < cmd.length; i++) {
    const ch = cmd[i];

    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
    } else if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
    } else if (ch === " " && !inSingle && !inDouble) {
      if (current.length > 0) {
        args.push(current);
        current = "";
      }
    } else {
      current += ch;
    }
  }

  if (current.length > 0) args.push(current);

  if (args.length === 0) {
    throw new Error(`Empty command after parsing: "${cmd}"`);
  }

  // Security: reject shell metacharacters that should never appear
  const FORBIDDEN = /[;&|`$<>\\]/;
  for (const arg of args) {
    if (FORBIDDEN.test(arg)) {
      throw new Error(
        `Forbidden shell metacharacter in hook command: "${arg}" (from: "${cmd}")`
      );
    }
  }

  return args as [string, ...string[]];
}

/**
 * Evaluate a `when` condition of the form:
 *   "{{resolvedValue}} == expectedValue"
 *
 * The vars have already been substituted before this function is called,
 * so `condition` looks like: "npm == npm" or "pnpm == npm".
 */
function evaluateWhen(condition: string): boolean {
  const m = condition.match(/^(.+?)\s*==\s*(.+)$/);
  if (!m) {
    throw new Error(`Invalid when condition format: "${condition}". Expected: "value == value"`);
  }
  return m[1].trim() === m[2].trim();
}

/**
 * Resolve variables in a string using the vars map.
 */
function resolveVars(input: string, vars: Record<string, string>): string {
  return input.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    const v = vars[key];
    return v !== undefined ? String(v) : `{{${key}}}`;
  });
}

export async function runHooks(
  hooks: Hook[] | string[] | undefined,
  cwd: string,
  vars: Record<string, string> = {}
): Promise<void> {
  if (!hooks?.length) return;

  for (const hook of hooks) {
    // Support both legacy string[] and new Hook[] formats
    const raw: Hook = typeof hook === "string" ? { run: hook } : hook;

    // Resolve variables in `when` condition and evaluate it
    if (raw.when !== undefined) {
      const resolvedWhen = resolveVars(raw.when, vars);
      if (!evaluateWhen(resolvedWhen)) {
        continue; // skip this hook
      }
    }

    // Resolve variables in the command itself
    const resolvedCmd = resolveVars(raw.run, vars);

    // Parse safely — no shell: true
    const [bin, ...args] = parseCommand(resolvedCmd);

    await execa(bin, args, {
      cwd,
      shell: false,   // ← explicit: never use shell
      stdio: "inherit"
    });
  }
}

// import { execa } from "execa";

// export async function runHooks(
//   cmds: string[] | undefined,
//   cwd: string
// ): Promise<void> {
//   if (!cmds?.length) return;

//   for (const cmd of cmds) {
//     // simple shell execution (cross-platform)
//     await execa(cmd, {
//       cwd,
//       shell: true,
//       stdio: "inherit"
//     });
//   }
// }