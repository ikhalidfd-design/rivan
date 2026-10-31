/**
 * اختبار تزامن منع الحجز المزدوج — قيد EXCLUDE على مستوى Postgres.
 * طلبان متوازيان على نفس التواريخ: واحد ينجح والآخر يُرفض (23P01).
 */
import { beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL_ = process.env.SUPABASE_URL_LOCAL ?? "http://127.0.0.1:54321";
const ANON = process.env.ANON_KEY_LOCAL ?? "";
const maybe = ANON ? describe : describe.skip;

const UNIT_SLUG = "yasmin-1"; // منشورة في seed للمنظمة A

let anon: SupabaseClient;
let admin: SupabaseClient;
let UNIT_ID = "";
let created: string[] = [];

beforeAll(async () => {
  anon = createClient(URL_, ANON, { auth: { persistSession: false } });
  admin = createClient(URL_, process.env.SERVICE_KEY_LOCAL ?? "", {
    auth: { persistSession: false },
  });
  const { data: unit } = await admin
    .from("units")
    .select("id")
    .eq("slug", UNIT_SLUG)
    .single();
  UNIT_ID = unit?.id ?? "";
});

function request(checkIn: string, checkOut: string, name: string) {
  return anon.rpc("request_booking", {
    p_unit_slug: UNIT_SLUG,
    p_check_in: checkIn,
    p_check_out: checkOut,
    p_guests: 2,
    p_guest_name: name,
    p_guest_phone: "0500000099",
    p_guest_email: null,
  });
}

maybe("منع الحجز المزدوج (قيد EXCLUDE)", () => {
  // تواريخ عشوائية لكل تشغيلة حتى لا تتصادم الجولات المتتالية (لا db reset بين كل تشغيلتين)
  const offset = Math.floor(Math.random() * 200);
  const day = (plus: number) =>
    new Date(Date.UTC(2027, 0, 10) + (offset + plus) * 86400000).toISOString().slice(0, 10);

  it("طلبان متوازيان على نفس الليالي — نجاح واحد فقط", async () => {
    const checkIn = day(0);
    const checkOut = day(3);

    const [r1, r2] = await Promise.all([
      request(checkIn, checkOut, "ضيف متوازٍ 1"),
      request(checkIn, checkOut, "ضيف متوازٍ 2"),
    ]);

    for (const r of [r1, r2]) {
      // التزامن على فهرس GIST قد يُخرج 23P01 (تعارض) أو 40P01 (deadlock) — كلاهما رفض صحيح
      if (r.error) expect(["23P01", "40P01"]).toContain(r.error.code);
    }

    // الثابت الحقيقي على مستوى القاعدة: حجز نشط واحد فقط لتلك الليالي.
    // (استجابة PostgREST قد تكون شاذة تحت التزامن — صف يُلتزم لكن يُعاد خطأ للعميل)
    const { data: rows } = await admin
      .from("bookings")
      .select("id, guest_name")
      .eq("unit_id", UNIT_ID)
      .in("status", ["pending", "confirmed", "checked_in"])
      .filter("stay", "ov", `[${checkIn},${checkOut})`);
    expect(rows ?? []).toHaveLength(1);
    const bookingId = rows?.[0]?.id;
    if (bookingId) created.push(bookingId);

    // على الأقل عميل واحد رأى نجاحًا أو القاعدة التزمت صفًا واحدًا
    expect([r1, r2].some((r) => !r.error) || bookingId).toBeTruthy();
  });

  it("تداخل جزئي مع حجز قائم مرفوض أيضًا", async () => {
    const res = await request(day(2), day(5), "ضيف متداخل");
    expect(res.error).toBeTruthy();
    expect((res.error as { code?: string }).code).toBe("23P01");
  });

  it("تواريخ مختلفة لا تتعارض", async () => {
    const res = await request(day(30), day(32), "ضيف آخر");
    expect(res.error).toBeFalsy();
    const row = res.data as unknown as { booking_id: string }[] | null;
    if (row && row[0]?.booking_id) created.push(row[0].booking_id);
  });

  it("تنظيف الحجوزات التجريبية", async () => {
    for (const id of created) {
      await admin.from("bookings").delete().eq("id", id);
    }
    expect(true).toBe(true);
  });
});
