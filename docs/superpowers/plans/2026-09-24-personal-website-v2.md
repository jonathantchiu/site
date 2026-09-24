# Personal Website v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Relight the shipped site to a warm-white palette, convert entries to compact scannable rows with Experience first, and add a cardboard-box reveal and a bug hunt driven by the Bento cat.

**Architecture:** The live site is Next 16 App Router, statically exported to GitHub Pages under the `/site` base path. This plan swaps design tokens, introduces one shared `EntryRow`, and adds two self-contained client components for the interactive layer. No change to content storage or routing.

**Tech Stack:** Next 16, React 19, TypeScript, Tailwind 3.4, Vitest, framer-motion (confined to `Reveal.tsx`).

**Spec:** `docs/superpowers/specs/2026-09-24-personal-website-v2-amendment.md`, amending `docs/superpowers/specs/2026-09-24-personal-website-design.md`

## Global Constraints

- **New tokens, exact values.** `--page #FDFCFA`, `--card #FFFFFF`, `--hairline #EDE8E2`, `--ink #22201D`, `--muted #6E6862`, `--accent-text #B04E1B`, `--accent #C25A22`.
- **Dark mode.** `--page #14130F`, `--card #1C1A16`, `--hairline #2E2B25`, `--ink #F2EFE9`, `--muted #A8A199`, `--accent-text #E8874D`.
- **`--accent` may never be used for text.** 4.29:1 on page, fails AA at every size. Decoration only.
- **The v1 tokens `--cream`, `--sand`, `--orange`, `--orange-text` are deleted, not aliased.** A component still referencing them must fail to build or fail a test.
- **No content is ever gated behind an interaction.** Every section's content is in the static HTML. Box and bug are `aria-hidden` overlays.
- **Under `prefers-reduced-motion` or with no JS, neither the box nor the bug renders.**
- Body text 17px minimum; measure 68 characters; tap targets 44×44px and 8px apart; no horizontal scroll at 320px; one `<h1>` per page; explicit width/height on every image; `alt=""` on decorative sprites.
- **`components/Reveal.tsx` stays the ONLY file importing framer-motion.**
- **All asset paths go through `assetPath()`** so they resolve under `/site`.
- Commit per task, Conventional Commits, no AI-attribution lines.

---

### Task 1: Swap the palette and shape language

**Files:** `app/globals.css`, `tailwind.config.ts`, `__tests__/tokens.test.ts`, plus every component referencing an old token: `components/{Nav,ProjectCard,ExperienceItem,Screenshot,MascotScene}.tsx`, `app/{page,layout,not-found}.tsx`, `app/projects/page.tsx`, `app/projects/[slug]/page.tsx`, `app/experience/page.tsx`

- [ ] **Step 1: Replace the tokens in `app/globals.css`** with the seven light values and the six dark values from the Global Constraints. Delete the old four entirely.
- [ ] **Step 2: Update `tailwind.config.ts`** — colors become `page`, `card`, `hairline`, `ink`, `muted`, `accent-text`, `accent`. Replace `shadow-offset`/`shadow-offset-lg` with `shadow-soft` (`0 1px 3px rgb(0 0 0 / 0.06)`) and `shadow-soft-lg` (`0 4px 12px rgb(0 0 0 / 0.08)`). Change `borderRadius.card` from 16px to 10px.
- [ ] **Step 3: Rewrite `__tests__/tokens.test.ts`** for the new names and thresholds: ink/page ≥ 4.5, accent-text/page ≥ 4.5, muted/card ≥ 4.5, and accent/page < 4.5 (documenting that it is decoration-only). Add the same four assertions for the dark-mode block — v1's regex matched only the first `:root` and left dark mode untested.
- [ ] **Step 4: Update every component's classNames.** `bg-sand` and `bg-cream` become `bg-card`/`bg-page`; `border-2 border-ink` becomes `border border-hairline`; `shadow-offset` becomes `shadow-soft`; `text-orange-text` becomes `text-accent-text`; `decoration-orange` becomes `decoration-accent`.
- [ ] **Step 5: Prove no old token survives.** `grep -rn 'cream\|sand\|orange' app components lib --include='*.tsx' --include='*.ts' --include='*.css'` returns nothing but unrelated prose. Add a test asserting `app/globals.css` contains none of the four deleted token names.
- [ ] **Step 6: Verify.** `npm test` passes, `NEXT_PUBLIC_BASE_PATH=/site npm run build` succeeds, no inline `opacity:0` in the output.
- [ ] **Step 7: Commit.** `style: relight the site to a warm-white palette`

---

### Task 2: Compact entry rows, Experience first

**Files:** create `components/EntryRow.tsx`, `__tests__/entryRow.test.tsx`; modify `app/page.tsx`, `app/experience/page.tsx`, `app/projects/page.tsx`, `lib/experience.ts`, `components/ExperienceItem.tsx`

