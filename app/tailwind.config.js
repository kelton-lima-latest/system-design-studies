/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#080D17",
          900: "#0B1220",
          800: "#121B2E",
          700: "#1A2740",
          600: "#1E2A42",
          500: "#2A3A57",
        },
        teal: {
          400: "#4FE3C7",
          500: "#22D3B8",
          600: "#14A88F",
        },
        amber: {
          400: "#F7B84D",
          500: "#F5A623",
        },
        coral: {
          400: "#F27272",
          500: "#EF4B4B",
          600: "#C93A3A",
        },
        violet: {
          400: "#A78BFA",
          500: "#8B5CF6",
        },
        ink_text: {
          100: "#E7ECF5",
          300: "#B7C2D6",
          500: "#8A96AC",
          700: "#5A6478",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};
