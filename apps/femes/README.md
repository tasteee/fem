# femes

A quiet place for your music. Built with fem and fem-media.

## Addresses

| Page | Path |
| --- | --- |
| Artist | `/tasteink` |
| Track | `/tasteink/track/safeword` |
| Playlist | `/tasteink/playlist/late-night-drafts` |

Names like `studio`, `signin`, and `api` are reserved, so no artist can take them.

## Develop

From the repo root:

```sh
npm run dev:femes     # localhost:5200
npm run build:femes   # apps/femes/dist
```

Pages read through `src/data/catalog.ts`. It serves demo data for now; the backend replaces it with no page changes.

## Deploy (Cloudflare Pages)

- **Root directory:** repo root
- **Build command:** `npm run build:femes`
- **Output:** `apps/femes/dist`
- **Watch paths:** `apps/femes/**`, `packages/**`, so docs-only changes don't redeploy it

`public/_redirects` sends every path to the app, so deep links work.
