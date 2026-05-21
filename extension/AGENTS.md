# Extension Development

## UI & Styling

- Use Skeleton UI components with Tailwind only — no custom CSS.
- If a component isn't available in Skeleton, compose it from existing Skeleton primitives.

## Dependencies

- Never edit `package.json` or `pnpm-lock.yaml` directly.
- Use `pnpm add`, `pnpm remove`, `pnpm up`, `pnpm dlx` for all dependency changes.
- Before adding a dep, check latest version: `pnpm view <package> dist-tags.latest`.

## Required finish gate (run from `extension/`)

After every change, run **all** of these:

- `pnpm format`
- `pnpm lint` (alias for `svelte-check`)
- `pnpm build` and `pnpm build:firefox`

Task is not complete until all pass without errors or reported problems.
