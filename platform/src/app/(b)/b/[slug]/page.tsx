import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BookingPageClient from "@/components/booking/BookingPageClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

function decodeSlug(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeSlug((await params).slug);
  const supabase = await createClient();
  const { data: unit } = await supabase
    .from("public_units")
    .select("name, description")
    .eq("slug", slug)
    .single();
  if (!unit) return { title: "وحدة غير متاحة" };
  return {
    title: `${unit.name} — حجز مباشر`,
    description: unit.description ?? `احجز ${unit.name} مباشرة بدون وسيط`,
  };
}

export default async function PublicBookingPage({ params }: Props) {
  const slug = decodeSlug((await params).slug);
  const supabase = await createClient();

  const { data: unit } = await supabase
    .from("public_units")
    .select(
      "id, name, slug, capacity, bedrooms, bathrooms, base_price, weekend_price, min_nights, description, photos",
    )
    .eq("slug", slug)
    .single();
  if (!unit) notFound();

  return (
    <BookingPageClient
      unit={unit as never as {
        id: string; name: string; slug: string; capacity: number;
        bedrooms: number | null; bathrooms: number | null;
        base_price: number; weekend_price: number | null;
        min_nights: number; description: string | null;
      }}
    />
  );
}
