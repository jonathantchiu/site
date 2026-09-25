'use client';

import { useEffect, useState } from 'react';

// The home page sections the traveling cat cares about, in document order.
// 'elsewhere' is tracked purely so the cat has a well-defined "no cat here"
// answer once the reader scrolls past Projects — it is never a place the
// cat parks, only a signal that neither hero nor a boxed section is active.
export type HomeSectionId = 'hero' | 'experience' | 'projects' | 'elsewhere';

const IDS: HomeSectionId[] = ['hero', 'experience', 'projects', 'elsewhere'];

// Shared by MascotScene (the hero leg) and TravelingCat (the experience/
// projects legs) so both agree on which section is "active" without any
// cross-component wiring — each just watches the same DOM ids.
//
// A section counts as active once it crosses the vertical center band of
// the viewport (rootMargin pulls the observed box in by 35% top and
// bottom), and ties are broken by whichever has the larger intersection
// ratio with that band. Disabled entirely (returns the default 'hero')
// when `enabled` is false, which callers set to `motionEnabled` so this
// never runs under prefers-reduced-motion or before mount.
export function useActiveHomeSection(enabled: boolean): HomeSectionId {
  const [active, setActive] = useState<HomeSectionId>('hero');

  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === 'undefined') return;

    const elements = IDS.map((id) => [id, document.getElementById(id)] as const).filter(
      (pair): pair is [HomeSectionId, HTMLElement] => pair[1] !== null
    );
    if (elements.length === 0) return;

    const ratios = new Map<HomeSectionId, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = elements.find(([, el]) => el === entry.target)?.[0];
          if (!id) continue;
          ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let best: HomeSectionId | null = null;
        let bestRatio = 0;
        for (const [id, ratio] of ratios) {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        }
        if (best) setActive(best);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: '-35% 0px -35% 0px' }
    );

    elements.forEach(([, el]) => observer.observe(el));
    return () => observer.disconnect();
  }, [enabled]);

  return active;
}
