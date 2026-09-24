import { describe, it, expect } from 'vitest';
import {
  getAllProjects,
  getFeaturedProjects,
  getProject,
  getProjectSlugs,
} from '@/lib/projects';

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
