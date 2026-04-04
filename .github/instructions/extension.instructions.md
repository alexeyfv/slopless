---
description: "Use when working with browser extension."
applyTo: "src/extension/**"
---

# Implementation Rules

## UI and layout

- Use Skeleton UI components with Tailwind only.
- Don't write custom CSS.
- If a required component is not supported by Skeleton UI, design it using available Skeleton UI components.

## Dependency management

- Never edit `package.json` or `pnpm-lock.yaml` directly.
- Manage dependencies only through pnpm commands (`pnpm add`, `pnpm remove`, `pnpm up`, `pnpm dlx`).
- Before adding a dependency, check the latest stable version with `pnpm view <package> dist-tags.latest`, then install via pnpm.

## Required finish gate

- Run all commands from `src/extension` after changes:
  - `pnpm format`
  - `pnpm lint`
  - `pnpm build` and `pnpm build:firefox`
- Task is not complete until all commands finish without errors, vulnerabilities (including transitive vulnerabilities), or other reported problems.
