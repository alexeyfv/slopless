---
description: Release history for the Slopless browser extension — new features and changes.
---

# Releases

## v0.3.2

### New features

- Added a feedback bot for reporting incorrect labeling.

## v0.3.1

### Fixes

- Fixed issue with stale AI-labels.
- Fixed issue with double dislikes (or any other actions).

## v0.3.0

### New features

- Slopless now uses its own AI-music classifier.
- Separate labeling for AI-artists and AI-tracks.

## v0.2.5

### Fixes

- Fixed broken skip, dislike, and like actions caused by Yandex Music renaming player bar CSS module classes.
- All player bar selectors now more robust against future DOM changes.

### Other

- Updated dependencies.

## v0.2.4

v0.2.4 was built but never deployed to Chrome or Firefox. Its changes are included in v0.2.5.

## v0.2.3

Automatic rollback to v0.2.1 by Google and Mozilla after a data file issue was resolved.

## v0.2.2

Automatic rollback to v0.2.0 by Google and Mozilla due to a corrupted artist ID data file.

## v0.2.1

### Fixes

- Moved AI detection logic from content scripts to background script.
- Fixed artist status detection edge cases.

## v0.2.0

### New features

- **Multi-level artist labeling**.
  - Red badge — AI detected using Deezer algorithms.
  - Orange badge — AI detected using Slopless algorithms.
- **Selecting the AI artist database**:
  - Deezer + Slopless;
  - Deezer only (artists with at least one AI-generated release);
  - Deezer only (artists where 100% of releases are AI-generated).
- **Choosing an action for AI tracks**:
  - Available actions: Dislike, Dislike if not liked, Skip, Skip if not liked, Do nothing, Like.
  - Action can be disabled for non-AI tracks. Useful when not all of an artist's tracks are AI-generated.
- **Localization**. The extension now supports Russian and English.
- **UI updates**
  - Improved extension UI.
  - Added a tooltip on hover over the badge.
- **Added support for the new My Vibe player**.
- **Updated documentation**. New pages: FAQ, Detection, Releases.

### Other

- The auto-blacklisting feature has been removed. The database now has over 140,000 AI artists and keeps growing. Even at 1 second per dislike, the extension would need to run non-stop for over a day and a half.

## v0.1.2

### New features

- Documentation updated.
- New AI artists added.

### Fixes

- Fixed extension behavior on `.ru`, `.by`, `.kz`, `.uz` domains.

## v0.1.1

### New features

- New AI artists added.

### Fixes

- Fixed a manifest error for Firefox.

## v0.1.0

### New features

- Initial release.
- AI artist labeling on Yandex Music pages.
- Auto-dislike when AI tracks are played.
- Auto-blacklisting of AI artists.
