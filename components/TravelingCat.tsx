'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Mascot } from './Mascot';
import { Portal } from './Portal';
import { useActiveHomeSection, type HomeSectionId } from '@/lib/useActiveHomeSection';
import type { CosmeticId, Mood } from '@/lib/cosmetics';

// The experience/projects legs of the single hero cat's journey (the hero
// leg itself lives in MascotScene.tsx). Reads the same "which section is
// active" signal as MascotScene via useActiveHomeSection, so the two never
// need to talk to each other directly, and portals its one live cat
// instance into whichever of the anchor slots (rendered by page.tsx,
// `#experience-cat-anchor` / `#projects-cat-anchor`) belongs to the active
// section. When the reader is at the hero or past Projects, this renders
// nothing at all.
//
// framer-motion stays confined to Reveal.tsx — this uses plain React
// state and the cat-wormhole-* CSS keyframes in app/globals.css.

const MOOD: Mood = 'happy';
const HOVER_COSMETIC: CosmeticId = 'sunglasses';

// Keep in sync with the cat-wormhole-exit / cat-wormhole-enter keyframe
// durations in app/globals.css, and with MascotScene's own copies of the
// same constants (the hero leg has to match pace with this one).
const EXIT_DURATION = 420;
const ENTER_DURATION = 480;

type Section = 'experience' | 'projects';
type Phase = 'entering' | 'parked' | 'leaving';

const ANCHOR_IDS: Record<Section, string> = {
  experience: 'experience-cat-anchor',
  projects: 'projects-cat-anchor',
};

function targetFor(section: HomeSectionId): Section | null {
  return section === 'experience' || section === 'projects' ? section : null;
}

export function TravelingCat() {
  const [motionEnabled, setMotionEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setMotionEnabled(!query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const activeSection = useActiveHomeSection(motionEnabled);
  const [displaySection, setDisplaySection] = useState<Section | null>(null);
  const [phase, setPhase] = useState<Phase>('entering');
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!motionEnabled) return;
    const target = targetFor(activeSection);
    if (target === displaySection) return;

    let settleTimer: ReturnType<typeof setTimeout> | undefined;

    function arrive(next: Section | null) {
      setDisplaySection(next);
      if (next) {
        setPhase('entering');
        settleTimer = setTimeout(() => setPhase('parked'), ENTER_DURATION);
      }
    }

    if (displaySection === null) {
      // Nothing on screen yet (first time the reader reaches a boxed
      // section, or arriving straight from hero): pop in directly, no
      // need to play an exit first.
      arrive(target);
    } else {
      // Already parked somewhere else: vanish into this spot's portal
      // first, then (after it closes) pop in at the new one, or stay
      // gone if heading back to the hero. This setState is a deliberate
      // reaction to activeSection changing, not state derived during
      // render, so calling it synchronously here is correct.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase('leaving');
      settleTimer = setTimeout(() => arrive(target), EXIT_DURATION);
    }

    return () => {
      if (settleTimer) clearTimeout(settleTimer);
    };
  }, [activeSection, motionEnabled, displaySection]);

  if (!motionEnabled || !displaySection) return null;

  const anchor = document.getElementById(ANCHOR_IDS[displaySection]);
  if (!anchor) return null;

  const travelClass =
    phase === 'leaving' ? 'cat-wormhole-exit' : phase === 'entering' ? 'cat-wormhole-enter' : '';
  const cosmeticVisible = hovered && phase === 'parked';
  const hoverHandlers =
    phase === 'parked'
      ? { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) }
      : {};

  return createPortal(
    <div aria-hidden="true" className="pointer-events-none">
      <div className={`relative sm:hidden ${travelClass}`} {...hoverHandlers}>
        <Portal className="pointer-events-none absolute inset-0 h-full w-full" />
        <Mascot
          mood={MOOD}
          cosmetic={HOVER_COSMETIC}
          cosmeticVisible={cosmeticVisible}
          size={92}
        />
      </div>
      <div className={`relative hidden sm:block ${travelClass}`} {...hoverHandlers}>
        <Portal className="pointer-events-none absolute inset-0 h-full w-full" />
        <Mascot
          mood={MOOD}
          cosmetic={HOVER_COSMETIC}
          cosmeticVisible={cosmeticVisible}
          size={120}
        />
      </div>
    </div>,
    anchor
  );
}
