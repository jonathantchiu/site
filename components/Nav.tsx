import Link from 'next/link';

const LINKS = [
  { href: '/', label: 'home' },
  { href: '/projects', label: 'projects' },
  { href: '/experience', label: 'experience' },
];

export function Nav() {
  return (
    <nav className="border-b-2 border-ink bg-cream">
      <ul className="mx-auto flex max-w-3xl gap-2 px-4 py-2">
        {LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex min-h-[44px] items-center px-3 text-lg hover:text-orange-text hover:underline"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
