import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase/api-auth";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 12;

export async function GET(request: NextRequest) {
  const access = await getAdminUser();
  if ("response" in access) return access.response;

  const params = request.nextUrl.searchParams;
  const pageValue = Number(params.get("page") ?? "1");
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const search = (params.get("search") ?? "").trim().replace(/[^\p{L}\p{N}\s@.+-]/gu, "").slice(0, 100);

  const [members, pending, approved, rejected, hotels, restaurants, apartments, testimonials] = await Promise.all([
    access.supabase.from("profiles").select("id", { count: "exact", head: true }),
    access.supabase.from("establishments").select("id", { count: "exact", head: true }).eq("status", "pending"),
    access.supabase.from("establishments").select("id", { count: "exact", head: true }).eq("status", "approved"),
    access.supabase.from("establishments").select("id", { count: "exact", head: true }).eq("status", "rejected"),
    access.supabase.from("establishments").select("id", { count: "exact", head: true }).eq("status", "approved").eq("business_type", "hotel"),
    access.supabase.from("establishments").select("id", { count: "exact", head: true }).eq("status", "approved").eq("business_type", "restaurant"),
    access.supabase.from("establishments").select("id", { count: "exact", head: true }).eq("status", "approved").eq("business_type", "apartment"),
    access.supabase.from("temoignages").select("id", { count: "exact", head: true }).eq("affiche", true),
  ]);
  const countError = [members, pending, approved, rejected, hotels, restaurants, apartments, testimonials].find((result) => result.error)?.error;
  if (countError) {
    console.error("Impossible de calculer les statistiques du tableau de bord.", countError);
    return NextResponse.json({ error: "Impossible de charger les statistiques." }, { status: 503 });
  }

  const from = (page - 1) * PAGE_SIZE;
  let profilesQuery = access.supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  if (search) profilesQuery = profilesQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  const { data: profiles, count: profileCount, error: profilesError } = await profilesQuery;
  if (profilesError) {
    console.error("Impossible de charger les profils pour le tableau de bord admin.", profilesError);
    return NextResponse.json({ error: "Impossible de charger les membres." }, { status: 503 });
  }

  const profileIds = (profiles ?? []).map((profile) => profile.id);
  let partnerIds = new Set<string>();
  if (profileIds.length > 0) {
    const { data: records, error } = await access.supabase
      .from("establishments")
      .select("owner_id")
      .in("owner_id", profileIds);
    if (error) {
      console.error("Impossible de déterminer les partenaires du tableau de bord.", error);
      return NextResponse.json({ error: "Impossible de charger les rôles des membres." }, { status: 503 });
    }
    partnerIds = new Set((records ?? []).map((record) => record.owner_id));
  }

  return NextResponse.json({
    stats: {
      members: members.count ?? 0,
      partners: (pending.count ?? 0) + (approved.count ?? 0) + (rejected.count ?? 0),
      pending: pending.count ?? 0,
      approved: approved.count ?? 0,
      rejected: rejected.count ?? 0,
      publishedTestimonials: testimonials.count ?? 0,
      categories: {
        hotel: hotels.count ?? 0,
        restaurant: restaurants.count ?? 0,
        apartment: apartments.count ?? 0,
      },
    },
    profiles: (profiles ?? []).map((profile) => ({ ...profile, isPartner: partnerIds.has(profile.id) })),
    profileCount: profileCount ?? 0,
  }, { headers: { "Cache-Control": "no-store" } });
}
