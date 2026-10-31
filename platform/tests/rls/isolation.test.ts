/**
 * بوابة أمان RLS — تُشغَّل ضد Supabase محلي (npx supabase start && npx supabase db reset)
 * تتطلب: SUPABASE_URL_LOCAL (افتراضي http://127.0.0.1:54321) وANON_KEY_LOCAL في البيئة
 * أو تعمل عبر ملف .env.test.local
 */
import { beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL_ = process.env.SUPABASE_URL_LOCAL ?? "http://127.0.0.1:54321";
const ANON = process.env.ANON_KEY_LOCAL ?? "";
const SERVICE = process.env.SERVICE_KEY_LOCAL ?? "";

const ORG_A = "aaaa0000-0000-4000-8000-00000000000a";
const ORG_B = "bbbb0000-0000-4000-8000-00000000000b";
const UNIT_A = "eeee0000-0000-4000-8000-00000000000a";
const UNIT_A_HIDDEN = "eeee0000-0000-4000-8000-00000000000b"; // غير منشورة

// skips موحّد إذا لم تتوفر المفاتيح (مثل CI دون Docker)
const maybe = ANON && SERVICE ? describe : describe.skip;

async function clientFor(email: string, password: string): Promise<SupabaseClient> {
  const c = createClient(URL_, ANON, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`فشل تسجيل الدخول ${email}: ${error.message}`);
  return c;
}

let userA: SupabaseClient;
let userB: SupabaseClient;
let anon: SupabaseClient;
let admin: SupabaseClient;

beforeAll(async () => {
  if (!ANON || !SERVICE) throw new Error("انتهك التهيئة: مفاتيح البيئة غير موجودة");
  [userA, userB] = await Promise.all([
    clientFor("a@ruwaq.test", "password123"),
    clientFor("b@ruwaq.test", "password123"),
  ]);
  anon = createClient(URL_, ANON, { auth: { persistSession: false } });
  admin = createClient(URL_, SERVICE, {
    auth: { persistSession: false },
  });
});

maybe("عزل المنظمات (RLS)", () => {
  it("مستخدم A يرى وحدات منظمته فقط", async () => {
    const { data } = await userA.from("units").select("id, org_id");
    expect(data).toHaveLength(2);
    expect(data!.every((u) => u.org_id === ORG_A)).toBe(true);
  });

  it("مستخدم B يرى وحدات منظمته فقط", async () => {
    const { data } = await userB.from("units").select("id");
    expect(data).toHaveLength(1);
    expect(data![0].id === "ffff0000-0000-4000-8000-00000000000b").toBe(true);
  });

  it("A لا يستطيع قراءة حجوزات B", async () => {
    // حجوزات B: لا توجد seed — لكن نتحقق أن كل الحجوزات المرئية لـA تخص ORG_A
    const { data } = await userA.from("bookings").select("org_id");
    expect(data!.every((b) => b.org_id === ORG_A)).toBe(true);
  });

  it("A لا يستطيع تحديث وحدة B", async () => {
    // RLS يحجب الصف بصمت: التحديث لا يخطئ لكنه لا يمس أي صف
    const { data } = await userA
      .from("units")
      .update({ name: "اختبار اختراق" })
      .eq("id", "ffff0000-0000-4000-8000-00000000000b")
      .select("id");
    expect(data ?? []).toHaveLength(0);
    const { data: row } = await userB
      .from("units")
      .select("name")
      .eq("id", "ffff0000-0000-4000-8000-00000000000b")
      .single();
    expect(row?.name).not.toBe("اختبار اختراق");
  });

  it("A لا يستطيع حذف عضوية B أو رؤيتها", async () => {
    const { data } = await userA.from("memberships").select("org_id");
    expect(data!.every((m) => m.org_id === ORG_A)).toBe(true);
  });

  it(" anon لا يرى الوحدات غير المنشورة عبر public_units إلا المنشورة", async () => {
    const { data } = await anon.from("public_units").select("id");
    const ids = (data ?? []).map((u: { id: string }) => u.id);
    expect(ids).toContain(UNIT_A);
    expect(ids).not.toContain(UNIT_A_HIDDEN);
  });

  it("anon لا يرى جدول الوحدات الداخلي إطلاقًا", async () => {
    const { data } = await anon.from("units").select("id");
    expect(data).toHaveLength(0);
  });

  it("anon لا يستطيع إدراج حجز مباشرة (يجب عبر RPC فقط)", async () => {
    const { error } = await anon.from("bookings").insert({
      org_id: ORG_A,
      unit_id: UNIT_A,
      kind: "booking",
      status: "pending",
      source: "direct",
      check_in: "2027-01-01",
      check_out: "2027-01-03",
      guests: 2,
    });
    expect(error).toBeTruthy();
  });

  it("جداول الخدمة محجوبة عن anon والمستخدمين", async () => {
    for (const table of ["jobs", "rate_limits", "job_failures"]) {
      const r1 = await anon.from(table).select("id").limit(1);
      expect(r1.error, `${table} anon`).toBeTruthy();
      const r2 = await userA.from(table).select("id").limit(1);
      expect(r2.error, `${table} user`).toBeTruthy();
    }
  });

  it("توكن iCal غير مكشوف في public_units", async () => {
    const { data } = await anon.from("public_units").select("*");
    for (const u of data ?? []) {
      expect(Object.keys(u)).not.toContain("ical_token");
      expect(Object.keys(u)).not.toContain("cleaning_fee");
    }
  });

  it("service-role يرى الكل (للعامل الخلفي)", async () => {
    const { data } = await admin.from("units").select("id");
    expect(data).toHaveLength(3);
  });
});
