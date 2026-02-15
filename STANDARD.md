# Project Standard (V1)

## 1. Goal
This standard ensures every project is:
- easy to understand (5 min)
- easy to run (2 commands)
- consistent across teams
- automatically checked in CI

## 2. Mandatory repository structure
Required paths/files:
- README.md
- docs/adr/
- .github/workflows/ci.yml
- template.lock
- .editorconfig
- .gitignore

Recommended:
- scripts/
- src/
- tests/ (depending on stack)

## 3. README required sections
README.md must include headings:
- Overview
- Quickstart
- Scripts
- Architecture
- Contributing

## 4. ADR requirements
Folder: docs/adr/
Required ADR:
- 0001-context.md

ADR template:
- Date
- Status
- Context
- Decision
- Consequences

## 5. Mandatory project commands (conceptual)
Every generated project must provide actions:
- lint
- format
- test
- build
- dev (if applicable)

## 6. CI requirements
A GitHub Actions workflow must exist:
- file: .github/workflows/ci.yml
- name: ci
It must run at least:
- lint
- test
- build

## 7. template.lock
Every generated project must include template.lock containing:
- template name
- template version
- selected options
- generation timestamp
