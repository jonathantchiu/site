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
  width?: number;
  height?: number;
}) {
  const srcSet = WIDTHS.map((w) => `${base}-${w}.webp ${w}w`).join(', ');

  return (
    <img
      src={`${base}-768.webp`}
      srcSet={srcSet}
      sizes="(max-width: 768px) 100vw, 768px"
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className={`h-auto w-full max-h-[70vh] object-contain rounded-card border-2 border-ink ${className}`}
    />
  );
}
