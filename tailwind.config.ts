import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fdf8e7",
          100: "#faefc4",
          200: "#f5dc85",
          300: "#f0c842",
          400: "#e8b800",
          500: "#c99a00",
          600: "#a37d00",
          700: "#7d6000",
        },
        navy: {
          50:  "#e8eaf6",
          100: "#c5cae9",
          200: "#9fa8da",
          300: "#7986cb",
          400: "#5c6bc0",
          500: "#1a237e",
          600: "#151c6b",
          700: "#0d1257",
          800: "#080c3f",
          900: "#030628",
        },
      },
    },
  },
  plugins: [],
};
export default config;
