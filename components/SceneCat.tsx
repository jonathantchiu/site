'use client';

import { useEffect, useRef, useState } from 'react';
import { Mascot } from './Mascot';
import type { CosmeticId, Mood } from '@/lib/cosmetics';

// v3.2 spec: the cat now sits ON one of the scene's own hairline divider
// lines (Scene.tsx's header rule, or any EntryRow's bottom border — both
// share the literal `border-t border-hairline`/`border-b border-hairline`
// class pair, which is how this component finds them without needing
// either component to opt in — see the comment above the query below for
// why *both* classes are required) instead of floating in a side gutter.
// It sits toward the right side of whichever
// line it lands on, and its x position is randomized only into the
// stretches of that line that have no visible content (text, images,
// icons, background art) sitting directly above them —
// measured at runtime against the scene's actual layout, never hardcoded,
// so it keeps working if copy changes length. See computePlacement below.
//
// Client-only and absent from the static export: nothing renders until the
// post-mount effect below flips `mounted`, same pattern as BoxReveal's
// motionEnabled. A no-JS reader sees no cat at all, never a broken one.

interface Variant {
  mood: Mood;
  cosmetic?: CosmeticId;
}

// bughunter-toy was deliberately removed from the repo (commit "Delete
// BugHunt.tsx ... and the dead bughunter-toy cosmetic/asset") along with
// the bug-hunt easter egg it belonged to — there is no anchor data for it
// in lib/cosmetics.ts and no sprite in public/mascot/cosmetics any more, so
// it is left out here rather than referencing a asset that does not exist.
const VARIANT_POOL: Variant[] = [
  { mood: 'happy', cosmetic: 'cowboy-hat' },
  { mood: 'sleep' },
  { mood: 'neutral', cosmetic: 'sunglasses' },
  { mood: 'sad' },
  { mood: 'happy', cosmetic: 'sport-glasses' },
  { mood: 'sleep', cosmetic: 'chef-hat' },
  { mood: 'neutral' },
  { mood: 'sad', cosmetic: 'sunglasses' },
];

// The size is not chosen from a fixed ladder any more — it falls straight
// out of the geometry of whichever (line, x-interval) pair wins the
// search below: size = min(interval width, available height above the
// line at that interval). MAX just keeps a huge empty area (e.g. a
// section with nothing else on it) from producing a comically large cat;
// FLOOR is the smallest a cat is allowed to render at before this scene
// is left without one — phones get a lower floor because their dividers
// are narrower and their rows read fine with a slightly smaller cat, but
// a cat that small would look like a speck on a wide desktop line where
// there was never a need to shrink that far.
const DESKTOP_MAX = 120;
const DESKTOP_FLOOR = 64;
const PHONE_MAX = 88;
const PHONE_FLOOR = 56;
const PHONE_BREAKPOINT = 640;

function sizeBoundsForViewport(): { max: number; floor: number } {
  return window.innerWidth < PHONE_BREAKPOINT
    ? { max: PHONE_MAX, floor: PHONE_FLOOR }
    : { max: DESKTOP_MAX, floor: DESKTOP_FLOOR };
}

// Two size-vs-position candidates within a few pixels of each other are
// treated as equally good, at which point the right-side preference below
// breaks the tie rather than the (often arbitrary) few extra pixels of
// size winning outright.
const SIZE_TIE_TOLERANCE = 8;

interface Placement {
  left: number;
  top: number;
  size: number;
}

// Marks the cat's own wrapper so the occlusion scan below can exclude its
// sprite and cosmetic images from "content the cat must avoid" — without
// this, a still-mounted cat from the previous placement would read as an
// obstacle to itself while a new placement is being computed.
const SCENE_CAT_MARKER = 'data-scene-cat';

function hasBackgroundImage(el: Element): boolean {
  const bg = window.getComputedStyle(el).backgroundImage;
  return Boolean(bg && bg !== 'none');
}

