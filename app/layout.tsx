import type { Metadata } from "next";
import { Cinzel, Plus_Jakarta_Sans } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { VisitTracker } from "@/components/visitor-counter";
import { ScrollToTop } from "@/components/scroll-to-top";
import "./globals.css";

const display = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gagnants 229 | Jouons notre histoire",
  description: "Découvrez le patrimoine béninois en jouant.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full overflow-x-hidden pb-[calc(5rem+env(safe-area-inset-bottom))] antialiased lg:pb-0"><VisitTracker /><SiteHeader />{children}<SiteFooter /><ScrollToTop /><MobileBottomNav /></body>
    </html>
  );
}
