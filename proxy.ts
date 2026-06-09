import type { NextRequest } from "next/server";
import { updateSession } from "@/services/supabase/middleware";

/** Next.js proxy (formerly "middleware"): keeps the Supabase session fresh.
 * No-ops when auth isn't configured. */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run on all paths except static assets and image optimization.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
