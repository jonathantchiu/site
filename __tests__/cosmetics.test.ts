import { describe, it, expect } from 'vitest';
import { getAnchor, anchorStyle } from '@/lib/cosmetics';

describe('getAnchor', () => {
  it('returns the cat/happy cowboy hat anchor from Bento', () => {
    expect(getAnchor('cowboy-hat', 'happy')).toEqual({
      x: 0.1865,
      y: -0.0487,
      width: 0.5263,
      height: 0.4626,
      rotate: 15.8,
    });
  });

  it('returns the cat/happy sunglasses anchor from Bento', () => {
    expect(getAnchor('sunglasses', 'happy')).toEqual({
      x: 0.1825,
      y: 0.2006,
      width: 0.3498,
      height: 0.3338,
      rotate: -5.1,
    });
  });

  it('keeps hats above the sprite box, which is intentional', () => {
    expect(getAnchor('cowboy-hat', 'happy').y).toBeLessThan(0);
    expect(getAnchor('chef-hat', 'happy').y).toBeLessThan(0);
  });
});

describe('anchorStyle', () => {
  it('converts anchor fractions to CSS percentages', () => {
    const style = anchorStyle(getAnchor('sunglasses', 'happy'));
    expect(style.left).toBe('18.25%');
    expect(style.top).toBe('20.06%');
    expect(style.width).toBe('34.98%');
    expect(style.transform).toBe('rotate(-5.1deg)');
  });
});
