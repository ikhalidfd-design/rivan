/**
 * مصفوفة الصلاحيات — المصدر الموحد للواجهة (ومتقاطعة مع سياسات RLS في قاعدة البيانات).
 * القاعدة: الواجهة تعرض وتخفي؛ القرار الأمني النهائي دائمًا في RLS/RPC.
 */

export type OrgRole =
  | "org_owner"
  | "org_admin"
  | "manager"
  | "staff"
  | "property_owner";

export const PERMISSIONS = [
  "units:read",
  "units:write",
  "rates:read",
  "rates:write",
  "bookings:read",
  "bookings:write", // إنشاء/تعديل/إلغاء
  "bookings:transition", // وصول/مغادرة
  "ical:read",
  "ical:write",
  "team:read",
  "team:write",
  "integrations:read",
  "integrations:write",
  "audit:read",
  "billing:read",
  "billing:write",
  "org:delete",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const MATRIX: Record<OrgRole, readonly Permission[]> = {
  org_owner: PERMISSIONS, // كل شيء
  org_admin: PERMISSIONS.filter((p) => p !== "org:delete" && p !== "billing:write"),
  manager: [
    "units:read",
    "units:write",
    "rates:read",
    "rates:write",
    "bookings:read",
    "bookings:write",
    "bookings:transition",
    "ical:read",
    "ical:write",
    "team:read",
    "integrations:read",
    "integrations:write",
  ],
  staff: [
    "units:read",
    "bookings:read",
    "bookings:transition",
    "ical:read",
    "team:read",
  ],
  property_owner: ["units:read", "bookings:read", "rates:read"], // read-only — يُفعّل P1
};

export function can(role: OrgRole, permission: Permission): boolean {
  return MATRIX[role]?.includes(permission) ?? false;
}

/** رتب أعلى من رتبة معينة — لفرز الواجهة فقط */
export const ROLE_RANK: Record<OrgRole, number> = {
  org_owner: 4,
  org_admin: 3,
  manager: 2,
  staff: 1,
  property_owner: 0,
};

export const ROLE_LABELS_AR: Record<OrgRole, string> = {
  org_owner: "مالك الحساب",
  org_admin: "مدير",
  manager: "مشغل",
  staff: "موظف",
  property_owner: "مالك وحدة",
};
