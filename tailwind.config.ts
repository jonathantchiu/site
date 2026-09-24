import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx,mdx}', './components/**/*.{ts,tsx}', './content/**/*.mdx'],
  theme: {
    extend: {
      colors: {
        page: 'var(--page)',
        card: 'var(--card)',
        hairline: 'var(--hairline)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        'accent-text': 'var(--accent-text)',
        accent: 'var(--accent)',
      },
      maxWidth: {
        measure: '68ch',
      },
      boxShadow: {
        soft: '0 1px 3px rgb(0 0 0 / 0.06)',
        'soft-lg': '0 4px 12px rgb(0 0 0 / 0.08)',
      },
      borderRadius: {
        card: '10px',
      },
    },
  },
  plugins: [],
};

export default config;
