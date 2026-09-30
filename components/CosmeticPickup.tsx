'use client';

import { useEffect, useState } from 'react';
import type { CosmeticId } from '@/lib/cosmetics';
import { COLLECTIBLES, collect, useInventory } from '@/lib/inventory';
import { assetPath } from '@/lib/assetPath';

// One collectible lying somewhere in its Scene, pulsing until the reader
// clicks it into their inventory (lib/inventory.ts). Once owned it is gone
// for good, even if unequipped later.
//
// Its spot is random on every visit, but always in blank space: after
// layout settles it measures everything visible in the scene (text,
// images, icons, the cat) and tries random positions until one clears all
// of it by a margin. It also stays out of the middle fifth of the width,
// so it never reads as placed dead-center. If nothing fits, it sits in
// the scene's top padding, which is always empty. Client-only, so the static export never ships a
// pickup.
// Phones get a smaller item and a wider berth from text, since there is
// less blank space to go around and a crowded pickup reads as clutter.
const PHONE_BREAKPOINT = 640;

function metrics() {
  return window.innerWidth < PHONE_BREAKPOINT
    ? { size: 44, margin: 20, edge: 8 }
    : { size: 56, margin: 16, edge: 16 };
}
const TRIES = 120;
// Fraction of the scene width, centered, that a pickup may not overlap.
const CENTER_BAND = 0.2;

interface Spot {
  left: number;
  top: number;
  size: number;
}

function isObstacle(el: Element): boolean {
  if (el.closest('[data-pickup]')) return false;
  if (el.matches('[data-scene-cat]')) return true;
  const tag = el.tagName.toLowerCase();
  if (tag === 'img' || tag === 'svg') return true;
  // Any element with its own text counts, not just leaves: a paragraph
  // with a link inside it still has text of its own around the link.
  return Array.from(el.childNodes).some(
    (n) => n.nodeType === Node.TEXT_NODE && Boolean(n.textContent?.trim())
  );
}

function findSpot(section: HTMLElement): Spot {
  const { size: SIZE, margin: MARGIN, edge: EDGE } = metrics();
  const box = section.getBoundingClientRect();
  const obstacles = Array.from(section.querySelectorAll('*'))
    .filter(isObstacle)
    .map((el) => el.getBoundingClientRect())
    .filter((r) => r.width > 0 && r.height > 0)
    .map((r) => ({
      left: r.left - box.left - MARGIN,
      right: r.right - box.left + MARGIN,
      top: r.top - box.top - MARGIN,
      bottom: r.bottom - box.top + MARGIN,
    }));

  const maxLeft = box.width - SIZE - EDGE;
  const maxTop = box.height - SIZE - EDGE;
  const bandStart = box.width * (0.5 - CENTER_BAND / 2);
  const bandEnd = box.width * (0.5 + CENTER_BAND / 2);
  const offCenter = (left: number) => left + SIZE <= bandStart || left >= bandEnd;
  const randomLeft = () => EDGE + Math.random() * Math.max(0, maxLeft - EDGE);

  for (let i = 0; i < TRIES; i++) {
    const left = randomLeft();
    const top = EDGE + Math.random() * Math.max(0, maxTop - EDGE);
    const clear = obstacles.every(
      (o) => left + SIZE <= o.left || left >= o.right || top + SIZE <= o.top || top >= o.bottom
    );
    if (clear && offCenter(left)) return { left, top, size: SIZE };
  }
  // Fallback: the top padding band, still clear of the section number.
  const clearAtTop = (left: number) =>
    obstacles.every((o) => left + SIZE <= o.left || left >= o.right || EDGE + SIZE <= o.top || EDGE >= o.bottom);
  let left = randomLeft();
  for (let i = 0; i < TRIES && !(offCenter(left) && clearAtTop(left)); i++) left = randomLeft();
  return { left, top: EDGE, size: SIZE };
}

export function CosmeticPickup({ id, sceneId }: { id: CosmeticId; sceneId: string }) {
  const [spot, setSpot] = useState<Spot | null>(null);
  const { owned } = useInventory();
  const isOwned = owned.includes(id);

  useEffect(() => {
    if (isOwned) return;
    const place = () => {
      const section = document.getElementById(sceneId);
      if (section) setSpot(findSpot(section));
    };
    // Two frames so the cat and fonts have laid out before measuring.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(place);
    });
    let resizeRaf = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(place);
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      cancelAnimationFrame(resizeRaf);
      window.removeEventListener('resize', onResize);
    };
  }, [isOwned, sceneId]);

  if (isOwned || !spot) return null;

  const name = COLLECTIBLES.find((c) => c.id === id)?.name ?? id;

  return (
    <button
      type="button"
      aria-label={`Pick up the ${name.toLowerCase()}`}
      data-pickup={id}
      onClick={() => collect(id)}
      className="game absolute z-10 flex cursor-pointer select-none items-center justify-center rounded-lg [-webkit-tap-highlight-color:transparent] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--g-primary)]"
      style={{ left: spot.left, top: spot.top, width: spot.size, height: spot.size }}
    >
      <img
        src={assetPath(`/mascot/cosmetics/${id}.webp`)}
        alt=""
        draggable={false}
        width={spot.size}
        height={spot.size}
        className="pickup-pulse object-contain"
      />
    </button>
  );
}
