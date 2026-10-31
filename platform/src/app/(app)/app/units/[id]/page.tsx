import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ar } from "@/lib/i18n/ar";
import UnitDetail from "@/components/units/UnitDetail";

export const dynamic = "force-dynamic";

export default async function UnitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: unit } = await supabase
    .from("units")
    .select(
      "id, org_id, name, slug, ical_token, is_published, capacity, bedrooms, bathrooms, base_price, weekend_price, cleaning_fee, min_nights, description, property:properties(id, name)",
    )
    .eq("id", id)
    .single();
  if (!unit) notFound();

  const unitRow = unit as unknown as {
    id: string; org_id: string; name: string; slug: string; ical_token: string;
    is_published: boolean; capacity: number; bedrooms: number | null; bathrooms: number | null;
    base_price: number; weekend_price: number | null; cleaning_fee: number;
    min_nights: number; description: string | null;
    property: { id: string; name: string } | { id: string; name: string }[] | null;
  };

  const [{ data: rates }, { data: feeds }] = await Promise.all([
    supabase
      .from("rates")
      .select("id, d, price, min_nights, note")
      .eq("unit_id", id)
      .order("d"),
    supabase
      .from("ical_feeds")
      .select("id, name, url, direction, enabled, last_synced_at, last_sync_ok_at, last_status, last_error")
      .eq("unit_id", id)
      .order("created_at"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/app/units" className="text-sm text-muted hover:text-teal">
            ← {ar.units.title}
          </Link>
          <h1 className="mt-1 font-display text-2xl font-semibold text-teal-deep">{unitRow.name}</h1>
        </div>
      </div>

      <UnitDetail
        unit={unitRow}
        rates={rates ?? []}
        feeds={feeds ?? []}
      />
    </div>
  );
}
