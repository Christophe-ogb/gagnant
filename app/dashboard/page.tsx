import { redirect } from "next/navigation";
import { AdminWorkspace } from "@/components/business/admin-workspace";
import { EmailAnnouncementPreferences } from "@/components/business/email-announcement-preferences";
import { EstablishmentForm } from "@/components/business/establishment-form";
import { SignOutButton } from "@/components/business/sign-out-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) throw new Error(`Impossible de vérifier ton profil : ${profileError.message}`);
  const isAdmin = profile?.role === "admin";

  return <main className="min-h-[70vh] bg-earth px-4 py-8 text-kaolin sm:px-6 lg:px-10 lg:py-10">
    <section className={`mx-auto w-full rounded-3xl border border-gold/20 bg-panel shadow-2xl ${isAdmin ? "max-w-[1440px] p-4 sm:p-6 lg:p-8" : "max-w-4xl p-6 sm:p-9"}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">{isAdmin ? "Administration" : "Espace partenaire"}</p>
          <h1 className="font-display mt-2 text-3xl text-white">{isAdmin ? "Modération" : "Tableau de bord"}</h1>
          <p className="mt-2 text-sm text-kaolin/65">Bonjour {profile?.full_name || user.email}.</p>
        </div>
        <SignOutButton />
      </div>

      {isAdmin ? (
        <div className="mt-8"><AdminWorkspace /></div>
      ) : (
        <>
          <p className="mt-6 text-sm leading-6 text-kaolin/70">Complétez les informations ci-dessous pour présenter au mieux votre établissement à nos visiteurs.</p>
          <EstablishmentForm />
          <EmailAnnouncementPreferences />
        </>
      )}
    </section>
  </main>;
}
