import { notFound } from "next/navigation";
import { Suspense } from "react";
import { RewardPage } from "@/components/reward-page";
import { getHeritageById } from "@/lib/heritage";

export default async function HeritageRewardPage({ params }: { params: Promise<{ heritage: string }> }) {
  const { heritage: heritageId } = await params;
  const heritage = getHeritageById(heritageId);
  if (!heritage) notFound();

  return (
    <Suspense fallback={<main className="min-h-screen bg-earth" aria-label="Chargement de la récompense" />}>
      <RewardPage heritageName={heritage.nom} badgeName={heritage.challenge?.badge ?? `Badge de ${heritage.nom}`} />
    </Suspense>
  );
}
