import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ar } from "@/lib/i18n/ar";
import IntegrationsHub from "@/components/integrations/IntegrationsHub";
import { PROVIDERS, PROVIDER_ORDER, CATEGORY_LABELS_AR } from "@/lib/integrations/registry";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase.from("memberships").select("org_id").limit(1);
  if (!membership || membership.length === 0) redirect("/onboarding");

  const [{ data: integrations }, { data: issues }, { data: feeds }] = await Promise.all([
    supabase.from("integrations").select("provider, status, last_sync_ok_at, last_error").eq("org_id", membership[0].org_id),
    supabase.from("sync_issues").select("id, source, severity, message, created_at").eq("org_id", membership[0].org_id).is("resolved_at", null).order("created_at", { ascending: false }).limit(20),
    supabase.from("ical_feeds").select("id, name, direction, last_sync_ok_at, last_status, unit:units(name)").eq("org_id", membership[0].org_id),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-teal-deep">{ar.integrations.title}</h1>
        <p className="mt-1 text-sm text-muted">
          كل ربط هنا يعرض حالته الفعلية — لا نعرض "مفعّل" إلا لتكامل مختبر فعليًا.
        </p>
      </div>

      {/* تنبيه مشكلات المزامنة */}
      {issues && issues.length > 0 && (
        <div className="rounded-xl border border-gold/40 bg-st-pending/50 p-4">
          <h2 className="font-semibold text-gold-deep">
            {ar.integrations.issues} (<span className="num">{issues.length}</span>)
          </h2>
          <ul className="mt-2 space-y-1.5 text-sm">
            {issues.map((i: { id: string; severity: string; message: string; source: string }) => (
              <li key={i.id} className="flex items-start gap-2">
                <span aria-hidden>{i.severity === "error" ? "⛔" : "⚠️"}</span>
                <span>{i.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* مزامنات iCal الحية */}
      {feeds && feeds.length > 0 && (
        <section className="rounded-xl border border-line bg-offwhite p-5">
          <h2 className="font-semibold text-teal-deep">قنوات iCal المتصلة فعليًا</h2>
          <div className="mt-3 space-y-2 text-sm">
            {feeds.map((f: { id: string; name: string; direction: string; last_sync_ok_at: string | null; last_status: string | null; unit: { name: string } | { name: string }[] | null }) => (
              <div key={f.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-mist px-3 py-2">
                <span className="font-medium">
                  {f.name} — {(Array.isArray(f.unit) ? f.unit[0] : f.unit)?.name ?? ""}
                </span>
                <span className="text-xs text-muted">
                  {f.last_sync_ok_at
                    ? `${ar.integrations.lastSyncOk}: ${new Date(f.last_sync_ok_at).toLocaleString("ar-SA")}`
                    : ar.integrations.never}
                  {f.last_status === "conflict" && " · ⚠️ تعارض"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* بطاقات المزودين */}
      {(["channels", "payments", "messaging", "locks", "compliance"] as const).map((cat) => {
        const items = PROVIDER_ORDER.filter((p) => PROVIDERS[p].category === cat);
        if (items.length === 0) return null;
        return (
          <section key={cat} className="space-y-3">
            <h2 className="font-semibold text-teal-deep">{CATEGORY_LABELS_AR[cat]}</h2>
            <IntegrationsHub
              providers={items.map((id) => {
                const meta = PROVIDERS[id];
                const dbRow = (integrations ?? []).find((i: { provider: string }) => i.provider === id);
                return {
                  id: meta.id,
                  nameAr: meta.nameAr,
                  capabilities: meta.capabilities,
                  requirementsAr: meta.requirementsAr,
                  icalAvailableNow: meta.icalAvailableNow,
                  notesAr: meta.notesAr,
                  dbStatus: (dbRow?.status as "inactive" | "active" | "error" | undefined) ?? "inactive",
                  lastSyncOkAt: dbRow?.last_sync_ok_at ?? null,
                };
              })}
            />
          </section>
        );
      })}
    </div>
  );
}
