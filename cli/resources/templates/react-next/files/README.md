# {{appName}}

Next.js 15 · App Router · TypeScript

## Getting Started

```bash
npm run dev
# Open http://localhost:3000
```

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm start` — Start production server
- `npm test` — Run tests
- `npm run lint` — Lint code
- `npm run format` — Format code with Prettier
- `npm run typecheck` — Type check with TypeScript

## Project Structure

```
src/
├── app/           # Next.js App Router pages
├── features/      # Feature modules
├── shared/        # Shared components and utilities
└── lib/           # Library code (providers, etc.)
```

## Standards

This project follows the [@oss-ma/tpl](https://www.npmjs.com/package/@oss-ma/tpl) standard.

Run `npx @oss-ma/tpl check` to validate compliance.

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.