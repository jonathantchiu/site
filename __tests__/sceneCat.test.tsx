import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { SceneCat } from '@/components/SceneCat';

// jsdom has neither matchMedia nor IntersectionObserver; components that
// check prefers-reduced-motion or observe scroll need stubs for both.
function stubMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

type ObserveCallback = (entries: Array<{ isIntersecting: boolean }>) => void;

function stubIntersectionObserver() {
  let callback: ObserveCallback | null = null;
  class FakeIntersectionObserver {
    constructor(cb: ObserveCallback) {
      callback = cb;
    }
    observe() {}
    disconnect() {}
  }
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  return {
    fire: (isIntersecting: boolean) => {
      act(() => {
        callback?.([{ isIntersecting }]);
      });
    },
  };
}

function mountSceneElement(id: string) {
  const el = document.createElement('section');
  el.id = id;
  document.body.appendChild(el);
  return () => el.remove();
}

describe('SceneCat', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('is absent before mount effects run and appears after, decoration-only', async () => {
    stubMatchMedia(false);
    const cleanupScene = mountSceneElement('hero');
    const { container } = render(<SceneCat sceneId="hero" band="light" startIndex={0} />);

    await act(async () => {});

    const wrapper = container.querySelector('[aria-hidden="true"]');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.className).toContain('pointer-events-none');
    cleanupScene();
  });

  it('renders no cat variant switching wrapper animation class under prefers-reduced-motion', async () => {
    stubMatchMedia(true);
    const cleanupScene = mountSceneElement('hero');
    const { container } = render(<SceneCat sceneId="hero" band="light" startIndex={0} />);

    await act(async () => {});

    const wrapper = container.querySelector('[aria-hidden="true"]');
    expect(wrapper?.className).not.toContain('cat-pop-in');
    cleanupScene();
  });

  it('advances to a different variant only on a genuine re-entry, not on every intersection callback', async () => {
    stubMatchMedia(false);
    const observer = stubIntersectionObserver();
    const cleanupScene = mountSceneElement('projects');
    const { container } = render(<SceneCat sceneId="projects" band="dark" startIndex={0} />);

    await act(async () => {});

    const moodOf = () => container.querySelector('img')?.getAttribute('src');
    const initialMood = moodOf();

    // Repeated "still intersecting" callbacks (what actually fires while
    // scrolling through a section) must not change the variant.
    observer.fire(true);
    observer.fire(true);
    observer.fire(true);
    expect(moodOf()).toBe(initialMood);

    // Leaving, then a genuine re-entry, advances exactly once.
    observer.fire(false);
    observer.fire(true);
    expect(moodOf()).not.toBe(initialMood);

    const afterFirstReentry = moodOf();
    observer.fire(true);
    observer.fire(true);
    expect(moodOf()).toBe(afterFirstReentry);

    cleanupScene();
  });

  it('applies a light halo on the dark band so the sprite separates from the ground', async () => {
    stubMatchMedia(false);
    const cleanupScene = mountSceneElement('projects');
    const { container } = render(<SceneCat sceneId="projects" band="dark" startIndex={0} />);

    await act(async () => {});

    const wrapper = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(wrapper.style.filter).toContain('drop-shadow');
    cleanupScene();
  });

  it('applies no halo on the light or warm bands', async () => {
    stubMatchMedia(false);
    const cleanupScene = mountSceneElement('hero');
    const { container } = render(<SceneCat sceneId="hero" band="light" startIndex={0} />);

    await act(async () => {});

    const wrapper = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(wrapper.style.filter).toBe('');
    cleanupScene();
  });
});
