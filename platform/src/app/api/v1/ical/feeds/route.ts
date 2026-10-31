import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { unauthorized, badRequest, pgErrorToResponse } from "@/lib/api/respond";
import { validateFeedUrl } from "@/lib/ical/guard";
import { canCreateFeed } from "@/lib/billing/entitlements";

const CreateFeed = z.object({
  unit_id: z.string().uuid(),
  name: z.string().trim().min(1).max(80),
  url: z.string().url().max(2048),
});

/** إضافة تغذية استيراد iCal — تحقق SSRF + حدود الباقة قبل التخزين */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = CreateFeed.safeParse(body);
  if (!parsed.success) return badRequest("بيانات غير مكتملة");

  // فحص مخطط الرابط قبل أي شيء (SSRF)
  try {
    validateFeedUrl(parsed.data.url);
  } catch {
    return badRequest("مسموح روابط HTTPS فقط");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  // الوحدة ضمن منظمة المستخدم (RLS يضمن)
  const { data: unit } = await supabase
    .from("units")
    .select("id, org_id")
    .eq("id", parsed.data.unit_id)
    .single();
  if (!unit) return NextResponse.json({ error: "UNIT_NOT_FOUND", error_ar: "الوحدة غير موجودة" }, { status: 404 });

  // حدود الباقة (خادم فقط)
  const { data: sub } = await supabase
    .from("org_subscriptions")
    .select("plan_id, status, trial_ends_at")
    .eq("org_id", unit.org_id)
    .single();
  const { count: feedsCount } = await supabase
    .from("ical_feeds")
    .select("id", { count: "exact", head: true })
    .eq("unit_id", unit.id);
  if (!canCreateFeed(sub as never, feedsCount ?? 0)) {
    return NextResponse.json(
      { error: "LIMIT_REACHED", error_ar: "وصلت حد تغذيات باقتك — قم بالترقية" },
      { status: 402 },
    );
  }

  const { data: feed, error } = await supabase
    .from("ical_feeds")
    .insert({
      org_id: unit.org_id,
      unit_id: unit.id,
      direction: "import",
      name: parsed.data.name,
      url: parsed.data.url,
    })
    .select("id")
    .single();

  if (error) {
    const mapped = pgErrorToResponse(error);
    return mapped ?? NextResponse.json({ error: "INSERT_FAILED", error_ar: "فشل الحفظ" }, { status: 500 });
  }

  // مزامنة أولى فورية (fire-and-forget)
  fetch(new URL(`/api/v1/ical/feeds/${feed.id}/sync`, req.url), { method: "POST" }).catch(() => {});

  return NextResponse.json({ id: feed.id }, { status: 201 });
}
