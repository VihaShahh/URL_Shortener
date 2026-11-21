import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import colors from "tailwindcss/colors";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Arial", "sans-serif"],
        mono: ["var(--font-inter)", "Arial", "sans-serif"]
      },
      colors: {
        slate: colors.neutral,
        ink: {
          950: "#171717",
          900: "#262626",
          700: "#404040"
        },
        signal: {
          500: "#171717",
          600: "#404040"
        }
      },
      boxShadow: {
        soft: "0 1px 2px rgb(0 0 0 / 0.03)"
      },
      gridTemplateColumns: {
        "20": "repeat(20, minmax(0, 1fr))"
      }
    }
  },
  plugins: [forms]
};

export default config;
