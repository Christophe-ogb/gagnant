import { Suspense } from "react";
import { RewardPage as RewardCard } from "@/components/reward-page";

export default function RewardPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-earth" aria-label="Chargement de la récompense" />}>
      <RewardCard />
    </Suspense>
  );
}
