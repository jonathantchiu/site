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

const REMOVED_TOKENS = ['cream', 'sand', 'orange', 'orange-text'];

// The site deliberately does NOT follow the OS color scheme. The alternating
// section bands are the color design, and an OS inversion on top of them
// flattened all four into one dark wash and erased the section breaks. So
// there is a single :root block, and each band declares its own complete
// token set.
function rootBlock(css: string): string {
  const blocks = [...css.matchAll(/:root\s*{([^}]*)}/g)].map((m) => m[1]);
  if (blocks.length !== 1) {
    throw new Error(`expected exactly one :root block, found ${blocks.length}`);
  }
  return blocks[0];
}

function bandBlock(css: string, band: string): string {
  const match = css.match(new RegExp(`\\[data-band='${band}'\\]\\s*{([\\s\\S]*?)}`));
  if (!match) throw new Error(`band ${band} not found in app/globals.css`);
  return match[1];
}

function bandBackground(block: string): string {
  const match = block.match(/background:\s*(#[0-9A-Fa-f]{6})/);
  if (!match) throw new Error('band declares no explicit background');
  return match[1];
}

function tokenFrom(block: string, name: string): string {
  const match = block.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`));
  if (!match) throw new Error(`token --${name} not found in this block`);
  return match[1];
}

const css = readFileSync('app/globals.css', 'utf8');
const light = rootBlock(css);
const BANDS = ['light', 'warm', 'dark'] as const;
const BAND_TOKENS = ['ink', 'muted', 'accent-text', 'card', 'hairline'] as const;

describe('palette (light)', () => {
  it('ink on page passes AA for normal text', () => {
    expect(contrast(tokenFrom(light, 'ink'), tokenFrom(light, 'page'))).toBeGreaterThanOrEqual(4.5);
  });

  it('accent-text on page passes AA for normal text', () => {
    expect(contrast(tokenFrom(light, 'accent-text'), tokenFrom(light, 'page'))).toBeGreaterThanOrEqual(4.5);
  });

  it('muted on card passes AA for normal text', () => {
    expect(contrast(tokenFrom(light, 'muted'), tokenFrom(light, 'card'))).toBeGreaterThanOrEqual(4.5);
  });

  it('decorative accent is documented as failing, so it is never used for text', () => {
    expect(contrast(tokenFrom(light, 'accent'), tokenFrom(light, 'page'))).toBeLessThan(4.5);
  });
});

describe('no orphaned v1 tokens', () => {
  it('app/globals.css does not declare any removed token', () => {
    for (const name of REMOVED_TOKENS) {
      expect(css).not.toMatch(new RegExp(`--${name}:`));
    }
  });
});

// v3.1 spec: section color bands. Bands are implemented by scoping token
// custom properties per band with [data-band="..."] selectors (see
// components/Scene.tsx and the comment above these rules in
// app/globals.css), not by conditional classNames at each call site. This
// asserts those override blocks are actually present with the exact,
// pre-contrast-checked values from the spec — not merely that some rule
// named "dark" exists.

describe('section color bands', () => {
  it('the site does not invert with the OS color scheme', () => {
    // An OS-driven inversion flattened the four bands into one dark wash and
    // removed the section breaks entirely, which is the opposite of what the
    // bands exist to do.
    expect(css).not.toMatch(/@media\s*\(prefers-color-scheme:\s*dark\)/);
  });

  for (const band of BANDS) {
    describe(`the ${band} band`, () => {
      const block = bandBlock(css, band);
      const bg = bandBackground(block);

      it('declares its own complete token set rather than inheriting one', () => {
        // A band's ground is fixed, so its foregrounds must be fixed with it.
        for (const token of BAND_TOKENS) {
          expect(() => tokenFrom(block, token), `--${token} on ${band}`).not.toThrow();
        }
      });

      it('carries body text at AA against its own background', () => {
        expect(contrast(tokenFrom(block, 'ink'), bg)).toBeGreaterThanOrEqual(4.5);
      });

      it('carries secondary text at AA against its own background', () => {
        expect(contrast(tokenFrom(block, 'muted'), bg)).toBeGreaterThanOrEqual(4.5);
      });

      it('carries accent text at AA against its own background', () => {
        expect(contrast(tokenFrom(block, 'accent-text'), bg)).toBeGreaterThanOrEqual(4.5);
      });

      it('has a light ground with dark text, or a dark ground with light text', () => {
        // The failure this guards is a light heading on a light band.
        const groundIsLight = luminance(bg) > 0.5;
        const inkIsLight = luminance(tokenFrom(block, 'ink')) > 0.5;
        expect(inkIsLight).toBe(!groundIsLight);
      });
    });
  }
});
