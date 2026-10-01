import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { VisitTracker } from "@/components/visitor-counter";
import { ScrollToTop } from "@/components/scroll-to-top";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gagnants 229 | Jouons notre histoire",
  description: "D\u00e9couvrez le patrimoine b\u00e9ninois en jouant.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="fr" translate="no" suppressHydrationWarning className="h-full" data-scroll-behavior="smooth">
    <body suppressHydrationWarning className="min-h-full overflow-x-hidden pb-[calc(5rem+env(safe-area-inset-bottom))] pt-[4.75rem] antialiased lg:pb-0"><VisitTracker /><SiteHeader />{children}<SiteFooter /><ScrollToTop /><MobileBottomNav /></body>
  </html>;
}