// Anything a reader would actually see and read as content counts as an
// obstacle, not just text: <img>s (the profile photo, EntryRow logos,
// project thumbnails), <svg>s (the cardboard box), anything painted via
// background-image, and — as a fallback — any leaf element (no element
// children) with real, non-whitespace text. This is deliberately generic
// rather than a list of known selectors (headings, EntryRow's
// title/subtitle/date, project hooks, the hover arrow, the section
// number badge, a specific photo) so it keeps working if the page's
// content changes without this file needing to change with it.
function isOccludingElement(el: Element): boolean {
  if (el.closest(`[${SCENE_CAT_MARKER}]`)) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === 'img' || tag === 'svg') return true;
  if (hasBackgroundImage(el)) return true;
  if (el.childElementCount > 0) return false;
  const text = el.textContent?.trim();
  return Boolean(text && text.length > 0);
}

// Both of the scene's candidate dividers share the `border-hairline`
// color class; which edge of the element the line actually renders on
// depends on whether it is Scene's header rule (`border-t`) or an
// EntryRow's bottom rule (`border-b`).
function lineY(el: Element, rect: DOMRect): number {
  return el.classList.contains('border-t') ? rect.top : rect.bottom;
}

interface Candidate {
  start: number;
  end: number;
  y: number;
  size: number;
  rightHalf: boolean;
}

// For one divider line, finds every (x-interval, available-height) pair by
// sweeping the obstacles that sit above it, rather than testing a single
// guessed size against the whole width at once. Between any two obstacle
// edges the set of obstacles overlapping that slice of x is constant, so
// the "ceiling" (the bottom edge of the lowest/closest obstacle above the
// line) is constant there too — that slice's available height is exactly
// `line.y - ceiling`, and its cat-size potential is
// `min(sliceWidth, availableHeight)`. A slice a real obstacle actually
// crosses through (its bottom is at or past the line, not above it) is
// dropped entirely: there is no available height there at all, not a
// small one.
function candidatesForDivider(
  dRect: DOMRect,
  y: number,
  occludingRects: DOMRect[],
  max: number,
  floor: number
): Candidate[] {
  const relevant = occludingRects
    .filter((r) => r.top < y && r.right > dRect.left && r.left < dRect.right)
    .map((r) => ({
      start: Math.max(r.left, dRect.left),
      end: Math.min(r.right, dRect.right),
      bottom: r.bottom,
    }))
    .filter((r) => r.end > r.start);

  const breakpoints = new Set<number>([dRect.left, dRect.right]);
  for (const r of relevant) {
    breakpoints.add(r.start);
    breakpoints.add(r.end);
  }
  const xs = Array.from(breakpoints).sort((a, b) => a - b);

  const mid = dRect.left + dRect.width / 2;
  const candidates: Candidate[] = [];

  for (let i = 0; i < xs.length - 1; i++) {
    const start = xs[i];
    const end = xs[i + 1];
    const width = end - start;
    if (width <= 0) continue;
    const midpoint = (start + end) / 2;

    const covering = relevant.filter((r) => r.start <= midpoint && r.end >= midpoint);
    // An obstacle whose bottom edge is at or below the line actually
    // crosses through this slice's column — no cat can stand there at
    // any height.
    if (covering.some((r) => r.bottom >= y)) continue;

    const ceilingBottom = covering.length > 0 ? Math.max(...covering.map((r) => r.bottom)) : null;
    // A cosmetic (a hat, in particular) can render slightly above the cat
    // sprite's own box — when a real obstacle defines the ceiling, hold
    // back a little of the measured height so a brim never lands on it.
    // An interval with no obstacle above it at all has no such neighbor to
    // protect against, so it isn't padded — otherwise open whitespace
    // would arbitrarily cap out below `max` for no reason.
    const availableHeight =
      ceilingBottom === null ? max : (y - ceilingBottom) * 0.85;

    const size = Math.min(width, Math.max(0, availableHeight), max);
    if (size < floor) continue;

    candidates.push({ start, end, y, size, rightHalf: midpoint >= mid });
  }

  return candidates;
}

