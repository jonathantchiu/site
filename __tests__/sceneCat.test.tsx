import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';
import { SceneCat } from '@/components/SceneCat';
import {
  IDLE_MS,
  INITIAL_CAT_STATE,
  QUICK_PASS_MS,
  SETTLE_MS,
  nextCatState,
  type CatEvent,
  type CatState,
} from '@/lib/catMood';
import { collect, resetInventoryForTests, toggleEquipped } from '@/lib/inventory';

function run(events: CatEvent[], start: CatState = INITIAL_CAT_STATE): CatState {
  return events.reduce(nextCatState, start);
}

describe('nextCatState', () => {
  it('starts neutral on entering and warms up to happy after settling', () => {
    expect(run(['enter']).mood).toBe('neutral');
    expect(run(['enter', 'settle']).mood).toBe('happy');
  });

  it('falls asleep when idle and wakes to neutral on activity', () => {
    expect(run(['enter', 'settle', 'idle']).mood).toBe('sleep');
    expect(run(['enter', 'settle', 'idle', 'activity']).mood).toBe('neutral');
  });

  it('ignores activity while awake', () => {
    const happy = run(['enter', 'settle']);
    expect(nextCatState(happy, 'activity')).toBe(happy);
  });

  it('is sad on the next visit after a quick pass, then recovers when settled', () => {
    const afterSkip = run(['enter', 'leaveQuick', 'enter']);
    expect(afterSkip.mood).toBe('sad');
    const recovered = nextCatState(afterSkip, 'settle');
    expect(recovered).toEqual({ mood: 'neutral', ignored: false });
  });

  it('is not sad after a normal visit', () => {
    expect(run(['enter', 'leave', 'enter']).mood).toBe('neutral');
  });

  it('petting makes it happy from any mood and clears the ignored flag', () => {
    expect(run(['enter', 'leaveQuick', 'enter', 'pet'])).toEqual({ mood: 'happy', ignored: false });
    expect(run(['enter', 'idle', 'pet']).mood).toBe('happy');
  });
});

// jsdom has neither matchMedia nor IntersectionObserver.
function stubMatchMedia(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

function stubIntersectionObserver() {
  let callback: ((entries: Array<{ isIntersecting: boolean }>) => void) | null = null;
  class FakeIntersectionObserver {
    constructor(cb: typeof callback) {
      callback = cb;
    }
    observe() {}
    disconnect() {}
  }
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  return (isIntersecting: boolean) => {
    act(() => {
      callback?.([{ isIntersecting }]);
    });
  };
}

function mountScene(id: string) {
  const section = document.createElement('section');
  section.id = id;
  document.body.appendChild(section);
  return () => section.remove();
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

function cat(container: HTMLElement) {
  return container.querySelector<HTMLButtonElement>('[data-scene-cat]');
}

describe('SceneCat', () => {
  let removeScene: () => void;

  beforeEach(() => {
    vi.useFakeTimers();
    removeScene = mountScene('hero');
    window.localStorage.clear();
    resetInventoryForTests();
  });

  afterEach(() => {
    removeScene();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('renders a pet button wearing only what is equipped', () => {
    stubMatchMedia(false);
    stubIntersectionObserver();
    const { container } = render(<SceneCat sceneId="hero" />);
    expect(cat(container)?.getAttribute('aria-label')).toBe('Pet the cat');
    expect(container.querySelector('img[src*="cosmetics/"]')).toBeNull();
    act(() => {
      collect('chef-hat');
      collect('sunglasses');
      toggleEquipped('chef-hat');
      toggleEquipped('sunglasses');
    });
    const srcs = Array.from(container.querySelectorAll('img[src*="cosmetics/"]')).map((img) =>
      img.getAttribute('src')
    );
    // Glasses are drawn first so the hat layers on top.
    expect(srcs).toEqual([
      expect.stringContaining('sunglasses'),
      expect.stringContaining('chef-hat'),
    ]);
  });

  it('goes neutral, then happy, then to sleep when left alone', () => {
    stubMatchMedia(false);
    const fire = stubIntersectionObserver();
    const { container } = render(<SceneCat sceneId="hero" />);
    fire(true);
    expect(cat(container)?.dataset.mood).toBe('neutral');
    advance(SETTLE_MS);
    expect(cat(container)?.dataset.mood).toBe('happy');
    advance(IDLE_MS + 1000);
    expect(cat(container)?.dataset.mood).toBe('sleep');
  });

  it('wakes with a hop when the reader scrolls', () => {
    stubMatchMedia(false);
    const fire = stubIntersectionObserver();
    const { container } = render(<SceneCat sceneId="hero" />);
    fire(true);
    advance(IDLE_MS + 1000);
    expect(cat(container)?.dataset.mood).toBe('sleep');
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(cat(container)?.dataset.mood).toBe('neutral');
    expect(container.querySelector('.cat-hop')).not.toBeNull();
  });

  it('does not fall asleep while the reader keeps scrolling', () => {
    stubMatchMedia(false);
    const fire = stubIntersectionObserver();
    const { container } = render(<SceneCat sceneId="hero" />);
    fire(true);
    for (let t = 0; t < IDLE_MS * 2; t += 2000) {
      advance(2000);
      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });
    }
    expect(cat(container)?.dataset.mood).not.toBe('sleep');
  });

  it('is happy with a bounce and a heart when petted', () => {
    stubMatchMedia(false);
    const fire = stubIntersectionObserver();
    const { container } = render(<SceneCat sceneId="hero" />);
    fire(true);
    fireEvent.click(cat(container)!);
    expect(cat(container)?.dataset.mood).toBe('happy');
    expect(container.querySelector('.cat-bounce')).not.toBeNull();
    expect(container.querySelector('.cat-heart')).not.toBeNull();
  });

  it('keeps exactly one cat sprite no matter how many times it is petted', () => {
    stubMatchMedia(false);
    const fire = stubIntersectionObserver();
    const { container } = render(<SceneCat sceneId="hero" />);
    fire(true);
    for (let i = 0; i < 4; i++) fireEvent.click(cat(container)!);
    expect(container.querySelectorAll('img[src*="mascot/cat-"]')).toHaveLength(1);
    expect(container.querySelectorAll('.cat-heart')).toHaveLength(1);
  });

  it('is sad when the reader comes back after scrolling straight past', () => {
    stubMatchMedia(false);
    const fire = stubIntersectionObserver();
    const { container } = render(<SceneCat sceneId="hero" />);
    fire(true);
    advance(QUICK_PASS_MS - 200);
    fire(false);
    fire(true);
    expect(cat(container)?.dataset.mood).toBe('sad');
  });

  it('still changes mood under prefers-reduced-motion, without animations', () => {
    stubMatchMedia(true);
    const fire = stubIntersectionObserver();
    const { container } = render(<SceneCat sceneId="hero" />);
    fire(true);
    advance(IDLE_MS + 1000);
    expect(cat(container)?.dataset.mood).toBe('sleep');
    expect(container.querySelector('.cat-zzz')).toBeNull();
    fireEvent.click(cat(container)!);
    expect(cat(container)?.dataset.mood).toBe('happy');
    expect(container.querySelector('.cat-bounce, .cat-heart')).toBeNull();
  });
});
