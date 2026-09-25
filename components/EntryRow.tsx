import Link from 'next/link';
import { assetPath } from '@/lib/assetPath';

export interface EntryRowProps {
  href: string; // internal route or external URL
  logo?: string; // path passed through assetPath by the component
  title: string; // org or project name
  subtitle: string; // role, or project hook
  date: string;
  blurb?: string; // one sentence
  external?: boolean;
}

const ROW_CLASS =
  'group flex min-h-[44px] items-start gap-4 border-b border-hairline py-5 transition-colors duration-200 hover:text-accent-text sm:py-6';

export function EntryRow({ href, logo, title, subtitle, date, blurb, external }: EntryRowProps) {
  const content = (
    <>
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {logo ? (
          <img
            src={assetPath(logo)}
            alt=""
            width={32}
            height={32}
            className="mt-0.5 h-8 w-8 shrink-0 rounded object-contain"
          />
        ) : null}
        <div className="min-w-0">
          <span className="entry-title block truncate text-ink group-hover:text-accent-text">
            {title}
          </span>
          {/* Explicit text-ink, not left to inherit: a color-scoped
              ancestor (app/globals.css's `[data-band] { color: var(--ink) }`)
              covers elements with no color class, but this one names its
              token directly so it can never regress into that trap again. */}
          <p className="mt-1 text-lg text-ink">{subtitle}</p>
          {blurb ? <p className="mt-1 max-w-measure text-[17px] text-muted">{blurb}</p> : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 pt-0.5">
        <span className="text-[17px] text-muted sm:text-right">{date}</span>
        <span
          aria-hidden="true"
          className="text-muted transition-transform duration-200 group-hover:translate-x-1 group-hover:text-accent-text"
        >
          &rarr;
        </span>
      </div>
    </>
  );

  if (external) {
    return (
      <a href={href} className={ROW_CLASS}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={ROW_CLASS}>
      {content}
    </Link>
  );
}
