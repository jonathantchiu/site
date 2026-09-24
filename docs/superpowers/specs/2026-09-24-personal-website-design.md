# Personal Website — Design Spec

Date: 2026-09-24
Owner: Jonathan Chiu

## Purpose

A personal site that makes Jonathan's CS projects look good to other students.

The primary audience is club and hackathon application readers (LA Hacks, UCLA
student orgs), not recruiters. That choice drives everything below: depth over
breadth on projects, a distinctive visual identity over a resume transcription,
and no attempt to be an ATS-friendly document.

Success criteria:

- A reader lands on the home page and understands who Jonathan is in under five seconds.
- Each showcased project has enough depth that a reader can judge real technical work.
- The site looks deliberately designed, not templated.
- Adding a new project later means writing one MDX file, nothing else.

## Scope

In scope: home page, projects index, per-project detail pages, experience page.

Out of scope: blog, dark mode toggle, CMS, analytics, contact form, comment
system, resume PDF hosting. Each is a later decision, not a launch requirement.

## Visual Identity

The palette and line style derive from the artwork in Jonathan's own Bento app
(`github.com/jonathantchiu/bento-money`): warm cream grounds, burnt orange
accents, near-black ink, and bold 2–3px outlines on shapes. Reusing his own
app's visual language means the site's personality is authentically his rather
than a theme pulled off a shelf.

Tokens, sampled directly from the Bento art and checked for contrast:

| Token | Hex | Role | Contrast on cream / sand |
|---|---|---|---|
| `--cream` | `#FDFAF5` | Page background | — |
| `--sand` | `#F2CEAB` | Card and section backgrounds | — |
| `--ink` | `#2B1A0C` | Body text, outlines | 16.06 / 11.30 |
| `--orange` | `#D88248` | Fills, borders, decorative only | 2.80 / 1.97 |
| `--orange-text` | `#A34E1E` | Link and accent text | 5.50 / 3.87 |
| `--muted` | `#6B5238` | Dates, captions, secondary text | 6.98 / 4.91 |

Two usage rules follow from those numbers and are not optional. `--orange`
fails AA at any text size and may only be used for fills, outlines, and
decoration, never for type. `--orange-text` passes AA on cream but not on sand,
so on sand backgrounds it is restricted to large text (24px+, or 19px bold).

All six are defined on `:root`. A dark-mode variant is defined under
`@media (prefers-color-scheme: dark)` so the site does not glare at night, but
there is no user-facing theme switcher.

Typography: a chunky, friendly sans for headings (Fredoka or Baloo 2) paired
with a clean, highly legible sans for body (Inter). Two families only. Loaded
from Google Fonts with `display: swap`.

Shape language: rounded corners at 12–16px, solid 2px ink outlines on cards and
buttons, and a small offset solid shadow rather than a soft blur. This is the
detail that makes the site read as hand-made.

## Content

### Home

- Name, and a one-line description of who he is.
- Profile photo, sourced from `Recruitment/2026 Recruitment/ProfilePhoto.jpg`,
  cropped to a circle with an ink outline.
- The Bento cat sprite as a small mascot accent beside the hero.
- Two featured project cards (Bento, Cognify) linking to their detail pages.
- A one-line mention of UCLA DevX / BruinChat as current club work.
- Links: GitHub, LinkedIn, email.

### Projects index

Full-width cards in a single column. Each card carries title, year, a one-line
hook, stack tags, a screenshot, and a link to the detail page. Two cards at
launch; the layout must not look broken or empty at that count, which is why it
is a single column of large cards rather than a grid.

### Project detail pages

One MDX file per project under `content/projects/`. Frontmatter: `title`,
`year`, `hook`, `stack` (array), `repo`, `cover`, `featured` (boolean).

Body sections, in order: the problem, what was built, how it works
(architecture), screenshots, what broke and how it was fixed, and a repo link.
The "what broke" section is deliberate — it is what separates a real writeup
from a README paraphrase, and it is what a club reader uses to judge whether
the applicant has actually shipped something.

Launch set:

1. **Bento** — a budgeting app where financial discipline raises a virtual pet.
   Expo / React Native, Zustand, expo-sqlite as local source of truth, optional
   Supabase cloud mirror, Jest. Screenshots from the `bento-site` repo
   (`screenshot-{home,journal,money,pet,stats,store}.jpg`).
