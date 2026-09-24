// Guards against Reveal (or anything else) shipping opacity:0 into the
// static HTML. During static export there is no browser, so any component
// that bakes a hidden initial style into its first render leaves no-JS (or
// slow-JS) readers looking at a blank page. This test runs a real
// `next build` against a static export and inspects the emitted HTML
// directly, rather than asserting against component internals, so it
// catches the regression no matter which component reintroduces it.
import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT_DIR = join(process.cwd(), 'out');

function allHtmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return allHtmlFiles(full);
    return entry.name.endsWith('.html') ? [full] : [];
  });
}

describe('static export output', () => {
  beforeAll(() => {
    execSync('npm run build', {
      cwd: process.cwd(),
      env: { ...process.env, NEXT_PUBLIC_BASE_PATH: '/site' },
      stdio: 'inherit',
    });
  }, 180_000);

  it('ships no inline opacity:0, so no-JS readers never see blank content', () => {
    const htmlFiles = allHtmlFiles(OUT_DIR);
    expect(htmlFiles.length).toBeGreaterThan(0);

    for (const file of htmlFiles) {
      const html = readFileSync(file, 'utf8');
      // Matches a bare `opacity:0` value (not `opacity:0.4`) however it is
      // quoted or terminated in the emitted inline style attribute.
      expect(html, file).not.toMatch(/opacity:0(?![.\d])/);
    }
  });

  // Guards against next-mdx-remote v6 silently dropping expression-valued
  // JSX attributes (width={1200} height={2478}) on <Screenshot /> used
  // inside MDX. When that happens every inline screenshot silently falls
  // back to the Screenshot component's defaults (width=768 height=1024),
  // which reserves the wrong aspect ratio and causes layout shift. None of
  // the real screenshots referenced from bento.mdx or cognify.mdx are
  // actually 768x1024, so that exact pairing appearing on an <img> in
  // either page's output means the dimensions were dropped, not that they
  // were genuinely correct.
  it('preserves real screenshot dimensions from MDX instead of falling back to Screenshot defaults', () => {
    for (const page of ['projects/bento.html', 'projects/cognify.html']) {
      const file = join(OUT_DIR, page);
      const html = readFileSync(file, 'utf8');
      const imgTags = html.match(/<img\b[^>]*>/g) ?? [];
      expect(imgTags.length).toBeGreaterThan(0);

      for (const tag of imgTags) {
        const isDefaultDims = /width="768"/.test(tag) && /height="1024"/.test(tag);
        expect(isDefaultDims, `${page} img carries dropped-attribute default dimensions: ${tag}`).toBe(
          false,
        );
      }
    }
  });
});
