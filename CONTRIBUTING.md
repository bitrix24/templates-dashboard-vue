# Contributing

Thanks for your interest in improving this template!

## Prerequisites

- Node.js `>= 22`
- pnpm `>= 10` (`corepack enable` picks up the pinned version)

## Workflow

1. Fork and create a feature branch.
2. Install dependencies: `pnpm install`.
3. Make your change. Keep the code style consistent with the surrounding files.
4. Run the full local gate before opening a PR:

   ```bash
   bash scripts/check.sh                                       # Linux / macOS
   powershell -ExecutionPolicy Bypass -File scripts/check.ps1  # Windows
   ```

   This runs lint, unit tests, typecheck and build — the same checks CI enforces.
5. Add or update unit tests for any business logic you touch
   (see `src/composables/useDealStats/*.test.ts` and `src/utils/*.test.ts`).
6. Open a pull request against `main` with a clear description.

## Commit messages

Use short, imperative summaries with a conventional prefix where it fits
(`feat:`, `fix:`, `chore:`, `test:`, `docs:`).
