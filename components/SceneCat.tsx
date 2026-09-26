'use client';

import { useEffect, useRef, useState } from 'react';
import { Mascot } from './Mascot';
import type { CosmeticId, Mood } from '@/lib/cosmetics';

// v3.2 spec: the cat now sits ON one of the scene's own hairline divider
// lines (Scene.tsx's header rule, or any EntryRow's bottom border — both
// share the literal `border-hairline` class, which is how this component
// finds them without needing either component to opt in) instead of
// floating in a side gutter. It sits toward the right side of whichever
// line it lands on, and its x position is randomized only into the
// stretches of that line that have no text sitting directly above them —
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

// Sizes tried, largest first: on a wide screen the divider lines are long
// enough that the full-size cat almost always finds room. On a phone, a
// project's date column above the line may be the only free stretch and
// it can be narrower than 76px, so the cat shrinks in steps until it fits
// or, at the smallest step, still doesn't — in which case it is omitted
// for that scene entirely rather than ever drawn over text.
const CAT_SIZES = [76, 64, 52, 40];

interface Placement {
  left: number;
  top: number;
  size: number;
}

interface Interval {
  start: number;
  end: number;
}

// A leaf element (no element children) with real, non-whitespace text is
// treated as "text-bearing" for occlusion purposes. This is deliberately
// generic rather than a list of known selectors (headings, EntryRow's
// title/subtitle/date, project hooks, the hover arrow, the section
// number badge) so it keeps working if the page's copy or structure
// changes without this file needing to change with it.
function isTextBearing(el: Element): boolean {
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

function mergeIntervals(intervals: Interval[]): Interval[] {
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  const merged: Interval[] = [];
  for (const cur of sorted) {
    const last = merged[merged.length - 1];
    if (last && cur.start <= last.end) {
      last.end = Math.max(last.end, cur.end);
    } else {
      merged.push({ ...cur });
    }
  }
  return merged;
}

// Reads every rect it needs up front (dividers, then text elements) before
// doing any math, so a caller running this inside a rAF does one
// measurement pass rather than interleaving reads and writes.
function computePlacement(sceneEl: HTMLElement): Placement | null {
  const sectionRect = sceneEl.getBoundingClientRect();
  const dividerEls = Array.from(sceneEl.querySelectorAll<HTMLElement>('.border-hairline'));
  if (dividerEls.length === 0) return null;

  const dividers = dividerEls
    .map((el) => {
      const rect = el.getBoundingClientRect();
      return { rect, y: lineY(el, rect) };
    })
    .filter((d) => d.rect.width > 0);
  if (dividers.length === 0) return null;

  const textRects = Array.from(sceneEl.querySelectorAll<HTMLElement>('*'))
    .filter(isTextBearing)
    .map((el) => el.getBoundingClientRect())
    .filter((r) => r.width > 0 && r.height > 0);

  for (const size of CAT_SIZES) {
    // A cosmetic (a hat, in particular) can render slightly above the
    // cat sprite's own box — pad the text-avoidance strip so a brim never
    // lands on a glyph even though the wrapper box itself stays exactly
    // `size` tall.
    const pad = Math.round(size * 0.15);
    const candidates: Array<{ start: number; end: number; y: number }> = [];

    for (const { rect: dRect, y } of dividers) {
      const stripTop = y - size - pad;
      const stripBottom = y;

      const occupied = textRects
        .filter((tRect) => tRect.bottom > stripTop && tRect.top < stripBottom)
        .map((tRect) => ({
          start: Math.max(tRect.left, dRect.left),
          end: Math.min(tRect.right, dRect.right),
        }))
        .filter((iv) => iv.end > iv.start);

      const merged = mergeIntervals(occupied);

      const free: Interval[] = [];
      let cursor = dRect.left;
      for (const iv of merged) {
        if (iv.start > cursor) free.push({ start: cursor, end: iv.start });
        cursor = Math.max(cursor, iv.end);
      }
      if (cursor < dRect.right) free.push({ start: cursor, end: dRect.right });

      // Right-half only, as a hard rule rather than a mere preference: a
      // candidate must be able to sit entirely at or past the divider's
      // midpoint, so its centre always lands in the right half. A free
      // stretch that only exists left of centre is never used — at this
      // size, on this divider — even if it is wide enough, per the
      // owner's "on the right side" requirement.
      const mid = dRect.left + dRect.width / 2;
      for (const iv of free) {
        const rightStart = Math.max(iv.start, mid);
        if (iv.end - rightStart >= size) {
          candidates.push({ start: rightStart, end: iv.end, y });
        }
      }
    }

    if (candidates.length === 0) continue;

    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    const maxLeft = chosen.end - size;
    const left = chosen.start + Math.random() * Math.max(0, maxLeft - chosen.start);

    return {
      left: left - sectionRect.left,
      top: chosen.y - size - sectionRect.top,
      size,
    };
  }

  return null;
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
        hasSeenFirstCallbackRef.current = true;
        wasIntersectingRef.current = isIntersecting;
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [mounted, motionEnabled, sceneId]);

  // Recomputes placement whenever the variant advances (so a re-entry
  // moves the cat to a new valid spot on the line, not just a new mood)
  // and once on mount. Measurement happens after paint (double rAF) so it
  // reads real, settled layout rather than racing it, and is a pure read
  // pass followed by a single state write rather than interleaved
  // read/write calls that would thrash layout.
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
  }, [mounted, sceneId, index]);

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
