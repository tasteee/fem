# fem

A flat, premium web component design system. No shadows, no gradients. Depth comes from surfaces, type, and color used with intent.

Docs: [tasteee.github.io/fem/components](https://tasteee.github.io/fem/components/).

## Packages

| Path | Package | What |
| --- | --- | --- |
| `packages/fem` | `@tasteee/fem` | Core components, tokens, icons, foundation |
| `packages/fem-media` | `@tasteee/fem-media` | Music pieces: audio engine, player bar, now playing, track row |
| `apps/site` | private | Docs site, component docs, notes example |

`fem-media` builds on core. It imports `@tasteee/fem/foundation` and uses the same tokens.

## Develop

```sh
npm install
npm run dev           # site at localhost, live from package source
npm run build         # both packages
npm run typecheck     # all workspaces
npm run build:demos   # static site in apps/site/demos, for GitHub Pages
```

See [packages/fem/README.md](packages/fem/README.md) for usage and the full API.
