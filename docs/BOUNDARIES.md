# Boundaries

## Dependency rules
- `src/app` can import from `src/features` and `src/shared`
- `src/features/*` can import from `src/shared`
- `src/shared` must NOT import from `src/features` or `src/app`
- feature-to-feature imports are forbidden unless justified by an ADR

## Why
This keeps features independent, reduces coupling, and makes handovers easier.
