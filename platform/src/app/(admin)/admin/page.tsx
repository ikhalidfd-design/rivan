import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ar } from "@/lib/i18n/ar";

export const dynamic = "force-dynamic";

/** Super Admin — إدارة المشتركين والاستخدام والوظائف (الدور: is_super_admin) */
export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_super_admin) redirect("/app");

  const admin = createAdminClient();
  const [{ data: orgs }, { data: subs }, jobsStats, { data: dead }] = await Promise.all([
    admin.from("organizations").select("id, name, slug, created_at").order("created_at", { ascending: false }).limit(50),
    admin.from("org_subscriptions").select("org_id, plan_id, status, trial_ends_at"),
    admin.from("jobs").select("id", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("job_failures").select("id, type, last_error, failed_at").order("failed_at", { ascending: false }).limit(10),
  ]);

  const unitsCount = await admin.from("units").select("org_id", { head: true, count: "exact" });

  const subByOrg = new Map((subs ?? []).map((s: { org_id: string }) => [s.org_id, s]));

  return (
    <main className="min-h-dvh bg-mist px-4 py-8" dir="rtl">
      <div className="mx-auto max-w-5xl space-y-8">
        <h1 className="font-display text-2xl font-semibold text-teal-deep">{ar.nav.admin}</h1>

        {/* إحصاءات سريعة */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-line bg-offwhite p-5">
            <p className="text-sm text-muted">المنظمات</p>
            <p className="num mt-1 text-3xl font-semibold text-teal-deep">{orgs?.length ?? 0}</p>
          </div>
          <div className="rounded-xl border border-line bg-offwhite p-5">
            <p className="text-sm text-muted">إجمالي الوحدات</p>
            <p className="num mt-1 text-3xl font-semibold text-teal-deep">{unitsCount.count ?? 0}</p>
          </div>
          <div className="rounded-xl border border-line bg-offwhite p-5">
            <p className="text-sm text-muted">وظائف منتظرة</p>
            <p className="num mt-1 text-3xl font-semibold text-teal-deep">{jobsStats.count ?? 0}</p>
          </div>
        </div>

        {/* المشتركون */}
        <section className="rounded-xl border border-line bg-offwhite p-5">
          <h2 className="font-semibold text-teal-deep">المشتركون</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-muted">
                  <th className="p-2 text-start">المنظمة</th>
                  <th className="p-2 text-start">الباقة</th>
                  <th className="p-2 text-start">الحالة</th>
                  <th className="p-2 text-start">انضم</th>
                </tr>
              </thead>
              <tbody>
                {(orgs ?? []).map((o: { id: string; name: string; slug: string; created_at: string }) => {
                  const s = subByOrg.get(o.id) as { plan_id: string; status: string } | undefined;
                  return (
                    <tr key={o.id} className="border-b border-line/50">
                      <td className="p-2 font-medium">{o.name}</td>
                      <td className="p-2">{s?.plan_id ?? "—"}</td>
                      <td className="p-2">
                        {s ? ar.billing.status[s.status as keyof typeof ar.billing.status] ?? s.status : "—"}
                      </td>
                      <td className="num p-2 text-muted" dir="ltr">
                        {new Date(o.created_at).toLocaleDateString("en-GB")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Dead-letter */}
        <section className="rounded-xl border border-line bg-offwhite p-5">
          <h2 className="font-semibold text-teal-deep">وظائف متعطلة (Dead-letter)</h2>
          {(dead ?? []).length === 0 ? (
            <p className="mt-2 text-sm text-muted">لا شيء — كل الوظائف تعمل.</p>
          ) : (
            <ul className="mt-2 space-y-2 text-sm">
              {(dead ?? []).map((j: { id: string; type: string; last_error: string | null; failed_at: string }) => (
                <li key={j.id} className="rounded-lg bg-red-50 p-3">
                  <span className="font-medium">{j.type}</span>
                  {j.last_error && <span className="text-red-700"> — {j.last_error}</span>}
                  <span className="num block text-xs text-muted" dir="ltr">
                    {new Date(j.failed_at).toLocaleString("en-GB")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
