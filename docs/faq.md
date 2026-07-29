---
description: Frequently asked questions about the Slopless browser extension — how AI detection works, privacy, auto-dislike, and more.
---

# FAQ

## How do I switch the language?

Click the language button in the top-right corner of the extension window.
You can choose between English and Russian.

## How does Slopless detect AI music?

Slopless uses a custom AI-music detector inspired by the Deezer Research team's ISMIR 2025 paper "[A Fourier Explanation of AI-music Artifacts](https://arxiv.org/abs/2506.19108)" (Darius Afchar, Gabriel Meseguer-Brocal, Kamil Akesbi, Romain Hennequin).

The detector uses the first derivative (forward difference) combined with principal component analysis to detect AI-music artifacts.

More information can be found in the classifier's [GitHub repository](https://github.com/alexeyfv/slopless/tree/main/classifie) and in this [article](https://alexeyfv.xyz/en/post/2026-07-02-ai-music-classifier).

## What's the difference between the actions?

| Action                   | Description                                                                                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dislike**              | Slopless clicks the Dislike button. If the track is liked, the Like is removed and the track is added to your dislikes. Playback automatically skips to the next track.     |
| **Dislike if not liked** | Slopless clicks the Dislike button only if the track has not been liked. Your liked tracks stay untouched. Useful if you genuinely enjoy some AI-generated tracks.          |
| **Skip**                 | Slopless clicks the Next button. The track is skipped without any other actions.                                                                                            |
| **Skip if not liked**    | Slopless clicks the Next button only if the track has not been liked. Your liked tracks keep playing. Useful if you genuinely enjoy some AI-generated tracks.               |
| **Do nothing**           | Slopless does not click any buttons. AI artist labels still appear on the page.                                                                                             |
| **Like**                 | Slopless clicks the Like button. The track is added to your favorites. Note that Yandex may recommend even more AI content afterward. Use only if you really like AI music. |

## What does "Only act on AI tracks" do?

When enabled, Slopless only acts on the artist's AI tracks. Useful when not all of an artist's releases are AI-generated.

## Does Slopless collect my data?

No. Slopless does **not** collect, store, or transmit any personal or sensitive user data.

## Still have questions?

Ask them in [Telegram-channel](https://t.me/yet_another_dev) or open an issue on [GitHub](https://github.com/alexeyfv/slopless/issues).
