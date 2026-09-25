'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CardboardBox } from './CardboardBox';

// Spec (interactive layer, "Cardboard box reveal"): each section below the
// hero starts covered by a cardboard box. The box topples on its own about
// 400ms after the section scrolls into view, or immediately on click. The
// per-scene cat (components/SceneCat.tsx) is a separate, purely decorative
// element positioned in that scene's own margin — this file only ever
// needs to know how to topple the box itself.
//
// The non-negotiable part: children are never gated behind the reveal.
// They are rendered once, unconditionally, right here — the box is only
// ever an absolutely-positioned sibling drawn on top. There is no branch
// in this file that omits `children`; a future edit that introduces one
// (e.g. `{revealed && children}`) is exactly the regression
// __tests__/boxReveal.test.tsx exists to catch.
const AUTO_REVEAL_DELAY = 400;
// Total time the sequence runs for, from trigger to the overlay
// unmounting — kept the same 900ms as before so the box's screen time
// still lines up with how long the traveling cat spends parked beside it
// mid-arrival.
const ACTIVE_DURATION = 900;
// How far into the sequence the box actually starts tumbling — a beat of
// anticipation before it goes. Keep in sync with the `animation-delay`
// applied to the box below and with the box-tumble/box-knocked keyframes'
// own 550ms duration in
// app/globals.css (300 + 550 = 850, finishing just before ACTIVE_DURATION).
const BOX_DELAY = 300;

type Phase = 'idle' | 'active' | 'revealed';

export function BoxReveal({ children }: { children: ReactNode }) {
  // Starts false so the server render, and the very first client render
  // before hydration's effects run, both show no overlay at all — matching
  // the no-JS reader's HTML exactly and avoiding a hydration mismatch. Only
  // an effect (below) may flip this, same pattern as SceneCat.
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
    </div>
  );
}
