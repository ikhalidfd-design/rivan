import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { HANDLERS, JobType } from "@/lib/jobs/handlers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BATCH = 10;
const STALE_MS = 5 * 60 * 1000;

/**
 * عامل الوظائف — يستدعى بـ Vercel Cron (أو pg_cron عبر HTTP).
 * حماية: Authorization: Bearer CRON_SECRET.
 * يطلب صفوفًا بـ FOR UPDATE SKIP LOCKED، يعالجها مع retry أسّي، وdead-letter بعد الاستنفاد.
 */
export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return runWorker();
}

/** Vercel Cron يرسل GET */
export async function GET(req: Request) {
  return POST(req);
}

async function runWorker(): Promise<NextResponse> {
  const admin = createAdminClient();
  const workerId = `w-${crypto.randomBytes(4).toString("hex")}`;

  // 0) إعادة تسليح الجمهور العالق (عامل crashed أثناء التنفيذ)
  await admin
    .from("jobs")
    .update({ status: "pending", locked_at: null, locked_by: null })
    .eq("status", "running")
    .lt("locked_at", new Date(Date.now() - STALE_MS).toISOString());

  // 1) جدولة booking.expire الدورية (كل 15 دقيقة) — idempotency بنافذة ربع ساعة
  await admin.from("jobs").insert({
    type: "booking.expire",
    payload: {},
    idempotency_key: `booking.expire:${Math.floor(Date.now() / (15 * 60 * 1000))}`,
  });

  // 2) تغذيات iCal المستحقة (لم تُزامن خلال 6 ساعات) — idempotency بنافذة نصف ساعة لكل تغذية
  const sixHoursAgo = new Date(Date.now() - 6 * 3600_000).toISOString();
  const { data: dueFeeds } = await admin
    .from("ical_feeds")
    .select("id")
    .eq("enabled", true)
    .eq("direction", "import")
    .or(`last_synced_at.is.null,last_synced_at.lt.${sixHoursAgo}`)
    .limit(20);
  for (const f of dueFeeds ?? []) {
    await admin.from("jobs").insert({
      type: "ical.import",
      payload: { feed_id: f.id },
      idempotency_key: `ical.import:${f.id}:${Math.floor(Date.now() / (30 * 60 * 1000))}`,
    }).then(({ error }: { error: { code?: string } | null }) => {
      if (error && error.code !== "23505") console.error("enqueue feed failed", f.id, error);
    });
  }

  // 3) سحب دفعة والتنفيذ
  const { data: claimed, error: claimErr } = await admin.rpc("claim_jobs", {
    p_worker: workerId,
    p_limit: BATCH,
  });
  if (claimErr) {
    return NextResponse.json({ error: "claim_failed" }, { status: 500 });
  }

  const stats = { done: 0, failed: 0, dead: 0 };
  for (const job of (claimed ?? []) as {
    id: string;
    type: string;
    payload: Record<string, unknown>;
    attempts: number;
    max_attempts: number;
  }[]) {
    try {
      const handler = HANDLERS[job.type as JobType];
      if (!handler) throw new Error(`نوع وظيفة غير معروف: ${job.type}`);
      await handler(job.payload);
      await admin.from("jobs").update({ status: "done", updated_at: new Date().toISOString() }).eq("id", job.id);
      stats.done++;
    } catch (e) {
      const message = e instanceof Error ? e.message : "خطأ غير معروف";
      const attempts = job.attempts + 1;
      if (attempts >= job.max_attempts) {
        // dead-letter
        await admin.from("jobs").update({
          status: "dead", last_error: message, updated_at: new Date().toISOString(),
        }).eq("id", job.id);
        await admin.from("job_failures").insert({
          job_id: job.id, type: job.type, payload: job.payload,
          attempts, last_error: message,
        });
        stats.dead++;
      } else {
        // retry بأسّ 2^n: 30s, 60s, 2m, 4m...
        const backoffMs = Math.pow(2, attempts) * 30_000;
        await admin.from("jobs").update({
          status: "pending", last_error: message,
          run_at: new Date(Date.now() + backoffMs).toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("id", job.id);
        stats.failed++;
      }
    }
  }

  return NextResponse.json({ worker: workerId, ...stats });
}
