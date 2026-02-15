
import fs from "node:fs";
import path from "node:path";

const name = process.argv[2];

if (!name) {
  console.error("Usage: npm run gen:feature <featureName>");
  process.exit(1);
}

const safe = name.trim().toLowerCase().replace(/\s+/g, "-");
if (!/^[a-z0-9-]+$/.test(safe)) {
  console.error("Feature name must contain only letters, numbers and hyphens.");
  process.exit(1);
}

const base = path.join(process.cwd(), "src", "features", safe);
const dirs = ["components", "api", "model", "tests"];

for (const d of dirs) fs.mkdirSync(path.join(base, d), { recursive: true });

const indexFile = path.join(base, "index.ts");
if (!fs.existsSync(indexFile)) {
  fs.writeFileSync(indexFile, `// Feature: ${safe}\nexport {};\n`, "utf8");
}

console.log(`✅ Feature created: src/features/${safe}`);