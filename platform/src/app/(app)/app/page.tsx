import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ar } from "@/lib/i18n/ar";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: memberships } = await supabase
    .from("memberships")
    .select("role, org:organizations(id, name, slug)");

  if (!memberships || memberships.length === 0) redirect("/onboarding");
  const active = memberships[0] as unknown as {
    role: string;
    org: { id: string; name: string; slug: string };
  };

  const today = new Date().toISOString().slice(0, 10);
  const [{ count: arrivalsToday }, { count: pendingCount }, { count: unitsCount }] =
    await Promise.all([
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("org_id", active.org.id)
        .eq("check_in", today)
        .eq("status", "confirmed"),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("org_id", active.org.id)
        .eq("status", "pending"),
      supabase
        .from("units")
        .select("id", { count: "exact", head: true })
        .eq("org_id", active.org.id),
    ]);

  const cards = [
    { label: "وصولات اليوم", value: arrivalsToday ?? 0 },
    { label: "طلبات بانتظار التأكيد", value: pendingCount ?? 0 },
    { label: "الوحدات", value: unitsCount ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-teal-deep">
          {active.org.name}
        </h1>
        <p className="text-muted text-sm mt-1">لوحة التحكم — نظرة اليوم</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-line bg-offwhite p-5">
            <p className="text-sm text-muted">{c.label}</p>
            <p className="num mt-2 text-3xl font-semibold text-teal-deep">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-line bg-offwhite p-5">
        <h2 className="font-semibold text-teal-deep">الخطوات التالية</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted list-disc ps-5">
          <li>
            <Link href="/app/units" className="link-underline text-teal">
              {ar.units.addNew}
            </Link>{" "}
            وأضف أسعارها وصورها
          </li>
          <li>انشر الوحدة لتحصل على صفحة الحجز المباشر</li>
          <li>
            <Link href="/app/settings/integrations" className="link-underline text-teal">
              {ar.integrations.title}
            </Link>{" "}
            — انسخ رابط iCal لكل وحدة والصقه في Airbnb/Booking
          </li>
          <li>
            <Link href="/app/calendar" className="link-underline text-teal">
              {ar.calendar.title}
            </Link>{" "}
            — تابع الحجوزات والكتل الخارجية في مكان واحد
          </li>
        </ul>
      </div>
    </div>
  );
}
