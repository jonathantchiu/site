import type { CSSProperties } from 'react';

export type Mood = 'happy' | 'neutral' | 'sad' | 'sleep';

export type CosmeticId =
  | 'cowboy-hat'
  | 'chef-hat'
  | 'sunglasses'
  | 'sport-glasses'
  | 'bughunter-toy';

export interface Anchor {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
}

// Fractions of the sprite's bounding box, taken from Bento's cat rows.
// Bento keyed the same items inconsistently across two tables
// ('cowboy hat' vs cowboy_hat), which is why ids are normalized here.
const ANCHORS: Record<CosmeticId, Record<Mood, Anchor>> = {
  'cowboy-hat': {
    happy: { x: 0.1865, y: -0.0487, width: 0.5263, height: 0.4626, rotate: 15.8 },
    neutral: { x: 0.1547, y: -0.0387, width: 0.5263, height: 0.4626, rotate: 15.8 },
    sad: { x: 0.1905, y: 0.023, width: 0.5263, height: 0.4626, rotate: 15.8 },
    sleep: { x: 0.1527, y: 0.0409, width: 0.5263, height: 0.4626, rotate: 7.2 },
  },
  'chef-hat': {
    happy: { x: 0.1646, y: -0.0743, width: 0.3657, height: 0.3907, rotate: -7.5 },
    neutral: { x: 0.1686, y: -0.0593, width: 0.3577, height: 0.3757, rotate: -1.8 },
    sad: { x: 0.2005, y: -0.0075, width: 0.3577, height: 0.3757, rotate: -0.8 },
    sleep: { x: 0.1367, y: 0.0323, width: 0.3577, height: 0.3757, rotate: -12.6 },
  },
  sunglasses: {
    happy: { x: 0.1825, y: 0.2006, width: 0.3498, height: 0.3338, rotate: -5.1 },
    neutral: { x: 0.1666, y: 0.1966, width: 0.3498, height: 0.3338, rotate: -4.6 },
    sad: { x: 0.1925, y: 0.2782, width: 0.3498, height: 0.3338, rotate: 0.2 },
    sleep: { x: 0.2044, y: 0.3141, width: 0.3498, height: 0.3338, rotate: -9.4 },
  },
  'sport-glasses': {
    happy: { x: 0.1407, y: 0.1777, width: 0.4383, height: 0.3497, rotate: -6.2 },
    neutral: { x: 0.1188, y: 0.1617, width: 0.4394, height: 0.3776, rotate: -2.5 },
    sad: { x: 0.1467, y: 0.2593, width: 0.4394, height: 0.3776, rotate: 0 },
    sleep: { x: 0.1527, y: 0.2752, width: 0.4394, height: 0.3776, rotate: -18.5 },
  },
  'bughunter-toy': {
    happy: { x: 0.0113, y: 0.6674, width: 0.3597, height: 0.3438, rotate: 0 },
    neutral: { x: 0.0133, y: 0.6077, width: 0.3597, height: 0.3438, rotate: 0 },
    sad: { x: 0.0452, y: 0.5958, width: 0.3597, height: 0.3438, rotate: 0 },
    sleep: { x: 0.6464, y: 0.536, width: 0.3597, height: 0.3438, rotate: 0 },
  },
};

export function getAnchor(cosmetic: CosmeticId, mood: Mood): Anchor {
  return ANCHORS[cosmetic][mood];
}

function percent(fraction: number): string {
  return `${Number((fraction * 100).toFixed(2))}%`;
}

export function anchorStyle(anchor: Anchor): CSSProperties {
  return {
    position: 'absolute',
    left: percent(anchor.x),
    top: percent(anchor.y),
    width: percent(anchor.width),
    transform: `rotate(${anchor.rotate}deg)`,
    transformOrigin: 'center',
  };
}
