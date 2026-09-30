import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Inventory } from '@/components/Inventory';
import { CosmeticPickup } from '@/components/CosmeticPickup';
import { collect, resetInventoryForTests, toggleEquipped, useInventory } from '@/lib/inventory';

function State() {
  const { owned, equipped } = useInventory();
  return <output data-testid="state">{JSON.stringify({ owned, equipped })}</output>;
}

function readState() {
  return JSON.parse(screen.getByTestId('state').textContent ?? '{}');
}

describe('inventory store', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetInventoryForTests();
  });

  it('only equips owned items, and toggles them off again', () => {
    render(<State />);
    act(() => toggleEquipped('chef-hat'));
    expect(readState().equipped).toEqual([]);
    act(() => {
      collect('chef-hat');
      toggleEquipped('chef-hat');
    });
    expect(readState().equipped).toEqual(['chef-hat']);
    act(() => toggleEquipped('chef-hat'));
    expect(readState().equipped).toEqual([]);
  });

  it('lets a hat and glasses be worn together', () => {
    render(<State />);
    act(() => {
      collect('chef-hat');
      collect('sunglasses');
      toggleEquipped('chef-hat');
      toggleEquipped('sunglasses');
    });
    expect(readState().equipped).toEqual(['chef-hat', 'sunglasses']);
  });

  it('restores what was found from localStorage', () => {
    window.localStorage.setItem(
      'cat-inventory-v1',
      JSON.stringify({ owned: ['sunglasses', 'bogus'], equipped: ['sunglasses', 'chef-hat'] })
    );
    render(<State />);
    expect(readState()).toEqual({ owned: ['sunglasses'], equipped: ['sunglasses'] });
  });
});

describe('pickups and the inventory menu', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetInventoryForTests();
  });

  it('picking up an item hides it, shows a dismissable toast and pulses the button', () => {
    render(
      <>
        <CosmeticPickup id="chef-hat" />
        <Inventory />
      </>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Pick up the chef hat' }));
    expect(screen.queryByRole('button', { name: 'Pick up the chef hat' })).toBeNull();
    expect(screen.getByRole('status').textContent).toContain('Chef hat added to inventory');
    expect(screen.getByRole('button', { name: 'Inventory' }).className).toContain('inventory-pulse');
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('does not show a toast for items restored from storage', () => {
    window.localStorage.setItem('cat-inventory-v1', JSON.stringify({ owned: ['chef-hat'], equipped: [] }));
    render(
      <>
        <CosmeticPickup id="chef-hat" />
        <Inventory />
      </>
    );
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Pick up the chef hat' })).toBeNull();
  });

  it('equips an item from the menu', () => {
    render(
      <>
        <Inventory />
        <State />
      </>
    );
    act(() => collect('sunglasses'));
    fireEvent.click(screen.getByRole('button', { name: 'Inventory' }));
    const item = screen.getByRole('button', { name: /Sunglasses/ });
    expect(item.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(item);
    expect(item.getAttribute('aria-pressed')).toBe('true');
    expect(readState().equipped).toEqual(['sunglasses']);
  });
});
