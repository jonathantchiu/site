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

---

## v3.1 — Section bands and the shifting cat

Added 2026-09-25, after the owner saw v3 live.

### Section color bands

Each scene gets its own background so the breaks between them are obvious,
the way the reference site changes ground per section. The colors are tonal
steps from the existing warm palette, not the reference's colors.

| Band | Scene | Background | ink | muted | accent |
|---|---|---|---|---|---|
| light | 01 Intro | `#FDFCFA` | `#22201D` 15.85 | `#57524B` 7.55 | `#A34818` 5.86 |
| warm | 02 Experience | `#F4EBE0` | `#22201D` 13.78 | `#57524B` 6.56 | `#A34818` 5.09 |
| dark | 03 Projects | `#22201D` | `#FDFCFA` 15.85 | `#B5AEA5` 7.40 | `#E8874D` 6.19 |
| light | 04 Elsewhere | `#FDFCFA` | `#22201D` 15.85 | `#57524B` 7.55 | `#A34818` 5.86 |

Every pairing above meets WCAG AA for normal text. `#EFE3D4` was rejected as
the warm band because muted text on it measures 4.35, below AA.

`--muted` was darkened from `#6E6862` to `#57524B` (and from `#A8A199` to
`#B5AEA5` on the dark band) after the owner reported the intro was hard to
read. The old values passed AA at 5.36 and 4.66, which is the point: AA is a
floor, not a target, and grey secondary text at 17px on a near-white ground is
uncomfortable even when it technically passes. The new values sit at 7.55 and
6.56 while staying 2.1:1 apart from `--ink`, so the hierarchy still reads.

The hero lede takes `--ink` rather than `--muted`. It is the first thing a
reader reads and the primary statement on the site, not a caption.

`--accent-text` was darkened from `#B04E1B` to `#A34818` in the same pass. On
the warm band the old value measured 4.51, a hair over the AA line, which put
every link in the same uncomfortable category as the secondary text. The new
value reads 5.86 on the light band and 5.09 on warm, and is still recognisably
the same burnt orange.

Bands are implemented by scoping the token custom properties per band, not by
adding conditional classNames at each call site. A scene carries a
`data-band` attribute and the stylesheet redefines `--ink`, `--muted`,
`--accent-text`, `--card` and `--hairline` within it. Every existing component
then inherits correct colors on a dark ground without knowing bands exist. A
component that hardcodes a color instead of using a token will break on the
dark band, and that is the intended signal.

Bands run full-bleed edge to edge, while their content stays within the
existing measure.

### The cat, reworked

The wormhole goes. The traveling-cat mechanic is replaced by a cat that
appears in a different form and a different place in each section.

- Each scene shows the cat in one of several variants: a mood
  (`happy`, `neutral`, `sad`, `sleep`) optionally paired with one of the five
  cosmetics, positioned at one of several spots around that scene's content
  (left, right, upper, lower).
- Scrolling away from a scene and back to it shows a different variant. The
  variant advances rather than being re-randomized on every frame, so it never
  flickers while scrolling.
- The cat is decoration: `aria-hidden`, `pointer-events: none`, and it never
  overlaps text or covers a link at any width.
- Cosmetics keep using the percentage anchors in `lib/cosmetics.ts` so they
  stay aligned at any sprite size.
- On the dark band the sprite's dark outline loses contrast against the
  ground, so the cat on that band needs separation, such as a soft light halo
  behind it. Verify it reads, rather than assuming.
- Nothing renders under `prefers-reduced-motion` beyond a single static cat,
  and nothing renders without JavaScript.

The cardboard box reveal stays as it is.
