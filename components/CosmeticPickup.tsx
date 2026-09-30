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
// of it by a margin. If none fits, it sits in the scene's top padding,
// which is always empty. Client-only, so the static export never ships a
// pickup.
const SIZE = 56;
const MARGIN = 16;
const EDGE = 16;
const TRIES = 120;

interface Spot {
  left: number;
  top: number;
}

function isObstacle(el: Element): boolean {
  if (el.closest('[data-pickup]')) return false;
  if (el.matches('[data-scene-cat]')) return true;
  const tag = el.tagName.toLowerCase();
  if (tag === 'img' || tag === 'svg') return true;
  if (el.childElementCount > 0) return false;
  return Boolean(el.textContent?.trim());
}

function findSpot(section: HTMLElement): Spot {
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
  for (let i = 0; i < TRIES; i++) {
    const left = EDGE + Math.random() * Math.max(0, maxLeft - EDGE);
    const top = EDGE + Math.random() * Math.max(0, maxTop - EDGE);
    const clear = obstacles.every(
      (o) => left + SIZE <= o.left || left >= o.right || top + SIZE <= o.top || top >= o.bottom
    );
    if (clear) return { left, top };
  }
  return { left: EDGE + Math.random() * Math.max(0, maxLeft - EDGE), top: EDGE };
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
      className="game game-sticker pickup-pulse absolute z-10 flex cursor-pointer select-none items-center justify-center focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--g-primary)]"
      style={{
        left: spot.left,
        top: spot.top,
        width: SIZE,
        height: SIZE,
        background: 'var(--g-gold-container)',
        borderColor: 'var(--g-gold)',
      }}
    >
      <img
        src={assetPath(`/mascot/cosmetics/${id}.webp`)}
        alt=""
        draggable={false}
        width={40}
        height={40}
        className="h-10 w-10 object-contain"
      />
    </button>
  );
}