2. **Cognify** — turns student notes into flashcards, quizzes, and study plans.
   React (Vite) behind Nginx, FastAPI with SQLAlchemy, PostgreSQL 16, OpenAI
   API, Docker Compose. Screenshots already in the public repo.

### Experience

Same card language as projects. Entries, newest first:

1. **SoFi** — Software Engineering Intern, June–Sept 2026. Guardrail evaluation
   pipeline for Coach, SoFi's AI financial guidance platform.
2. **UCLA DevX — BruinChat** — Developer, 2025–Present. Backend for user
   profiles, class enrollment, and chat-group matching on a multi-developer
   agile team.
3. **DECA Inc** — Financial Data Analyst & Development Intern, Sept 2024–June 2025.

Each entry shows a 32px logo mark. Logos are stored in `public/logos/` and
converted to WebP. Using a company's mark to identify that company next to a
role is ordinary nominative use.

Education (UCLA, BS Computer Science, expected June 2028) sits at the bottom of
this page rather than getting its own page.

## Motion

Motion is polish, never spectacle. Three effects total:

1. Sections fade and rise 12px as they enter the viewport, once, not on every scroll.
2. Project and experience cards lift 2px on hover, with the offset shadow growing.
3. The hero mascot swaps mood art once when the user scrolls past the hero, and
   a cosmetic drops onto it on hover.

Everything above is wrapped in a `prefers-reduced-motion: reduce` guard that
disables transforms and transitions entirely. There is no scroll-jacking, no
parallax world, and no animation that delays content becoming readable.

## Architecture

Next.js App Router with static export (`output: 'export'`), Tailwind CSS,
deployed on Vercel. Framer Motion for scroll reveals. MDX for project content.

```
app/
  layout.tsx          Root layout: fonts, nav, footer, color tokens
  page.tsx            Home
  projects/page.tsx   Projects index
  projects/[slug]/    Project detail, generated from MDX
  experience/page.tsx Experience
components/
  Nav.tsx             Site header, active-link state, mobile menu
  ProjectCard.tsx     Card used on home and projects index
  ExperienceItem.tsx  Role entry with logo, dates, bullets
  Mascot.tsx          Bento cat sprite, mood state, cosmetic overlay
  Reveal.tsx          Scroll-reveal wrapper, reduced-motion aware
content/projects/     One MDX file per project
lib/
  projects.ts         Reads and parses MDX frontmatter, sorts, filters featured
  cosmetics.ts        Anchor table placing a cosmetic on the cat sprite
public/
  logos/              sofi, ucla, devx, deca
  projects/           Project screenshots, WebP
  mascot/             Pet sprites, WebP
```

Module boundaries: `lib/projects.ts` is the only code that knows how project
content is stored. Pages ask it for a list or a single project and never touch
the filesystem or parse frontmatter themselves. Swapping MDX for any other
source later touches that one file.

`components/Reveal.tsx` is the only component that knows about Framer Motion.
Every animated section wraps in it, so the reduced-motion guard lives in one
place and cannot be forgotten at a call site.

### Mascot and cosmetics

The cat is the only pet used, and the four Bento scene backdrops are not used
at all — they are app backgrounds that would fight the page rather than sit on
it.

Cosmetic placement is not guesswork. Bento already solved it in
`NekoFinance/src/data/cosmeticAnchors.ts`, where each anchor is expressed as a
fraction of the pet's bounding box. Those fractions port straight to CSS
percentages inside a relatively-positioned sprite wrapper. The cat/happy row,
copied exactly:

| Cosmetic | x | y | width | height | rotate |
|---|---|---|---|---|---|
| `cowboy-hat` | 0.1865 | -0.0487 | 0.5263 | 0.4626 | 15.8 |
| `chef-hat` | 0.1646 | -0.0743 | 0.3657 | 0.3907 | -7.5 |
| `sunglasses` | 0.1825 | 0.2006 | 0.3498 | 0.3338 | -5.1 |
| `sport-glasses` | 0.1407 | 0.1777 | 0.4383 | 0.3497 | -6.2 |
| `bughunter-toy` | 0.0113 | 0.6674 | 0.3597 | 0.3438 | 0 |

The negative `y` values on hats are correct, not typos: the crown of the hat
sits above the top edge of the sprite box, so the wrapper must not clip
overflow.

