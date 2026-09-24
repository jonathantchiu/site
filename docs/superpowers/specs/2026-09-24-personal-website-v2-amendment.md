# Personal Website — Design Spec v2 Amendment

Date: 2026-09-24
Amends: `2026-09-24-personal-website-design.md`

The v1 site shipped and is live at https://jonathantchiu.github.io/site/ .
This amendment changes its visual identity, its information order, and adds an
interactive layer. Everything in v1 not contradicted here still stands.

## Why

Three problems with v1, all reported by the site's owner after seeing it live:

1. The palette reads brown. The cause is `--sand #F2CEAB` used as a fill on
   every card, compounded by 2px ink outlines and hard offset shadows.
2. Experience sits below Projects on the home page. For the club and
   hackathon audience this site targets, where he has actually worked is the
   stronger opener.
3. Entries are verbose. Bulleted role cards read like a resume; the reference
   site (trub.fyi) uses compact scannable rows.

A fourth goal is additive: make the site memorable to a student browsing it,
using the Bento cat art the site already owns.

## Visual identity, replacing v1's

The warm-white ground stays so the cat sprite does not look pasted onto a
clinical page, but card fills, heavy outlines and offset shadows all go.

| Token | Hex | Role | Contrast on page / card |
|---|---|---|---|
| `--page` | `#FDFCFA` | Page background | — |
| `--card` | `#FFFFFF` | Card and row fill | — |
| `--hairline` | `#EDE8E2` | 1px borders and dividers | 1.22, decorative only |
| `--ink` | `#22201D` | Body text | 15.85 / 16.25 |
| `--muted` | `#6E6862` | Dates, captions, secondary text | 5.36 / 5.50 |
| `--accent-text` | `#B04E1B` | Link and accent text | 5.18 / 5.31 |
| `--accent` | `#C25A22` | Decoration, underlines, fills | 4.29 / 4.39 |

`--accent` measures 4.29 on the page background and therefore fails WCAG AA
for text at any size. It is for decoration only. `--accent-text` carries every
accent string. This is the same split v1 enforced, at the lighter values.

Dark mode, verified to the same standard:

| Token | Hex | Contrast on page / card |
|---|---|---|
| `--page` | `#14130F` | — |
| `--card` | `#1C1A16` | — |
| `--hairline` | `#2E2B25` | decorative |
| `--ink` | `#F2EFE9` | 16.20 / 15.14 |
| `--muted` | `#A8A199` | 7.28 / 6.80 |
| `--accent-text` | `#E8874D` | 7.08 / 6.62 |

Shape language changes: borders drop from 2px to 1px hairlines; `shadow-offset`
and `shadow-offset-lg` are replaced by a soft low shadow; corner radius drops
from 16px to 10px. The v1 tokens `--cream`, `--sand`, `--orange`,
`--orange-text` are removed rather than aliased, so no component can keep using
them by accident.

## Information order

On the home page, Experience appears above Projects. Everything else on the
page keeps its order.

## Entry rows

Experience entries and project entries share one row component. A row carries:
a 32px logo or thumbnail, the org or project name, the date on the same line
(right-aligned on desktop, wrapping beneath on phones), the role or subtitle on
the next line, and one sentence below that. No bullet lists. The full row is a
single click target.

The detail bullets in `lib/experience.ts` are NOT deleted. They stop appearing
on the home page, and continue to appear on `/experience`, which is where the
depth belongs. The SoFi and DECA metrics are the substance of that page.

## Interactive layer

Two independent features. Both are decoration: neither may gate content.

### Cardboard box reveal

Each section below the hero is covered by a cardboard box until revealed.

Hard requirements, which exist because the audience reads this on a phone from
a link in an application:

- The section's content is always present in the DOM and in the static HTML.
  The box is an overlay, marked `aria-hidden`, never a conditional render.
- The box topples on its own ~400ms after its section scrolls into view. A
  reader who never interacts sees the whole site.
- Clicking the box makes the cat pounce and knock it off immediately.
- Once revealed, a section stays revealed.
- Under `prefers-reduced-motion`, and with JavaScript disabled, no box ever
  renders.
- The box never intercepts clicks meant for links beneath it once revealed.

The box is inline SVG drawn in the Bento style — bold dark outline, warm
cardboard fill, flap lines — not a sourced asset.

### Bug hunt

A bug crosses the page on a randomized interval of 20–40 seconds. Clicking it
makes the cat pounce and increments a counter shown quietly in the footer,
persisted in `localStorage` and wrapped in try/catch so private-window failures
are harmless.

Requirements: the bug never overlaps body text, never covers a link or button,
is keyboard-reachable or else purely optional, and does not render under
`prefers-reduced-motion`.

## Constraints carried forward unchanged from v1

Body text 17px minimum; measure capped at 68 characters; tap targets 44×44px
minimum and 8px apart; no horizontal scroll at 320px; one `<h1>` per page; all
images explicit width and height with `alt=""` on decorative sprites; every
animation behind a `prefers-reduced-motion` guard; `components/Reveal.tsx`
remains the only file importing framer-motion; images under 200KB; assets
routed through `assetPath()` so they resolve under the `/site` base path.
