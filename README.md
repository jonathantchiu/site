# jonathanchiu.dev

Personal site. Next.js App Router, statically exported, deployed to GitHub
Pages as a project site at `jonathantchiu.github.io/site/`.

## Develop

```bash
npm install
npm run dev
```

Local dev runs at the root path (no base path).

## Test

```bash
npm test
```

## Build

Production builds must be built with the GitHub Pages base path set, since
the site is served from a subpath rather than the domain root:

```bash
NEXT_PUBLIC_BASE_PATH=/site npm run build
```

Every plain `<img>` in this codebase (there is no image optimizer in a
static export) is routed through `lib/assetPath.ts`, which prefixes
`NEXT_PUBLIC_BASE_PATH` onto root-relative asset paths. `next/link` and
`next/image` already rewrite for `basePath` automatically; plain `<img src>`
does not, which is why the helper exists — miss it and an image 404s in
production while looking fine in local dev.

## Deploy

Deploys are automatic: `.github/workflows/deploy.yml` builds and publishes
`out/` to GitHub Pages on every push to `main` (or via manual
`workflow_dispatch`). The workflow runs `npm test` before building and fails
if tests fail.

`public/.nojekyll` is required in the output — without it, GitHub Pages runs
Jekyll, which strips the `_next/` directory Next.js emits its assets into,
breaking all CSS and JS while the HTML still loads.

### Custom domain later

Attaching a custom domain later means clearing `NEXT_PUBLIC_BASE_PATH` (the
site then serves from the domain root) and updating the workflow's build step
accordingly — no other code change is needed.

## Add a project

Create `content/projects/<slug>.mdx` with this frontmatter:

```yaml
title: Name
year: '2026'
hook: One sentence.
stack: ['TypeScript']
repo: https://github.com/jonathantchiu/<repo>
cover: /projects/<slug>/<screenshot-name>
coverWidth: 768
coverHeight: 1024
featured: true
```

`coverWidth`/`coverHeight` are the pixel dimensions of the cover screenshot
(the largest generated width, see below) and set explicit `width`/`height` on
the rendered `<img>` so the layout does not shift while it loads.

Then drop source screenshots (PNG or JPG, one file per screen, full-size —
do not resize by hand) at `assets/screenshots-src/<slug>/<name>.png` and run:

```bash
node scripts/prepare-assets.mjs
```

This resizes each source image to 480/768/1200px wide and writes the WebP
files the `Screenshot` component expects at
`public/projects/<slug>/<name>-{480,768,1200}.webp`. The same script also
(re)downloads the mascot sprites and cosmetics from Bento's public repo; both
jobs run every time, and each is skipped harmlessly if its source is missing
(no `assets/screenshots-src/` directory means the screenshot step is a no-op).

Nothing else needs to change: the index, detail route, and home page all read
from `lib/projects.ts`.
