"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ar } from "@/lib/i18n/ar";

export interface UnitRow {
  id: string;
  name: string;
  slug: string;
  is_published: boolean;
  capacity: number;
  base_price: number;
  city: string | null;
  property_name: string | null;
}

export default function UnitsList({
  initialUnits,
  canCreate,
}: {
  initialUnits: UnitRow[];
  canCreate: boolean;
}) {
  const [units, setUnits] = useState(initialUnits);

  async function togglePublish(unit: UnitRow) {
    const supabase = createClient();
    const next = !unit.is_published;
    const { error } = await supabase
      .from("units")
      .update({ is_published: next })
      .eq("id", unit.id);
    if (!error) {
      setUnits((us) => us.map((u) => (u.id === unit.id ? { ...u, is_published: next } : u)));
    }
  }

  if (units.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-offwhite p-10 text-center">
        <p className="text-muted">لا وحدات بعد — أضف وحدتك الأولى لتبدأ.</p>
        {canCreate && (
          <Link
            href="/app/units/new"
            className="mt-4 inline-block rounded-lg bg-teal px-5 py-2.5 text-sm text-offwhite hover:bg-teal-deep"
          >
            + {ar.units.addNew}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {units.map((u) => (
        <div key={u.id} className="rounded-xl border border-line bg-offwhite p-5">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/app/units/${u.id}`} className="link-underline font-semibold text-teal-deep">
              {u.name}
            </Link>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs ${
                u.is_published ? "bg-teal/10 text-teal" : "bg-line text-muted"
              }`}
            >
              {u.is_published ? ar.units.published : ar.units.unpublished}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">
            {[u.property_name, u.city].filter(Boolean).join(" · ") || "—"}
          </p>
          <p className="num mt-3 text-lg font-semibold text-teal-deep">
            {u.base_price} <span className="text-sm font-normal text-muted">{ar.common.currency} / {ar.common.night}</span>
          </p>
          <p className="mt-1 text-xs text-muted">
            السعة <span className="num">{u.capacity}</span>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => togglePublish(u)}
              className="rounded-lg border border-line px-3 py-1.5 text-xs transition hover:border-teal hover:text-teal"
            >
              {u.is_published ? ar.units.unpublish : ar.units.publish}
            </button>
            {u.is_published && (
              <Link
                href={`/b/${u.slug}`}
                target="_blank"
                className="rounded-lg border border-line px-3 py-1.5 text-xs transition hover:border-teal hover:text-teal"
              >
                {ar.units.publicPage} ↗
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