**Interfaces:**
```typescript
export interface EntryRowProps {
  href: string;          // internal route or external URL
  logo?: string;         // path passed through assetPath by the component
  title: string;         // org or project name
  subtitle: string;      // role, or project hook
  date: string;
  blurb?: string;        // one sentence
  external?: boolean;
}
export function EntryRow(props: EntryRowProps): JSX.Element;
```

- [ ] **Step 1: Add a one-sentence `blurb` to each role in `lib/experience.ts`.** Do not delete the existing `bullets` — `/experience` keeps using them. Blurbs must be factually consistent with the bullets they summarize.
- [ ] **Step 2: Write the failing test** asserting a row renders title, subtitle, date and blurb; that the whole row is one link to `href`; that the logo has `alt=""`; that the logo src is base-path-prefixed; and that the row's click target is at least 44px tall.
- [ ] **Step 3: Implement `EntryRow`** — logo and title and date on one line with the date right-aligned at `sm:` and wrapping beneath below it, subtitle on line two, blurb on line three, a hairline divider between rows, hover raising `shadow-soft` to `shadow-soft-lg`.
- [ ] **Step 4: Rebuild the home page** with Experience above Projects, both as `EntryRow` lists, each section ending in a link to its full page. Keep the hero, the mascot, and the Elsewhere links.
- [ ] **Step 5: Convert `/projects`** to `EntryRow` and `/experience` to `EntryRow` plus the retained bullets beneath each row.
- [ ] **Step 6: Verify** tests, build, one `<h1>` per page, and no horizontal scroll at 320px.
- [ ] **Step 7: Commit.** `feat: compact entry rows with experience first`

---

### Task 3: Cardboard box reveal

**Files:** create `components/BoxReveal.tsx`, `components/CardboardBox.tsx`, `__tests__/boxReveal.test.tsx`; modify `app/page.tsx`

- [ ] **Step 1: Draw the box** as inline SVG in `CardboardBox.tsx` — Bento's style: 3px `#2B1A0C` outline, `#C89A6A` face, `#B5824F` side, flap lines, slight rotation. No external asset. `aria-hidden`, `pointer-events` only while covering.
- [ ] **Step 2: Write the failing test.** Children are always rendered in the DOM regardless of reveal state — this is the spec's hard requirement and the test that matters most. Also: no box renders when `prefers-reduced-motion` is set; once revealed the overlay is gone; the overlay carries `aria-hidden="true"`.
- [ ] **Step 3: Implement `BoxReveal`.** `'use client'`. Children render unconditionally. An overlay sits above them until revealed. IntersectionObserver triggers auto-reveal 400ms after entry; a click reveals immediately with the cat pouncing in from the side. Revealed state is one-way. No framer-motion — CSS transitions and a keyframed tumble.
- [ ] **Step 4: Guard no-JS.** Initial server render has no overlay; the overlay mounts only after hydration, so a reader without JS sees plain content. Assert this by grepping the built HTML for the box's SVG and finding nothing.
- [ ] **Step 5: Wrap the home page's Experience and Projects sections.**
- [ ] **Step 6: Verify** tests, build, no `opacity:0` in output, 320px clean, and that the box's SVG is absent from static HTML.
- [ ] **Step 7: Commit.** `feat: cardboard box reveal for home page sections`

---

### Task 4: Bug hunt

**Files:** create `components/BugHunt.tsx`, `__tests__/bugHunt.test.tsx`; modify `app/layout.tsx`

- [ ] **Step 1: Write the failing test** — the bug does not render under `prefers-reduced-motion`; the counter reads and writes `localStorage` inside try/catch and renders correctly when `localStorage` throws; clicking increments.
- [ ] **Step 2: Implement `BugHunt`.** `'use client'`. A bug SVG crosses a randomized edge path every 20–40s, `position: fixed`, `pointer-events: auto` on the bug alone and `none` on its container so it never blocks links. Click triggers a cat pounce at that point and increments the count.
- [ ] **Step 3: Render the counter** quietly in the footer: "bugs caught: N", hidden entirely at zero.
- [ ] **Step 4: Verify** tests, build, and that the bug never overlaps body text at 320px.
- [ ] **Step 5: Commit.** `feat: bug hunt easter egg`

---

### Task 5: Verify and deploy

- [ ] **Step 1:** `npm test`; `NEXT_PUBLIC_BASE_PATH=/site npm run build`.
- [ ] **Step 2:** Every image src and srcSet entry in the built HTML starts with `/site/`.
- [ ] **Step 3:** No inline `opacity:0` in any built HTML.
- [ ] **Step 4:** Measure in a headless browser at 320/375/390 on all five routes: `scrollWidth === clientWidth`, no body text under 17px, no tap target under 44px. Report measured numbers.
- [ ] **Step 5:** With `prefers-reduced-motion: reduce`, confirm no box and no bug render and all content is visible.
- [ ] **Step 6:** Lighthouse performance and accessibility both ≥ 90 against the base-path build.
- [ ] **Step 7:** Commit, merge to main, push. The workflow deploys. Verify all five live routes return 200.
