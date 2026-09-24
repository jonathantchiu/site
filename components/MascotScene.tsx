'use client';

import { useEffect, useState } from 'react';
import { Mascot } from './Mascot';
import type { CosmeticId, Mood } from '@/lib/cosmetics';

// Spec motion effect 3: "The hero mascot swaps mood art once when the user
// scrolls past the hero, and a cosmetic drops onto it on hover." This is the
// one file that owns that interactivity; Mascot itself stays a plain,
// server-safe component so it still degrades to a static image with no JS.
// framer-motion stays confined to Reveal.tsx — this uses plain React state
// and CSS transitions (declared on Mascot's cosmetic image) instead.

const HERO_MOOD: Mood = 'happy';
const SCROLLED_MOOD: Mood = 'neutral';
const HOVER_COSMETIC: CosmeticId = 'sunglasses';

export function MascotScene() {
  // Default state (and the only state rendered before hydration, so it is
  // also what static export bakes into the HTML): happy mood, no cosmetic.
  // That is the "sensible default" a no-JS reader sees.
  const [scrolledPast, setScrolledPast] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setMotionEnabled(!query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!motionEnabled) return;
    // The whole hero section (id="hero" in app/page.tsx), not just the
    // mascot's own small box, so "scrolls past the hero" matches what it
    // reads like: the intro block, not a sliver of it.
    const hero = document.getElementById('hero');
    if (!hero || typeof IntersectionObserver === 'undefined') return;

    // Fires once, the first time the hero leaves the viewport on scroll;
    // the mood then stays swapped rather than flipping back and forth.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setScrolledPast(true);
          observer.disconnect();
        }
      },
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [motionEnabled]);

  const mood = motionEnabled && scrolledPast ? SCROLLED_MOOD : HERO_MOOD;
  const cosmeticVisible = motionEnabled && hovered;

  const hoverHandlers = motionEnabled
    ? {
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
      }
    : {};

  return (
    <>
      {/* order-first: on the stacked mobile layout this must sit above the
          name (spec), even though in the desktop row it is the sm:hidden
          twin of the trailing desktop instance below. */}
      <div className="order-first shrink-0 sm:hidden" {...hoverHandlers}>
        <Mascot
          mood={mood}
          cosmetic={HOVER_COSMETIC}
          cosmeticVisible={cosmeticVisible}
          size={92}
        />
      </div>
      <div className="hidden shrink-0 sm:block" {...hoverHandlers}>
        <Mascot
          mood={mood}
          cosmetic={HOVER_COSMETIC}
          cosmeticVisible={cosmeticVisible}
          size={120}
        />
      </div>
    </>
  );
}
