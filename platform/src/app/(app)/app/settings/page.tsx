import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ar } from "@/lib/i18n/ar";
import { ROLE_LABELS_AR, type OrgRole } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("memberships")
    .select("org_id, role, org:organizations(name, slug, settings)")
    .limit(1);
  if (!membership || membership.length === 0) redirect("/onboarding");

  const active = membership[0] as unknown as {
    org_id: string;
    role: OrgRole;
    org: { name: string; slug: string; settings: { hold_hours?: number } };
  };

  const [{ data: team }, { data: sub }] = await Promise.all([
    supabase
      .from("memberships")
      .select("id, role, user:profiles!inner(full_name), profile_id:profiles!inner(id)")
      .eq("org_id", active.org_id),
    supabase
      .from("org_subscriptions")
      .select("plan_id, status, interval, trial_ends_at, current_period_end")
      .eq("org_id", active.org_id)
      .single(),
  ]);

  const teamRows = ((team ?? []) as unknown[]).map((m) => {
    const row = m as {
      id: string;
      role: OrgRole;
      user: { full_name: string } | { full_name: string }[];
      profile_id: string | { id: string }[];
    };
    const name = Array.isArray(row.user) ? row.user[0]?.full_name : row.user?.full_name;
    const pid = Array.isArray(row.profile_id) ? row.profile_id[0]?.id : row.profile_id;
    return { id: row.id, role: row.role, name: name || "عضو", userId: pid };
  });

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-semibold text-teal-deep">{ar.nav.settings}</h1>

      {/* المنظمة */}
      <section className="rounded-xl border border-line bg-offwhite p-5">
        <h2 className="font-semibold text-teal-deep">المنظمة</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">الاسم</dt>
            <dd className="mt-0.5 font-medium">{active.org.name}</dd>
          </div>
          <div>
            <dt className="text-muted">المعرّف</dt>
            <dd className="num mt-0.5 font-medium" dir="ltr">{active.org.slug}</dd>
          </div>
          <div>
            <dt className="text-muted">مدة تعليق الحجز (ساعات)</dt>
            <dd className="num mt-0.5 font-medium">{active.org.settings?.hold_hours ?? 24}</dd>
          </div>
        </dl>
      </section>

      {/* الاشتراك */}
      {sub && (
        <section className="rounded-xl border border-line bg-offwhite p-5">
          <h2 className="font-semibold text-teal-deep">{ar.billing.plan}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-teal/10 px-3 py-1 text-teal">
              {sub.plan_id === "trial" ? ar.billing.trial : sub.plan_id === "basic" ? ar.billing.basic : ar.billing.pro}
            </span>
            <span className="text-muted">
              {ar.billing.status[sub.status as keyof typeof ar.billing.status] ?? sub.status}
              {sub.status === "trialing" && sub.trial_ends_at && (
                <> · تنتهي التجربة {new Date(sub.trial_ends_at).toLocaleDateString("ar-SA")}</>
              )}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted">
            الدفع الإلكتروني يُفعّل عند توفر مزود الدفع — حتى ذلك الحين التجربة والترقية عبر التواصل معنا.
          </p>
        </section>
      )}

      {/* الفريق */}
      <section className="rounded-xl border border-line bg-offwhite p-5">
        <h2 className="font-semibold text-teal-deep">{ar.nav.team}</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {teamRows.map((m) => (
            <li key={m.id} className="flex items-center justify-between rounded-lg bg-mist px-3 py-2">
              <span>{m.name}</span>
              <span className="text-xs text-muted">{ROLE_LABELS_AR[m.role]}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">
          دعوة أعضاء جدد بالبريد متاحة في الإصدار القادم — مع صلاحيات دقيقة لكل دور.
        </p>
      </section>
    </div>
  );
}
