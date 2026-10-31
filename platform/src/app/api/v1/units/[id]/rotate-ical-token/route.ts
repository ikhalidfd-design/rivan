import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { unauthorized } from "@/lib/api/respond";

/** تدوير توكن تصدير iCal — يبطل كل الروابط القديمة فورًا */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const newToken = crypto.randomBytes(32).toString("hex");
  const { error } = await supabase
    .from("units")
    .update({ ical_token: newToken, updated_at: new Date().toISOString() })
    .eq("id", id); // RLS: manager+ فقط ولنفس المنظمة

  if (error) {
    return NextResponse.json({ error: "UPDATE_FAILED", error_ar: "فشل التحديث" }, { status: 403 });
  }
  return NextResponse.json({ ical_token: newToken });
}
