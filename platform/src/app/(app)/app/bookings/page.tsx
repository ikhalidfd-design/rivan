import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ar } from "@/lib/i18n/ar";
import BookingsTable from "@/components/bookings/BookingsTable";
import { STATUS_LABELS_AR } from "@/lib/bookings/transitions";

export const dynamic = "force-dynamic";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase.from("memberships").select("org_id").limit(1);
  if (!membership || membership.length === 0) redirect("/onboarding");

  let query = supabase
    .from("bookings")
    .select(
      "id, kind, status, source, check_in, check_out, guests, guest_name, guest_phone, total_amount, expires_at, unit:units(id, name)",
    )
    .eq("org_id", membership[0].org_id)
    .order("check_in", { ascending: true })
    .limit(200);

  const validStatuses = Object.keys(STATUS_LABELS_AR);
  if (status && validStatuses.includes(status)) {
    query = query.eq("status", status);
  }

  const { data: bookings } = await query;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-teal-deep">الحجوزات</h1>

      <div className="flex flex-wrap gap-2">
        <a
          href="/app/bookings"
          className={`rounded-full px-3 py-1.5 text-sm ${!status ? "bg-teal text-offwhite" : "border border-line text-muted hover:border-teal"}`}
        >
          الكل
        </a>
        {(["pending", "confirmed", "checked_in", "checked_out"] as const).map((s) => (
          <a
            key={s}
            href={`/app/bookings?status=${s}`}
            className={`rounded-full px-3 py-1.5 text-sm ${status === s ? "bg-teal text-offwhite" : "border border-line text-muted hover:border-teal"}`}
          >
            {STATUS_LABELS_AR[s]}
          </a>
        ))}
      </div>

      <BookingsTable
        bookings={(bookings ?? []).map((b: {
          id: string; kind: "booking" | "block"; status: string; source: string;
          check_in: string; check_out: string; guests: number;
          guest_name: string | null; guest_phone: string | null;
          total_amount: number | null; expires_at: string | null;
          unit: { id: string; name: string } | { id: string; name: string }[] | null;
        }) => ({
          id: b.id,
          kind: b.kind,
          status: b.status as never,
          source: b.source,
          check_in: b.check_in,
          check_out: b.check_out,
          guests: b.guests,
          guest_name: b.guest_name,
          guest_phone: b.guest_phone,
          total_amount: b.total_amount,
          expires_at: b.expires_at,
          unit_name: (Array.isArray(b.unit) ? b.unit[0] : b.unit)?.name ?? "—",
        }))}
      />
    </div>
  );
}
