"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 420);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 grid size-12 place-items-center rounded-full border border-gold/60 bg-earth/95 text-gold shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition hover:bg-gold hover:text-earth active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white lg:bottom-6 lg:right-6"
      aria-label="Retourner en haut de la page"
      title="Retour en haut"
    >
      <ArrowUp aria-hidden="true" size={21} />
    </button>
  );
}
