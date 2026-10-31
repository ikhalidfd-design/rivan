import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * كل شيء عدا الأصول الثابتة والصور وfavicon وملفات iCal العامة والـAPI العامة
     */
    "/((?!_next/static|_next/image|favicon.ico|api/ical|api/cron|api/v1/public|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|ics)$).*)",
  ],
};
