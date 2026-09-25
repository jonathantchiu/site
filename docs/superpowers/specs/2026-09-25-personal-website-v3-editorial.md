# Personal Website v3 — Editorial Layout

Date: 2026-09-25
Amends: `2026-09-24-personal-website-design.md` and `2026-09-24-personal-website-v2-amendment.md`

The v2 site is live at https://jonathantchiu.github.io/site/ . v3 changes the
layout and typography only. Everything not contradicted here still stands.

## Why

The owner asked to rework the layout using https://theqream.com as reference,
and explicitly said to take the layout, NOT the color scheme. The v2 palette
stays exactly as it is.

## What the reference actually does

Measured from the live site rather than described: H1 at 82px / weight 700 /
letter-spacing -2.46px, H2 at 64.8px / 700 / -1.94px, body at 15-18px. The
layout devices worth taking:

1. Full-viewport sections, each one its own scene.
2. Oversized display type, flush left, uppercase, stacked over two or three
   lines, with tight negative tracking.
3. An asymmetric split: the giant heading on the left, a small right-aligned
   paragraph opposite it.
4. A section number in the top corner.
5. A hairline rule separating the header block from the content below.

Not taken: the color scheme, the 3D renders, the graffiti textures, the
sticker-tape buttons.

## Typography

The display face changes from Fredoka to a tight grotesque. Fredoka's rounded
letterforms do not tighten, so large sizes with negative tracking read as
cramped rather than editorial. Archivo at weight 800 is the display face; Inter
stays for body.

| Role | Face | Size | Weight | Tracking | Case |
|---|---|---|---|---|---|
| Scene heading | Archivo | `clamp(2.75rem, 11vw, 6.5rem)` | 800 | -0.03em | uppercase |
| Page heading | Archivo | `clamp(2.25rem, 7vw, 4rem)` | 800 | -0.03em | uppercase |
| Entry title | Archivo | 1.25rem | 700 | -0.01em | none |
| Lede | Inter | 1.0625rem | 400 | normal | none |
| Body | Inter | 17px minimum | 400 | normal | none |

The heading sizes are `clamp()` rather than fixed breakpoint jumps because
oversized type is the single most likely thing to overflow a 320px viewport.

## Scenes

The home page becomes four scenes, each `min-height: 100svh` (small viewport
height, so mobile browser chrome does not cut content off) with its content
vertically centered:

| # | Scene | Heading | Content |
|---|---|---|---|
| 01 | Intro | JONATHAN CHIU | Photo, lede, current work, links |
| 02 | Experience | EXPERIENCE | Three entry rows, link to full page |
| 03 | Projects | PROJECTS | Two entry rows, link to full page |
| 04 | Elsewhere | ELSEWHERE | GitHub, LinkedIn, email |

Each scene carries its number in the top right, `aria-hidden`, and a hairline
rule under the header block.

`min-height` rather than `height`, and never `overflow: hidden`: if content
exceeds the viewport on a small screen it must push the scene taller, not get
clipped. A scene that hides content fails.

## Interior pages

`/projects`, `/experience` and the project detail pages adopt the same page
heading treatment and hairline rules, but are NOT broken into full-viewport
scenes. They are reading pages and forcing a screen per section would bury the
content.

## What does not change

- The entire v2 palette: `--page #FDFCFA`, `--card #FFFFFF`, `--hairline
  #EDE8E2`, `--ink #22201D`, `--muted #6E6862`, `--accent-text #B04E1B`,
  `--accent #C25A22`, and the dark-mode set.
- `--accent` remains decoration-only; it fails WCAG AA at 4.29:1.
- The traveling cat and the cardboard box reveal, both restyled to sit in the
  new layout but behaviorally unchanged.
- Content is never gated. Nothing renders under `prefers-reduced-motion` or
  without JavaScript except the plain page.
- Body text 17px minimum, tap targets 44x44 and 8px apart, no horizontal
  scroll at 320px, one `<h1>` per page, explicit image dimensions, `alt=""` on
  decorative sprites, `components/Reveal.tsx` the only framer-motion importer,
  all assets through `assetPath()`.

## Risks this design carries

- Oversized type overflowing narrow viewports. Mitigated by `clamp()` and
  verified by measurement at 320px, not by inspection.
- `100vh` on mobile cutting off content under browser chrome. Mitigated by
  `100svh` and by `min-height` rather than a fixed height.
- Four full screens making the site feel long. Accepted: the owner chose this
  explicitly over the lighter option.
