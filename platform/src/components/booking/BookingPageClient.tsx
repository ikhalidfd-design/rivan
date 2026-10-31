"use client";

import { useMemo, useState } from "react";
import { ar } from "@/lib/i18n/ar";

interface UnitData {
  id: string;
  name: string;
  slug: string;
  capacity: number;
  bedrooms: number | null;
  bathrooms: number | null;
  base_price: number;
  weekend_price: number | null;
  min_nights: number;
  description: string | null;
}

function addDays(d: string, n: number): string {
  const dt = new Date(d + "T00:00:00");
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().slice(0, 10);
}

export default function BookingPageClient({ unit }: { unit: UnitData }) {
  const today = new Date().toISOString().slice(0, 10);
  const [checkIn, setCheckIn] = useState(addDays(today, 1));
  const [checkOut, setCheckOut] = useState(addDays(today, 3));
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [quote, setQuote] = useState<{ nights: number; nightly_total: number; cleaning_fee: number; total: number } | null>(null);
  const [result, setResult] = useState<{ expires_at: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const nights = useMemo(() => {
    const diff = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000;
    return Number.isFinite(diff) && diff > 0 ? diff : 0;
  }, [checkIn, checkOut]);

  async function getQuote() {
    setError(null);
    setQuote(null);
    if (nights < unit.min_nights) {
      setError(`أقل إقامة ${unit.min_nights} ${ar.common.nights}`);
      return;
    }
    setLoading(true);
    const res = await fetch("/api/v1/public/quote", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ unit_slug: unit.slug, check_in: checkIn, check_out: checkOut, guests }),
    });
    const data = await res.json().catch(() => null);
    setLoading(false);
    if (!res.ok) {
      setError(data?.error_ar ?? ar.common.error);
      return;
    }
    setQuote(data);
  }

  async function submit() {
    setError(null);
    setLoading(true);
    const res = await fetch("/api/v1/public/bookings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        unit_slug: unit.slug,
        check_in: checkIn,
        check_out: checkOut,
        guests,
        guest_name: name,
        guest_phone: phone,
        guest_email: email,
      }),
    });
    const data = await res.json().catch(() => null);
    setLoading(false);
    if (!res.ok) {
      setError(data?.error_ar ?? ar.common.error);
      return;
    }
    setResult({ expires_at: data.expires_at });
  }

  if (result) {
    return (
      <main className="min-h-dvh bg-mist grid place-items-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-line bg-offwhite p-8 text-center">
          <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-teal/10 text-2xl">✓</div>
          <h1 className="font-display text-xl font-semibold text-teal-deep">وصل طلبك للمالك</h1>
          <p className="mt-3 text-sm text-muted">
            حُجزت التواريخ مبدئيًا حتى{" "}
            <span className="num">{new Date(result.expires_at).toLocaleString("ar-SA")}</span>.{" "}
            سيتواصل معك المالك للتأكيد النهائي.
          </p>
          <p className="mt-2 text-xs text-muted">{ar.bookings.holdNote}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-offwhite">
      {/* ترويسة */}
      <header className="bg-teal-deep px-4 py-8 text-offwhite">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-gold">حجز مباشر من المالك — بدون وسيط</p>
          <h1 className="mt-2 font-display text-3xl font-semibold">{unit.name}</h1>
          <p className="mt-3 text-sm text-offwhite/80">
            <span className="num">{unit.capacity}</span> ضيوف
            {unit.bedrooms && <> · <span className="num">{unit.bedrooms}</span> غرف</>}
            {unit.bathrooms && <> · <span className="num">{unit.bathrooms}</span> دورات مياه</>}
            {" "}· أقل إقامة <span className="num">{unit.min_nights}</span> {ar.common.nights}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {unit.description && (
          <p className="mb-6 leading-relaxed text-muted">{unit.description}</p>
        )}

        <div className="rounded-2xl border border-line bg-offwhite p-6 shadow-sm">
          {/* التواريخ */}
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-muted">{ar.bookings.checkIn}</span>
              <input
                type="date"
                className="field num"
                dir="ltr"
                min={today}
                value={checkIn}
                onChange={(e) => {
                  setCheckIn(e.target.value);
                  setQuote(null);
                }}
              />
            </label>
            <label className="block">
              <span className="text-sm text-muted">{ar.bookings.checkOut}</span>
              <input
                type="date"
                className="field num"
                dir="ltr"
                min={addDays(checkIn, 1)}
                value={checkOut}
                onChange={(e) => {
                  setCheckOut(e.target.value);
                  setQuote(null);
                }}
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="text-sm text-muted">{ar.bookings.guests}</span>
            <select
              className="field"
              value={guests}
              onChange={(e) => {
                setGuests(Number(e.target.value));
                setQuote(null);
              }}
            >
              {Array.from({ length: unit.capacity }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={getQuote}
            disabled={loading || nights < 1}
            className="mt-5 w-full rounded-lg border border-teal py-2.5 text-teal transition hover:bg-teal hover:text-offwhite disabled:opacity-50"
          >
            احسب السعر
          </button>

          {/* عرض السعر */}
          {quote && (
            <div className="mt-5 space-y-2 rounded-xl bg-mist p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">
                  <span className="num">{quote.nights}</span> {ar.common.nights} × الأسعار
                </span>
                <span className="num">{quote.nightly_total} {ar.common.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">تنظيف</span>
                <span className="num">{quote.cleaning_fee} {ar.common.currency}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-2 font-bold text-teal-deep">
                <span>{ar.bookings.total}</span>
                <span className="num">{quote.total} {ar.common.currency}</span>
              </div>
            </div>
          )}

          {/* بيانات الضيف */}
          {quote && (
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm text-muted">{ar.auth.fullName}</span>
                <input className="field" value={name} onChange={(e) => setName(e.target.value)} minLength={2} />
              </label>
              <label className="block">
                <span className="text-sm text-muted">{ar.auth.phone}</span>
                <input className="field num" dir="ltr" inputMode="tel" placeholder="05xxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm text-muted">{ar.auth.email} (اختياري)</span>
                <input className="field num" dir="ltr" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>

              {error && (
                <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                onClick={submit}
                disabled={loading || name.trim().length < 2 || phone.trim().length < 9}
                className="w-full rounded-lg bg-gold py-3 font-semibold text-teal-deep transition hover:bg-gold-deep hover:text-offwhite disabled:opacity-50"
              >
                {loading ? ar.common.loading : "اطلب الحجز"}
              </button>
              <p className="text-center text-xs text-muted">
                طلب حجز مجاني — الدفع يتم لاحقًا بالتنسيق مع المالك
              </p>
            </div>
          )}

          {!quote && error && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          مدعوم بمنصة <span className="font-semibold text-teal">رواق</span> لإدارة وحدات الضيافة
        </p>
      </div>
    </main>
  );
}
