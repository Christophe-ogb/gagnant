"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { EMPTY_PROGRESS, getProgress } from "@/lib/progress";

export function PlayerProgress() {
  const [progress, setProgress] = useState(EMPTY_PROGRESS);

  useEffect(() => {
    const updateProgress = () => setProgress(getProgress());
    updateProgress();
    window.addEventListener("storage", updateProgress);
    window.addEventListener("jeux-gagnants:progress-updated", updateProgress);
    return () => {
      window.removeEventListener("storage", updateProgress);
      window.removeEventListener("jeux-gagnants:progress-updated", updateProgress);
    };
  }, []);

  return (
    <div className="flex items-center gap-2" aria-label="Votre progression">
      <div className="rounded-full border border-gold/30 bg-white/5 px-3 py-2 backdrop-blur-sm">
        <span className="sr-only">Points : </span>
        <span className="text-sm font-bold text-gold">{progress.points}</span>
        <span className="ml-1 text-xs text-kaolin/70">pts</span>
      </div>
      <div className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/5 text-kaolin/70 backdrop-blur-sm" title={`${progress.unlockedBadgeIds.length} badge débloqué`}>
        <Sparkles aria-hidden="true" size={16} />
        <span className="sr-only">{progress.unlockedBadgeIds.length} badge débloqué</span>
      </div>
    </div>
  );
}
