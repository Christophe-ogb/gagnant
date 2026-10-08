import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const destination = request.nextUrl.searchParams.get("next");
  const next = destination === "/reset-password" ? "/reset-password" : "/dashboard";
  const errorDestination = next === "/reset-password" ? "/reset-password?error=confirmation" : "/login?error=confirmation";

  if (!code) {
    return NextResponse.redirect(new URL(errorDestination, request.url));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL(errorDestination, request.url));
  }

  return NextResponse.redirect(new URL(next, request.url));
}
