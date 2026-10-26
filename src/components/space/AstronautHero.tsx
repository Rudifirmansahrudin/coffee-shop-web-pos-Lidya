import { cn } from "@/lib/utils";

// Colors match the SPEC design tokens
const NAVY = "#0F1B3D";
const MATCHA = "#6E9B3F";
const MATCHA_SOFT = "#EAF2DF";
const GOLD = "#E0A526";
const WHITE = "#FFFFFF";

type Props = { className?: string; withOrnaments?: boolean };

// Simple flat SVG astronaut, used for empty states (the home hero uses HeroAstronaut)
export function AstronautHero({ className }: Props) {
  return (
    <svg
      viewBox="0 0 240 260"
      role="img"
      aria-label="Ilustrasi astronot memegang segelas kopi"
      className={cn("h-auto w-full max-w-[280px]", className)}
    >
      {/* backpack */}
      <rect x="62" y="128" width="116" height="84" rx="22" fill={MATCHA} />

      {/* legs and boots */}
      <rect x="86" y="200" width="30" height="44" rx="14" fill={WHITE} stroke={NAVY} strokeWidth="3" />
      <rect x="124" y="200" width="30" height="44" rx="14" fill={WHITE} stroke={NAVY} strokeWidth="3" />
      <rect x="82" y="232" width="38" height="16" rx="8" fill={NAVY} />
      <rect x="120" y="232" width="38" height="16" rx="8" fill={NAVY} />

      {/* torso */}
      <rect x="78" y="126" width="84" height="84" rx="26" fill={WHITE} stroke={NAVY} strokeWidth="3" />
      <rect x="102" y="150" width="36" height="22" rx="7" fill={MATCHA_SOFT} stroke={NAVY} strokeWidth="2" />
      <circle cx="112" cy="161" r="3" fill={GOLD} />
      <circle cx="126" cy="161" r="3" fill={MATCHA} />

      {/* left arm (hanging) */}
      <rect x="52" y="140" width="30" height="58" rx="15" fill={WHITE} stroke={NAVY} strokeWidth="3" />
      <circle cx="67" cy="198" r="9" fill={NAVY} />

      {/* neck ring */}
      <rect x="98" y="122" width="44" height="12" rx="6" fill={MATCHA_SOFT} stroke={NAVY} strokeWidth="2" />

      {/* helmet */}
      <line x1="120" y1="34" x2="120" y2="22" stroke={NAVY} strokeWidth="3" strokeLinecap="round" />
      <circle cx="120" cy="19" r="5" fill={GOLD} />
      <circle cx="120" cy="82" r="48" fill={WHITE} stroke={NAVY} strokeWidth="3" />
      <rect x="88" y="62" width="64" height="48" rx="24" fill={NAVY} />
      <path d="M100 78 q6 -10 18 -10" stroke={MATCHA_SOFT} strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="136" cy="92" r="2.5" fill={GOLD} />

      {/* cup */}
      <path d="M196 112 L224 112 L220 144 L200 144 Z" fill={WHITE} stroke={NAVY} strokeWidth="3" strokeLinejoin="round" />
      <path d="M197.5 124 L222.5 124 L221.5 134 L198.5 134 Z" fill={MATCHA} />
      <rect x="194" y="104" width="32" height="9" rx="4" fill={NAVY} />
      <path d="M205 96 q-5 -7 0 -13 q5 -6 0 -12" stroke={MATCHA} strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M216 96 q-5 -7 0 -13 q5 -6 0 -12" stroke={MATCHA} strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* right arm (raised to the cup) */}
      <rect
        x="150"
        y="150"
        width="30"
        height="46"
        rx="15"
        fill={WHITE}
        stroke={NAVY}
        strokeWidth="3"
        transform="rotate(-100 165 150)"
      />
      <circle cx="210" cy="142" r="9.5" fill={NAVY} />
    </svg>
  );
}