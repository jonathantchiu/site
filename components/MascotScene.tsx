'use client';

import { useEffect, useRef, useState } from 'react';
import { Mascot } from './Mascot';
import { Portal } from './Portal';
import { useActiveHomeSection } from '@/lib/useActiveHomeSection';
import type { CosmeticId, Mood } from '@/lib/cosmetics';

// Owner's brief: "there's the one cat at the top. i want it to wormhole
// down, same size. stay there when the scroll is on the page." This file
// owns the hero leg of that single cat's journey: the plain static look a
// no-JS or reduced-motion reader always sees, plus (once mounted, with
// motion allowed) vanishing into a portal when the reader scrolls past the
// hero and popping back out of one when they scroll back up to it. The
// experience/projects legs live in TravelingCat.tsx, which shares the same
// useActiveHomeSection() read of the DOM so neither file has to know about
// the other directly.
//
// framer-motion stays confined to Reveal.tsx — this uses plain React state
// and the cat-wormhole-* CSS keyframes in app/globals.css instead.

const MOOD: Mood = 'happy';
const HOVER_COSMETIC: CosmeticId = 'sunglasses';

// Keep in sync with the cat-wormhole-exit / cat-wormhole-enter keyframe
// durations in app/globals.css.
const EXIT_DURATION = 420;
const ENTER_DURATION = 480;

type Phase = 'parked' | 'leaving' | 'gone' | 'entering';

export function MascotScene() {
  // Default state (and the only state rendered before hydration, so it is
  // also what static export bakes into the HTML): the plain cat, parked,
  // no portal in sight. That is the "sensible default" a no-JS reader
  // sees, and it is also exactly what a reduced-motion reader keeps
  // forever, since motionEnabled never flips true for them.
  const [hovered, setHovered] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [phase, setPhase] = useState<Phase>('parked');
  // Tracks whether the *previous* render was at the hero, so the effect
  // below only reacts to a genuine crossing, not every re-render.
  const wasHeroRef = useRef(true);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setMotionEnabled(!query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const activeSection = useActiveHomeSection(motionEnabled);
  const atHero = activeSection === 'hero';

  useEffect(() => {
    if (!motionEnabled) return;
    const wasHero = wasHeroRef.current;
    wasHeroRef.current = atHero;
    if (wasHero === atHero) return; // no crossing, nothing to animate

    if (atHero) {
      // Scrolled back up: pop in through a portal, then settle to the
      // plain static look (same as the very first paint). This is a
      // deliberate reaction to activeSection crossing into 'hero', not
      // state derived from props/state during render, so the synchronous
      // setState here is the correct tool, not something to hoist out.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase('entering');
      const t = setTimeout(() => setPhase('parked'), ENTER_DURATION);
      return () => clearTimeout(t);
    }

    // Scrolled away: vanish into a portal in place, then stay gone —
    // TravelingCat picks the cat up from here.
    setPhase('leaving');
    const t = setTimeout(() => setPhase('gone'), EXIT_DURATION);
    return () => clearTimeout(t);
  }, [atHero, motionEnabled]);

  // Once truly away from the hero, render nothing here at all — there is
  // only ever one cat on screen, and while it is parked at another
  // section this slot stays empty.
  if (motionEnabled && phase === 'gone') return null;

  const cosmeticVisible = motionEnabled && hovered && phase === 'parked';
  const hoverHandlers =
    motionEnabled && phase === 'parked'
      ? { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) }
      : {};

  const travelClass =
    phase === 'leaving' ? 'cat-wormhole-exit' : phase === 'entering' ? 'cat-wormhole-enter' : '';
  const showPortalArt = motionEnabled && travelClass !== '';

  return (
    <>
      {/* order-first: on the stacked mobile layout this must sit above the
          name (spec), even though in the desktop row it is the sm:hidden
          twin of the trailing desktop instance below. */}
      <div
        className={`relative order-first shrink-0 sm:hidden ${travelClass}`}
        {...hoverHandlers}
      >
        {showPortalArt && (
          <Portal className="pointer-events-none absolute inset-0 h-full w-full" />
        )}
        <Mascot
          mood={MOOD}
          cosmetic={HOVER_COSMETIC}
          cosmeticVisible={cosmeticVisible}
          size={92}
        />
      </div>
      <div className={`relative hidden shrink-0 sm:block ${travelClass}`} {...hoverHandlers}>
        {showPortalArt && (
          <Portal className="pointer-events-none absolute inset-0 h-full w-full" />
        )}
        <Mascot
          mood={MOOD}
          cosmetic={HOVER_COSMETIC}
          cosmeticVisible={cosmeticVisible}
          size={120}
        />
      </div>
    </>
  );
}
