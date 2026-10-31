import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // لديه منظمة نشطة؟ → لوحة التحكم
  const { data: existing } = await supabase
    .from("memberships")
    .select("org_id")
    .limit(1);
  if (existing && existing.length > 0) redirect("/app");

  const { data: plans } = await supabase
    .from("plans")
    .select("id, name_ar, monthly_price, yearly_price, max_units")
    .eq("is_public", true)
    .order("sort_order");

  return (
    <main className="min-h-dvh bg-mist px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <span className="font-display text-3xl font-semibold text-teal-deep">رواق</span>
          <h1 className="mt-4 font-display text-2xl font-semibold text-teal-deep">
            لنجهّز حسابك — 3 خطوات
          </h1>
        </div>
        <div className="rounded-2xl border border-line bg-offwhite p-8 shadow-sm">
          <OnboardingWizard
            plans={(plans ?? []).map((p: { id: string; name_ar: string; monthly_price: number; yearly_price: number; max_units: number }) => p)}
          />
        </div>
      </div>
    </main>
  );
}
