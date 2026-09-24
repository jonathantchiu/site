// Downloads the mascot sprites and cosmetics from Bento's public repo, and
// converts any project screenshots dropped in assets/screenshots-src/, all
// to WebP at the sizes the site actually serves, writing everything into
// public/.
//
// Run once: node scripts/prepare-assets.mjs
// Output is committed, so this is build-prep, not part of `next build`.

import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import sharp from 'sharp';

const RAW = 'https://raw.githubusercontent.com/jonathantchiu/bento-money/main';

const MOODS = ['happy', 'neutral', 'sad', 'sleep'];

// Project screenshots are not downloaded from anywhere; they are supplied by
// hand, one source image per screen, dropped under
// assets/screenshots-src/<project-slug>/<name>.(png|jpg|jpeg). This walks
// that directory and emits the three responsive widths the Screenshot
// component's srcset expects at public/projects/<slug>/<name>-{480,768,1200}.webp.
const SCREENSHOTS_SRC_DIR = 'assets/screenshots-src';
const SCREENSHOT_WIDTHS = [480, 768, 1200];
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg']);

// Bento's anchor table and its asset table disagree on key spelling
// ('cowboy hat' vs cowboy_hat). This site uses kebab-case ids, so the mapping
// from our id to Bento's filename is explicit here.
const COSMETICS = {
  'cowboy-hat': 'cowboy_hat',
  'chef-hat': 'chef-hat',
  'sunglasses': 'sunglasses',
  'sport-glasses': 'sport-glasses',
  'bughunter-toy': 'bughunterToy',
};

async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function write(path, buffer) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, buffer);
  console.log(`  wrote ${path} (${Math.round(buffer.length / 1024)}KB)`);
}

async function sprite(url, out, width = 512) {
  const buf = await fetchBuffer(url);
  const webp = await sharp(buf)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  await write(out, webp);
}

async function convertScreenshot(srcPath, slug, name) {
  const buf = await readFile(srcPath);
  for (const width of SCREENSHOT_WIDTHS) {
    const webp = await sharp(buf)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    await write(`public/projects/${slug}/${name}-${width}.webp`, webp);
  }
}

async function convertScreenshots() {
  if (!existsSync(SCREENSHOTS_SRC_DIR)) {
    console.log(`  no ${SCREENSHOTS_SRC_DIR}/ found, skipping (nothing to convert)`);
    return;
  }

  const slugs = await readdir(SCREENSHOTS_SRC_DIR);
  for (const slug of slugs) {
    const slugDir = join(SCREENSHOTS_SRC_DIR, slug);
    if (!(await stat(slugDir)).isDirectory()) continue;

    const files = await readdir(slugDir);
    for (const file of files) {
      if (!IMAGE_EXTENSIONS.has(extname(file).toLowerCase())) continue;
      const name = file.slice(0, -extname(file).length);
      console.log(`  ${slug}/${name}`);
      await convertScreenshot(join(slugDir, file), slug, name);
    }
  }
}

async function main() {
  console.log('pets');
  for (const mood of MOODS) {
    await sprite(`${RAW}/NekoFinance/assets/pets/cat-${mood}.png`, `public/mascot/cat-${mood}.webp`);
  }

  console.log('cosmetics');
  for (const [id, source] of Object.entries(COSMETICS)) {
    await sprite(`${RAW}/NekoFinance/assets/shop/${source}.png`, `public/mascot/cosmetics/${id}.webp`);
  }

  console.log('screenshots');
  await convertScreenshots();

  console.log('done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
