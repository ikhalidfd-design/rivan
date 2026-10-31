import { createAdminClient } from "@/lib/supabase/admin";
import { buildUnitIcal } from "@/lib/ical/build";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * تصدير iCal العام بالتوكن غير القابل للتخمين.
 * GET /api/ical/[token]/ruwaq.ics — لا يتطلب مصادقة ( التوكن هو المفتاح، قابل للتدوير).
 */
export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  if (!/^[0-9a-f]{64}$/i.test(token)) {
    return new Response("Not found", { status: 404 });
  }

  const admin = createAdminClient();
  const { data: unit } = await admin
    .from("units")
    .select("id, slug")
    .eq("ical_token", token)
    .single();
  if (!unit) return new Response("Not found", { status: 404 });

  const { data: bookings } = await admin
    .from("bookings")
    .select("id, check_in, check_out, kind, status")
    .eq("unit_id", unit.id)
    .in("status", ["pending", "confirmed", "checked_in"]);

  const ics = buildUnitIcal(
    unit.slug,
    (bookings ?? []).map((b: { id: string; check_in: string; check_out: string; kind: "booking" | "block"; status: string }) => ({
      id: b.id,
      check_in: b.check_in,
      check_out: b.check_out,
      kind: b.kind,
      status: b.status,
    })),
  );

  return new Response(ics, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "cache-control": "public, max-age=1800",
    },
  });
}
