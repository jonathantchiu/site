'use client';

import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { assetPath } from '@/lib/assetPath';

// Spec (interactive layer, "Bug hunt"): a bug crosses the page on a
// randomized 20-40s interval. Clicking it makes the cat pounce and
// increments a counter shown quietly in the footer, persisted in
// localStorage and wrapped in try/catch so private-window failures are
// harmless. It is an easter egg: delightful if noticed, invisible if not.
//
// Non-negotiables carried over from the brief:
// - never blocks a link or button: the outer strip is `pointer-events-none`,
//   only the bug <button> itself is `pointer-events-auto`.
// - never renders under prefers-reduced-motion.
// - never renders server-side / before hydration (motionEnabled starts
//   false, same pattern as MascotScene and BoxReveal, so the static export
//   and the first client paint both show nothing).
// - localStorage reads and writes are wrapped in try/catch; the component
//   must render correctly with localStorage entirely unavailable.
// - the counter is hidden entirely at zero.

const STORAGE_KEY = 'bug-hunt-count';
const MIN_INTERVAL_MS = 20_000;
const MAX_INTERVAL_MS = 40_000;
// Keep in sync with the `bug-crossing` / `bug-crossing-reverse` animation
// durations declared in app/globals.css.
const CROSSING_DURATION_MS = 6_000;
const POUNCE_DURATION_MS = 600;

function randomInterval(): number {
  return MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS);
}

function readStoredCount(): number {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    // Private window, blocked site data, etc. Start from zero rather than
    // letting the throw propagate and white-screen the page.
    return 0;
  }
}

function writeStoredCount(count: number): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(count));
  } catch {
    // Same as above: the count just won't persist across visits.
  }
}

type Edge = 'top' | 'bottom';

interface Crossing {
  id: number;
  edge: Edge;
  // Distance in pixels from the chosen edge, kept small so the bug travels
  // through the page margin rather than through the centered text column.
  inset: number;
  reverse: boolean;
}

