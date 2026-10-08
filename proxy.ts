import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseCookieOptions } from "@/lib/supabase/cookie-options";

export async function proxy(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0].trim();
    const requestProto = forwardedProto || request.nextUrl.protocol.replace(/:$/, "");
    if (requestProto === "http") {
      const secureUrl = request.nextUrl.clone();
      secureUrl.protocol = "https:";
      secureUrl.port = "";
      return NextResponse.redirect(secureUrl, 308);
    }
  }

  const refreshSession = request.nextUrl.pathname.startsWith("/dashboard")
    || request.nextUrl.pathname === "/auth/callback";
  if (!refreshSession) return NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anonKey, {
    cookieOptions: getSupabaseCookieOptions(),
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  await supabase.auth.getClaims();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
