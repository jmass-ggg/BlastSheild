/** @type {import('tailwindcss').Config} */
module.exports = {
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
      },
      fontFamily: {
        sans: ["var(--font-family-sans)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-family-mono)", "JetBrains Mono", "monospace"],
      },
      fontSize: {
        'display': ['clamp(2.25rem, 4vw + 1rem, 3.75rem)', { lineHeight: '1.05', letterSpacing: '-0.035em' }],
        'h1': ['clamp(1.875rem, 3vw + 0.5rem, 2.75rem)', { lineHeight: '1.12', letterSpacing: '-0.03em' }],
        'h2': ['clamp(1.5rem, 2vw + 0.5rem, 2rem)', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
        'h3': ['clamp(1.25rem, 1.5vw + 0.25rem, 1.5rem)', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
        'h4': ['1.125rem', { lineHeight: '1.35', letterSpacing: '-0.015em' }],
        'body-lg': ['1.125rem', { lineHeight: '1.65', letterSpacing: '-0.01em' }],
        'body': ['1rem', { lineHeight: '1.6', letterSpacing: '-0.005em' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.01em' }],
        'badge': ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.03em' }],
      },
      fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      letterSpacing: {
        tighter: '-0.035em',
        tight: '-0.02em',
        snug: '-0.01em',
        normal: '0em',
        wide: '0.02em',
        wider: '0.04em',
        widest: '0.08em',
      },
    },
  },
  plugins: [],
};