export function BugHunt() {
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [count, setCount] = useState(0);
  const [crossing, setCrossing] = useState<Crossing | null>(null);
  const [pounceAt, setPounceAt] = useState<{ x: number; y: number } | null>(null);

  const scheduleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const crossingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setMotionEnabled(!query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  // Load the persisted count once on mount. readStoredCount handles the
  // localStorage-unavailable case internally.
  useEffect(() => {
    setCount(readStoredCount());
  }, []);

  const clearAllTimers = useCallback(() => {
    if (scheduleTimerRef.current) clearTimeout(scheduleTimerRef.current);
    if (crossingTimerRef.current) clearTimeout(crossingTimerRef.current);
    if (pounceTimerRef.current) clearTimeout(pounceTimerRef.current);
  }, []);

  const scheduleNext = useCallback(() => {
    if (scheduleTimerRef.current) clearTimeout(scheduleTimerRef.current);
    scheduleTimerRef.current = setTimeout(() => {
      setCrossing({
        id: Date.now(),
        edge: Math.random() < 0.5 ? 'top' : 'bottom',
        inset: 8 + Math.random() * 24,
        reverse: Math.random() < 0.5,
      });
    }, randomInterval());
  }, []);

  // Start (or stop) the whole cycle based on the reduced-motion query.
  useEffect(() => {
    if (!motionEnabled) {
      setCrossing(null);
      setPounceAt(null);
      clearAllTimers();
      return;
    }
    scheduleNext();
    return clearAllTimers;
  }, [motionEnabled, scheduleNext, clearAllTimers]);

  // A crossing nobody clicked finishes its trip on its own and the cycle
  // schedules the next one.
  useEffect(() => {
    if (!crossing) return;
    crossingTimerRef.current = setTimeout(() => {
      setCrossing(null);
      scheduleNext();
    }, CROSSING_DURATION_MS);
    return () => {
      if (crossingTimerRef.current) clearTimeout(crossingTimerRef.current);
    };
  }, [crossing, scheduleNext]);

  useEffect(() => clearAllTimers, [clearAllTimers]);

  function handleCatch(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    if (crossingTimerRef.current) clearTimeout(crossingTimerRef.current);
    setCrossing(null);
    setPounceAt({ x: rect.left, y: rect.top });

    setCount((current) => {
      const next = current + 1;
      writeStoredCount(next);
      return next;
    });

    if (pounceTimerRef.current) clearTimeout(pounceTimerRef.current);
    pounceTimerRef.current = setTimeout(() => {
      setPounceAt(null);
      scheduleNext();
    }, POUNCE_DURATION_MS);
  }

  return (
    <>
      {motionEnabled && crossing && !pounceAt && (
        // aria-hidden, same as CardboardBox's overlay: this is a decorative
        // easter egg, not content, so it is purely optional and mouse-only
        // rather than a focusable control an AT user would be steered
        // toward and then find unreachable (a button nested inside an
        // aria-hidden ancestor is invisible to assistive tech regardless of
        // its own role, which would be a worse outcome than simply opting
        // it out of the accessibility tree entirely).
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 z-40"
          style={{ [crossing.edge]: `${crossing.inset}px` }}
        >
          <div
            data-testid="bug-hunt-bug"
            onClick={handleCatch}
            className={
              'pointer-events-auto absolute h-8 w-8 cursor-pointer bug-crossing' +
              (crossing.reverse ? ' bug-crossing-reverse' : '')
            }
            style={{ [crossing.edge]: 0 }}
          >
            <BugSvg />
          </div>
        </div>
      )}
      {motionEnabled && pounceAt && (
        <img
          src={assetPath('/mascot/cat-happy.webp')}
          alt=""
          width={56}
          height={56}
          className="cat-pounce pointer-events-none fixed z-40 h-14 w-14 object-contain"
          style={{ left: pounceAt.x, top: pounceAt.y }}
        />
      )}
      {count > 0 && <p className="mt-2 text-[13px] text-muted">bugs caught: {count}</p>}
    </>
  );
}

// Small characterful bug, drawn in Bento's style: bold dark outline, warm
// fill, no gradients or photographic detail.
const BUG_LINE = '#2B1A0C';
const BUG_FILL = '#C25A22';
const BUG_SPOT = '#8F3E15';

function BugSvg() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false" className="h-8 w-8">
      {/* legs */}
      <g stroke={BUG_LINE} strokeWidth="1.6" strokeLinecap="round">
        <path d="M9 13 L3 10" />
        <path d="M9 16 L2 16" />
        <path d="M9 19 L3 22" />
        <path d="M23 13 L29 10" />
        <path d="M23 16 L30 16" />
        <path d="M23 19 L29 22" />
      </g>
      {/* antennae */}
      <g stroke={BUG_LINE} strokeWidth="1.6" strokeLinecap="round">
        <path d="M13 8 L10 3" />
        <path d="M19 8 L22 3" />
      </g>
      <circle cx="10" cy="3" r="1.2" fill={BUG_LINE} />
      <circle cx="22" cy="3" r="1.2" fill={BUG_LINE} />
      {/* body */}
      <ellipse
        cx="16"
        cy="17"
        rx="8"
        ry="9"
        fill={BUG_FILL}
        stroke={BUG_LINE}
        strokeWidth="2"
      />
      {/* head */}
      <circle cx="16" cy="8" r="4" fill={BUG_FILL} stroke={BUG_LINE} strokeWidth="2" />
      {/* wing seam */}
      <path d="M16 9 L16 25" stroke={BUG_LINE} strokeWidth="1.6" />
      {/* spots */}
      <circle cx="12.5" cy="14" r="1.4" fill={BUG_SPOT} />
      <circle cx="19.5" cy="14" r="1.4" fill={BUG_SPOT} />
      <circle cx="12.5" cy="21" r="1.4" fill={BUG_SPOT} />
      <circle cx="19.5" cy="21" r="1.4" fill={BUG_SPOT} />
    </svg>
  );
}
