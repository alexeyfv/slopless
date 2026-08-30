---
name: create-release
description: Use when the user asks to create a release, bump version, tag, or publish a new version of the Slopless browser extension.
---

# Release Workflow

## Steps

1. Read current version from `extension/package.json`. Ask the user what the next version should be.

2. Bump `version` in `extension/package.json`.

3. From `git log <last-tag>..HEAD --oneline`, gather changes. Add a `## vX.Y.Z` section to both files:
   - `docs/releases.md` (English)
   - `docs/ru/releases.md` (Russian)

   Follow existing format with `### Fixes`, `### New features`, `### Other`.

4. Run Prettier on the changed docs.

5. `git add` and `git commit -m "Bump version to vX.Y.Z"`.

6. `git tag -a vX.Y.Z -m "Slopless vX.Y.Z"`.

7. Remind user to `git push --follow-tags`.
