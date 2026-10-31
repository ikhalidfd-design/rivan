import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Rate limiting بنافذة ثابتة عبر جدول rate_limits (Postgres).
 * كافٍ لنطاق P0؛ Upstash بديل مستقبلي عند الحاجة.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<{ ok: boolean; remaining: number }> {
  const admin = createAdminClient();
  const now = new Date();

  const { data: existing } = await admin
    .from("rate_limits")
    .select("key, window_start, count")
    .eq("key", key)
    .single();

  if (!existing || now.getTime() - new Date(existing.window_start).getTime() > windowSec * 1000) {
    // نافذة جديدة
    await admin
      .from("rate_limits")
      .upsert({ key, window_start: now.toISOString(), count: 1 }, { onConflict: "key" });
    return { ok: true, remaining: limit - 1 };
  }

  if (existing.count >= limit) {
    return { ok: false, remaining: 0 };
  }

  const { count: newCount } = await admin
    .rpc("increment_rate_limit", { p_key: key }) as unknown as { count: number };
  return { ok: (newCount ?? existing.count + 1) <= limit, remaining: Math.max(0, limit - (newCount ?? 0)) };
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
