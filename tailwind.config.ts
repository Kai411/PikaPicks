import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./composables/**/*.{js,ts}",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        pokemon: {
          red: "#E3350D",
          blue: "#006DAA",
          yellow: "#FFCB05",
          gold: "#B8860B",
        },
        ink: {
          DEFAULT: "#0A0A0A",
          muted: "#52525B",
          soft: "#A1A1AA",
        },
        canvas: {
          DEFAULT: "#FAFAFA",
          raised: "#FFFFFF",
          sunken: "#F4F4F5",
          inverse: "#0A0A0B",
        },
      },
      fontFamily: {
        sans: [
          '"Inter"',
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: ['"Inter"', "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,15,20,0.04), 0 4px 16px rgba(15,15,20,0.04)",
        "card-hover":
          "0 1px 2px rgba(15,15,20,0.05), 0 12px 32px rgba(15,15,20,0.10)",
        glow:
          "0 0 0 1px rgba(227,53,13,0.5), 0 8px 24px rgba(227,53,13,0.35)",
        "ring-soft":
          "0 0 0 1px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
} satisfies Config;
