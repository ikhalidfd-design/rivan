"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ar } from "@/lib/i18n/ar";

interface Plan {
  id: string;
  name_ar: string;
  monthly_price: number;
  yearly_price: number;
  max_units: number;
}

function slugify(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return base || `org-${Date.now().toString(36)}`;
}

export default function OnboardingWizard({ plans }: { plans: Plan[] }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState("");
  const [unitName, setUnitName] = useState("");
  const [unitCity, setUnitCity] = useState("الرياض");
  const [basePrice, setBasePrice] = useState("300");
  const [planId, setPlanId] = useState("trial");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function finish() {
    setError(null);
    setLoading(true);
    const supabase = createClient();

    // 1) المنظمة + الباقة عبر RPC (مع العضوية والاشتراك التجريبي)
    const { data: orgId, error: orgErr } = await supabase.rpc("create_organization", {
      p_name: orgName.trim(),
      p_slug: `${slugify(orgName)}-${Math.random().toString(36).slice(2, 6)}`,
      p_plan_id: planId,
    });
    if (orgErr || !orgId) {
      setError(orgErr?.message === "ALREADY_HAS_ORG" ? "لديك منظمة نشطة بالفعل" : ar.common.error);
      setLoading(false);
      return;
    }

    // 2) الوحدة الأولى (RLS: عضو مالك)
    let unitSlug = slugify(unitName || "unit-1");
    const { error: unitErr } = await supabase.from("units").insert({
      org_id: orgId,
      name: unitName.trim() || "وحدتي الأولى",
      slug: `${unitSlug}-${Math.random().toString(36).slice(2, 6)}`,
      base_price: Number(basePrice) || 300,
      is_published: false,
    });
    if (unitErr) {
      setError(ar.common.error);
      setLoading(false);
      return;
    }

    router.push("/app");
    router.refresh();
  }

  return (
    <div>
      {/* شريط الخطوات */}
      <div className="mb-8 flex items-center gap-2" aria-hidden>
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-teal" : "bg-line"}`}
          />
        ))}
      </div>
      <p className="mb-6 text-sm text-muted">الخطوة {step} من 3</p>

      {step === 1 && (
        <div className="space-y-5">
          <label className="block">
            <span className="text-sm text-muted">{ar.onboarding.orgName}</span>
            <input
              className="field"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="مثال: إدارة شقق الياسمين"
              required
              minLength={2}
            />
          </label>
          <button
            onClick={() => orgName.trim().length >= 2 && setStep(2)}
            disabled={orgName.trim().length < 2}
            className="w-full rounded-lg bg-teal py-3 text-offwhite font-medium transition hover:bg-teal-deep disabled:opacity-50"
          >
            التالي
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <label className="block">
            <span className="text-sm text-muted">{ar.onboarding.unitName}</span>
            <input
              className="field"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              placeholder="مثال: شقة الياسمين 1"
              required
              minLength={2}
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-muted">{ar.units.city}</span>
              <select className="field" value={unitCity} onChange={(e) => setUnitCity(e.target.value)}>
                <option>الرياض</option>
                <option>جدة</option>
                <option>الدمام</option>
                <option>الخبر</option>
                <option>الطائف</option>
                <option>أبها</option>
                <option>المدينة المنورة</option>
                <option>مكة المكرمة</option>
                <option>أخرى</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-muted">{ar.units.basePrice}</span>
              <input
                className="field num"
                dir="ltr"
                type="number"
                min="50"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
              />
            </label>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="rounded-lg border border-line px-5 py-3 text-muted">
              {ar.common.back}
            </button>
            <button
              onClick={() => unitName.trim().length >= 2 && setStep(3)}
              disabled={unitName.trim().length < 2}
              className="flex-1 rounded-lg bg-teal py-3 text-offwhite font-medium transition hover:bg-teal-deep disabled:opacity-50"
            >
              التالي
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {plans.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlanId(p.id)}
                className={`rounded-xl border p-4 text-right transition ${
                  planId === p.id
                    ? "border-teal bg-mist ring-2 ring-teal"
                    : "border-line hover:border-teal"
                }`}
              >
                <p className="font-semibold text-teal-deep">{p.name_ar}</p>
                <p className="num mt-1 text-lg font-bold">
                  {p.monthly_price === 0 ? "مجانًا" : `${p.monthly_price} ${ar.common.currency}`}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {ar.billing.unitsLimit}: <span className="num">{p.max_units}</span>
                </p>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted">
            تبدأ بفترة تجريبية 14 يومًا بكامل المزايا — لا نطلب بيانات دفع الآن.
          </p>
          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="rounded-lg border border-line px-5 py-3 text-muted">
              {ar.common.back}
            </button>
            <button
              onClick={finish}
              disabled={loading}
              className="flex-1 rounded-lg bg-gold px-5 py-3 font-medium text-teal-deep transition hover:bg-gold-deep hover:text-offwhite disabled:opacity-50"
            >
              {loading ? ar.common.loading : ar.onboarding.finish}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
