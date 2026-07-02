# AI music classifier

Trains an XGBoost classifier on [SONICS](https://github.com/awsaf49/sonics) dataset.

This notebook is inspired by the Deezer Research team's ISMIR 2025 paper ["A Fourier Explanation of AI-music Artifacts"](https://arxiv.org/abs/2506.19108) (Darius Afchar, Gabriel Meseguer-Brocal, Kamil Akesbi, Romain Hennequin). It uses a different feature extraction approach: the first derivative (forward difference) combined with principal component analysis instead of calculating lower-hull fakeprints.

## Requirements

- Python 3.13+
- [uv](https://docs.astral.sh/uv/)
- ~37 GB free disk space for dataset

## Run

1. Clone the repo.

   ```bash
   git clone https://github.com/alexeyfv/slopless
   cd classifier
   uv sync
   ```

2. Download [the dataset](https://github.com/awsaf49/sonics).

   ```bash
   kaggle datasets download -d awsaf49/sonics-dataset --unzip
   ```

Then open a notebook and press "Run All".
