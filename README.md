# Ledgerly-MVP
A beautiful local-first accounting app that uses Beancount as the source of truth, with AI and rules layered on top to help import, categorize, review, and report on financial data.

@docs/pitch.md
@docs/product-thesis.md
@docs/value-proposition.md

## Development

Ledgerly is a Tauri + React + TypeScript local desktop app.

```bash
npm install
npm run dev
```

Run checks:

```bash
npm run typecheck
npm run test
npm run build
cd src-tauri && cargo test
npm run test:e2e
```

## Workspace Lifecycle

Issue 1 implements App-Created Workspace creation and reopen from disk. The Workspace layout is documented in [docs/workspace-layout.md](docs/workspace-layout.md).

The Workspace contains readable Beancount files plus Ledgerly-managed local data under `.ledgerly/`. It does not require a Ledgerly cloud account.

## Architecture

The current codebase architecture is documented in [docs/architecture.md](docs/architecture.md).
