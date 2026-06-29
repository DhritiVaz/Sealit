import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F7F7F5",
        foreground: "#0A0A0A",
        primary: {
          DEFAULT: "#1B3A6B",
          light: "#EEF2FF",
        },
        muted: "#888888",
        border: "#E8E8E8",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Merriweather", "serif"],
        logo: ["Sour Gummy", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
