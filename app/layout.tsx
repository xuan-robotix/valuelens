import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ValueLens — Type a ticker. Understand it in ten seconds.",
  description:
    "ValueLens turns a stock ticker into a clean valuation verdict — cheap, fair, or expensive — based on fundamentals. Not financial advice; clarity, not a crystal ball.",
};

// Set theme before paint to avoid a flash of the wrong color scheme. Runs as a
// beforeInteractive script so it executes before React hydrates.
const themeScript = `(function(){try{var t=localStorage.getItem('vl-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-bg text-fg">
        <Script id="vl-theme" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
