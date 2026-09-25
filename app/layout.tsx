import type { Metadata } from 'next';
import { Inter, Archivo } from 'next/font/google';
import { Nav } from '@/components/Nav';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
// Archivo at weight 800 is the display face (spec: v3 editorial layout).
// Fredoka's rounded letterforms do not tighten, so oversized type with
// negative tracking read as cramped rather than editorial; Archivo does.
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Jonathan Chiu',
  description: 'CS at UCLA. I build apps that make boring habits worth repeating.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${archivo.variable}`}>
      <body className="font-[family-name:var(--font-body)]">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:border-2 focus:border-ink focus:bg-page focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <Nav />
        {/* No max-w/padding here: the home page's Scene sections are
            full-bleed. Interior reading pages (projects, experience, the
            not-found page) apply their own max-w-3xl px-4 py-10 wrapper. */}
        <main id="content">{children}</main>
        <footer className="mx-auto max-w-3xl border-t border-hairline px-4 py-8 text-[17px] text-muted">
          Built by Jonathan Chiu.
        </footer>
      </body>
    </html>
  );
}
