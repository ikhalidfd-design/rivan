import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ar } from "@/lib/i18n/ar";
import UnitsList from "@/components/units/UnitsList";

export const dynamic = "force-dynamic";

export default async function UnitsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("memberships")
    .select("org_id, role")
    .limit(1);
  if (!membership || membership.length === 0) redirect("/onboarding");
  const activeOrg = membership[0].org_id;

  const [{ data: units }, { data: sub }] = await Promise.all([
    supabase
      .from("units")
      .select("id, name, slug, is_published, capacity, base_price, property:properties(name, city)")
      .eq("org_id", activeOrg)
      .order("created_at"),
    supabase
      .from("org_subscriptions")
      .select("plan_id, status, trial_ends_at")
      .eq("org_id", activeOrg)
      .single(),
  ]);

  const [{ count: unitsCount }] = await Promise.all([
    supabase.from("units").select("id", { count: "exact", head: true }).eq("org_id", activeOrg),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-teal-deep">{ar.units.title}</h1>
          <p className="mt-1 text-sm text-muted">
            <span className="num">{unitsCount ?? 0}</span> وحدة
            {sub && (
              <> · باقة {sub.plan_id === "trial" ? ar.billing.trial : sub.plan_id === "basic" ? ar.billing.basic : ar.billing.pro}</>
            )}
          </p>
        </div>
        <Link
          href="/app/units/new"
          className="rounded-lg bg-teal px-4 py-2.5 text-sm font-medium text-offwhite transition hover:bg-teal-deep"
        >
          + {ar.units.addNew}
        </Link>
      </div>

      <UnitsList
        initialUnits={(units ?? []).map((u: {
          id: string; name: string; slug: string; is_published: boolean;
          capacity: number; base_price: number;
          property: { name: string; city: string | null } | { name: string; city: string | null }[] | null;
        }) => {
          const prop = Array.isArray(u.property) ? u.property[0] : u.property;
          return {
            id: u.id,
            name: u.name,
            slug: u.slug,
            is_published: u.is_published,
            capacity: u.capacity,
            base_price: u.base_price,
            city: prop?.city ?? null,
            property_name: prop?.name ?? null,
          };
        })}
        canCreate={true}
      />
    </div>
  );
}
