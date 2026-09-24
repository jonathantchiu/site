// The box's artwork only — no state, no interaction. BoxReveal owns when
// this mounts, when it topples, and the cat that knocks it off; this file
// only knows how to draw it, in Bento's hand-made style: a bold dark
// outline, warm cardboard fill, and hand-drawn (not ruler-straight) flap
// creases and tape. `preserveAspectRatio="none"` lets it stretch to cover
// whatever section it sits over, since sections vary in height.
const LINE = '#2B1A0C';
const FACE = '#C89A6A';
const SIDE = '#B5824F';
const TAPE = '#E9D9BC';

export function CardboardBox({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className={`absolute inset-0 h-full w-full ${className}`}
    >
      {/* box face */}
      <rect
        x="1.5"
        y="1.5"
        width="97"
        height="97"
        rx="2"
        fill={FACE}
        stroke={LINE}
        strokeWidth="3"
        vectorEffect="non-scaling-stroke"
      />

      {/* shadowed lid band along the top edge, drawn as a slightly bowed
          band rather than a straight rectangle so it reads as hand-drawn */}
      <path
        d="M1.5 1.5 Q50 16 98.5 1.5 L98.5 10 Q50 24 1.5 10 Z"
        fill={SIDE}
        opacity="0.55"
      />
      <path
        d="M1.5 10 Q50 24 98.5 10"
        fill="none"
        stroke={LINE}
        strokeWidth="1.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        opacity="0.8"
      />

      {/* flap creases: four hand-drawn curves converging toward the middle,
          suggesting the folded-in top flaps of an open box lid */}
      <path
        d="M7 7 Q34 34 49 49"
        fill="none"
        stroke={LINE}
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        opacity="0.7"
      />
      <path
        d="M93 6 Q66 33 51 49"
        fill="none"
        stroke={LINE}
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        opacity="0.7"
      />
      <path
        d="M6 93 Q33 67 49 51"
        fill="none"
        stroke={LINE}
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        opacity="0.7"
      />
      <path
        d="M94 94 Q67 68 51 51"
        fill="none"
        stroke={LINE}
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        opacity="0.7"
      />

      {/* packing tape sealing the middle seam, slightly crooked */}
      <path d="M42 0 L58 0 L56 100 L44 100 Z" fill={TAPE} opacity="0.9" />
      <path
        d="M42 0 L44 100 M58 0 L56 100"
        fill="none"
        stroke={SIDE}
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
