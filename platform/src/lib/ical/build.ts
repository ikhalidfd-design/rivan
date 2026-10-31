import "server-only";
import ical, { ICalEventStatus, ICalEventTransparency } from "ical-generator";

export interface ExportBooking {
  id: string;
  check_in: string; // YYYY-MM-DD
  check_out: string;
  kind: "booking" | "block";
  status: string;
}

/**
 * بناء ملف iCal لتصدير توافر وحدة — لكل حجز حاجز VEVENT.
 * الليالي [check_in, check_out) — DTEND حصري وفق المواصفة.
 */
export function buildUnitIcal(unitSlug: string, bookings: ExportBooking[]): string {
  const cal = ical({ name: `RUWAQ ${unitSlug}`, prodId: "//RUWAQ//iCal Availability//AR" });

  for (const b of bookings) {
    cal.createEvent({
      id: `ruwaq-${b.id}`,
      start: b.check_in,
      end: b.check_out,
      allDay: true,
      summary: b.kind === "block" ? "محجوز" : "محجوز — RUWAQ",
      transparency: ICalEventTransparency.OPAQUE,
      status: ICalEventStatus.CONFIRMED,
    });
  }

  return cal.toString();
}
