# Releases

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
