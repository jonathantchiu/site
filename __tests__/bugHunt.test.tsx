import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BugHunt } from '@/components/BugHunt';

// jsdom has no matchMedia; stub it the same way BoxReveal's tests do so we
// can simulate both a reduced-motion reader and a normal one.
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

const STORAGE_KEY = 'bug-hunt-count';
// Comfortably past the component's 40s max scheduling interval and its 6s
// crossing duration, so a single advance is guaranteed to produce a bug on
// screen.
const PAST_MAX_INTERVAL = 41_000;

describe('BugHunt', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    try {
      window.localStorage.clear();
    } catch {
      // ignore — some tests intentionally break localStorage
    }
  });

  it('never renders a bug when prefers-reduced-motion is set, even after the interval elapses', async () => {
    vi.useFakeTimers();
    stubMatchMedia(true);
    const { container } = render(<BugHunt />);

    await act(async () => {
      vi.advanceTimersByTime(PAST_MAX_INTERVAL);
    });

    expect(container.querySelector('svg')).toBeNull();
    expect(container.querySelector('[data-testid="bug-hunt-bug"]')).toBeNull();
  });

  it('renders a clickable bug after the randomized interval elapses when motion is allowed', async () => {
    vi.useFakeTimers();
    stubMatchMedia(false);
    const { container } = render(<BugHunt />);

    await act(async () => {
      vi.advanceTimersByTime(PAST_MAX_INTERVAL);
    });

    expect(container.querySelector('[data-testid="bug-hunt-bug"]')).toBeTruthy();
  });

  it('the bug container cannot intercept pointer events; only the bug itself can', async () => {
    vi.useFakeTimers();
    stubMatchMedia(false);
    const { container } = render(<BugHunt />);

    await act(async () => {
      vi.advanceTimersByTime(PAST_MAX_INTERVAL);
    });

    const bug = container.querySelector('[data-testid="bug-hunt-bug"]') as HTMLElement;
    const strip = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(strip).not.toBeNull();
    expect(strip.className).toContain('pointer-events-none');
    expect(bug.className).toContain('pointer-events-auto');
  });

  it('clicking the bug increments the count and persists it to localStorage inside try/catch', async () => {
    vi.useFakeTimers();
    stubMatchMedia(false);
    const { container } = render(<BugHunt />);

    await act(async () => {
      vi.advanceTimersByTime(PAST_MAX_INTERVAL);
    });

    const bug = container.querySelector('[data-testid="bug-hunt-bug"]') as HTMLElement;
    await act(async () => {
      fireEvent.click(bug);
    });

    expect(screen.getByText('bugs caught: 1')).toBeTruthy();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('1');
  });

  it('hides the counter entirely at zero, so a first-time visitor sees nothing', () => {
    stubMatchMedia(false);
    render(<BugHunt />);
    expect(screen.queryByText(/bugs caught/)).toBeNull();
  });

  it('reads a previously persisted count from localStorage on mount', async () => {
    stubMatchMedia(false);
    window.localStorage.setItem(STORAGE_KEY, '4');

    render(<BugHunt />);

    await screen.findByText('bugs caught: 4');
  });

  it('renders correctly, with no thrown error, when localStorage is entirely unavailable', async () => {
    stubMatchMedia(false);
    const originalLocalStorage = window.localStorage;
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('localStorage is unavailable (private window)');
      },
    });

    expect(() => render(<BugHunt />)).not.toThrow();
    // No persisted count could be read, so the counter stays hidden.
    expect(screen.queryByText(/bugs caught/)).toBeNull();

    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: originalLocalStorage,
    });
  });

  it('does not throw when localStorage.setItem throws on catching a bug', async () => {
    vi.useFakeTimers();
    stubMatchMedia(false);
    const originalSetItem = window.localStorage.setItem.bind(window.localStorage);
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const { container } = render(<BugHunt />);
    await act(async () => {
      vi.advanceTimersByTime(PAST_MAX_INTERVAL);
    });
    const bug = container.querySelector('[data-testid="bug-hunt-bug"]') as HTMLElement;

    await act(async () => {
      expect(() => fireEvent.click(bug)).not.toThrow();
    });

    // The in-memory count still updates even though persistence failed.
    expect(screen.getByText('bugs caught: 1')).toBeTruthy();

    window.localStorage.setItem = originalSetItem;
  });
});
