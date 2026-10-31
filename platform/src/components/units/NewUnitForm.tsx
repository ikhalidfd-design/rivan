"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ar } from "@/lib/i18n/ar";

function slugify(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "") || `unit-${Date.now().toString(36)}`
  );
}

export default function NewUnitForm({ orgId }: { orgId: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    capacity: 4,
    base_price: 300,
    weekend_price: "",
    cleaning_fee: 80,
    min_nights: 1,
    description: "",
    publishNow: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.name.trim().length < 2) {
      setError(ar.common.required);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error: insertErr } = await supabase
      .from("units")
      .insert({
        org_id: orgId,
        name: form.name.trim(),
        slug: `${slugify(form.name)}-${Math.random().toString(36).slice(2, 6)}`,
        capacity: Number(form.capacity),
        base_price: Number(form.base_price),
        weekend_price: form.weekend_price === "" ? null : Number(form.weekend_price),
        cleaning_fee: Number(form.cleaning_fee),
        min_nights: Number(form.min_nights),
        description: form.description || null,
        is_published: form.publishNow,
      })
      .select("id")
      .single();

    setLoading(false);
    if (insertErr || !data) {
      setError(insertErr?.code === "42501" ? ar.errors.limitReached : ar.common.error);
      return;
    }
    router.push(`/app/units/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-xl border border-line bg-offwhite p-6">
      <label className="block">
        <span className="text-sm text-muted">{ar.units.name}</span>
        <input
          className="field"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="مثال: شقة الياسمين 3"
          required
          minLength={2}
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-muted">{ar.units.capacity}</span>
          <input className="field num" dir="ltr" type="number" min="1" max="30" value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
        </label>
        <label className="block">
          <span className="text-sm text-muted">{ar.units.minNights}</span>
          <input className="field num" dir="ltr" type="number" min="1" value={form.min_nights}
            onChange={(e) => setForm({ ...form, min_nights: Number(e.target.value) })} />
        </label>
        <label className="block">
          <span className="text-sm text-muted">{ar.units.basePrice}</span>
          <input className="field num" dir="ltr" type="number" min="50" value={form.base_price}
            onChange={(e) => setForm({ ...form, base_price: Number(e.target.value) })} />
        </label>
        <label className="block">
          <span className="text-sm text-muted">{ar.units.weekendPrice} (اختياري)</span>
          <input className="field num" dir="ltr" type="number" min="0" value={form.weekend_price}
            onChange={(e) => setForm({ ...form, weekend_price: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-sm text-muted">{ar.units.cleaningFee}</span>
          <input className="field num" dir="ltr" type="number" min="0" value={form.cleaning_fee}
            onChange={(e) => setForm({ ...form, cleaning_fee: Number(e.target.value) })} />
        </label>
      </div>

      <label className="block">
        <span className="text-sm text-muted">وصف مختصر (اختياري)</span>
        <textarea className="field min-h-20" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.publishNow}
          onChange={(e) => setForm({ ...form, publishNow: e.target.checked })}
          className="size-4 accent-teal"
        />
        نشر الوحدة للعامة فورًا (يمكن التراجع)
      </label>

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-teal py-3 text-offwhite font-medium hover:bg-teal-deep disabled:opacity-50"
      >
        {loading ? ar.common.loading : ar.common.save}
      </button>
    </form>
  );
}
