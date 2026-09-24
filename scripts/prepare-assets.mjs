// Downloads source art and screenshots, converts everything to WebP at the
// sizes the site actually serves, and writes them into public/.
//
// Run once: node scripts/prepare-assets.mjs
// Output is committed, so this is build-prep, not part of `next build`.

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import sharp from 'sharp';

const RAW = 'https://raw.githubusercontent.com/jonathantchiu/bento-money/main';

const MOODS = ['happy', 'neutral', 'sad', 'sleep'];

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

async function main() {
  console.log('pets');
  for (const mood of MOODS) {
    await sprite(`${RAW}/NekoFinance/assets/pets/cat-${mood}.png`, `public/mascot/cat-${mood}.webp`);
  }

  console.log('cosmetics');
  for (const [id, source] of Object.entries(COSMETICS)) {
    await sprite(`${RAW}/NekoFinance/assets/shop/${source}.png`, `public/mascot/cosmetics/${id}.webp`);
  }

  console.log('done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
