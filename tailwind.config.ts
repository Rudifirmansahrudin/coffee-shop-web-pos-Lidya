import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

// Theme-aware color: value comes from a CSS variable (RGB triplet) in globals.css
const v = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;
// Same, but with a base opacity from --a-<name> (used for glass surfaces in dark mode)
const va = (name: string) => `rgb(var(--c-${name}) / calc(var(--a-${name}) * <alpha-value>))`;

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // SPEC design tokens (follow light/dark mode)
        "space-navy": v("navy"),
        "navy-bg": v("navy-bg"),
        matcha: { DEFAULT: v("matcha"), soft: v("matcha-soft") },
        "matcha-soft": v("matcha-soft"),
        cream: v("cream"),
        surface: va("surface"),
        ink: v("ink"),
        muted: { DEFAULT: v("muted"), foreground: v("muted") },
        "star-gold": "#E0A526",
        line: va("line"),
        danger: v("danger"),
        eyebrow: v("eyebrow"),

        // shadcn/ui semantic names mapped to SPEC tokens
        border: va("line"),
        input: va("line"),
        ring: v("matcha"),
        background: v("cream"),
        foreground: v("ink"),
        card: { DEFAULT: va("surface"), foreground: v("ink") },
        popover: { DEFAULT: v("popover"), foreground: v("ink") },
        primary: { DEFAULT: v("matcha"), foreground: v("primary-fg") },
        secondary: { DEFAULT: v("matcha-soft"), foreground: v("ink") },
        accent: { DEFAULT: v("matcha-soft"), foreground: v("ink") },
        destructive: { DEFAULT: v("danger"), foreground: v("danger-fg") },
      },
      fontFamily: {
        heading: ["var(--font-sora)", "system-ui", "sans-serif"],
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        button: "12px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      maxWidth: {
        content: "1200px",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(0.8)" },
        },
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        twinkle: "twinkle 4s ease-in-out infinite",
      },
    },
  },
  plugins: [animate],
};

export default config;