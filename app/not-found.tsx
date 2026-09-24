import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="flex flex-col items-start gap-4">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">Page not found</h1>
      <p className="max-w-measure text-lg">
        There is nothing at this address. The link may be old, or mistyped.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex min-h-[44px] items-center rounded-card border-2 border-ink bg-sand px-5 shadow-offset"
      >
        Back to the home page
      </Link>
    </section>
  );
}
