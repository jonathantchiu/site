import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Screenshot } from '@/components/Screenshot';
import { ProjectCard } from '@/components/ProjectCard';
import type { Project } from '@/lib/projects';

const project: Project = {
  slug: 'bento',
  title: 'Bento',
  year: '2026',
  hook: 'A budgeting app where staying under budget raises a virtual pet.',
  stack: ['React Native', 'Expo'],
  repo: 'https://github.com/jonathantchiu/bento-money',
  cover: '/projects/bento/home',
  coverWidth: 768,
  coverHeight: 1586,
  featured: true,
  content: 'body',
};

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

describe('ProjectCard', () => {
  it('shows the title, year, hook, and stack', () => {
    render(<ProjectCard project={project} />);
    expect(screen.getByText('Bento')).toBeTruthy();
    expect(screen.getByText('2026')).toBeTruthy();
    expect(screen.getByText(project.hook)).toBeTruthy();
    expect(screen.getByText('React Native')).toBeTruthy();
  });

  it('links to the project detail page', () => {
    render(<ProjectCard project={project} />);
    const link = screen.getByRole('link', { name: /Bento/ });
    expect(link.getAttribute('href')).toBe('/projects/bento');
  });

  it("renders the cover at the project's frontmatter dimensions, not Screenshot's default", () => {
    render(<ProjectCard project={project} />);
    const img = screen.getByAltText('Bento screenshot');
    expect(img.getAttribute('height')).toBe('1586');
    expect(img.getAttribute('height')).not.toBe('1024');
    expect(img.getAttribute('width')).toBe('768');
  });
});