// Reads every rect it needs up front (dividers, then occluding elements) before
// doing any math, so a caller running this inside a rAF does one
// measurement pass rather than interleaving reads and writes.
function computePlacement(sceneEl: HTMLElement): Placement | null {
  const sectionRect = sceneEl.getBoundingClientRect();
  // `border-hairline` alone is not enough to identify a divider: the same
  // color class is also used on plain decorative framing (the profile
  // photo's circular border, pill/card borders elsewhere) that sets
  // `border` on all four sides rather than `border-t`/`border-b`. Require
  // one of those two on the same element, matching exactly the two real
  // divider shapes (Scene's header rule, an EntryRow's own row element).
  const dividerEls = Array.from(
    sceneEl.querySelectorAll<HTMLElement>('.border-t.border-hairline, .border-b.border-hairline')
  );
  if (dividerEls.length === 0) return null;

  const dividers = dividerEls
    .map((el) => {
      const rect = el.getBoundingClientRect();
      return { rect, y: lineY(el, rect) };
    })
    .filter((d) => d.rect.width > 0);
  if (dividers.length === 0) return null;

  const occludingRects = Array.from(sceneEl.querySelectorAll<HTMLElement>('*'))
    .filter(isOccludingElement)
    .map((el) => el.getBoundingClientRect())
    .filter((r) => r.width > 0 && r.height > 0);

  const { max, floor } = sizeBoundsForViewport();

  const candidates = dividers.flatMap(({ rect, y }) =>
    candidatesForDivider(rect, y, occludingRects, max, floor)
  );
  if (candidates.length === 0) return null;

  // Maximize size first — the whole point of measuring the real rectangle
  // instead of guessing a size is that the biggest cat that actually fits
  // anywhere in the scene wins. Only among candidates within a few pixels
  // of that best size does the right-side preference get to pick.
  const bestSize = Math.max(...candidates.map((c) => c.size));
  const comparable = candidates.filter((c) => c.size >= bestSize - SIZE_TIE_TOLERANCE);
  const rightComparable = comparable.filter((c) => c.rightHalf);
  const pool = rightComparable.length > 0 ? rightComparable : comparable;

  const chosen = pool[Math.floor(Math.random() * pool.length)];
  const size = chosen.size;
  const maxLeft = chosen.end - size;
  const left = chosen.start + Math.random() * Math.max(0, maxLeft - chosen.start);

  return {
    left: left - sectionRect.left,
    top: chosen.y - size - sectionRect.top,
    size,
  };
}

