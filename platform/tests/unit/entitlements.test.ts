import { describe, expect, it } from "vitest";
import { canCreateFeed, canCreateUnit, effectiveLimits } from "@/lib/billing/entitlements";

const sub = (plan_id: string, status: string, trial_ends_at: string | null = null) => ({
  plan_id,
  status,
  trial_ends_at,
});

describe("Entitlements (تُطبق من الخادم)", () => {
  it("حدود الباقات", () => {
    expect(effectiveLimits(sub("trial", "trialing")).maxUnits).toBe(2);
    expect(effectiveLimits(sub("basic", "active")).maxUnits).toBe(10);
    expect(effectiveLimits(sub("pro", "active")).maxUnits).toBe(100);
  });

  it("خطة غير معروفة → حد التجربة", () => {
    expect(effectiveLimits(sub("enterprise", "active")).maxUnits).toBe(2);
  });

  it("اشتراك ملغى/منتهي → قراءة فقط (صفر إنشاء)", () => {
    for (const status of ["canceled", "expired", "past_due grace end", "unpaid"]) {
      if (status === "past_due grace end") continue;
      expect(effectiveLimits(sub("pro", status)).maxUnits).toBe(0);
    }
  });

  it("past_due يبقى ضمن الحدود (سماحية سداد)", () => {
    expect(effectiveLimits(sub("pro", "past_due")).maxUnits).toBe(100);
  });

  it("تجربة انتهت مدتها → قراءة فقط", () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    expect(effectiveLimits(sub("trial", "trialing", past)).maxUnits).toBe(0);
  });

  it("تجربة سارية → حدود التجربة", () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    expect(effectiveLimits(sub("trial", "trialing", future)).maxUnits).toBe(2);
  });

  it("canCreateUnit عند الحد الأقصى", () => {
    const s = sub("trial", "trialing", new Date(Date.now() + 86400000).toISOString());
    expect(canCreateUnit(s, 1)).toBe(true);
    expect(canCreateUnit(s, 2)).toBe(false);
    expect(canCreateUnit(s, 5)).toBe(false);
  });

  it("canCreateFeed وفق حد التغذيات لكل وحدة", () => {
    const s = sub("pro", "active");
    expect(canCreateFeed(s, 9)).toBe(true);
    expect(canCreateFeed(s, 10)).toBe(false);
  });

  it("لا اشتراك إطلاقًا → صفر", () => {
    expect(effectiveLimits(null).maxUnits).toBe(0);
  });
});
