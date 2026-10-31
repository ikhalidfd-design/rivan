import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ar } from "@/lib/i18n/ar";
import NewUnitForm from "@/components/units/NewUnitForm";
import { canCreateUnit } from "@/lib/billing/entitlements";

export const dynamic = "force-dynamic";

export default async function NewUnitPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase.from("memberships").select("org_id").limit(1);
  if (!membership || membership.length === 0) redirect("/onboarding");
  const orgId = membership[0].org_id;

  const [{ count: unitsCount }, { data: sub }] = await Promise.all([
    supabase.from("units").select("id", { count: "exact", head: true }).eq("org_id", orgId),
    supabase
      .from("org_subscriptions")
      .select("plan_id, status, trial_ends_at")
      .eq("org_id", orgId)
      .single(),
  ]);

  if (!canCreateUnit(sub as never, unitsCount ?? 0)) {
    return (
      <div className="rounded-xl border border-gold/40 bg-st-pending/40 p-8 text-center">
        <h1 className="font-display text-xl font-semibold text-teal-deep">
          {ar.errors.limitReached}
        </h1>
        <p className="mt-2 text-sm text-muted">
          باقتك الحالية تسمح بعدد أقل من الوحدات — قم بالترقية لإضافة المزيد.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="font-display text-2xl font-semibold text-teal-deep">{ar.units.addNew}</h1>
      <NewUnitForm orgId={orgId} />
    </div>
  );
}
