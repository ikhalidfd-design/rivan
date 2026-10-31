import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchIcalFeed } from "./fetch";
import { parseIcalToBlocks } from "./parse";

/**
 * مزامنة تغذية استيراد iCal واحدة — idempotent (diff بـ UID) داخل معاملة منطقية.
 * النتيجة: ok | not_modified | error | conflict
 */
export async function syncIcalFeed(feedId: string): Promise<
  "ok" | "not_modified" | "error" | "conflict"
> {
  const admin = createAdminClient();

  const { data: feed } = await admin
    .from("ical_feeds")
    .select("id, org_id, unit_id, url, etag, enabled")
    .eq("id", feedId)
    .single();
  if (!feed || !feed.enabled || !feed.url) return "error";

  const horizonStart = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const horizonEnd = new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10);

  let result: "ok" | "not_modified" | "error" | "conflict" = "ok";
  try {
    const { body, etag } = await fetchIcalFeed(feed.url, { etag: feed.etag });
    if (body === "") {
      await admin
        .from("ical_feeds")
        .update({ last_synced_at: new Date().toISOString(), last_status: "ok" })
        .eq("id", feedId);
      return "not_modified";
    }

    const events = await parseIcalToBlocks(body, horizonStart, horizonEnd);

    // الكاش الحالي
    const { data: cached } = await admin
      .from("ical_events")
      .select("uid, start_date, end_date, block_booking_id")
      .eq("feed_id", feedId);
    const cachedMap = new Map((cached ?? []).map((c: { uid: string; start_date: string; end_date: string; block_booking_id: string | null }) => [c.uid, c]));
    const incomingUids = new Set(events.map((e) => e.uid));

    // 1) اختفى من المصدر → احذف الكتلة والكاش
    for (const [uid, c] of cachedMap) {
      if (!incomingUids.has(uid)) {
        if (c.block_booking_id) {
          await admin.from("bookings").delete().eq("id", c.block_booking_id);
        }
        await admin.from("ical_events").delete().eq("feed_id", feedId).eq("uid", uid);
      }
    }

    // 2) جديد أو متغير التواريخ
    for (const ev of events) {
      const prev = cachedMap.get(ev.uid);
      const changed =
        !prev || prev.start_date !== ev.start || prev.end_date !== ev.end;

      if (prev && !changed) continue;

      if (prev && changed) {
        if (prev.block_booking_id) {
          await admin.from("bookings").delete().eq("id", prev.block_booking_id);
        }
        await admin.from("ical_events").delete().eq("feed_id", feedId).eq("uid", ev.uid);
      }

      // كتلة جديدة — تعارض EXCLUDE ممكن (حجز داخلي قائم على نفس التواريخ)
      const { data: block, error: blockErr } = await admin
        .from("bookings")
        .insert({
          org_id: feed.org_id,
          unit_id: feed.unit_id,
          kind: "block",
          status: "confirmed",
          source: "ical",
          check_in: ev.start,
          check_out: ev.end,
          external_ref: ev.uid,
        })
        .select("id")
        .single();

      if (blockErr && blockErr.code === "23P01") {
        // الواقع الخارجي يفوز: سجل تعارضًا وأكمل
        result = "conflict";
        await admin.from("sync_issues").insert({
          org_id: feed.org_id,
          source: `ical:${feedId}`,
          severity: "warning",
          message: `تعارض: كتلة خارجية (${ev.start} → ${ev.end}) تتقاطع مع حجز قائم`,
          detail: { uid: ev.uid, start: ev.start, end: ev.end },
        });
        continue; // نخزن الكاش بلا block مرتبط؟ لا — بدون كتلة، الكاش بلا معنى هنا. تجاهل.
      }
      if (blockErr) throw new Error(blockErr.message);

      await admin.from("ical_events").insert({
        feed_id: feedId,
        uid: ev.uid,
        summary: ev.summary,
        start_date: ev.start,
        end_date: ev.end,
        block_booking_id: block.id,
      });
    }

    await admin
      .from("ical_feeds")
      .update({
        last_synced_at: new Date().toISOString(),
        last_sync_ok_at: new Date().toISOString(),
        last_status: result,
        last_error: null,
        etag,
      })
      .eq("id", feedId);

    return result;
  } catch (e) {
    const message = e instanceof Error ? e.message : "خطأ غير معروف";
    await admin
      .from("ical_feeds")
      .update({ last_synced_at: new Date().toISOString(), last_status: "error", last_error: message })
      .eq("id", feedId);
    await admin.from("sync_issues").insert({
      org_id: feed.org_id,
      source: `ical:${feedId}`,
      severity: "error",
      message: `فشلت مزامنة التغذية: ${message}`,
    });
    return "error";
  }
}
