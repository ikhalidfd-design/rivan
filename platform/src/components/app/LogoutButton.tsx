"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ar } from "@/lib/i18n/ar";

export default function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className={
        compact
          ? "rounded-lg border border-offwhite/30 px-3 py-1.5 text-sm text-offwhite transition hover:bg-forest"
          : "mt-2 text-gold-soft transition hover:text-gold"
      }
    >
      {ar.nav.logout}
    </button>
  );
}
