import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Screenshot } from '@/components/Screenshot';

describe('Screenshot', () => {
  it('offers all three widths so phones do not download the desktop file', () => {
    render(<Screenshot base="/projects/bento/home" alt="Bento home screen" />);
    const img = screen.getByAltText('Bento home screen');
    expect(img.getAttribute('srcset')).toContain('/projects/bento/home-480.webp 480w');
    expect(img.getAttribute('srcset')).toContain('/projects/bento/home-768.webp 768w');
    expect(img.getAttribute('srcset')).toContain('/projects/bento/home-1200.webp 1200w');
  });

  it('tells the browser a phone gets a full-width image', () => {
    render(<Screenshot base="/projects/bento/home" alt="Bento home screen" />);
    expect(screen.getByAltText('Bento home screen').getAttribute('sizes'))
      .toBe('(max-width: 768px) 100vw, 768px');
  });

  it('sets explicit dimensions so layout does not shift', () => {
    render(<Screenshot base="/projects/bento/home" alt="Bento home screen" />);
    const img = screen.getByAltText('Bento home screen');
    expect(img.getAttribute('width')).toBeTruthy();
    expect(img.getAttribute('height')).toBeTruthy();
  });

  it('uses the real dimensions passed in, not the hardcoded default, to avoid layout shift', () => {
    render(
      <Screenshot
        base="/projects/cognify/notes"
        alt="Cognify notes screen"
        width={768}
        height={562}
      />
    );
    const img = screen.getByAltText('Cognify notes screen');
    expect(img.getAttribute('width')).toBe('768');
    expect(img.getAttribute('height')).toBe('562');
  });
});
