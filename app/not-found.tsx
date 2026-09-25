import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-start gap-4 px-4 py-10">
      <h1 className="heading-page text-ink">Page not found</h1>
      <p className="max-w-measure text-lg">
        There is nothing at this address. Either the link is old or something
        got mistyped.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex min-h-[44px] items-center rounded-card border border-hairline bg-card px-5 shadow-soft"
      >
        Back to the home page
      </Link>
    </section>
  );
}
