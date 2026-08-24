import { notFound, redirect } from "next/navigation";
import { getHeritageById } from "@/lib/heritage";

export default async function CommuneQrEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const commune = getHeritageById(slug);

  if (!commune || commune.type !== "commune") {
    notFound();
  }

  redirect(`/scan/${slug}`);
}
