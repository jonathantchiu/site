'use client';

import { useEffect, useState } from 'react';
import { anchorStyle, getAnchor, type CosmeticId, type Mood } from '@/lib/cosmetics';
import { assetPath } from '@/lib/assetPath';

// A cosmetic that mounts already at its final anchor position and eases its
// opacity/transform in on the next frame, so hovering the mascot reads as
// the item dropping onto it rather than popping in. Its only caller,
// SceneCat, renders nothing until after mount, so this is never present
// in the static-exported HTML.
function CosmeticDrop({
  src,
  anchor,
  width,
  height,
}: {
  src: string;
  anchor: ReturnType<typeof getAnchor>;
  width: number;
  height: number;
}) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const base = anchorStyle(anchor);

  return (
    <img
      src={src}
      alt=""
      width={width}
      height={height}
      style={{
        ...base,
        opacity: entered ? 1 : 0,
        transform: `${base.transform} translateY(${entered ? '0' : '-8px'})`,
        transition: 'opacity 250ms ease, transform 250ms ease',
      }}
      className="pointer-events-none"
    />
  );
}

export function Mascot({
  mood = 'happy',
  cosmetics = [],
  size = 160,
}: {
  mood?: Mood;
  // Drawn in array order, so later items layer on top (pass glasses
  // before hats). Each one drops in with CosmeticDrop when it first
  // appears.
  cosmetics?: CosmeticId[];
  size?: number;
}) {
  return (
    // overflow must stay visible: hat anchors have negative y and sit above
    // the top edge of the sprite box.
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <img
        src={assetPath(`/mascot/cat-${mood}.webp`)}
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-contain"
      />
      {cosmetics.map((cosmetic) => {
        const anchor = getAnchor(cosmetic, mood);
        return (
          <CosmeticDrop
            key={cosmetic}
            src={assetPath(`/mascot/cosmetics/${cosmetic}.webp`)}
            anchor={anchor}
            width={Math.round(anchor.width * size)}
            height={Math.round(anchor.height * size)}
          />
        );
      })}
    </div>
  );
}
