import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { unauthorized } from "@/lib/api/respond";

/**
 * طلب مزامنة تغذية الآن: يضيف job ثم يستدعي العامل فورًا (لا ينتظر الدورة).
 * حد أدنى 30 دقيقة بين مزامنتين لنفس التغذية (يفحصه العامل أيضًا).
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  // مساران: مستخدم مسجل (زر المزامنة) أو العامل الدوري (يستدعي بعد الجدولة)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // تحقق أن التغذية ضمن منظمة المستخدم (RLS)
    const { data: feed } = await supabase
      .from("ical_feeds")
      .select("id")
      .eq("id", id)
      .single();
    if (!feed) return unauthorized();
  }

  const admin = createAdminClient();
  const { error } = await admin.from("jobs").insert({
    type: "ical.import",
    payload: { feed_id: id },
    idempotency_key: `ical.import:${id}:${Math.floor(Date.now() / (30 * 60 * 1000))}`, // نافذة 30 دقيقة
  });
  // مفتاح مكرر = طلب متكرر خلال النافذة — نجاح صامت
  if (error && error.code !== "23505") {
    return NextResponse.json({ error: "ENQUEUE_FAILED", error_ar: "فشل طلب المزامنة" }, { status: 500 });
  }

  // استدعاء العامل فورًا إن توفر السر (بيئة الخادم)
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const origin = new URL(req.url).origin;
    fetch(`${origin}/api/cron/worker`, {
      method: "POST",
      headers: { authorization: `Bearer ${cronSecret}` },
    }).catch(() => {});
  }

  return NextResponse.json({ enqueued: true });
}
