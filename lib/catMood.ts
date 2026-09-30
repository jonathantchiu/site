import type { Mood } from '@/lib/cosmetics';

// The scene cat's mood as a small state machine, kept separate from the
// component so the rules can be tested without timers or a DOM. The
// component (components/SceneCat.tsx) owns the clocks and turns them into
// these events:
//
// - enter:      the cat's scene scrolls into view
// - leave:      it scrolls out after the reader stayed a while
// - leaveQuick: it scrolls out within QUICK_PASS_MS of entering
// - idle:       no scroll, key, pointer or touch input for IDLE_MS while in view
// - activity:   any of that input arrives
// - pet:        the reader clicks or taps the cat
// - settle:     SETTLE_MS in view with no mood change
export const IDLE_MS = 4000;
export const SETTLE_MS = 2500;
export const QUICK_PASS_MS = 1200;

export type CatEvent = 'enter' | 'leave' | 'leaveQuick' | 'idle' | 'activity' | 'pet' | 'settle';

export interface CatState {
  mood: Mood;
  // Set when the reader scrolled past without stopping. The cat is sad
  // the next time its scene comes into view, until petted or settled.
  ignored: boolean;
}

export const INITIAL_CAT_STATE: CatState = { mood: 'neutral', ignored: false };

export function nextCatState(state: CatState, event: CatEvent): CatState {
  switch (event) {
    case 'enter':
      return { ...state, mood: state.ignored ? 'sad' : 'neutral' };
    case 'leaveQuick':
      return { ...state, ignored: true };
    case 'leave':
      return state;
    case 'idle':
      return state.mood === 'sleep' ? state : { ...state, mood: 'sleep' };
    case 'activity':
      return state.mood === 'sleep' ? { ...state, mood: 'neutral' } : state;
    case 'pet':
      return { mood: 'happy', ignored: false };
    case 'settle':
      if (state.mood === 'sad') return { mood: 'neutral', ignored: false };
      if (state.mood === 'neutral') return { ...state, mood: 'happy' };
      return state;
  }
}
