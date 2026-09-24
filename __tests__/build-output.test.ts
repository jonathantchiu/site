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
});
