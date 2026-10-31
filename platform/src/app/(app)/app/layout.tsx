import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ar } from "@/lib/i18n/ar";
import LogoutButton from "@/components/app/LogoutButton";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/app", label: ar.nav.dashboard, icon: "▦" },
  { href: "/app/units", label: ar.nav.units, icon: "🏠" },
  { href: "/app/calendar", label: ar.nav.calendar, icon: "📅" },
  { href: "/app/bookings", label: ar.nav.bookings, icon: "📋" },
  { href: "/app/settings/integrations", label: ar.nav.integrations, icon: "🔌" },
  { href: "/app/settings", label: ar.nav.settings, icon: "⚙" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, is_super_admin")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-dvh bg-mist">
      {/* شريط جانبي — RTL: يظهر يمينًا */}
      <aside className="fixed inset-y-0 right-0 z-30 hidden w-60 flex-col border-l border-line bg-teal-deep text-offwhite md:flex">
        <div className="px-5 py-6">
          <span className="font-display text-2xl font-semibold">رواق</span>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition hover:bg-forest"
            >
              <span aria-hidden>{n.icon}</span>
              {n.label}
            </Link>
          ))}
          {profile?.is_super_admin && (
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gold transition hover:bg-forest"
            >
              <span aria-hidden>★</span>
              {ar.nav.admin}
            </Link>
          )}
        </nav>
        <div className="border-t border-forest px-5 py-4 text-sm">
          <p className="truncate">{profile?.full_name || user.email}</p>
          <LogoutButton />
        </div>
      </aside>

      {/* شريط علوي للجوال */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-teal-deep px-4 py-3 text-offwhite md:hidden">
        <span className="font-display text-xl font-semibold">رواق</span>
        <LogoutButton compact />
      </div>
      <nav className="flex gap-1 overflow-x-auto border-b border-line bg-teal-deep px-2 pb-2 text-sm text-offwhite md:hidden">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-lg px-3 py-1.5 hover:bg-forest">
            {n.label}
          </Link>
        ))}
      </nav>

      <main className="px-4 py-6 md:ps-60">{children}</main>
    </div>
  );
}
