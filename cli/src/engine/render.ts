// cli/src/engine/render.ts

/**
 * Render a template string with variable substitution and conditional blocks.
 *
 * Supported syntax:
 *   {{variableName}}              — replaced by vars[variableName]
 *   {{#if variableName}}...{{/if}} — block included only if vars[variableName] is truthy and !== "none"
 *   {{#unless variableName}}...{{/unless}} — block included only if vars[variableName] is falsy or === "none"
 *
 * Blocks can span multiple lines.
 * Nested blocks are not supported.
 */
export function renderString(
  input: string,
  vars: Record<string, string>
): string {
  // 1) Process {{#if var}}...{{/if}} blocks
  let output = input.replace(
    /\{\{#if\s+([a-zA-Z0-9_]+)\s*\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_, key: string, content: string) => {
      const val = vars[key];
      return isActive(val) ? content : "";
    }
  );

  // 2) Process {{#unless var}}...{{/unless}} blocks
  output = output.replace(
    /\{\{#unless\s+([a-zA-Z0-9_]+)\s*\}\}([\s\S]*?)\{\{\/unless\}\}/g,
    (_, key: string, content: string) => {
      const val = vars[key];
      return isActive(val) ? "" : content;
    }
  );

  // 3) Replace {{variable}} placeholders
  output = output.replace(
    /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g,
    (_, key: string) => {
      const v = vars[key];
      return v !== undefined ? String(v) : `{{${key}}}`;
    }
  );

  // 4) Clean up blank lines left by removed blocks (max 1 consecutive blank line)
  output = output.replace(/\n{3,}/g, "\n\n");

  return output;
}

/**
 * A variable is "active" if it exists, is not empty, and is not "none".
 */
function isActive(val: string | undefined): boolean {
  return val !== undefined && val !== "" && val !== "none";
}