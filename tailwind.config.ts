import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        shrink: {
          "0%":   { width: "100%" },
          "100%": { width: "0%" },
        },
      },
      animation: {
        shrink: "shrink 4s linear forwards",
      },
      colors: {
        brand: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#16a34a",
          600: "#15803d",
          700: "#166534",
        },
        navy: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#166534",
          600: "#14532d",
          700: "#052e16",
          800: "#031a0e",
          900: "#020f08",
        },
      },
    },
  },
  plugins: [],
};
export default config;
