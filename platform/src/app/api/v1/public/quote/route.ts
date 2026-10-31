import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { badRequest, pgErrorToResponse } from "@/lib/api/respond";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const Quote = z.object({
  unit_slug: z.string().trim().min(1).max(120),
  check_in: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  check_out: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().int().min(1).max(30).default(1),
});

/** حساب سعر عام (حاسبة صفحة الحجز) — 30 طلبًا/دقيقة لكل IP */
export async function POST(req: NextRequest) {
  const rl = await rateLimit(`ip:${clientIp(req)}:quote`, 30, 60);
  if (!rl.ok) {
    return NextResponse.json({ error: "RATE_LIMITED", error_ar: "محاولات كثيرة" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = Quote.safeParse(body);
  if (!parsed.success) return badRequest("بيانات غير صالحة");

  const supabase = await createClient();
  const { data: unit } = await supabase
    .from("public_units")
    .select("id")
    .eq("slug", parsed.data.unit_slug)
    .single();
  if (!unit)
    return NextResponse.json({ error: "UNIT_NOT_FOUND", error_ar: "الوحدة غير متاحة" }, { status: 404 });

  const { data, error } = await supabase.rpc("calc_quote", {
    p_unit_id: unit.id,
    p_check_in: parsed.data.check_in,
    p_check_out: parsed.data.check_out,
    p_guests: parsed.data.guests,
  });
  if (error) {
    const mapped = pgErrorToResponse(error);
    return mapped ?? NextResponse.json({ error: error.message }, { status: 422 });
  }

  // هل التواريخ محجوزة؟ (قراءة عامة عبر view)
  const { data: conflicts } = await supabase
    .from("public_units")
    .select("id")
    .eq("id", unit.id)
    .limit(1);

  const row = (data as { nights: number; nightly_total: number; cleaning_fee: number; total: number }[])[0];
  return NextResponse.json({ ...row });
}