export function SceneCat({
  sceneId,
  startIndex,
}: {
  sceneId: string;
  // Still accepted from callers (app/page.tsx passes it per scene) even
  // though nothing in this component reads it any more: the halo that
  // used to key off it has been removed at the owner's request (see
  // note above VARIANT_POOL's sibling constants — the halo existed only
  // to separate the cat from the dark band's ground). Kept in the prop
  // type rather than stripped from every call site for a purely cosmetic
  // change with no behavioral upside.
  band: 'light' | 'warm' | 'dark';
  startIndex: number;
}) {
  // Same "nothing until a post-mount effect says so" pattern as BoxReveal
  // and the old MascotScene: keeps this entirely out of the server-rendered
  // and pre-hydration HTML.
  const [mounted, setMounted] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [index, setIndex] = useState(startIndex);
  const [popKey, setPopKey] = useState(0);
  const [placement, setPlacement] = useState<Placement | null>(null);
  // Bumped to force a recompute without touching `index` (which also
  // restarts the pop-in animation and would make BoxReveal's own reveal
  // look like a mood change). See the settle-recompute effect below.
  const [settleTick, setSettleTick] = useState(0);
  const wasIntersectingRef = useRef(false);
  // A fresh IntersectionObserver fires once immediately on observe() with
  // whatever the current intersection state already is (e.g. the hero
  // scene is already on screen at load). That first callback must only
  // seed wasIntersectingRef, never count as a "re-entry" — otherwise every
  // scene already in view on load would silently skip its startIndex
  // variant before the reader ever sees it.
  const hasSeenFirstCallbackRef = useRef(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setMotionEnabled(!query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    // Reduced-motion readers get one static cat forever: no observer, no
    // variant switching, no animation. Placement still runs (below) so
    // that static cat still sits on a line rather than nowhere.
    if (!mounted || !motionEnabled) return;
    const el = document.getElementById(sceneId);
    if (!el || typeof IntersectionObserver === 'undefined') return;
    hasSeenFirstCallbackRef.current = false;
    let settleTimer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        // Only advance on the false -> true edge (a genuine re-entry) after
        // the very first callback, not on every callback while the scene
        // is scrolling past — that would flicker through variants
        // mid-scroll instead of switching once per visit.
        if (
          hasSeenFirstCallbackRef.current &&
          isIntersecting &&
          !wasIntersectingRef.current
        ) {
          setIndex((i) => (i + 1) % VARIANT_POOL.length);
          setPopKey((k) => k + 1);
        }
        // A scene's *first* arrival in view (unlike a later re-entry)
        // doesn't bump `index`, so it wouldn't otherwise trigger the
        // recompute effect below — but this is exactly the moment
        // BoxReveal's cardboard box, sitting on top of the EntryRow list,
        // starts (and ~1.3s later finishes) toppling out of the way. A
        // placement computed right now would still see that box as an
        // obstacle covering the row dividers; queue one more recompute
        // timed to land after it's gone, so the freed-up space actually
        // gets used instead of leaving a scene without a cat until the
        // reader happens to scroll away and back. Harmless to also queue
        // this on later re-entries — the box has already unmounted by
        // then, and one extra measurement changes nothing.
        if (isIntersecting && !wasIntersectingRef.current) {
          if (settleTimer) clearTimeout(settleTimer);
          settleTimer = setTimeout(() => setSettleTick((t) => t + 1), 1500);
        }
        hasSeenFirstCallbackRef.current = true;
        wasIntersectingRef.current = isIntersecting;
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (settleTimer) clearTimeout(settleTimer);
    };
  }, [mounted, motionEnabled, sceneId]);

  // Recomputes placement whenever the variant advances (so a re-entry
  // moves the cat to a new valid spot on the line, not just a new mood),
  // once on mount, and once more via `settleTick` after a scene's first
  // reveal (see the intersection observer above). Measurement happens
  // after paint (double rAF) so it reads real, settled layout rather than
  // racing it, and is a pure read pass followed by a single state write
  // rather than interleaved read/write calls that would thrash layout.
  useEffect(() => {
    if (!mounted) return;
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const el = document.getElementById(sceneId);
        setPlacement(el ? computePlacement(el as HTMLElement) : null);
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [mounted, sceneId, index, settleTick]);

  // Free intervals change with layout, so a resize needs the same
  // recompute — debounced onto a single rAF per burst of resize events.
  useEffect(() => {
    if (!mounted) return;
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = document.getElementById(sceneId);
        setPlacement(el ? computePlacement(el as HTMLElement) : null);
      });
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, [mounted, sceneId]);

  if (!mounted || !placement) return null;

  const variant = VARIANT_POOL[index % VARIANT_POOL.length];
  const animateClass = motionEnabled ? 'cat-pop-in' : '';

  return (
    <div
      // Reduced-motion: key never changes, so this never remounts and never
      // replays an entrance animation. Full motion: a fresh key on every
      // re-entry restarts the pop-in for the newly-picked variant.
      key={motionEnabled ? popKey : 'static'}
      aria-hidden="true"
      data-scene-cat=""
      className={`pointer-events-none ${animateClass}`}
      style={{
        position: 'absolute',
        left: placement.left,
        top: placement.top,
        width: placement.size,
        height: placement.size,
      }}
    >
      <Mascot
        mood={variant.mood}
        cosmetic={variant.cosmetic}
        cosmeticVisible={Boolean(variant.cosmetic)}
        size={placement.size}
      />
    </div>
  );
}
