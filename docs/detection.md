# How Slopless Detects AI Music

Slopless uses two data sources to detect AI-generated music on Yandex Music.

## Data Sources

### Deezer

Deezer is the only streaming service that labels AI-generated music. Slopless cross-references artists on Yandex Music with Deezer to identify those who use AI for music production.

### Slopless model

Not all artists upload their work to Deezer. That's why Slopless uses its own statistical model ([XGBoost](https://en.wikipedia.org/wiki/XGBoost)) to analyze artists not found in Deezer. The model looks at release patterns, label connections, and other publicly available data.

A statistical model is never 100% accurate and can make mistakes. The confusion matrix for the latest model version is:

|                 | Predicted as non-AI | Predicted as AI |
| --------------- | ------------------- | --------------- |
| Actually non-AI | 96,740              | 2,784           |
| Actually AI     | 423                 | 14,370          |

In other words, **83.77%** of artists labeled as AI by the model are indeed AI, and the model correctly identifies **97.14%** of all AI artists.

For more technical details, check out [this article](https://alexeyfv.xyz/en/post/2026-05-19-yandex-music-ai-slop).
