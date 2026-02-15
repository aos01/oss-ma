# Architecture

## Structure
- `src/app`: app bootstrap and root composition
- `src/features`: feature modules (group by domain/feature)
- `src/shared`: reusable building blocks (ui, utils, types)

## Creating a new feature
```bash
npm run gen:feature billing
