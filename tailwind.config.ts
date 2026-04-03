import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          950: "#111111",
          900: "#1f1f1f",
          800: "#3d3d3d",
        },
        mist: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#ebebeb",
        },
        sage: {
          100: "#f3f3f3",
          300: "#d4d4d4",
          500: "#737373",
          700: "#262626",
        },
        amber: {
          100: "#f3f3f3",
          400: "#9a9a9a",
          600: "#3a3a3a",
        },
        rose: {
          100: "#ededed",
          400: "#8a8a8a",
          600: "#333333",
        },
      },
      boxShadow: {
        panel: "0 12px 30px rgba(17, 17, 17, 0.03)",
        float: "0 8px 24px rgba(17, 17, 17, 0.04)",
      },
      backgroundImage: {
        "hero-glow": "none",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
