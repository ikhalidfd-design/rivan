import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { badRequest, pgErrorToResponse } from "@/lib/api/respond";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const RequestBooking = z.object({
  unit_slug: z.string().trim().min(1).max(120),
  check_in: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  check_out: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().int().min(1).max(30),
  guest_name: z.string().trim().min(2).max(120),
  guest_phone: z.string().trim().min(9).max(20),
  guest_email: z.string().email().optional().or(z.literal("")),
});

/**
 * طلب حجز عام (anon) — 5 محاولات/ساعة لكل IP.
 * كل المنطق داخل RPC request_booking (security definer): نشر + أقل ليالٍ + سعر الخادم + قيد EXCLUDE.
 */
export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = await rateLimit(`ip:${ip}:booking`, 5, 3600);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "RATE_LIMITED", error_ar: "محاولات كثيرة، انتظر قليلًا" },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = RequestBooking.safeParse(body);
  if (!parsed.success) return badRequest("بيانات غير مكتملة أو غير صالحة");

  const { check_in, check_out } = parsed.data;
  if (new Date(check_out) <= new Date(check_in)) return badRequest("تاريخ المغادرة يجب أن يكون بعد الوصول");

  // anon client — الـRPC ممنوحة لـ anon
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("request_booking", {
    p_unit_slug: parsed.data.unit_slug,
    p_check_in: check_in,
    p_check_out: check_out,
    p_guests: parsed.data.guests,
    p_guest_name: parsed.data.guest_name,
    p_guest_phone: parsed.data.guest_phone,
    p_guest_email: parsed.data.guest_email || null,
  });

  if (error) {
    const mapped = pgErrorToResponse(error);
    if (mapped) return mapped;
    const arMap: Record<string, string> = {
      UNIT_NOT_FOUND: "الوحدة غير متاحة للحجز",
      GUESTS_EXCEEDED: "عدد الضيوف يتجاوز سعة الوحدة",
      MIN_NIGHTS: "أقل عدد ليالٍ غير مستوفى",
      GUEST_NAME_REQUIRED: "الاسم مطلوب",
      GUEST_PHONE_REQUIRED: "رقم الجوال مطلوب",
    };
    return NextResponse.json(
      { error: error.message, error_ar: arMap[error.message] ?? "تعذر إنشاء الطلب" },
      { status: 422 },
    );
  }

  const row = (data as { booking_id: string; expires_at: string; total: number; nights: number }[])[0];
  return NextResponse.json(
    {
      booking_id: row.booking_id,
      expires_at: row.expires_at,
      total: row.total,
      nights: row.nights,
    },
    { status: 201 },
  );
}
