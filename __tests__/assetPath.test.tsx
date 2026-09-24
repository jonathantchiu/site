import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { assetPath } from '@/lib/assetPath';

describe('assetPath', () => {
  const original = process.env.NEXT_PUBLIC_BASE_PATH;

  afterEach(() => {
    if (original === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
    else process.env.NEXT_PUBLIC_BASE_PATH = original;
  });

  it('returns the input unchanged when no base is set', () => {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
    expect(assetPath('/mascot/cat-happy.webp')).toBe('/mascot/cat-happy.webp');
  });

  it('prefixes the base path when one is set', () => {
    process.env.NEXT_PUBLIC_BASE_PATH = '/site';
    expect(assetPath('/mascot/cat-happy.webp')).toBe('/site/mascot/cat-happy.webp');
  });

  it('does not produce a double slash when the base has a trailing slash', () => {
    process.env.NEXT_PUBLIC_BASE_PATH = '/site/';
    expect(assetPath('/mascot/cat-happy.webp')).toBe('/site/mascot/cat-happy.webp');
  });

  it('is idempotent-safe: repeated calls with the same base do not compound', () => {
    process.env.NEXT_PUBLIC_BASE_PATH = '/site';
    const once = assetPath('/mascot/cat-happy.webp');
    expect(once).toBe('/site/mascot/cat-happy.webp');
  });
});

describe('Screenshot srcSet under a base path', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_BASE_PATH = '/site';
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
  });

  it('prefixes all three widths', async () => {
    const { render, screen } = await import('@testing-library/react');
    const { Screenshot } = await import('@/components/Screenshot');
    render(<Screenshot base="/projects/bento/home" alt="Bento home screen" />);
    const img = screen.getByAltText('Bento home screen');
    expect(img.getAttribute('srcset')).toContain(
      '/site/projects/bento/home-480.webp 480w'
    );
    expect(img.getAttribute('srcset')).toContain(
      '/site/projects/bento/home-768.webp 768w'
    );
    expect(img.getAttribute('srcset')).toContain(
      '/site/projects/bento/home-1200.webp 1200w'
    );
    expect(img.getAttribute('src')).toBe('/site/projects/bento/home-768.webp');
  });
});
