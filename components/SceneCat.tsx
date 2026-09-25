'use client';

import { useEffect, useRef, useState } from 'react';
import { Mascot } from './Mascot';
import type { CosmeticId, Mood } from '@/lib/cosmetics';

// v3.1 spec: replaces the wormhole/single-traveling-cat mechanic entirely.
// Each scene shows its own cat, in a mood + optional cosmetic + position,
// at every width (see the layout comment further down — in-flow below
// `xl`, absolutely positioned in the gutter at `xl` and up). Leaving the
// scene and scrolling back in advances to the next variant in a fixed
// rotation (never re-randomized on every intersection callback, which
// would flicker while scrolling past).
//
// Client-only and absent from the static export: nothing renders until the
// post-mount effect below flips `mounted`, same pattern as BoxReveal's
// motionEnabled. A no-JS reader sees no cat at all, never a broken one.

type Position = 'left' | 'right' | 'upper' | 'lower';

interface Variant {
  mood: Mood;
  cosmetic?: CosmeticId;
  position: Position;
}

// bughunter-toy was deliberately removed from the repo (commit "Delete
// BugHunt.tsx ... and the dead bughunter-toy cosmetic/asset") along with
// the bug-hunt easter egg it belonged to — there is no anchor data for it
// in lib/cosmetics.ts and no sprite in public/mascot/cosmetics any more, so
// it is left out here rather than referencing a asset that does not exist.
const VARIANT_POOL: Variant[] = [
  { mood: 'happy', cosmetic: 'cowboy-hat', position: 'left' },
  { mood: 'sleep', position: 'right' },
  { mood: 'neutral', cosmetic: 'sunglasses', position: 'upper' },
  { mood: 'sad', position: 'lower' },
  { mood: 'happy', cosmetic: 'sport-glasses', position: 'right' },
  { mood: 'sleep', cosmetic: 'chef-hat', position: 'left' },
  { mood: 'neutral', position: 'lower' },
  { mood: 'sad', cosmetic: 'sunglasses', position: 'upper' },
];

// Two layout strategies, chosen per breakpoint entirely in CSS (one
// element, Tailwind responsive variants — no separate render branch):
//
// Below `xl` (most laptops and every phone), the cat is a normal in-flow
// child of Scene's content column (components/Scene.tsx makes that column
// `flex flex-col` for exactly this). An in-flow element cannot overlap its
// siblings by definition — it pushes layout instead — so this is the
// overlap guarantee at every width that isn't wide enough for a side
// gutter. `order-first`/`order-last` place it above or below the content
// block; `self-start`/`self-end`/`self-center` place it left, right, or
// centered within that column.
//
// At `xl` and up, Scene's content column tops out at max-w-5xl and the
// section itself has grown wide enough to have empty horizontal margin
// outside that column — the cat switches to `xl:absolute` and sits in that
// margin instead (left-3/right-3 sit inside the section's own edge, well
// outside the max-w-5xl column: checked by hand against Scene's own
// padding/max-width — at exactly 1280px there is ~40px of clearance
// between the cat's edge and the content column's edge, growing at wider
// viewports).
const FLOW_POSITION_CLASS: Record<Position, string> = {
  left: 'self-start order-last',
  right: 'self-end order-last',
  upper: 'self-center order-first',
  lower: 'self-center order-last',
};

const GUTTER_POSITION_CLASS: Record<Position, string> = {
  left: 'xl:left-3 xl:top-1/2 xl:-translate-y-1/2',
  right: 'xl:right-3 xl:top-1/2 xl:-translate-y-1/2',
  upper: 'xl:left-3 xl:top-10',
  lower: 'xl:right-3 xl:bottom-10',
};

const SIZE = 76;

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
    // variant switching, no animation.
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

  if (!mounted) return null;

  const variant = VARIANT_POOL[index % VARIANT_POOL.length];
  const animateClass = motionEnabled ? 'cat-pop-in' : '';

  return (
    <div
      // Reduced-motion: key never changes, so this never remounts and never
      // replays an entrance animation. Full motion: a fresh key on every
      // re-entry restarts the pop-in for the newly-picked variant.
      key={motionEnabled ? popKey : 'static'}
      aria-hidden="true"
      className={`pointer-events-none my-6 flex xl:absolute xl:m-0 xl:block ${FLOW_POSITION_CLASS[variant.position]} ${GUTTER_POSITION_CLASS[variant.position]} ${animateClass}`}
    >
      <Mascot
        mood={variant.mood}
        cosmetic={variant.cosmetic}
        cosmeticVisible={Boolean(variant.cosmetic)}
        size={SIZE}
      />
    </div>
  );
}
