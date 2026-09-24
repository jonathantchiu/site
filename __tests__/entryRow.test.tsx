import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EntryRow } from '@/components/EntryRow';

describe('EntryRow', () => {
  const original = process.env.NEXT_PUBLIC_BASE_PATH;

  afterEach(() => {
    if (original === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
    else process.env.NEXT_PUBLIC_BASE_PATH = original;
  });

  it('renders title, subtitle, date, and blurb', () => {
    render(
      <EntryRow
        href="/experience"
        logo="/logos/sofi.webp"
        title="SoFi"
        subtitle="Software Engineering Intern"
        date="June 2026 — Sept 2026"
        blurb="Built guardrails for an AI financial assistant."
      />
    );
    expect(screen.getByText('SoFi')).toBeTruthy();
    expect(screen.getByText('Software Engineering Intern')).toBeTruthy();
    expect(screen.getByText('June 2026 — Sept 2026')).toBeTruthy();
    expect(screen.getByText('Built guardrails for an AI financial assistant.')).toBeTruthy();
  });

  it('wraps the whole row in a single link to href', () => {
    render(
      <EntryRow
        href="/projects/bento"
        title="Bento"
        subtitle="A budgeting app."
        date="2026"
      />
    );
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/projects/bento');
    expect(link.textContent).toContain('Bento');
    expect(link.textContent).toContain('A budgeting app.');
  });

  it('uses an external anchor when external is set', () => {
    render(
      <EntryRow
        href="https://github.com/jonathantchiu"
        title="GitHub"
        subtitle="Profile"
        date=""
        external
      />
    );
    const link = screen.getByRole('link');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('https://github.com/jonathantchiu');
  });

  it('marks the logo decorative', () => {
    const { container } = render(
      <EntryRow href="/experience" logo="/logos/sofi.webp" title="SoFi" subtitle="Intern" date="2026" />
    );
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('');
  });

  it('prefixes the logo src with the base path', () => {
    process.env.NEXT_PUBLIC_BASE_PATH = '/site';
    const { container } = render(
      <EntryRow href="/experience" logo="/logos/sofi.webp" title="SoFi" subtitle="Intern" date="2026" />
    );
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/site/logos/sofi.webp');
  });

  it('renders no img element when no logo is given', () => {
    const { container } = render(
      <EntryRow href="/experience" title="SoFi" subtitle="Intern" date="2026" />
    );
    expect(container.querySelector('img')).toBeNull();
  });

  it('gives the row a 44px-minimum tap target', () => {
    render(
      <EntryRow href="/experience" logo="/logos/sofi.webp" title="SoFi" subtitle="Intern" date="2026" />
    );
    const link = screen.getByRole('link');
    expect(link.className).toMatch(/min-h-\[44px\]/);
  });
});
