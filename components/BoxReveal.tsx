'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CardboardBox } from './CardboardBox';
import { Portal } from './Portal';
import { assetPath } from '@/lib/assetPath';

// Spec (interactive layer, "Cardboard box reveal"): each section below the
// hero starts covered by a cardboard box. The box topples on its own about
// 400ms after the section scrolls into view, or immediately on click — and
// however it is triggered, a wormhole portal opens beside the section, the
// cat pops out of it to knock the box off, then drops back through as the
// portal closes behind it.
//
// The non-negotiable part: children are never gated behind the reveal.
// They are rendered once, unconditionally, right here — the box and portal
// are only ever absolutely-positioned siblings drawn on top. There is no
// branch in this file that omits `children`; a future edit that introduces
// one (e.g. `{revealed && children}`) is exactly the regression
// __tests__/boxReveal.test.tsx exists to catch.
const AUTO_REVEAL_DELAY = 400;
// Total time the portal-open / cat-pounce / box-knock / portal-close
// sequence runs for, from trigger to the overlay unmounting. Keep in sync
// with the `portal-cycle` and `cat-portal-pounce` animation durations in
// app/globals.css (900ms).
const ACTIVE_DURATION = 900;
// How far into the sequence the box actually starts tumbling — the cat
// needs a moment to rise out of the portal and close the distance first.
// Keep in sync with the `animation-delay` applied to the box below and
// with the box-tumble/box-knocked keyframes' own 550ms duration in
// app/globals.css (300 + 550 = 850, finishing just before ACTIVE_DURATION).
const BOX_DELAY = 300;

type Phase = 'idle' | 'active' | 'revealed';

export function BoxReveal({ children }: { children: ReactNode }) {
  // Starts false so the server render, and the very first client render
  // before hydration's effects run, both show no overlay at all — matching
  // the no-JS reader's HTML exactly and avoiding a hydration mismatch. Only
  // an effect (below) may flip this, same pattern as MascotScene.
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [pounced, setPounced] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setMotionEnabled(!query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  // Auto-reveal: once the section is on screen, give the reader ~400ms to
  // notice it, then run the portal/cat/box sequence with no click involved.
  // This is the path a reader who never clicks anything takes — the box
  // goes away regardless.
  useEffect(() => {
    if (!motionEnabled || phase !== 'idle') return;
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        autoTimerRef.current = setTimeout(() => {
          setPhase((p) => (p === 'idle' ? 'active' : p));
        }, AUTO_REVEAL_DELAY);
        observer.disconnect();
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [motionEnabled, phase]);

  // Once the sequence starts (either path), let the CSS animations play,
  // then drop the overlay from the DOM entirely so it can never again
  // intercept a click meant for the content underneath.
  useEffect(() => {
    if (phase !== 'active') return;
    const t = setTimeout(() => setPhase('revealed'), ACTIVE_DURATION);
    return () => clearTimeout(t);
  }, [phase]);

  function handleClick() {
    if (phase !== 'idle') return;
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    setPounced(true);
    setPhase('active');
  }

  const showBox = motionEnabled && phase !== 'revealed';
  const showPortal = motionEnabled && phase === 'active';

  return (
    <div ref={containerRef} className="relative">
      {children}
      {showBox && (
        <div
          aria-hidden="true"
          onClick={handleClick}
          className={
            'absolute inset-0 overflow-hidden rounded-card' +
            (phase === 'active' ? ' pointer-events-none' : ' cursor-pointer')
          }
        >
          <CardboardBox
            className={
              phase === 'active' ? (pounced ? 'box-knocked' : 'box-tumble') : 'box-sitting'
            }
            style={phase === 'active' ? { animationDelay: `${BOX_DELAY}ms` } : undefined}
          />
        </div>
      )}
      {showPortal && (
        // A decorative sibling, entirely outside the box overlay above, so
        // it can sit beside the section (near its top edge) rather than
        // being clipped to the box's inset-0 bounds. pointer-events-none
        // for its whole life — unlike the box, it never needs to be the
        // click target, so it can never intercept a click meant for
        // content either before or after reveal.
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 z-10 h-9 w-9 -translate-y-2 translate-x-1 sm:h-14 sm:w-14 sm:translate-x-7 md:h-16 md:w-16 md:translate-x-11"
        >
          <Portal className="portal-cycle h-full w-full" />
          <img
            src={assetPath('/mascot/cat-happy.webp')}
            alt=""
            width={64}
            height={64}
            className="cat-portal-pounce pointer-events-none absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 object-contain sm:h-12 sm:w-12"
          />
        </div>
      )}
    </div>
  );
}
