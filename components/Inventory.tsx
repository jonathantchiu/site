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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
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
    <div ref={rootRef} className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {toast ? (
        <div
          role="status"
          className="toast-in flex items-center gap-3 rounded-full border border-hairline bg-card py-1.5 pl-2 pr-1.5 text-[0.9375rem] text-ink shadow-lg"
        >
          <img src={assetPath(`/mascot/cosmetics/${toast}.webp`)} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
          <span>
            {itemName(toast)} added to inventory
          </span>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setToast(null)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:text-ink"
          >
            ×
          </button>
        </div>
      ) : null}

      {open ? (
        <div
          id="inventory-menu"
          className="w-64 rounded-2xl border border-hairline bg-card p-3 text-ink shadow-lg"
        >
          <p className="px-1 pb-2 text-sm font-semibold">Inventory</p>
          {owned.length === 0 ? (
            <p className="px-1 pb-1 text-sm text-muted">Nothing yet. A couple of things on this page can be picked up.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {owned.map((id) => {
                const on = equipped.includes(id);
                return (
                  <li key={id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleEquipped(id)}
                      className="flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left hover:bg-page"
                    >
                      <img src={assetPath(`/mascot/cosmetics/${id}.webp`)} alt="" width={32} height={32} className="h-8 w-8 object-contain" />
                      <span className="flex-1 text-[0.9375rem]">{itemName(id)}</span>
                      <span className={`text-sm ${on ? 'text-accent-text' : 'text-muted'}`}>{on ? 'Equipped' : 'Equip'}</span>
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
        className={`relative flex h-12 w-12 items-center justify-center rounded-full border border-hairline bg-card text-ink shadow-md hover:text-accent-text ${pulsing ? 'inventory-pulse' : ''}`}
      >
        <BagIcon />
        {owned.length > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-accent-text px-1 text-[11px] font-semibold text-card">
            {owned.length}
          </span>
        ) : null}
      </button>
    </div>
  );
}
