import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx,mdx}', './components/**/*.{ts,tsx}', './content/**/*.mdx'],
  theme: {
    extend: {
      colors: {
        cream: 'var(--cream)',
        sand: 'var(--sand)',
        ink: 'var(--ink)',
        orange: 'var(--orange)',
        'orange-text': 'var(--orange-text)',
        muted: 'var(--muted)',
      },
      maxWidth: {
        measure: '68ch',
      },
      boxShadow: {
        offset: '4px 4px 0 var(--ink)',
        'offset-lg': '6px 6px 0 var(--ink)',
      },
      borderRadius: {
        card: '16px',
      },
    },
  },
  plugins: [],
};

export default config;
