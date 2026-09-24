import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

const CONTENT_DIR = join(process.cwd(), 'content', 'projects');

export interface Project {
  slug: string;
  title: string;
  year: string;
  hook: string;
  stack: string[];
  repo: string;
  cover: string;
  featured: boolean;
  content: string;
}

function parse(filename: string): Project {
  const slug = filename.replace(/\.mdx$/, '');
  const raw = readFileSync(join(CONTENT_DIR, filename), 'utf8');
  const { data, content } = matter(raw);

  for (const field of ['title', 'year', 'hook', 'stack', 'repo', 'cover']) {
    if (data[field] === undefined) {
      throw new Error(`${filename}: missing required frontmatter field "${field}"`);
    }
  }

  return {
    slug,
    title: String(data.title),
    year: String(data.year),
    hook: String(data.hook),
    stack: data.stack as string[],
    repo: String(data.repo),
    cover: String(data.cover),
    featured: Boolean(data.featured),
    content,
  };
}

export function getAllProjects(): Project[] {
  return readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map(parse)
    .sort((a, b) => b.year.localeCompare(a.year));
}

export function getFeaturedProjects(): Project[] {
  return getAllProjects().filter((p) => p.featured);
}

export function getProject(slug: string): Project | null {
  return getAllProjects().find((p) => p.slug === slug) ?? null;
}

export function getProjectSlugs(): string[] {
  return getAllProjects().map((p) => p.slug);
}
