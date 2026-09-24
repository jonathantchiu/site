'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'home' },
  { href: '/projects', label: 'projects' },
  { href: '/experience', label: 'experience' },
];

// A link is "active" when the pathname matches exactly, or — for
// non-home links — when the current route is a subpath of it (so
// /projects/bento marks the "projects" nav item active too).
function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b-2 border-ink bg-cream">
      <ul className="mx-auto flex max-w-3xl gap-2 px-4 py-2">
        {LINKS.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-[44px] items-center px-3 text-lg underline-offset-4 hover:text-orange-text hover:underline ${
                  active ? 'text-orange-text underline decoration-2' : ''
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
