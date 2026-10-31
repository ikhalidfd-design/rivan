"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ar } from "@/lib/i18n/ar";
import {
  STATUS_LABELS_AR,
  TRANSITIONS,
  type BookingStatus,
} from "@/lib/bookings/transitions";

export interface BookingRow {
  id: string;
  kind: "booking" | "block";
  status: BookingStatus;
  source: string;
  check_in: string;
  check_out: string;
  guests: number;
  guest_name: string | null;
  guest_phone: string | null;
  total_amount: number | null;
  expires_at: string | null;
  unit_name: string;
}

const SOURCE_AR: Record<string, string> = {
  manual: ar.bookings.source_manual,
  direct: ar.bookings.source_direct,
  ical: ar.bookings.source_ical,
  api: ar.bookings.source_api,
};

const ACTION_AR: Partial<Record<BookingStatus, string>> = {
  confirmed: ar.bookings.confirm,
  declined: ar.bookings.decline,
  cancelled: ar.bookings.cancelBooking,
  checked_in: ar.bookings.checkInAction,
  checked_out: ar.bookings.checkOutAction,
};

export default function BookingsTable({ bookings }: { bookings: BookingRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function transition(id: string, to: BookingStatus) {
    setBusy(id + to);
    setError(null);
    const res = await fetch(`/api/v1/bookings/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: to }),
    });
    setBusy(null);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error_ar ?? ar.common.error);
      return;
    }
    router.refresh();
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-offwhite p-10 text-center text-muted">
        لا حجوزات في هذا التصنيف.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {bookings.map((b) => (
        <div key={b.id} className="rounded-xl border border-line bg-offwhite p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-teal-deep">
                  {b.kind === "block" ? ar.bookings.block : b.guest_name ?? "—"}
                </span>
                <span className="rounded-full bg-mist px-2 py-0.5 text-xs text-muted">
                  {SOURCE_AR[b.source] ?? b.source}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    b.status === "pending"
                      ? "bg-st-pending text-gold-deep"
                      : b.status === "confirmed"
                        ? "bg-st-confirmed text-teal-deep"
                        : b.status === "checked_in"
                          ? "bg-teal text-offwhite"
                          : "bg-line text-muted"
                  }`}
                >
                  {STATUS_LABELS_AR[b.status]}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">
                {b.unit_name} · <span className="num">{b.check_in}</span> → <span className="num">{b.check_out}</span> ·{" "}
                <span className="num">{b.guests}</span> ضيوف
                {b.kind === "booking" && b.guest_phone && (
                  <>
                    {" · "}
                    <span className="num" dir="ltr">{b.guest_phone}</span>
                  </>
                )}
              </p>
              {b.status === "pending" && b.expires_at && (
                <p className="mt-1 text-xs text-gold-deep">
                  {ar.bookings.holdNote}: {new Date(b.expires_at).toLocaleString("ar-SA")}
                </p>
              )}
            </div>
            {b.kind === "booking" && (
              <div className="text-left">
                {b.total_amount != null && (
                  <p className="num text-lg font-semibold text-teal-deep">
                    {b.total_amount} <span className="text-xs font-normal text-muted">{ar.common.currency}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {b.kind === "booking" && TRANSITIONS[b.status].length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {TRANSITIONS[b.status]
                .filter((to) => ACTION_AR[to])
                .map((to) => (
                  <button
                    key={to}
                    onClick={() => transition(b.id, to)}
                    disabled={busy === b.id + to}
                    className={`rounded-lg px-3 py-1.5 text-xs transition disabled:opacity-50 ${
                      to === "cancelled" || to === "declined"
                        ? "border border-red-200 text-red-700 hover:bg-red-50"
                        : "bg-teal text-offwhite hover:bg-teal-deep"
                    }`}
                  >
                    {ACTION_AR[to]}
                  </button>
                ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
