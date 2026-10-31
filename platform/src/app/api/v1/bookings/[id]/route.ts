import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { unauthorized, badRequest } from "@/lib/api/respond";
import { can } from "@/lib/auth/rbac";
import { canTransition, type BookingStatus } from "@/lib/bookings/transitions";

const PatchBooking = z.object({
  status: z.enum([
    "pending", "confirmed", "checked_in", "checked_out",
    "cancelled", "expired", "declined",
  ]),
});

/** انتقال حالة حجز — آلة الحالات + RLS */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = PatchBooking.safeParse(body);
  if (!parsed.success) return badRequest("بيانات غير صالحة");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, status, org_id")
    .eq("id", id)
    .single();
  if (!booking) return NextResponse.json({ error: "NOT_FOUND", error_ar: "غير موجود" }, { status: 404 });

  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("org_id", booking.org_id)
    .single();

  const role = membership?.role as never;
  // الوصول/المغادرة يسمح بها staff أيضًا
  const to = parsed.data.status as BookingStatus;
  const needsWrite = !["checked_in", "checked_out"].includes(to);
  if (
    !membership ||
    (needsWrite && !can(role, "bookings:write")) ||
    (!needsWrite && !can(role, "bookings:transition"))
  ) {
    return unauthorized();
  }

  if (!canTransition(booking.status as BookingStatus, to)) {
    return NextResponse.json(
      { error: "INVALID_TRANSITION", error_ar: "انتقال حالة غير مسموح" },
      { status: 422 },
    );
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status: to, updated_at: new Date().toISOString(), expires_at: null })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "UPDATE_FAILED", error_ar: "فشل التحديث" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
