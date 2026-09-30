import { useSyncExternalStore } from 'react';
import type { CosmeticId } from '@/lib/cosmetics';

// The cosmetic cache: items a reader can find on the home page, collect,
// and put on the scene cats. One small store shared by the pickups, the
// inventory menu and every SceneCat, saved to localStorage so a returning
// reader keeps what they found. Storage can be missing or throw (private
// windows, blocked site data), in which case the store still works for
// the current visit and simply starts empty next time.

export interface CollectibleInfo {
  id: CosmeticId;
  name: string;
  // Items in different slots can be worn together; equipping an item
  // takes off whatever else is in its slot.
  slot: 'hat' | 'glasses';
}

export const COLLECTIBLES: CollectibleInfo[] = [
  { id: 'chef-hat', name: 'Chef hat', slot: 'hat' },
  { id: 'sunglasses', name: 'Sunglasses', slot: 'glasses' },
];

export interface InventoryState {
  owned: CosmeticId[];
  equipped: CosmeticId[];
}

const STORAGE_KEY = 'cat-inventory-v1';
const EMPTY: InventoryState = { owned: [], equipped: [] };

let state: InventoryState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();
// Told about each new pickup, so the inventory button can pulse and show
// its toast only for a real pickup, never for items restored from storage.
const collectListeners = new Set<(id: CosmeticId) => void>();

function isCollectible(id: unknown): id is CosmeticId {
  return COLLECTIBLES.some((c) => c.id === id);
}

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<InventoryState>;
    const owned = (parsed.owned ?? []).filter(isCollectible);
    const equipped = (parsed.equipped ?? []).filter((id) => isCollectible(id) && owned.includes(id));
    state = { owned, equipped };
  } catch {
    // Keep the empty state.
  }
}

function set(next: InventoryState) {
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Not saved; still works for this visit.
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  load();
  return state;
}

function getServerSnapshot() {
  return EMPTY;
}

export function useInventory(): InventoryState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function collect(id: CosmeticId) {
  load();
  if (state.owned.includes(id)) return;
  set({ ...state, owned: [...state.owned, id] });
  for (const listener of collectListeners) listener(id);
}

export function onCollect(listener: (id: CosmeticId) => void) {
  collectListeners.add(listener);
  return () => {
    collectListeners.delete(listener);
  };
}

export function toggleEquipped(id: CosmeticId) {
  load();
  if (!state.owned.includes(id)) return;
  if (state.equipped.includes(id)) {
    set({ ...state, equipped: state.equipped.filter((e) => e !== id) });
    return;
  }
  const slot = COLLECTIBLES.find((c) => c.id === id)?.slot;
  const sameSlot = new Set(COLLECTIBLES.filter((c) => c.slot === slot).map((c) => c.id));
  set({ ...state, equipped: [...state.equipped.filter((e) => !sameSlot.has(e)), id] });
}

// Glasses sit under hats, so draw them first.
export function drawOrder(ids: CosmeticId[]): CosmeticId[] {
  const rank = (id: CosmeticId) => (COLLECTIBLES.find((c) => c.id === id)?.slot === 'hat' ? 1 : 0);
  return [...ids].sort((a, b) => rank(a) - rank(b));
}

// Test-only: reset the in-memory store between tests.
export function resetInventoryForTests() {
  state = EMPTY;
  loaded = false;
  for (const listener of listeners) listener();
}
