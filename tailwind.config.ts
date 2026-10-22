import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // SPEC design tokens
        "space-navy": "#0F1B3D",
        matcha: { DEFAULT: "#6E9B3F", soft: "#EAF2DF" },
        "matcha-soft": "#EAF2DF",
        cream: "#FAF7F0",
        surface: "#FFFFFF",
        ink: "#1B2236",
        muted: { DEFAULT: "#6B7389", foreground: "#6B7389" },
        "star-gold": "#E0A526",
        line: "#E8E3D6",
        danger: "#C8473D",

        // shadcn/ui semantic names mapped to SPEC tokens
        border: "#E8E3D6",
        input: "#E8E3D6",
        ring: "#6E9B3F",
        background: "#FAF7F0",
        foreground: "#1B2236",
        card: { DEFAULT: "#FFFFFF", foreground: "#1B2236" },
        popover: { DEFAULT: "#FFFFFF", foreground: "#1B2236" },
        primary: { DEFAULT: "#6E9B3F", foreground: "#FFFFFF" },
        secondary: { DEFAULT: "#EAF2DF", foreground: "#1B2236" },
        accent: { DEFAULT: "#EAF2DF", foreground: "#1B2236" },
        destructive: { DEFAULT: "#C8473D", foreground: "#FFFFFF" },
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
    },
  },
  plugins: [animate],
};

export default config;