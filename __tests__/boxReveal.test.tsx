import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BoxReveal } from '@/components/BoxReveal';

// jsdom has no matchMedia; components that check prefers-reduced-motion
// need a stub. `matches` is configurable per test so we can simulate both
// a reduced-motion reader and a normal one.
function stubMatchMedia(matches: boolean) {
  const listeners: Array<() => void> = [];
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: (_: string, cb: () => void) => listeners.push(cb),
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

describe('BoxReveal', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // This is the test that matters most: the spec's hard requirement is that
  // content is NEVER gated behind the reveal interaction. A reader on a
  // phone, arriving from a club-application link, must see everything even
  // if they never click or scroll far enough for the auto-reveal timer to
  // fire. If a future refactor changes BoxReveal to something like
  // `{revealed && children}`, this test fails immediately because children
  // are asserted present at first render, before any reveal has happened.
  it('always renders children in the DOM, before any reveal interaction has occurred', () => {
    stubMatchMedia(false);
    render(
      <BoxReveal>
        <p>Where he actually worked: SoFi.</p>
      </BoxReveal>
    );
    expect(screen.getByText('Where he actually worked: SoFi.')).toBeTruthy();
  });

  it('still renders children even while the box overlay is covering the section', () => {
    stubMatchMedia(false);
    render(
      <BoxReveal>
        <p>Still here underneath the box.</p>
      </BoxReveal>
    );
    // The overlay (if present) is a sibling, never a wrapper that could
    // conditionally omit this content.
    expect(screen.getByText('Still here underneath the box.')).toBeTruthy();
  });

  it('renders no box overlay when prefers-reduced-motion is set', () => {
    stubMatchMedia(true);
    const { container } = render(
      <BoxReveal>
        <p>Content</p>
      </BoxReveal>
    );
    expect(container.querySelector('svg')).toBeNull();
  });

  it('marks the overlay aria-hidden so it is invisible to assistive tech', () => {
    stubMatchMedia(false);
    const { container } = render(
      <BoxReveal>
        <p>Content</p>
      </BoxReveal>
    );
    const overlay = container.querySelector('[aria-hidden="true"]');
    expect(overlay).not.toBeNull();
  });

  it('the overlay is not keyboard-focusable', () => {
    stubMatchMedia(false);
    const { container } = render(
      <BoxReveal>
        <p>Content</p>
      </BoxReveal>
    );
    const overlay = container.querySelector('[aria-hidden="true"]');
    expect(overlay?.getAttribute('tabindex')).toBeNull();
    expect(overlay?.tagName.toLowerCase()).not.toBe('button');
  });

  it('removes the overlay once revealed by a click, and stays revealed', async () => {
    vi.useFakeTimers();
    stubMatchMedia(false);
    const { container } = render(
      <BoxReveal>
        <p>Content</p>
      </BoxReveal>
    );

    const overlay = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(overlay).not.toBeNull();

    await act(async () => {
      fireEvent.click(overlay);
    });
    // The tumble animation runs for a bit before the overlay is dropped
    // from the DOM entirely.
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(container.querySelector('svg')).toBeNull();
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
    expect(screen.getByText('Content')).toBeTruthy();

    vi.useRealTimers();
  });

  it('does not intercept clicks on content once revealed', async () => {
    vi.useFakeTimers();
    stubMatchMedia(false);
    const onContentClick = vi.fn();
    const { container } = render(
      <BoxReveal>
        <button onClick={onContentClick}>Click me</button>
      </BoxReveal>
    );

    const overlay = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    await act(async () => {
      fireEvent.click(overlay);
    });
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    fireEvent.click(screen.getByText('Click me'));
    expect(onContentClick).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('renders no box overlay when prefers-reduced-motion is set, even after a click attempt', async () => {
    vi.useFakeTimers();
    stubMatchMedia(true);
    const { container } = render(
      <BoxReveal>
        <p>Content</p>
      </BoxReveal>
    );

    // No overlay at all under reduced motion, so there is nothing to click,
    // but drive the clock forward anyway to be sure nothing appears later.
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(container.querySelector('svg')).toBeNull();

    vi.useRealTimers();
  });

  // The per-scene cat (components/SceneCat.tsx) is never rendered by this
  // component at all — it is a separate, independently-positioned
  // decoration. This file's own job is just the box: it topples on click
  // and unmounts once the sequence ends.
  it('knocks the box off on click, mid-sequence, and unmounts it once revealed', async () => {
    vi.useFakeTimers();
    stubMatchMedia(false);
    const { container } = render(
      <BoxReveal>
        <p>Content</p>
      </BoxReveal>
    );

    const overlay = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    await act(async () => {
      fireEvent.click(overlay);
    });

    // Mid-sequence: the box is on screen, mid-toppling. There is no
    // portal or cat sprite here any more — never an <img>.
    const box = container.querySelector('svg');
    expect(box).toBeTruthy();
    expect(box?.getAttribute('class')).toContain('box-knocked');
    expect(container.querySelector('img')).toBeNull();

    // Past the full sequence, the overlay unmounts entirely — same
    // guarantee as the plain box-reveal test above.
    await act(async () => {
      vi.advanceTimersByTime(1200);
    });

    expect(container.querySelector('svg')).toBeNull();
    expect(screen.getByText('Content')).toBeTruthy();

    vi.useRealTimers();
  });

  it('the box overlay goes pointer-events-none the instant it starts toppling, so it can never intercept a click meant for content', async () => {
    vi.useFakeTimers();
    stubMatchMedia(false);
    const { container } = render(
      <BoxReveal>
        <p>Content</p>
      </BoxReveal>
    );

    const overlay = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    await act(async () => {
      fireEvent.click(overlay);
    });

    expect(overlay.className).toContain('pointer-events-none');

    vi.useRealTimers();
  });
});
