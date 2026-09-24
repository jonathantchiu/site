import { anchorStyle, getAnchor, type CosmeticId, type Mood } from '@/lib/cosmetics';
import { assetPath } from '@/lib/assetPath';

export function Mascot({
  mood = 'happy',
  cosmetic,
  size = 160,
}: {
  mood?: Mood;
  cosmetic?: CosmeticId;
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
      {cosmetic && anchor && (
        <img
          src={assetPath(`/mascot/cosmetics/${cosmetic}.webp`)}
          alt=""
          width={Math.round(anchor.width * size)}
          height={Math.round(anchor.height * size)}
          style={anchorStyle(anchor)}
          className="pointer-events-none"
        />
      )}
    </div>
  );
}
