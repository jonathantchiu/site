'use client';

import { useEffect, useState } from 'react';
import { anchorStyle, getAnchor, type CosmeticId, type Mood } from '@/lib/cosmetics';
import { assetPath } from '@/lib/assetPath';

// A cosmetic that mounts already at its final anchor position and eases its
// opacity/transform in on the next frame, so hovering the mascot reads as
// the item dropping onto it rather than popping in. This subtree is only
// ever mounted by <Mascot> when cosmeticVisible is true, and that starts
// false in every caller driven by real interaction (see SceneCat), so it
// is never present in the static-exported HTML — the entrance state below
// is a purely client-side, post-hydration effect, never a baked-in style.
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
  cosmetic,
  cosmeticVisible = false,
  size = 160,
}: {
  mood?: Mood;
  cosmetic?: CosmeticId;
  // Spec motion effect 3: a cosmetic "drops onto" the mascot on hover.
  // Defaults to hidden (not rendered at all — see CosmeticDrop) so a
  // caller must opt in explicitly; a client wrapper like SceneCat flips
  // this true in response to a real hover event.
  cosmeticVisible?: boolean;
  size?: number;
}) {
  const anchor = cosmetic ? getAnchor(cosmetic, mood) : undefined;

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
      {cosmetic && anchor && cosmeticVisible && (
        <CosmeticDrop
          src={assetPath(`/mascot/cosmetics/${cosmetic}.webp`)}
          anchor={anchor}
          width={Math.round(anchor.width * size)}
          height={Math.round(anchor.height * size)}
        />
      )}
    </div>
  );
}
