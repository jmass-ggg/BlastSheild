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
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        surface: {
          DEFAULT: "#ffffff",
          subtle: "#f8fafc",
          muted: "#f1f5f9",
          dark: "#0f172a",
        },
        risk: {
          low: "#16a34a",
          "low-bg": "#f0fdf4",
          "low-border": "#bbf7d0",
          medium: "#ea580c",
          "medium-bg": "#fff7ed",
          "medium-border": "#fed7aa",
          high: "#e11d48",
          "high-bg": "#fff1f2",
          "high-border": "#fecdd3",
          critical: "#dc2626",
          "critical-bg": "#fef2f2",
          "critical-border": "#fecaca",
        },
        cascade: {
          DEFAULT: "#ea580c",
          bg: "#fff7ed",
          border: "#ffedd5",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Courier New", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)",
        dropdown: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        modal: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      },
      animation: {
        pulseSlow: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        flowRight: "flowRight 1.5s linear infinite",
      },
      keyframes: {
        flowRight: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
