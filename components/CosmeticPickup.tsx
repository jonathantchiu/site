'use client';

import { useEffect, useState } from 'react';
import type { CosmeticId } from '@/lib/cosmetics';
import { COLLECTIBLES, collect, useInventory } from '@/lib/inventory';
import { assetPath } from '@/lib/assetPath';

// One collectible lying somewhere on the home page, pulsing until the
// reader clicks it into their inventory (lib/inventory.ts). Once owned it
// is gone for good, even if unequipped later. The caller positions it
// with `className`; it is absolutely positioned inside its Scene, so pick
// a spot that is always blank, such as the scene's top padding.
//
// Client-only, like SceneCat: nothing renders before mount, so the
// static export never ships a pickup.
export function CosmeticPickup({ id, className = '' }: { id: CosmeticId; className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { owned } = useInventory();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted || owned.includes(id)) return null;

  const name = COLLECTIBLES.find((c) => c.id === id)?.name ?? id;

  return (
    <button
      type="button"
      aria-label={`Pick up the ${name.toLowerCase()}`}
      data-pickup={id}
      onClick={() => collect(id)}
      className={`pickup-pulse absolute z-10 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text ${className}`}
    >
      <img
        src={assetPath(`/mascot/cosmetics/${id}.webp`)}
        alt=""
        width={44}
        height={44}
        className="h-11 w-11 object-contain"
      />
    </button>
  );
}
