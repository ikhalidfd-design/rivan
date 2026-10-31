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
let created: string[] = [];

beforeAll(() => {
  anon = createClient(URL_, ANON, { auth: { persistSession: false } });
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
  it("طلبان متوازيان على نفس الليالي — نجاح واحد فقط", async () => {
    const checkIn = "2027-03-10";
    const checkOut = "2027-03-13";

    const [r1, r2] = await Promise.all([
      request(checkIn, checkOut, "ضيف متوازٍ 1"),
      request(checkIn, checkOut, "ضيف متوازٍ 2"),
    ]);

    const successes = [r1, r2].filter((r) => !r.error);
    const failures = [r1, r2].filter((r) => r.error);
    expect(successes).toHaveLength(1);
    expect(failures).toHaveLength(1);
    expect(failures[0].error!.code).toBe("23P01");

    const row = successes[0].data as unknown as { booking_id: string }[] | null;
    if (row && row[0]?.booking_id) created.push(row[0].booking_id);
  });

  it("تداخل جزئي مع حجز قائم مرفوض أيضًا", async () => {
    const res = await request("2027-03-12", "2027-03-15", "ضيف متداخل");
    expect(res.error).toBeTruthy();
    expect((res.error as { code?: string }).code).toBe("23P01");
  });

  it("تواريخ مختلفة لا تتعارض", async () => {
    const res = await request("2027-04-01", "2027-04-03", "ضيف آخر");
    expect(res.error).toBeFalsy();
    const row = res.data as unknown as { booking_id: string }[] | null;
    if (row && row[0]?.booking_id) created.push(row[0].booking_id);
  });

  it("تنظيف الحجوزات التجريبية", async () => {
    const admin = createClient(
      URL_,
      process.env.SERVICE_KEY_LOCAL ?? "",
      { auth: { persistSession: false } },
    );
    for (const id of created) {
      await admin.from("bookings").delete().eq("id", id);
    }
    expect(true).toBe(true);
  });
});
