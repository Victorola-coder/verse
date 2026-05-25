import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        verse: {
          bg: "#0E0E0E",
          text: "#F5F1EA",
          muted: "#9D9D9D",
          accent: "#D6B98C",
          card: "#161616",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderColor: {
        verse: "rgba(255, 255, 255, 0.08)",
      },
      transitionTimingFunction: {
        verse: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
