# femes

A quiet place for your music. Built with fem and fem-media, hosted on Cloudflare Pages with D1 and R2.

## Addresses

| Page | Path |
| --- | --- |
| Artist | `/tasteink` |
| Track | `/tasteink/track/safeword` |
| Playlist | `/tasteink/playlist/late-night-drafts` |
| Sign in | `/signin` |
| Studio | `/studio`, `/studio/playlists`, `/studio/profile` |
| Embed | `/embed/tasteink/track/safeword` |

Renamed tracks and playlists keep their old links working.

## How it fits together

- **`src/`**: the Svelte app. Pages read through `data/catalog.ts` (public) and `data/studio.svelte.ts` (Studio).
- **`server/worker.ts`**: one Worker, bundled to `dist/_worker.js`. Pages runs it for every request:
  - `/api/...`: public pages, sign-in, and the Studio API
  - `/media/...`: files from R2, with byte ranges so audio can seek
  - everything else: the app, with link-preview tags (title, art, audio) written into its head for that page
- **`migrations/`**: database tables. The Worker applies new ones on the first request after a deploy.
- **Uploads**: audio goes up in 20 MB parts (Cloudflare caps one request at 100 MB); images go whole. Files live in R2 under `artists/<id>/`.
- **Sign-in**: a one-time email link (15 minutes), then a 30-day session cookie. Only token hashes are stored.

## Cloudflare settings

Bindings on the Pages project (Production and Preview):

| Binding | Points at |
| --- | --- |
| `DB` | D1 `femes-db` |
| `MEDIA` | R2 `femes-media` |

Variables (Settings → Variables and Secrets):

| Name | Value |
| --- | --- |
| `RESEND_API_KEY` | Secret. From resend.com → API Keys. |
| `MAIL_FROM` | `femes <onboarding@resend.dev>` to start. That sender only delivers to the email on your Resend account; add your own domain in Resend to email anyone. |

Check it at `/api/health`: `database`, `media`, and `email` should all be `true`, and `tables` should list `artists`, `tracks`, and the rest.

## Develop

From the repo root:

```sh
npm run dev:femes     # app only, demo data, localhost:5200
npm run build:femes   # apps/femes/dist, app + worker
```

The full stack locally, from `apps/femes`:

```sh
echo "DEV_SHOW_LINKS=true" > .dev.vars   # sign-in links show on screen
npm run build
npm run preview                           # localhost:5201, local D1 and R2
```