One inherited inconsistency must be normalized on the way in. Bento's anchor
table keys hats as `'cowboy hat'` with a space, while its asset table keys the
same item as `cowboy_hat`, and `sport-glasses` versus `sport_glasses` diverges
the same way. Copying both tables verbatim yields a cosmetic that renders with
no position. This site uses kebab-case ids throughout, as in the table above.

## Assets

Source art comes from the public `bento-money` repo, so nothing private is
required for the site to build. The `bento-site` screenshots are copied in from
a private repo as files — they ship as ordinary images in `public/`.

Every image is converted to WebP and resized before being committed. This is a
hard requirement, not a nicety: the source pet sprites are 300–500KB each and
the cosmetics 200–450KB. Committing them raw would make the site unusable on a
phone. Target: no single image over 200KB, hero images under
100KB.

Static export (`output: 'export'`) turns off Next's on-demand image optimizer,
so `next/image` would ship a single full-size file to every device no matter
what `sizes` says. Responsive images are therefore generated at build-prep
time: the asset script emits each screenshot at 480px, 768px, and 1200px wide
in WebP, and a `Screenshot` component renders a plain `<img>` with an explicit
`srcset` and `sizes`. `next/image` is configured `unoptimized: true` and used
only where a single fixed-size asset is correct, such as logos and the mascot.

Every image carries explicit `width` and `height` so layout never shifts
during load.

## Accessibility

- Color pairings meet WCAG AA contrast, verified rather than assumed.
- Every image has alt text; decorative sprites get `alt=""`.
- Keyboard navigation reaches every link, with a visible focus ring.
- A skip-to-content link opens the tab order.
- Semantic landmarks: one `<h1>` per page, `<nav>`, `<main>`, `<footer>`.

## Responsive and Mobile Readability

Mobile-first, with one breakpoint at 768px. Most readers will open this on a
phone from a link in an application or a group chat, so phone layout is the
default the site is designed at, not a shrunken desktop.

**Reading comfort.** Body text is 17px minimum on phones, never the 14px that
looks tidy in a mockup and is unreadable in daylight. Line height is 1.6 on
body copy and 1.25 on headings. Measure is capped at 68 characters so lines do
not run edge to edge. Side gutters are 16px minimum, and no element may cause
horizontal scroll at any width down to 320px.

**Type scale.** Headings shrink on phones rather than wrapping into four-line
blocks: the `h1` drops from 48px to 32px, `h2` from 32px to 24px. Headings use
`text-wrap: balance` so they break evenly.

**Touch.** Every link, button, and card hit area is at least 44×44px. Nav items
get vertical padding to reach that height even though the text is short.
Adjacent tap targets are separated by at least 8px so neighbors are not hit by
accident.

**Layout at phone width.** Everything is a single column. Project cards stack
with the screenshot above the text. Experience entries put the logo and role on
one line, dates on the next, rather than compressing a two-column row. Stack
tags wrap freely and never scroll sideways. The mascot shrinks and sits above
the name instead of beside it. The nav collapses to a simple row of three
links, which fits at 320px and avoids needing a hamburger menu at all.

**Images.** Screenshots are served responsively through the `Screenshot`
component's `srcset` with `sizes="(max-width: 768px) 100vw, 768px"`, so phones
download the 480px file rather than a desktop-width one. Tall app screenshots are capped at 70vh so a single image
cannot fill the entire screen and stall scrolling. Every image has explicit
dimensions, so nothing shifts as the page loads.

**Verification.** The site is checked in a real mobile viewport at 320px,
375px, and 390px before it is called done. The check is not "does it fit" but
"is it comfortable to read": no horizontal scroll, no text under 17px, no tap
target under 44px, no heading wrapping past three lines.

## Testing

- Build check: `next build` completes with no type errors.
- Content check: every MDX file parses, and every project renders at its route.
- Link check: no internal link 404s; external repo links resolve.
- Manual pass at 320px, 375px, 390px, and 1440px, with reduced motion both on
  and off. The phone widths check readability against the rules in the
  responsive section, not just that the layout fits.
- Lighthouse: performance and accessibility both 90+.

## Open Decisions

Deferred deliberately, none blocking:

- Custom domain. The site builds and deploys identically with or without one.
  A domain can be pointed at the Vercel deployment at any time with no code change.
- Whether BruinChat later graduates from an experience entry to a project page.
