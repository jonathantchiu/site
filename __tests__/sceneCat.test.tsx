import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { SceneCat } from '@/components/SceneCat';

// jsdom has neither matchMedia, IntersectionObserver, nor real layout
// (every element's getBoundingClientRect() is zeroed by default); tests
// that exercise prefers-reduced-motion, scroll re-entry, or the
// measure-and-place logic all need stubs for these.
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

interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

function setRect(el: HTMLElement, rect: Rect) {
  el.getBoundingClientRect = () =>
    ({
      ...rect,
      width: rect.right - rect.left,
      height: rect.bottom - rect.top,
      x: rect.left,
      y: rect.top,
      toJSON() {
        return this;
      },
    }) as DOMRect;
}

// Builds a scene with one divider line and a set of text elements above
// it, each given a fixed rect via setRect (jsdom does no real layout, so
// SceneCat's runtime measurement has to be fed geometry explicitly). The
// divider spans the full section width; `occupied` describes the
// text-bearing spans sitting in the strip directly above the line —
// mirroring the owner's own examples: a wide heading/hook occupying most
// of the line, with room left over near the right edge (e.g. under a
// short date).
function buildScene(
  id: string,
  {
    dividerEdge = 'border-b',
    dividerRect,
    occupied,
  }: {
    dividerEdge?: 'border-t' | 'border-b';
    dividerRect: Rect;
    occupied: Rect[];
  }
) {
  const section = document.createElement('section');
  section.id = id;
  setRect(section, { left: 0, top: 0, right: 800, bottom: 400 });

  const divider = document.createElement('div');
  divider.className = `${dividerEdge} border-hairline`;
  setRect(divider, dividerRect);
  section.appendChild(divider);

  occupied.forEach((rect, i) => {
    const span = document.createElement('span');
    span.textContent = `occupied-${i}`;
    setRect(span, rect);
    section.appendChild(span);
  });

  document.body.appendChild(section);
  return () => section.remove();
}

// SceneCat measures placement inside a double requestAnimationFrame (after
// paint). jsdom implements rAF via a real timer, so an `act(async () =>
// {})` microtask flush isn't enough to observe it — this awaits two real
// frames inside `act` so React processes the resulting state update.
async function flushPlacement() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
}

// A wide divider (0-800) with a wide occupied span on the left (mirrors
// "not under PROJECTS" / "not under ...stay under budget") and two free,
// text-free stretches on the right wide enough for even the largest cat
// size (76px) — mirrors "under the date is fine, because there is room
// there."
function buildRoomyScene(id: string) {
  return buildScene(id, {
    dividerRect: { left: 0, right: 800, top: 100, bottom: 101 },
    occupied: [
      { left: 0, right: 500, top: 70, bottom: 90 },
      { left: 650, right: 700, top: 80, bottom: 95 },
    ],
  });
}

