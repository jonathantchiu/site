import type { ReactNode } from 'react';

// Spec (docs/superpowers/specs/2026-09-25-personal-website-v3-editorial.md):
// the home page's four full-viewport scenes. Each carries a section number
// top-right (aria-hidden — it is decoration, not content), an oversized
// flush-left uppercase heading with a small right-aligned lede opposite it
// on wide screens (stacked beneath on phones), a hairline rule under that
// header block, then arbitrary children.
//
// `min-h-[100svh]`, never `h-screen`/`100vh` and never `overflow: hidden`:
// small-viewport height ignores mobile browser chrome, and if a section's
// content is taller than the viewport it must push the section taller
// instead of getting clipped.
//
// `id` is load-bearing, not cosmetic: components/TravelingCat.tsx,
// components/MascotScene.tsx and lib/useActiveHomeSection.ts all key off
// the literal ids 'hero' | 'experience' | 'projects' | 'elsewhere' to know
// which section is on screen. Callers must pass exactly one of those.
interface SceneProps {
  id: string;
  number: string;
  heading: string;
  level?: 'h1' | 'h2';
  lede?: ReactNode;
  children?: ReactNode;
}

export function Scene({ id, number, heading, level = 'h2', lede, children }: SceneProps) {
  const Heading = level;

  return (
    <section
      id={id}
      className="relative flex min-h-[100svh] flex-col justify-center px-4 py-20 sm:px-8"
    >
      <span
        aria-hidden="true"
        className="absolute right-4 top-6 font-[family-name:var(--font-display)] text-sm text-muted sm:right-8 sm:top-8"
      >
        {number}
      </span>

      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
          <Heading className="heading-scene max-w-4xl text-ink">{heading}</Heading>
          {lede ? (
            <p className="max-w-xs text-[1.0625rem] text-muted sm:text-right">{lede}</p>
          ) : null}
        </div>

        <div className="mt-8 border-t border-hairline sm:mt-10" />

        <div className="mt-10 sm:mt-14">{children}</div>
      </div>
    </section>
  );
}
