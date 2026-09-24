'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';

export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduced = useReducedMotion();
  // Static export prerenders this component with no browser around, and the
  // very first client paint before hydration finishes uses that same
  // markup. If framer-motion's `initial` prop were applied on that render,
  // every wrapped block would ship into the static HTML as opacity:0 and
  // stay invisible for a reader whose JS is slow, blocked, or absent. So the
  // very first render (server and pre-hydration) stays a plain, fully
  // visible div; only after mount does it become the animated motion.div
  // that fades in on scroll for users who have JS and have not asked for
  // reduced motion.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Deliberate one-time "have we mounted in a real browser yet" flag.
    // It must be effect-driven, not derived at render time (e.g. via
    // `typeof window`), because the client's first render has to match the
    // server-rendered static HTML exactly or React throws a hydration
    // mismatch; only the post-mount effect is safe to diverge in.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
  }, []);

  if (reduced) return <>{children}</>;

  if (!ready) return <div>{children}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
