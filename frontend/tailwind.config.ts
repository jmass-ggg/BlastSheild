import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
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
        obsidian: {
          950: "#05080e",
          900: "#070b12",
          850: "#0b0f19",
          800: "#0d1424",
          750: "#0f172a",
          700: "#131d31",
          600: "#1e293b",
          500: "#334155",
          400: "#475569",
        },
        cyber: {
          rose: "#f43f5e",
          "rose-glow": "rgba(244, 63, 94, 0.25)",
          amber: "#f59e0b",
          "amber-glow": "rgba(245, 158, 11, 0.25)",
          emerald: "#10b981",
          "emerald-glow": "rgba(16, 185, 129, 0.25)",
          cyan: "#06b6d4",
          "cyan-glow": "rgba(6, 182, 212, 0.25)",
          blue: "#3b82f6",
          purple: "#8b5cf6",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        "cyber-sm": "0 0 10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        "cyber-card": "0 4px 20px -2px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        "glow-rose": "0 0 20px -3px rgba(244, 63, 94, 0.4)",
        "glow-amber": "0 0 20px -3px rgba(245, 158, 11, 0.4)",
        "glow-emerald": "0 0 20px -3px rgba(16, 185, 129, 0.4)",
        "glow-cyan": "0 0 20px -3px rgba(6, 182, 212, 0.4)",
        "glow-blue": "0 0 20px -3px rgba(59, 130, 246, 0.4)",
      },
      animation: {
        pulseSlow: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        flowDash: "flowDashes 1.2s linear infinite",
        radarSweep: "radar 4s linear infinite",
        scanline: "scanline 8s linear infinite",
      },
      keyframes: {
        flowDashes: {
          from: { strokeDashoffset: "24" },
          to: { strokeDashoffset: "0" },
        },
        radar: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
