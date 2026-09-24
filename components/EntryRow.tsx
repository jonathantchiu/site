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
  'block min-h-[44px] rounded-card border border-hairline bg-card p-4 shadow-soft transition-shadow duration-200 hover:shadow-soft-lg sm:p-6';

export function EntryRow({ href, logo, title, subtitle, date, blurb, external }: EntryRowProps) {
  const content = (
    <>
      <div className="flex flex-col gap-x-3 gap-y-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {logo ? (
            <img
              src={assetPath(logo)}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded object-contain"
            />
          ) : null}
          <span className="text-xl font-bold">{title}</span>
        </div>
        <span className="shrink-0 text-[17px] text-muted sm:text-right">{date}</span>
      </div>

      <p className="mt-1 text-lg">{subtitle}</p>

      {blurb ? <p className="mt-1 max-w-measure text-[17px] text-muted">{blurb}</p> : null}
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
