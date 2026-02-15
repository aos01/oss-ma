# {{appName}}

## Overview
Starter React + TypeScript (Vite) with a strict structure and default quality gates (lint/format/test/build).

## Quickstart
```bash
{{packageManager}} install
{{packageManager}} run dev
```

## Scripts
{{packageManager}} run dev : start dev server
{{packageManager}} run build : production build
{{packageManager}} run test : run tests
{{packageManager}} run lint : lint code
{{packageManager}} run format : format code

## Architecture
src/app : app bootstrap (entry, root component)
src/features : feature modules (business/UI by feature)
src/shared : reusable primitives (ui, utils, types)

## Contributing
Keep code inside features/ when it belongs to a domain feature.
Reuse from shared/ only when it’s truly cross-feature.
CI must stay green: lint + test + build.


### ADR obligatoire
**`templates/react-ts/files/docs/adr/0001-context.md`**
```md
# ADR 0001 — Project context

- Date: {{date}}
- Status: Accepted

## Context
We need a React + TypeScript starter that is easy to hand over between teams and stays consistent over time.

## Decision
Use Vite + React + TypeScript with:
- Feature-based structure
- ESLint + Prettier
- Vitest for unit tests
- GitHub Actions CI running lint, test and build

## Consequences
- Fast local setup and consistent code style
- Enforced quality gates via CI
- Clear separation between app bootstrap, features and shared code
