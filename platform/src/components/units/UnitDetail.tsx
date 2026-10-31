"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ar } from "@/lib/i18n/ar";

interface UnitData {
  id: string;
  name: string;
  slug: string;
  ical_token: string;
  is_published: boolean;
  capacity: number;
  bedrooms: number | null;
  bathrooms: number | null;
  base_price: number;
  weekend_price: number | null;
  cleaning_fee: number;
  min_nights: number;
  description: string | null;
}

interface RateRow {
  id: string;
  d: { lower: string; upper: string } | unknown;
  price: number;
  min_nights: number | null;
  note: string | null;
}

interface FeedRow {
  id: string;
  name: string;
  url: string | null;
  direction: "import" | "export";
  enabled: boolean;
  last_synced_at: string | null;
  last_sync_ok_at: string | null;
  last_status: string | null;
  last_error: string | null;
}

export default function UnitDetail({
  unit,
  rates,
  feeds,
}: {
  unit: UnitData;
  rates: RateRow[];
  feeds: FeedRow[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: unit.name,
    capacity: unit.capacity,
    base_price: unit.base_price,
    weekend_price: unit.weekend_price ?? "",
    cleaning_fee: unit.cleaning_fee,
    min_nights: unit.min_nights,
    description: unit.description ?? "",
  });
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [icalUrl, setIcalUrl] = useState(unit.ical_token);
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [newFeedName, setNewFeedName] = useState("");
  const [feedError, setFeedError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  const exportUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/ical/${icalUrl}/ruwaq.ics`
      : `/api/ical/${icalUrl}/ruwaq.ics`;

  async function save() {
    setSaved(false);
    const supabase = createClient();
    const { error } = await supabase
      .from("units")
      .update({
        name: form.name,
        capacity: Number(form.capacity),
        base_price: Number(form.base_price),
        weekend_price: form.weekend_price === "" ? null : Number(form.weekend_price),
        cleaning_fee: Number(form.cleaning_fee),
        min_nights: Number(form.min_nights),
        description: form.description || null,
      })
      .eq("id", unit.id);
    if (!error) {
      setSaved(true);
      router.refresh();
    }
  }

  async function rotateToken() {
    const res = await fetch(`/api/v1/units/${unit.id}/rotate-ical-token`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setIcalUrl(data.ical_token);
      router.refresh();
    }
  }

  async function addFeed() {
    setFeedError(null);
    const res = await fetch("/api/v1/ical/feeds", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        unit_id: unit.id,
        name: newFeedName || "تغذية خارجية",
        url: newFeedUrl,
      }),
    });
    if (res.ok) {
      setNewFeedUrl("");
      setNewFeedName("");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setFeedError(data?.error_ar ?? ar.common.error);
    }
  }

  async function removeFeed(id: string) {
    const supabase = createClient();
    await supabase.from("ical_feeds").delete().eq("id", id);
    router.refresh();
  }

  async function syncFeed(id: string) {
    setSyncing(id);
    await fetch(`/api/v1/ical/feeds/${id}/sync`, { method: "POST" });
    setSyncing(null);
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ——— بيانات الوحدة والتسعير ——— */}
      <section className="space-y-4 rounded-xl border border-line bg-offwhite p-6">
        <h2 className="font-semibold text-teal-deep">البيانات والتسعير</h2>
        <label className="block">
          <span className="text-sm text-muted">{ar.units.name}</span>
          <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-muted">{ar.units.capacity}</span>
            <input className="field num" dir="ltr" type="number" min="1" value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
          </label>
          <label className="block">
            <span className="text-sm text-muted">{ar.units.minNights}</span>
            <input className="field num" dir="ltr" type="number" min="1" value={form.min_nights}
              onChange={(e) => setForm({ ...form, min_nights: Number(e.target.value) })} />
          </label>
          <label className="block">
            <span className="text-sm text-muted">{ar.units.basePrice}</span>
            <input className="field num" dir="ltr" type="number" min="0" value={form.base_price}
              onChange={(e) => setForm({ ...form, base_price: Number(e.target.value) })} />
          </label>
          <label className="block">
            <span className="text-sm text-muted">{ar.units.weekendPrice}</span>
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
          <span className="text-sm text-muted">وصف مختصر (يظهر في صفحة الحجز)</span>
          <textarea className="field min-h-24" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <div className="flex items-center gap-3">
          <button onClick={save} className="rounded-lg bg-teal px-5 py-2.5 text-sm text-offwhite hover:bg-teal-deep">
            {ar.common.save}
          </button>
          {saved && <span className="text-sm text-teal">{ar.common.saved}</span>}
        </div>

        {unit.is_published && (
          <div className="rounded-lg bg-mist p-4 text-sm">
            <p className="text-muted">{ar.units.publicPage}:</p>
            <a href={`/b/${unit.slug}`} target="_blank" className="num mt-1 block text-teal underline" dir="ltr">
              /b/{unit.slug} ↗
            </a>
          </div>
        )}
      </section>

      {/* ——— iCal ——— */}
      <section className="space-y-4 rounded-xl border border-line bg-offwhite p-6">
        <h2 className="font-semibold text-teal-deep">iCal — {ar.integrations.availabilityOnly}</h2>

        <div className="rounded-lg bg-mist p-4">
          <p className="text-sm text-muted">{ar.units.icalExport}</p>
          <div className="mt-2 flex gap-2">
            <input className="field num flex-1" dir="ltr" readOnly value={exportUrl} onFocus={(e) => e.target.select()} />
            <button
              onClick={() => {
                navigator.clipboard.writeText(exportUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="whitespace-nowrap rounded-lg border border-teal px-3 py-2 text-sm text-teal hover:bg-teal hover:text-offwhite"
            >
              {copied ? ar.units.copied : ar.units.copyLink}
            </button>
          </div>
          <button onClick={rotateToken} className="mt-2 text-xs text-muted underline hover:text-red-700">
            {ar.units.rotateToken}
          </button>
          <p className="mt-2 text-xs text-muted">
            الصقه في Airbnb / Booking.com / جاذرن لمنع الحجز المزدوج — يزامن التوافر فقط.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-teal-deep">تغذيات الاستيراد</p>
          {feeds.filter((f) => f.direction === "import").map((f) => (
            <div key={f.id} className="rounded-lg border border-line p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{f.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    f.last_status === "ok"
                      ? "bg-teal/10 text-teal"
                      : f.last_status === "conflict"
                        ? "bg-gold/20 text-gold-deep"
                        : f.last_status === "error"
                          ? "bg-red-100 text-red-700"
                          : "bg-line text-muted"
                  }`}
                >
                  {f.last_status ?? "بانتظار أول مزامنة"}
                </span>
              </div>
              <p className="num mt-1 truncate text-xs text-muted" dir="ltr">{f.url}</p>
              {f.last_sync_ok_at && (
                <p className="mt-1 text-xs text-muted">
                  {ar.integrations.lastSyncOk}:{" "}
                  {new Date(f.last_sync_ok_at).toLocaleString("ar-SA")}
                </p>
              )}
              {f.last_error && <p className="mt-1 text-xs text-red-700">{f.last_error}</p>}
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => syncFeed(f.id)}
                  disabled={syncing === f.id}
                  className="rounded-lg border border-line px-3 py-1 text-xs hover:border-teal hover:text-teal disabled:opacity-50"
                >
                  {syncing === f.id ? ar.common.loading : ar.integrations.syncNow}
                </button>
                <button
                  onClick={() => removeFeed(f.id)}
                  className="rounded-lg border border-line px-3 py-1 text-xs text-red-700 hover:border-red-300"
                >
                  {ar.common.delete}
                </button>
              </div>
            </div>
          ))}

          <div className="rounded-lg border border-dashed border-line p-3">
            <input
              className="field"
              placeholder="اسم التغذية (مثال: Airbnb)"
              value={newFeedName}
              onChange={(e) => setNewFeedName(e.target.value)}
            />
            <input
              className="field num mt-2"
              dir="ltr"
              type="url"
              placeholder="https://…/calendar.ics"
              value={newFeedUrl}
              onChange={(e) => setNewFeedUrl(e.target.value)}
            />
            {feedError && <p className="mt-2 text-xs text-red-700">{feedError}</p>}
            <button
              onClick={addFeed}
              disabled={!newFeedUrl.startsWith("https://")}
              className="mt-3 rounded-lg bg-teal px-4 py-2 text-xs text-offwhite hover:bg-teal-deep disabled:opacity-50"
            >
              {ar.common.add}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