describe('SceneCat', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('is absent before mount effects run and appears after, decoration-only', async () => {
    stubMatchMedia(false);
    const cleanupScene = buildRoomyScene('hero');
    const { container } = render(<SceneCat sceneId="hero" band="light" startIndex={0} />);

    await flushPlacement();

    const wrapper = container.querySelector('[aria-hidden="true"]');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.className).toContain('pointer-events-none');
    cleanupScene();
  });

  it('places the cat bottom-aligned to the divider line, right of center, clear of occupied text', async () => {
    stubMatchMedia(false);
    const cleanupScene = buildRoomyScene('hero');
    const { container } = render(<SceneCat sceneId="hero" band="light" startIndex={0} />);

    await flushPlacement();

    const wrapper = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(wrapper).not.toBeNull();
    const style = wrapper.style;
    const left = parseFloat(style.left);
    const top = parseFloat(style.top);
    const size = parseFloat(style.width);

    // Divider line is at y=101 (bottom edge, border-b), section top is 0.
    expect(top + size).toBeCloseTo(101, 0);
    // Right of the divider's center (divider spans 0-800, center 400).
    expect(left + size / 2).toBeGreaterThan(400);
    // Clear of both occupied spans (0-500 and 650-700).
    const overlapsOccupied =
      (left < 500 && left + size > 0) || (left < 700 && left + size > 650);
    expect(overlapsOccupied).toBe(false);
    cleanupScene();
  });

  it('omits the cat entirely when no stretch of any divider is wide enough, rather than overlapping text', async () => {
    stubMatchMedia(false);
    const cleanupScene = buildScene('hero', {
      dividerRect: { left: 0, right: 800, top: 100, bottom: 101 },
      // Text covers the entire line's width above it, leaving nothing free.
      occupied: [{ left: 0, right: 800, top: 70, bottom: 95 }],
    });
    const { container } = render(<SceneCat sceneId="hero" band="light" startIndex={0} />);

    await flushPlacement();

    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
    cleanupScene();
  });

  it('prefers full size over shrinking: a full-size spot on a second divider wins over a smaller spot on the first', async () => {
    stubMatchMedia(false);
    const section = document.createElement('section');
    section.id = 'hero';
    setRect(section, { left: 0, top: 0, right: 800, bottom: 400 });

    // First divider (header rule): only a narrow, sub-64px gap free.
    const headerDivider = document.createElement('div');
    headerDivider.className = 'border-t border-hairline';
    setRect(headerDivider, { left: 0, right: 800, top: 100, bottom: 100 });
    section.appendChild(headerDivider);
    const headerOccupied = document.createElement('span');
    headerOccupied.textContent = 'heading';
    setRect(headerOccupied, { left: 0, right: 770, top: 70, bottom: 95 });
    section.appendChild(headerOccupied);

    // Second divider (an EntryRow's bottom border): fully free, wide.
    const rowDivider = document.createElement('div');
    rowDivider.className = 'border-b border-hairline';
    setRect(rowDivider, { left: 0, right: 800, top: 300, bottom: 300 });
    section.appendChild(rowDivider);

    document.body.appendChild(section);

    const { container } = render(<SceneCat sceneId="hero" band="light" startIndex={0} />);
    await flushPlacement();

    const wrapper = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(wrapper).not.toBeNull();
    // Desktop ladder's largest size (112) should be used, on the second
    // (wide-open) divider, not a shrunk size squeezed onto the first.
    expect(parseFloat(wrapper.style.width)).toBe(112);
    expect(parseFloat(wrapper.style.top) + 112).toBeCloseTo(300, 0);

    section.remove();
  });

  it('falls back to a left-of-centre spot rather than omitting the cat when nothing fits on the right', async () => {
    stubMatchMedia(false);
    // The only free stretch, at every size down to the floor, sits left of
    // centre (divider spans 0-800, centre 400; free interval is 0-150).
    const cleanupScene = buildScene('hero', {
      dividerRect: { left: 0, right: 800, top: 100, bottom: 100 },
      occupied: [{ left: 150, right: 800, top: 70, bottom: 95 }],
    });
    const { container } = render(<SceneCat sceneId="hero" band="light" startIndex={0} />);

    await flushPlacement();

    const wrapper = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(wrapper).not.toBeNull();
    const left = parseFloat(wrapper.style.left);
    const size = parseFloat(wrapper.style.width);
    // Still full size (112, the largest desktop rung that fits in a
    // 150px-wide gap) — falling back to the left side must not also
    // force an unnecessary shrink.
    expect(size).toBe(112);
    expect(left + size).toBeLessThanOrEqual(150 + 0.01);
    cleanupScene();
  });

  it('renders no cat variant switching wrapper animation class under prefers-reduced-motion', async () => {
    stubMatchMedia(true);
    const cleanupScene = buildRoomyScene('hero');
    const { container } = render(<SceneCat sceneId="hero" band="light" startIndex={0} />);

    await flushPlacement();

    const wrapper = container.querySelector('[aria-hidden="true"]');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.className ?? '').not.toContain('cat-pop-in');
    cleanupScene();
  });

  it('advances to a different variant only on a genuine re-entry, not on every intersection callback', async () => {
    stubMatchMedia(false);
    const observer = stubIntersectionObserver();
    const cleanupScene = buildRoomyScene('projects');
    const { container } = render(<SceneCat sceneId="projects" band="dark" startIndex={0} />);

    await flushPlacement();

    const moodOf = () => container.querySelector('img')?.getAttribute('src');
    const initialMood = moodOf();
    expect(initialMood).toBeTruthy();

    // Repeated "still intersecting" callbacks (what actually fires while
    // scrolling through a section) must not change the variant.
    observer.fire(true);
    observer.fire(true);
    observer.fire(true);
    expect(moodOf()).toBe(initialMood);

    // Leaving, then a genuine re-entry, advances exactly once.
    observer.fire(false);
    await flushPlacement();
    observer.fire(true);
    await flushPlacement();
    expect(moodOf()).not.toBe(initialMood);

    const afterFirstReentry = moodOf();
    observer.fire(true);
    await flushPlacement();
    observer.fire(true);
    await flushPlacement();
    expect(moodOf()).toBe(afterFirstReentry);

    cleanupScene();
  });

  it('recomputes the x position (not just mood) on a genuine re-entry', async () => {
    stubMatchMedia(false);
    // Real randomness (not mocked): the free interval is 150-200px wide
    // and the pick is a continuous `start + Math.random() * width`, so an
    // exact repeat across two independent recomputes is a practical-zero
    // probability — this checks the recompute genuinely re-rolls x rather
    // than reusing a cached value, without pinning down where it lands.
    const observer = stubIntersectionObserver();
    const cleanupScene = buildRoomyScene('projects');
    const { container } = render(<SceneCat sceneId="projects" band="dark" startIndex={0} />);

    await flushPlacement();
    const leftOf = () =>
      (container.querySelector('[aria-hidden="true"]') as HTMLElement | null)?.style.left;
    const initialLeft = leftOf();

    observer.fire(false);
    await flushPlacement();
    observer.fire(true);
    await flushPlacement();

    expect(leftOf()).not.toBe(initialLeft);
    cleanupScene();
  });

  it('applies no glow/halo filter on the dark band (owner asked it removed)', async () => {
    stubMatchMedia(false);
    const cleanupScene = buildRoomyScene('projects');
    const { container } = render(<SceneCat sceneId="projects" band="dark" startIndex={0} />);

    await flushPlacement();

    const wrapper = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper.style.filter).toBe('');
    cleanupScene();
  });

  it('applies no glow/halo filter on the light or warm bands', async () => {
    stubMatchMedia(false);
    const cleanupScene = buildRoomyScene('hero');
    const { container } = render(<SceneCat sceneId="hero" band="light" startIndex={0} />);

    await flushPlacement();

    const wrapper = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper.style.filter).toBe('');
    cleanupScene();
  });
});
