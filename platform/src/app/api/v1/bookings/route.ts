import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { unauthorized, badRequest, pgErrorToResponse } from "@/lib/api/respond";
import { can } from "@/lib/auth/rbac";

const CreateBooking = z.object({
  unit_id: z.string().uuid(),
  check_in: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  check_out: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().int().min(1).default(1),
  guest_name: z.string().trim().min(2).max(120),
  guest_phone: z.string().trim().min(9).max(20),
  guest_email: z.string().email().optional().or(z.literal("")),
  notes: z.string().max(2000).optional(),
  total_amount: z.number().min(0).optional(),
});

/** إنشاء حجز يدوي (من اللوحة) — قيد EXCLUDE يمنع التعارض على مستوى DB */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = CreateBooking.safeParse(body);
  if (!parsed.success) return badRequest("بيانات غير مكتملة أو غير صالحة");

  const { check_in, check_out } = parsed.data;
  if (new Date(check_out) <= new Date(check_in))
    return badRequest("تاريخ المغادرة يجب أن يكون بعد الوصول");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  // الوحدة ضمن منظمة المستخدم (RLS) + صلاحية
  const { data: unit } = await supabase
    .from("units")
    .select("id, org_id, min_nights, capacity")
    .eq("id", parsed.data.unit_id)
    .single();
  if (!unit) return NextResponse.json({ error: "UNIT_NOT_FOUND", error_ar: "الوحدة غير موجودة" }, { status: 404 });

  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("org_id", unit.org_id)
    .single();
  if (!membership || !can(membership.role as never, "bookings:write")) return unauthorized();

  const nights =
    (new Date(check_out).getTime() - new Date(check_in).getTime()) / 86400000;
  if (nights < unit.min_nights)
    return NextResponse.json(
      { error: "MIN_NIGHTS", error_ar: `أقل إقامة ${unit.min_nights} ليالٍ` },
      { status: 422 },
    );
  if (parsed.data.guests > unit.capacity)
    return NextResponse.json(
      { error: "GUESTS_EXCEEDED", error_ar: "عدد الضيوف يتجاوز سعة الوحدة" },
      { status: 422 },
    );

  // السعر من الخادم (calc_quote) — لا يُثق بسعر العميل
  const { data: quote, error: quoteErr } = await supabase.rpc("calc_quote", {
    p_unit_id: unit.id,
    p_check_in: check_in,
    p_check_out: check_out,
    p_guests: parsed.data.guests,
  });

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      org_id: unit.org_id,
      unit_id: unit.id,
      kind: "booking",
      status: "confirmed", // الحجز اليدوي يؤكد مباشرة
      source: "manual",
      check_in,
      check_out,
      guests: parsed.data.guests,
      guest_name: parsed.data.guest_name,
      guest_phone: parsed.data.guest_phone,
      guest_email: parsed.data.guest_email || null,
      notes: parsed.data.notes || null,
      total_amount: quote?.[0]?.total ?? null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    const mapped = pgErrorToResponse(error);
    return mapped ?? NextResponse.json({ error: "INSERT_FAILED", error_ar: "فشل إنشاء الحجز" }, { status: 500 });
  }

  return NextResponse.json({ id: booking.id, quote: quote?.[0] ?? null }, { status: 201 });
}
