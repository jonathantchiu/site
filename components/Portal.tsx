// The wormhole's artwork only — no state, no interaction. BoxReveal owns
// when this mounts and how it animates open/closed; this file only knows
// how to draw it, in Bento's hand-made style: a bold dark outline, warm
// fill, and a hand-drawn (not compass-perfect) spiral rather than a
// generic portal icon. Drawn as a flat-ish ellipse — BoxReveal's CSS
// stretches it open vertically and wobbles it via `transform: scaleY`, so
// the artwork itself just needs to read correctly at that resting ellipse
// shape.
const LINE = '#2B1A0C';
const RING_OUTER = '#E8874D';
const RING_INNER = '#B04E1B';
const SWIRL_A = '#C25A22';
const SWIRL_B = '#8F3E15';
const VOID = '#3A1E0F';
const SPARK = '#F2D9B8';

export function Portal({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* outer rim, drawn slightly lopsided so it reads as hand-inked */}
      <ellipse
        cx="50"
        cy="50"
        rx="46"
        ry="40"
        fill={RING_OUTER}
        stroke={LINE}
        strokeWidth="4"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M8 50 Q6 20 50 10 Q94 19 92 50 Q95 81 50 91 Q5 80 8 50 Z"
        fill="none"
        stroke={LINE}
        strokeWidth="1.4"
        opacity="0.35"
      />

      {/* inner band */}
      <ellipse
        cx="50"
        cy="50"
        rx="34"
        ry="29"
        fill={RING_INNER}
        stroke={LINE}
        strokeWidth="3"
        vectorEffect="non-scaling-stroke"
      />

      {/* the dark throat of the wormhole */}
      <ellipse cx="50" cy="50" rx="21" ry="17" fill={VOID} stroke={LINE} strokeWidth="2.5" />

      {/* hand-drawn swirl arms spiraling into the void */}
      <path
        d="M50 33 Q64 36 63 50 Q62 62 50 63 Q40 64 39 54"
        fill="none"
        stroke={SWIRL_A}
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M50 67 Q37 64 37 50 Q37 39 48 37"
        fill="none"
        stroke={SWIRL_B}
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* sparks flung off the rim */}
      <circle cx="18" cy="30" r="2.4" fill={SPARK} stroke={LINE} strokeWidth="1" />
      <circle cx="83" cy="66" r="1.8" fill={SPARK} stroke={LINE} strokeWidth="1" />
      <circle cx="80" cy="28" r="1.4" fill={SPARK} stroke={LINE} strokeWidth="1" />
    </svg>
  );
}
