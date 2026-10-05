import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Gabarito, Nunito_Sans } from "next/font/google";
import Link from "next/link";

const gabarito = Gabarito({ subsets: ["latin"], variable: "--font-gabarito", weight: ["800"] });
const nunito = Nunito_Sans({ subsets: ["latin"], variable: "--font-nunito", weight: ["400", "600", "700"] });

export const metadata: Metadata = { title: "Mossy Paws Grooming", description: "Book a grooming appointment in Larkspur Heights." };
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${gabarito.variable} ${nunito.variable}`}>
      <body className="font-sans min-h-screen flex flex-col">
        <header>
          <div className="mx-auto max-w-5xl px-5 sm:px-8 h-20 flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2.5 font-display font-extrabold text-xl tracking-tight">
              <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true"><g fill="#4F7A3A"><ellipse cx="16" cy="21" rx="7" ry="6" /><circle cx="7.5" cy="13" r="3.2" /><circle cx="13" cy="8" r="3.2" /><circle cx="19" cy="8" r="3.2" /><circle cx="24.5" cy="13" r="3.2" /></g></svg>
              Mossy Paws
            </Link>
            <nav className="flex items-center gap-1 text-[15px] font-semibold">
              <Link href="/" className="px-3 py-2 rounded-full text-muted hover:text-ink">Book</Link>
              <Link href="/admin" className="px-3 py-2 rounded-full text-muted hover:text-ink">Staff</Link>
            </nav>
          </div>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="mx-auto max-w-5xl w-full px-5 sm:px-8 py-8 text-sm text-faint">Fictional business, invented data. Dog photos are CC0 from Wikimedia Commons.</footer>
      </body>
    </html>
  );
}
