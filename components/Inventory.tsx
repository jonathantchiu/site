'use client';

import { useEffect, useRef, useState } from 'react';
import type { CosmeticId } from '@/lib/cosmetics';
import { COLLECTIBLES, onCollect, toggleEquipped, useInventory } from '@/lib/inventory';
import { assetPath } from '@/lib/assetPath';

// The cosmetic cache's UI (lib/inventory.ts): a round button fixed to the
// bottom-right corner that opens a small menu for equipping what the
// reader has found, plus the "added to inventory" toast that appears
// after each pickup. The button pulses briefly on each pickup so the
// reader sees where the item went.
//
// Client-only: nothing renders before mount.
const PULSE_MS = 1200;

function itemName(id: CosmeticId): string {
  return COLLECTIBLES.find((c) => c.id === id)?.name ?? id;
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export function Inventory() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [pulsing, setPulsing] = useState(false);
  const [toast, setToast] = useState<CosmeticId | null>(null);
  const { owned, equipped } = useInventory();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const off = onCollect((id) => {
      setToast(id);
      setPulsing(true);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setPulsing(false), PULSE_MS);
    });
    return () => {
      off();
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Close the menu on Escape or a click anywhere outside it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      ref={rootRef}
      className="game fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
    >
      {toast ? (
        <div role="status" className="game-card toast-in flex items-center gap-3 py-2 pl-3 pr-2">
          <span className="game-tile flex h-10 w-10 shrink-0 items-center justify-center">
            <img src={assetPath(`/mascot/cosmetics/${toast}.webp`)} alt="" draggable={false} width={32} height={32} className="h-8 w-8 object-contain" />
          </span>
          <span className="flex flex-col items-start gap-1">
            <span className="game-ribbon game-ribbon--gold">New!</span>
            <span className="text-[0.9375rem] font-semibold">{itemName(toast)} added to inventory</span>
          </span>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setToast(null)}
            className="game-sticker ml-1 flex h-8 w-8 shrink-0 items-center justify-center text-base font-bold leading-none"
          >
            ×
          </button>
        </div>
      ) : null}

      {open ? (
        <div id="inventory-menu" className="game-card w-72 p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="text-lg font-bold">Inventory</p>
            <p className="game-hand text-base text-[var(--g-muted)]">~ dress up the cats ~</p>
          </div>
          {owned.length === 0 ? (
            <p className="game-hand text-lg text-[var(--g-muted)]">Nothing yet. Some things on this page can be picked up!</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {owned.map((id) => {
                const on = equipped.includes(id);
                return (
                  <li key={id} className="flex items-center gap-3">
                    <span className="game-tile flex h-12 w-12 shrink-0 items-center justify-center">
                      <img src={assetPath(`/mascot/cosmetics/${id}.webp`)} alt="" draggable={false} width={36} height={36} className="h-9 w-9 object-contain" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
                      <span className="text-[0.9375rem] font-semibold">{itemName(id)}</span>
                      {on ? <span className="game-ribbon game-ribbon--mint">Equipped</span> : null}
                    </span>
                    <button
                      type="button"
                      aria-label={`${on ? 'Unequip' : 'Equip'} ${itemName(id).toLowerCase()}`}
                      onClick={() => toggleEquipped(id)}
                      className={`game-btn ${on ? 'game-btn--quiet' : ''}`}
                    >
                      {on ? 'Unequip' : 'Equip'}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}

      <button
        type="button"
        aria-label="Inventory"
        aria-expanded={open}
        aria-controls="inventory-menu"
        onClick={() => {
          setOpen((o) => !o);
          setToast(null);
        }}
        className={`game-sticker relative flex h-14 w-14 items-center justify-center ${pulsing ? 'inventory-pulse' : ''}`}
      >
        <BagIcon />
        {owned.length > 0 ? (
          <span
            className="absolute -right-1.5 -top-1.5 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-1 text-xs font-bold text-white"
            style={{ background: 'var(--g-gold)', border: '2px solid var(--g-outline)' }}
          >
            {owned.length}
          </span>
        ) : null}
      </button>
    </div>
  );
}
