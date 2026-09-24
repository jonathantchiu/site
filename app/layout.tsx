import type { Metadata } from 'next';
import { Inter, Fredoka } from 'next/font/google';
import { Nav } from '@/components/Nav';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const fredoka = Fredoka({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  title: 'Jonathan Chiu',
  description: 'CS at UCLA. I build apps that make boring habits worth repeating.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fredoka.variable}`}>
      <body className="font-[family-name:var(--font-body)]">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:border-2 focus:border-ink focus:bg-cream focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <Nav />
        <main id="content" className="mx-auto max-w-3xl px-4 py-10">
          {children}
        </main>
        <footer className="mx-auto max-w-3xl border-t-2 border-ink px-4 py-8 text-[17px] text-muted">
          Built by Jonathan Chiu.
        </footer>
      </body>
    </html>
  );
}
