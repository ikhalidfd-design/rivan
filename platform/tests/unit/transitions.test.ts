import { describe, expect, it } from "vitest";
import { BLOCKING_STATUSES, TRANSITIONS, canTransition } from "@/lib/bookings/transitions";

describe("آلة حالات الحجز", () => {
  it("pending → confirmed/cancelled/declined/expired مسموح", () => {
    expect(canTransition("pending", "confirmed")).toBe(true);
    expect(canTransition("pending", "cancelled")).toBe(true);
    expect(canTransition("pending", "declined")).toBe(true);
    expect(canTransition("pending", "expired")).toBe(true);
  });

  it("pending → checked_in مرفوض (يجب التأكيد أولًا)", () => {
    expect(canTransition("pending", "checked_in")).toBe(false);
  });

  it("المسار الكامل pending→confirmed→checked_in→checked_out", () => {
    expect(canTransition("confirmed", "checked_in")).toBe(true);
    expect(canTransition("checked_in", "checked_out")).toBe(true);
    expect(canTransition("checked_out", "confirmed")).toBe(false);
  });

  it("الحالات النهائية لا تنتقل لأي حالة", () => {
    for (const terminal of ["checked_out", "cancelled", "expired", "declined"] as const) {
      expect(TRANSITIONS[terminal]).toHaveLength(0);
    }
  });

  it("confirmed → cancelled مسموح، cancelled → confirmed مرفوض", () => {
    expect(canTransition("confirmed", "cancelled")).toBe(true);
    expect(canTransition("cancelled", "confirmed")).toBe(false);
  });

  it("الحالات الحاجبة للتواريخ هي pending/confirmed/checked_in فقط", () => {
    expect([...BLOCKING_STATUSES].sort()).toEqual(["checked_in", "confirmed", "pending"]);
  });
});
