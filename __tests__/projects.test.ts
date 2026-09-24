import { describe, it, expect } from 'vitest';
import {
  getAllProjects,
  getFeaturedProjects,
  getProject,
  getProjectSlugs,
  sortByYearDesc,
  selectFeatured,
  type Project,
} from '@/lib/projects';

function makeProject(overrides: Partial<Project>): Project {
  return {
    slug: 'placeholder',
    title: 'Placeholder',
    year: '2020',
    hook: 'A placeholder hook.',
    stack: ['TypeScript'],
    repo: 'https://github.com/example/placeholder',
    cover: '/projects/placeholder/cover',
    coverWidth: 768,
    coverHeight: 1024,
    featured: false,
    content: 'x'.repeat(250),
    ...overrides,
  };
}

describe('getAllProjects', () => {
  it('returns every project in content/projects', () => {
    const projects = getAllProjects();
    expect(projects.length).toBeGreaterThanOrEqual(2);
    expect(projects.map((p) => p.slug).sort()).toEqual(['bento', 'cognify']);
  });

  it('sorts newest year first', () => {
    const years = getAllProjects().map((p) => p.year);
    expect([...years].sort().reverse()).toEqual(years);
  });

  it('parses every required frontmatter field', () => {
    for (const project of getAllProjects()) {
      expect(project.title, `${project.slug} title`).toBeTruthy();
      expect(project.year, `${project.slug} year`).toMatch(/^\d{4}$/);
      expect(project.hook, `${project.slug} hook`).toBeTruthy();
      expect(project.stack.length, `${project.slug} stack`).toBeGreaterThan(0);
      expect(project.repo, `${project.slug} repo`).toMatch(/^https:\/\/github\.com\//);
      expect(project.content.length, `${project.slug} body`).toBeGreaterThan(200);
    }
  });
});

describe('getFeaturedProjects', () => {
  it('returns only featured projects', () => {
    const featured = getFeaturedProjects();
    expect(featured.length).toBeGreaterThan(0);
    expect(featured.every((p) => p.featured)).toBe(true);
  });
});

describe('getProject', () => {
  it('finds a project by slug', () => {
    expect(getProject('bento')?.title).toBe('Bento');
  });

  it('returns null for an unknown slug', () => {
    expect(getProject('does-not-exist')).toBeNull();
  });
});

describe('getProjectSlugs', () => {
  it('returns one slug per project', () => {
    expect(getProjectSlugs().sort()).toEqual(['bento', 'cognify']);
  });
});

describe('sortByYearDesc', () => {
  it('sorts a synthetic set of distinct years newest first', () => {
    const input = [
      makeProject({ slug: 'a', year: '2024' }),
      makeProject({ slug: 'b', year: '2026' }),
      makeProject({ slug: 'c', year: '2025' }),
    ];
    expect(sortByYearDesc(input).map((p) => p.slug)).toEqual(['b', 'c', 'a']);
  });

  it('does not mutate the input array', () => {
    const input = [
      makeProject({ slug: 'a', year: '2024' }),
      makeProject({ slug: 'b', year: '2026' }),
    ];
    const originalOrder = input.map((p) => p.slug);
    sortByYearDesc(input);
    expect(input.map((p) => p.slug)).toEqual(originalOrder);
  });
});

describe('selectFeatured', () => {
  it('keeps only featured projects from a mixed synthetic set', () => {
    const input = [
      makeProject({ slug: 'a', featured: true }),
      makeProject({ slug: 'b', featured: false }),
      makeProject({ slug: 'c', featured: true }),
    ];
    expect(selectFeatured(input).map((p) => p.slug)).toEqual(['a', 'c']);
  });
});
