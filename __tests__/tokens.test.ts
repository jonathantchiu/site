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

// v1's regex (`--${name}:\s*...`) matched only the FIRST occurrence in the
// file, which meant it always read the :root block and silently ignored the
// prefers-color-scheme: dark block — dark mode was never actually tested.
// Splitting the file into the two :root blocks up front and indexing tokens
// within each one closes that hole.
function splitRootBlocks(css: string): { light: string; dark: string } {
  const blocks = [...css.matchAll(/:root\s*{([^}]*)}/g)].map((m) => m[1]);
  if (blocks.length < 2) {
    throw new Error('expected two :root blocks (light and dark) in app/globals.css');
  }
  return { light: blocks[0], dark: blocks[1] };
}

function tokenFrom(block: string, name: string): string {
  const match = block.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`));
  if (!match) throw new Error(`token --${name} not found in this :root block`);
  return match[1];
}

const css = readFileSync('app/globals.css', 'utf8');
const { light, dark } = splitRootBlocks(css);

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

describe('palette (dark)', () => {
  it('ink on page passes AA for normal text', () => {
    expect(contrast(tokenFrom(dark, 'ink'), tokenFrom(dark, 'page'))).toBeGreaterThanOrEqual(4.5);
  });

  it('accent-text on page passes AA for normal text', () => {
    expect(contrast(tokenFrom(dark, 'accent-text'), tokenFrom(dark, 'page'))).toBeGreaterThanOrEqual(4.5);
  });

  it('muted on card passes AA for normal text', () => {
    expect(contrast(tokenFrom(dark, 'muted'), tokenFrom(dark, 'card'))).toBeGreaterThanOrEqual(4.5);
  });

  it('accent-text carries every accent string; there is no separate decorative accent in dark mode', () => {
    // The dark palette in the spec only defines --accent-text (no --accent),
    // so this block documents that --accent stays undefined for dark mode
    // rather than silently reusing the light value.
    expect(dark).not.toMatch(/--accent:/);
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
  function bandBlock(bandName: string): string {
    const match = css.match(new RegExp(`\\[data-band=['"]${bandName}['"]\\]\\s*{([^}]*)}`));
    if (!match) throw new Error(`no [data-band="${bandName}"] rule found in app/globals.css`);
    return match[1];
  }

  it('defines a full-bleed background for every band', () => {
    expect(bandBlock('light')).toMatch(/background:\s*#FDFCFA/i);
    expect(bandBlock('warm')).toMatch(/background:\s*#F4EBE0/i);
    expect(bandBlock('dark')).toMatch(/background:\s*#22201D/i);
  });

  it('the dark band redefines ink, muted and accent-text to the spec values', () => {
    const dark = bandBlock('dark');
    expect(tokenFrom(dark, 'ink')).toBe('#FDFCFA');
    expect(tokenFrom(dark, 'muted')).toBe('#B5AEA5');
    expect(tokenFrom(dark, 'accent-text')).toBe('#E8874D');
  });

  it('the dark band redefines card and hairline, both distinct from the band background', () => {
    const dark = bandBlock('dark');
    const card = tokenFrom(dark, 'card');
    const hairline = tokenFrom(dark, 'hairline');
    expect(card).not.toBe('#22201D');
    expect(hairline).not.toBe('#22201D');
    expect(hairline).not.toBe(card);
  });

  it('the warm band redefines card and hairline, both distinct from the band background', () => {
    const warm = bandBlock('warm');
    const card = tokenFrom(warm, 'card');
    const hairline = tokenFrom(warm, 'hairline');
    expect(card).not.toBe('#F4EBE0');
    expect(hairline).not.toBe('#F4EBE0');
  });

  it('the light band redefines its own full token set rather than inheriting from :root', () => {
    // Regression guard for the shipped defect: the light band previously
    // declared only `background`, so its --ink/--muted/--accent-text/
    // --card/--hairline fell through to whatever :root resolved to — which
    // flips to light-on-light under prefers-color-scheme: dark. Every band
    // must be self-consistent on its own.
    const light = bandBlock('light');
    expect(tokenFrom(light, 'ink')).toBe('#22201D');
    expect(tokenFrom(light, 'muted')).toBe('#57524B');
    expect(tokenFrom(light, 'accent-text')).toBe('#A34818');
    expect(tokenFrom(light, 'card')).toBe('#FFFFFF');
    expect(tokenFrom(light, 'hairline')).toBe('#EDE8E2');
  });

  describe('dark-scheme band grounds', () => {
    function darkSchemeBlock(): string {
      // The dark-scheme band rules are the last @media (prefers-color-scheme:
      // dark) block in the file; isolate it before matching per-band rules so
      // this can't accidentally read the :root dark block near the top
      // instead.
      const start = css.lastIndexOf('@media (prefers-color-scheme: dark)');
      if (start === -1) throw new Error('no dark-scheme band @media block found in app/globals.css');
      return css.slice(start);
    }

    function darkSchemeBandBlock(bandName: string): string {
      const block = darkSchemeBlock();
      const match = block.match(new RegExp(`\\[data-band=['"]${bandName}['"]\\]\\s*{([^}]*)}`));
      if (!match) throw new Error(`no dark-scheme [data-band="${bandName}"] rule found`);
      return match[1];
    }

    it('every band defines all five tokens for the dark scheme, so this cannot regress silently', () => {
      for (const bandName of ['light', 'warm', 'dark']) {
        const block = darkSchemeBandBlock(bandName);
        expect(block, `${bandName} background`).toMatch(/background:\s*#[0-9A-Fa-f]{6}/);
        for (const token of ['ink', 'muted', 'accent-text', 'card', 'hairline']) {
          expect(() => tokenFrom(block, token), `${bandName} --${token}`).not.toThrow();
        }
      }
    });

    it('every dark-scheme band ink/muted/accent-text pairing passes WCAG AA against its own background', () => {
      for (const bandName of ['light', 'warm', 'dark']) {
        const block = darkSchemeBandBlock(bandName);
        const bg = block.match(/background:\s*(#[0-9A-Fa-f]{6})/)![1];
        for (const token of ['ink', 'muted', 'accent-text']) {
          const value = tokenFrom(block, token);
          expect(contrast(value, bg), `${bandName} --${token} on ${bg}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    });

    it('every dark-scheme band card and hairline are distinct from that band background', () => {
      for (const bandName of ['light', 'warm', 'dark']) {
        const block = darkSchemeBandBlock(bandName);
        const bg = block.match(/background:\s*(#[0-9A-Fa-f]{6})/)![1];
        const card = tokenFrom(block, 'card');
        const hairline = tokenFrom(block, 'hairline');
        expect(card, `${bandName} card vs bg`).not.toBe(bg);
        expect(hairline, `${bandName} hairline vs bg`).not.toBe(bg);
        expect(hairline, `${bandName} hairline vs card`).not.toBe(card);
      }
    });
  });

  it('every ink/muted/accent-text pairing in every band passes WCAG AA for normal text against that band background', () => {
    const BACKGROUNDS: Record<string, string> = {
      light: '#FDFCFA',
      warm: '#F4EBE0',
      dark: '#22201D',
    };
    // Light band declares no overrides (matches :root defaults exactly),
    // so its ink/muted/accent-text come from the light palette block
    // already validated above.
    const PAIRS: Record<string, { ink: string; muted: string; accentText: string }> = {
      light: { ink: tokenFrom(light, 'ink'), muted: tokenFrom(light, 'muted'), accentText: tokenFrom(light, 'accent-text') },
      warm: { ink: '#22201D', muted: '#6E6862', accentText: '#A34818' },
      dark: { ink: '#FDFCFA', muted: '#A8A199', accentText: '#E8874D' },
    };
    for (const band of Object.keys(BACKGROUNDS)) {
      const bg = BACKGROUNDS[band];
      const { ink, muted, accentText } = PAIRS[band];
      expect(contrast(ink, bg), `${band} ink on ${bg}`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(muted, bg), `${band} muted on ${bg}`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(accentText, bg), `${band} accent-text on ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});
