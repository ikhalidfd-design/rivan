import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncIcalFeed } from "@/lib/ical/sync";

export type JobType = "ical.import" | "booking.expire";

/**
 * معالجات الوظائف — كلها idempotent:
 *  - ical.import: diff بـ UID (آمنة لإعادة التشغيل)
 *  - booking.expire: تحديث شرطي where status='pending' (آمن للتكرار)
 */
export const HANDLERS: Record<JobType, (payload: Record<string, unknown>) => Promise<void>> = {
  "ical.import": async (payload) => {
    const feedId = payload.feed_id as string;
    if (!feedId) throw new Error("feed_id مفقود");
    await syncIcalFeed(feedId);
  },

  "booking.expire": async () => {
    const admin = createAdminClient();
    await admin.rpc("expire_stale_pending_bookings");
  },
};
