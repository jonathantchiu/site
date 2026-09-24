'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CardboardBox } from './CardboardBox';
import { assetPath } from '@/lib/assetPath';

// Spec (interactive layer, "Cardboard box reveal"): each section below the
// hero starts covered by a cardboard box. The box topples on its own about
// 400ms after the section scrolls into view, or immediately on click with
// the cat pouncing in to knock it off. Once revealed, it stays revealed.
//
// The non-negotiable part: children are never gated behind the reveal.
// They are rendered once, unconditionally, right here — the box is only
// ever an absolutely-positioned sibling drawn on top. There is no branch in
// this file that omits `children`; a future edit that introduces one (e.g.
// `{revealed && children}`) is exactly the regression
// __tests__/boxReveal.test.tsx exists to catch.
const AUTO_REVEAL_DELAY = 400;
// Keep in sync with the `box-tumble` / `box-knocked` animation durations
// declared in app/globals.css.
const TUMBLE_DURATION = 550;

type Phase = 'idle' | 'tumbling' | 'revealed';

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
  // notice it, then topple the box with no cat involved. This is the path
  // a reader who never clicks anything takes — the box goes away regardless.
  useEffect(() => {
    if (!motionEnabled || phase !== 'idle') return;
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        autoTimerRef.current = setTimeout(() => {
          setPhase((p) => (p === 'idle' ? 'tumbling' : p));
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

  // Once tumbling starts (either path), let the CSS animation play, then
  // drop the overlay from the DOM entirely so it can never again intercept
  // a click meant for the content underneath.
  useEffect(() => {
    if (phase !== 'tumbling') return;
    const t = setTimeout(() => setPhase('revealed'), TUMBLE_DURATION);
    return () => clearTimeout(t);
  }, [phase]);

  function handleClick() {
    if (phase !== 'idle') return;
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    setPounced(true);
    setPhase('tumbling');
  }

  const showOverlay = motionEnabled && phase !== 'revealed';

  return (
    <div ref={containerRef} className="relative">
      {children}
      {showOverlay && (
        <div
          aria-hidden="true"
          onClick={handleClick}
          className={
            'absolute inset-0 overflow-hidden rounded-card' +
            (phase === 'tumbling' ? ' pointer-events-none' : ' cursor-pointer')
          }
        >
          <CardboardBox
            className={
              phase === 'tumbling' ? (pounced ? 'box-knocked' : 'box-tumble') : 'box-sitting'
            }
          />
          {pounced && phase === 'tumbling' && (
            <img
              src={assetPath('/mascot/cat-happy.webp')}
              alt=""
              width={96}
              height={96}
              className="cat-pounce pointer-events-none absolute bottom-0 left-1/2 h-24 w-24 object-contain"
            />
          )}
        </div>
      )}
    </div>
  );
}
