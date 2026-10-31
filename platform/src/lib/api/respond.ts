import { NextResponse } from "next/server";

/** أخطاء Postgres المعروفة → استجابات عربية موحدة */
export function pgErrorToResponse(err: { code?: string; message?: string }): NextResponse | null {
  switch (err.code) {
    case "23P01": // exclusion_violation
      return NextResponse.json(
        { error: "DATES_UNAVAILABLE", error_ar: "التواريخ محجوزة، اختر تواريخ أخرى" },
        { status: 409 },
      );
    case "23505":
      return NextResponse.json(
        { error: "DUPLICATE", error_ar: "القيمة مستخدمة مسبقًا" },
        { status: 409 },
      );
    case "23503":
      return NextResponse.json(
        { error: "FK_VIOLATION", error_ar: "مرجع غير صالح" },
        { status: 400 },
      );
    case "42501":
      return NextResponse.json(
        { error: "RLS_DENIED", error_ar: "غير مصرح لهذا الإجراء" },
        { status: 403 },
      );
    default:
      if (err.message?.includes("INVALID_DATES"))
        return NextResponse.json({ error: "INVALID_DATES", error_ar: "تواريخ غير صالحة" }, { status: 422 });
      if (err.message?.includes("UNIT_NOT_FOUND"))
        return NextResponse.json({ error: "UNIT_NOT_FOUND", error_ar: "الوحدة غير موجودة" }, { status: 404 });
      return null;
  }
}

export function unauthorized() {
  return NextResponse.json({ error: "UNAUTHORIZED", error_ar: "غير مصرح" }, { status: 401 });
}

export function badRequest(error_ar: string) {
  return NextResponse.json({ error: "BAD_REQUEST", error_ar }, { status: 400 });
}
