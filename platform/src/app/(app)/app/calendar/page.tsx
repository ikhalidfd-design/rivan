import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ar } from "@/lib/i18n/ar";
import UnifiedCalendar from "@/components/calendar/UnifiedCalendar";

export const dynamic = "force-dynamic";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { m } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase.from("memberships").select("org_id").limit(1);
  if (!membership || membership.length === 0) redirect("/onboarding");

  const from = new Date();
  from.setDate(1);
  if (m && /^\d{4}-\d{2}$/.test(m)) {
    const [y, mo] = m.split("-").map(Number);
    from.setFullYear(y, mo - 1, 1);
  }
  const to = new Date(from);
  to.setMonth(to.getMonth() + 1);

  const fromStr = from.toISOString().slice(0, 10);
  const toStr = to.toISOString().slice(0, 10);

  const [{ data: units }, { data: bookings }] = await Promise.all([
    supabase.from("units").select("id, name").eq("org_id", membership[0].org_id).order("name"),
    supabase
      .from("bookings")
      .select("id, unit_id, kind, status, source, check_in, check_out, guest_name")
      .eq("org_id", membership[0].org_id)
      .gte("check_out", fromStr)
      .lte("check_in", toStr)
      .in("status", ["pending", "confirmed", "checked_in"]),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-teal-deep">{ar.calendar.title}</h1>
      <UnifiedCalendar
        year={from.getFullYear()}
        month={from.getMonth() + 1}
        units={units ?? []}
        bookings={bookings ?? []}
      />
    </div>
  );
}
