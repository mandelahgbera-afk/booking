// Next.js 16 renamed Middleware to "Proxy" (same mechanism, new file name).
// This refreshes the Supabase auth session cookie on every request so
// Server Components always see a valid session, and does an optimistic
// "are you signed in at all" bounce for /admin routes — a fast redirect
// before the request even reaches a page, per Next's own guidance for
// Proxy-level auth checks. The authoritative check (is this user's
// profiles.role actually 'admin'?) still lives in
// src/app/admin/(dashboard)/layout.tsx, which has DB access Proxy
// intentionally avoids for anything heavier than this.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Touching getUser() is what actually refreshes the session cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  if (isAdminRoute && !user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
