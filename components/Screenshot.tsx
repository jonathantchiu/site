import { assetPath } from '@/lib/assetPath';

const WIDTHS = [480, 768, 1200];

export function Screenshot({
  base,
  alt,
  className = '',
  width = 768,
  height = 1024,
}: {
  base: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
}) {
  const srcSet = WIDTHS.map((w) => `${assetPath(`${base}-${w}.webp`)} ${w}w`).join(', ');

  return (
    <img
      src={assetPath(`${base}-768.webp`)}
      srcSet={srcSet}
      sizes="(max-width: 768px) 100vw, 768px"
      alt={alt}
      width={Number(width)}
      height={Number(height)}
      loading="lazy"
      decoding="async"
      className={`h-auto w-full max-h-[70vh] object-contain rounded-card border border-hairline ${className}`}
    />
  );
}
