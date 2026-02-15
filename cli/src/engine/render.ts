// cli/src/engine/render.ts

export function renderString(input: string, vars: Record<string, string>): string {
  return input.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    const v = vars[key];
    return v !== undefined ? String(v) : `{{${key}}}`; // keep unresolved visible
  });
}