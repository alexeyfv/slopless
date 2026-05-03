# Slopless

Keep your music free of AI slop.

![cover](./cover.png)

## Installation

Install the browser extension for Yandex Music for free.

- [Chrome Web Store](https://chromewebstore.google.com/detail/slopless/ceehepkmdedlkcgcaocbfjheafkfnaej)
- [Firefox Add-ons](https://addons.mozilla.org/addon/slopless/)

## Development

### Prerequisites

- Operating system: Linux, macOS, or Windows
- [Node.js 24.x](https://nodejs.org/en/download)
- [pnpm 9.x](https://pnpm.io/installation#using-corepack)

Go to the `extension` directory and install dependencies:

```sh
cd extension
pnpm i
```

### Run locally

To run the add-on locally in development mode:

```sh
# Google Chrome
pnpm dev

# Firefox
pnpm dev:firefox
```

### Build from source

To build the add-on from source:

```sh
# Google Chrome
pnpm build

# Firefox
pnpm build:firefox
```

Or run zip scripts to get a ready-to-upload archive:

```sh
# Google Chrome
pnpm zip

# Firefox
pnpm zip:firefox
```

## Creating a release

From the repository root:

```sh
git tag -a v* -m "Slopless v*"
git push origin v*
```

The release [workflow](./.github/workflows/release.yaml) runs necessary scripts automatically when a `v*` tag is
published.
