# {{appName}}

Next.js 15 · App Router · TypeScript

## Overview

Modern Next.js application with TypeScript, App Router, and professional tooling.

## Quickstart

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

## Architecture

```
src/
├── app/           # Next.js App Router pages
├── features/      # Feature modules
├── shared/        # Shared components and utilities
└── lib/           # Library code (providers, etc.)
```

See [ADR documentation](docs/adr/) for architectural decisions.

## Standards

This project follows the [@oss-ma/tpl](https://www.npmjs.com/package/@oss-ma/tpl) standard.

Run `npx @oss-ma/tpl check` to validate compliance.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint && npm test`
5. Submit a pull request

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.