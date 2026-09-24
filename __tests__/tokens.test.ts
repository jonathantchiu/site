import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const linear = channels.map((c) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function token(name: string): string {
  const css = readFileSync('app/globals.css', 'utf8');
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`));
  if (!match) throw new Error(`token --${name} not found in app/globals.css`);
  return match[1];
}

describe('palette', () => {
  it('body ink on cream passes AA for normal text', () => {
    expect(contrast(token('ink'), token('cream'))).toBeGreaterThanOrEqual(4.5);
  });

  it('accent text on cream passes AA for normal text', () => {
    expect(contrast(token('orange-text'), token('cream'))).toBeGreaterThanOrEqual(4.5);
  });

  it('muted text on sand passes AA for normal text', () => {
    expect(contrast(token('muted'), token('sand'))).toBeGreaterThanOrEqual(4.5);
  });

  it('decorative orange is documented as failing, so it is never used for text', () => {
    expect(contrast(token('orange'), token('cream'))).toBeLessThan(4.5);
  });
});
