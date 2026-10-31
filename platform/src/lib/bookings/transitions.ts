/**
 * آلة حالات الحجز — المصدر الموحد للواجهة وAPI.
 * قرار القبول النهائي أيضًا في RLS/RPC، لكن أي انتقال خارج هذه الخريطة يرفض بـ422.
 */

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "expired"
  | "declined";

export const TRANSITIONS: Record<BookingStatus, readonly BookingStatus[]> = {
  pending: ["confirmed", "cancelled", "declined", "expired"],
  confirmed: ["checked_in", "cancelled"],
  checked_in: ["checked_out"],
  checked_out: [],
  cancelled: [],
  expired: [],
  declined: [],
};

/** الحالات التي تحجب التواريخ (بالإضافة إلى kind='block' دائمًا) */
export const BLOCKING_STATUSES: readonly BookingStatus[] = [
  "pending",
  "confirmed",
  "checked_in",
];

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export const STATUS_LABELS_AR: Record<BookingStatus, string> = {
  pending: "بانتظار التأكيد",
  confirmed: "مؤكد",
  checked_in: "ضيف داخلي",
  checked_out: "مغادر",
  cancelled: "ملغي",
  expired: "منتهي",
  declined: "مرفوض",
};
