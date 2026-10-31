import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * نقطة Webhooks الواردة لكل المزودين.
 * القاعدة الصارمة: أي مزود بلا مفاتيح معتمدة يرفض 503 فورًا — لا ادعاء تفعيل.
 * عند وجود المفاتيح: تحقق HMAC أولًا ثم تخزين خام قابل لإعادة التشغيل (webhook_events).
 */

const ACTIVATION_ENV: Record<string, string[]> = {
  moyasar: ["MOYASAR_SECRET_KEY"],
  hyperpay: ["HYPERPAY_SECRET_KEY"],
  whatsapp: ["WHATSAPP_CLOUD_TOKEN"],
  airbnb: ["AIRBNB_CLIENT_ID", "AIRBNB_CLIENT_SECRET"],
  booking: ["BOOKING_PARTNER_KEY"],
  ttlock: ["TTLOCK_CLIENT_ID", "TTLOCK_CLIENT_SECRET"],
};

export async function POST(req: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params;
  const required = ACTIVATION_ENV[provider];

  if (!required) {
    return NextResponse.json({ error: "UNKNOWN_PROVIDER" }, { status: 404 });
  }

  const activated = required.every((k) => Boolean(process.env[k]));
  if (!activated) {
    return NextResponse.json(
      { error: "NOT_ACTIVATED", error_ar: "هذا التكامل غير مفعّل — يتطلب اعتمادًا ومفاتيح خارجية" },
      { status: 503 },
    );
  }

  // تحقق التوقيع (إن وُجد سر موحد للمزود)
  const raw = await req.text();
  const admin = createAdminClient();
  const sig = req.headers.get("x-ruwaq-signature");
  const sigValid = sig ? verifyProvider(provider, raw, sig) : false;

  // تخزين خام قابل لإعادة التشغيل — المعالجة الفعلية لكل مزود عند تفعيله
  await admin.from("webhook_events").insert({
    provider,
    signature_valid: sigValid,
    body: JSON.parse(raw || "{}"),
  });

  if (!sigValid) {
    return NextResponse.json({ error: "BAD_SIGNATURE" }, { status: 401 });
  }

  // معالجات كل مزود تُضاف عند التفعيل الرسمي (P1+)
  return NextResponse.json({ received: true });
}

function verifyProvider(provider: string, raw: string, sig: string): boolean {
  // كل مزود له سرّه — مؤقتًا نستخدم متغير <PROVIDER>_WEBHOOK_SECRET
  const secret = process.env[`${provider.toUpperCase()}_WEBHOOK_SECRET`];
  if (!secret) return false;
  const crypto = require("node:crypto") as typeof import("node:crypto");
  const expected = crypto.createHmac("sha256", secret).update(raw, "utf8").digest("hex");
  const provided = sig.startsWith("sha256=") ? sig.slice(7) : sig;
  if (!/^[0-9a-f]{64}$/i.test(provided)) return false;
  return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(provided, "hex"));
}
