import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'BlastShield // Pre-Execution Safety Cockpit',
  description: 'Deterministic pre-execution PostgreSQL safety gateway, consequence blast-radius analyzer, and automated zero-loss safeguard orchestrator.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-[#070b12] text-slate-100 antialiased font-sans flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
        {children}
      </body>
    </html>
  );
}
