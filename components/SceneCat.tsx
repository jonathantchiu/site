'use client';

import { useEffect, useReducer, useRef, useState } from 'react';
import { Mascot } from './Mascot';
import type { Mood } from '@/lib/cosmetics';
import { drawOrder, useInventory } from '@/lib/inventory';
import {
  IDLE_MS,
  INITIAL_CAT_STATE,
  QUICK_PASS_MS,
  SETTLE_MS,
  nextCatState,
} from '@/lib/catMood';

// Each home page scene has one cat at a fixed spot, chosen per scene by
// the caller through `className` (app/page.tsx). Every cat wears whatever
// the reader has equipped from the cosmetic cache (lib/inventory.ts). The cat renders in flow
// as the scene's last child, so it reserves its own space and can never
// cover content.
//
// Its mood follows the reader (rules in lib/catMood.ts):
// - neutral when its scene comes into view, happy after a moment
// - asleep after IDLE_MS with no input while in view
// - scroll, keys, pointer or touch wake it with a small hop
// - click or tap pets it: happy, a bounce and a heart
// - sad next time if the reader scrolled past its scene without stopping
//
// Client-only and absent from the static export: nothing renders until
// the post-mount effect flips `mounted`, so the static export never ships one. A
// no-JS reader sees no cat at all, never a broken one. Reduced-motion
// readers still see the moods change, only without the hop, bounce,
// floating z's and heart.
const DESKTOP_SIZE = 104;
const PHONE_SIZE = 80;
const PHONE_BREAKPOINT = 640;
const ACTIVITY_EVENTS = ['scroll', 'wheel', 'keydown', 'pointermove', 'pointerdown', 'touchstart'] as const;

function sizeForViewport(): number {
  return window.innerWidth < PHONE_BREAKPOINT ? PHONE_SIZE : DESKTOP_SIZE;
}

export function SceneCat({
  sceneId,
  className = '',
}: {
  // Must match the id passed to the enclosing <Scene>: the cat observes
  // that element to know when its scene is in view.
  sceneId: string;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [size, setSize] = useState(DESKTOP_SIZE);
  const [inView, setInView] = useState(false);
  const [state, dispatch] = useReducer(nextCatState, INITIAL_CAT_STATE);
  const { equipped } = useInventory();
  // The last one-shot animation: a hop on waking or a bounce on a pet.
  // `key` bumps each time so the animated wrapper remounts and replays.
  const [anim, setAnim] = useState<{ kind: 'hop' | 'bounce' | null; key: number }>({
    kind: null,
    key: 0,
  });
  const lastActivityRef = useRef(0);
  const enteredAtRef = useRef(0);
  const inViewRef = useRef(false);
  const prevMoodRef = useRef<Mood>(state.mood);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setSize(sizeForViewport());
    lastActivityRef.current = Date.now();
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setMotionEnabled(!query.matches);
    sync();
    query.addEventListener('change', sync);
    const onResize = () => setSize(sizeForViewport());
    window.addEventListener('resize', onResize);
    return () => {
      query.removeEventListener('change', sync);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Scene visibility: entering sets the starting mood, and leaving within
  // QUICK_PASS_MS counts as being ignored.
  useEffect(() => {
    if (!mounted) return;
    const el = document.getElementById(sceneId);
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        if (visible === inViewRef.current) return;
        inViewRef.current = visible;
        setInView(visible);
        if (visible) {
          enteredAtRef.current = Date.now();
          lastActivityRef.current = Date.now();
          dispatch('enter');
        } else {
          dispatch(Date.now() - enteredAtRef.current < QUICK_PASS_MS ? 'leaveQuick' : 'leave');
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [mounted, sceneId]);

  // Any input records activity and wakes a sleeping cat in view. The
  // reducer returns the same state when the cat is awake, so React skips
  // the re-render for the common case.
  useEffect(() => {
    if (!mounted) return;
    const onActivity = () => {
      lastActivityRef.current = Date.now();
      if (inViewRef.current) dispatch('activity');
    };
    for (const type of ACTIVITY_EVENTS) {
      window.addEventListener(type, onActivity, { passive: true });
    }
    return () => {
      for (const type of ACTIVITY_EVENTS) window.removeEventListener(type, onActivity);
    };
  }, [mounted]);

  // Idle check. Polling once a second is cheaper than resetting a timer
  // on every pointermove.
  useEffect(() => {
    if (!mounted || !inView) return;
    const id = setInterval(() => {
      if (Date.now() - lastActivityRef.current >= IDLE_MS) dispatch('idle');
    }, 1000);
    return () => clearInterval(id);
  }, [mounted, inView]);

  // Settle: neutral warms up to happy, sad recovers to neutral.
  useEffect(() => {
    if (!inView || (state.mood !== 'neutral' && state.mood !== 'sad')) return;
    const id = setTimeout(() => dispatch('settle'), SETTLE_MS);
    return () => clearTimeout(id);
  }, [inView, state.mood]);

  // Hop when woken.
  useEffect(() => {
    if (prevMoodRef.current === 'sleep' && state.mood !== 'sleep') {
      setAnim((a) => ({ kind: 'hop', key: a.key + 1 }));
    }
    prevMoodRef.current = state.mood;
  }, [state.mood]);

  if (!mounted) return null;

  const { mood } = state;
  const animation = motionEnabled && anim.kind ? `cat-${anim.kind}` : '';

  return (
    <button
      type="button"
      aria-label="Pet the cat"
      data-scene-cat=""
      data-mood={mood}
      onClick={() => {
        lastActivityRef.current = Date.now();
        dispatch('pet');
        setAnim((a) => ({ kind: 'bounce', key: a.key + 1 }));
      }}
      className={`game relative shrink-0 cursor-pointer select-none rounded-full [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-[var(--g-primary)] ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Keys are prefixed because the heart below is a sibling keyed off
          the same counter. Two siblings sharing a key made React leave the
          old sprite behind on every pet, stacking copies of the cat. */}
      <span key={`cat-${anim.key}`} className={`block h-full w-full ${animation}`}>
        <Mascot mood={mood} cosmetics={drawOrder(equipped)} size={size} />
      </span>

      {mood === 'sleep' && motionEnabled ? (
        <span aria-hidden="true" className="game-hand pointer-events-none absolute -top-3 right-0 text-lg text-[var(--g-muted)]">
          <span className="cat-zzz inline-block">z</span>
          <span className="cat-zzz inline-block [animation-delay:600ms]">z</span>
        </span>
      ) : null}

      {anim.kind === 'bounce' && motionEnabled ? (
        <span
          key={`heart-${anim.key}`}
          aria-hidden="true"
          className="cat-heart pointer-events-none absolute -top-4 left-1/2 text-xl text-[var(--g-primary)]"
        >
          ♥
        </span>
      ) : null}
    </button>
  );
}
