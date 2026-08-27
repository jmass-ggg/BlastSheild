import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BlastShieldAI — Pre-Execution Impact Analysis for TrueForge Agents",
  description:
    "Intercept dangerous AI-agent actions, simulate them safely in sandboxes, calculate blast radius, explain business consequences, and require human approval.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark h-full`}
    >
      <body className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200 antialiased">
        {children}
      </body>
    </html>
  );
}
