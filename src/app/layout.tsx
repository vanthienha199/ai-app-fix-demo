import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", weight: ["600", "700", "800"] });
const plex = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-plex", weight: ["400", "500", "600"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", weight: ["500", "600"] });

export const metadata: Metadata = { title: "Mossy Paws Grooming", description: "Book a grooming appointment. Sample app, fictional business." };
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

const themeScript = `(()=>{try{const q=new URLSearchParams(location.search).get("theme");const t=q||localStorage.getItem("theme");document.documentElement.dataset.theme=t==="light"?"light":"dark"}catch(e){document.documentElement.dataset.theme="dark"}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${plex.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans min-h-screen">
        <header className="border-b border-line">
          <div className="mx-auto max-w-6xl px-4 sm:px-8 h-16 flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2.5 font-display font-bold text-lg tracking-tight">
              <span className="grid place-items-center size-8 rounded-[10px] bg-accent text-accent-ink text-base">M</span>
              Mossy Paws
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <span className="hidden md:inline-flex items-center gap-2 mr-2 rounded-[10px] bg-warn-soft text-warn px-2.5 py-1 font-mono text-[11px] tracking-wider uppercase">Sample app, fictional business</span>
              <Link href="/" className="px-3 py-2 rounded-[10px] text-muted hover:text-ink">Book</Link>
              <Link href="/admin" className="px-3 py-2 rounded-[10px] text-muted hover:text-ink">Staff</Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
