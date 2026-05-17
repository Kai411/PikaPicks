import type { Config } from "tailwindcss";

export default {
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
      },
    },
  },
  plugins: [],
} satisfies Config;
