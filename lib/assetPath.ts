// Static export ships no server, so every plain <img src> must be prefixed
// by hand for GitHub Pages project sites served from a subpath. next/link
// and next/image rewrite automatically via basePath/assetPrefix; plain <img>
// does not, so any image src or srcSet entry must go through this helper.
export function assetPath(path: string): string {
  const base = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '');
  if (!base) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
