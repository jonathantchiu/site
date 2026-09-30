import type { ReactNode } from 'react';

// Contact links for the hero lede. From `sm` up: a small icon beside each
// handle, stacked one per line. On phones: just the three icons in a row
// as round buttons, with the handle kept for screen readers. Gmail and LinkedIn use their brand colors;
// GitHub's mark is monochrome, so it takes --ink via currentColor.
const LINKS: { label: string; text: string; href: string; icon: ReactNode }[] = [
  {
    label: 'Email',
    text: 'jonnych1u@g.ucla.edu',
    href: 'mailto:jonnych1u@g.ucla.edu',
    icon: (
      <svg viewBox="52 42 88 66">
        <path fill="#4285F4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6" />
        <path fill="#34A853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15" />
        <path fill="#FBBC04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2" />
        <path fill="#EA4335" d="M72 74V48l24 18 24-18v26L96 92" />
        <path fill="#C5221F" d="M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    text: '/in/jonathantchiu',
    href: 'https://linkedin.com/in/jonathantchiu',
    icon: (
      <svg viewBox="0 0 24 24" fill="#0A66C2">
        <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    text: 'jonathantchiu',
    href: 'https://github.com/jonathantchiu',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8 0 3.2.9.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1.1.9 2.2v3.3c0 .3.1.7.8.6A12 12 0 0 0 12 .3" />
      </svg>
    ),
  },
];

export function ContactLinks() {
  return (
    <ul className="flex flex-row gap-3 sm:flex-col sm:items-end sm:gap-0">
      {LINKS.map(({ label, text, href, icon }) => (
        <li key={label}>
          <a
            href={href}
            aria-label={`${label}: ${text}`}
            className="group flex h-11 w-11 items-center justify-center gap-3 rounded-full border border-hairline text-[0.9375rem] text-ink sm:h-auto sm:min-h-[44px] sm:w-auto sm:justify-start sm:rounded-none sm:border-0"
          >
            <span aria-hidden="true" className="h-5 w-5 shrink-0 text-ink sm:h-4 sm:w-4">
              {icon}
            </span>
            <span className="sr-only underline decoration-hairline sm:not-sr-only decoration-1 underline-offset-4 transition-colors group-hover:decoration-accent-text">
              {text}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
