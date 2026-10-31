/**
 * Entitlements — تُطبق من الخادم فقط.
 * كل نقطة إنشاء (وحدة، تغذية iCal، webhook) تفحص الحدود هنا قبل الكتابة،
 * والواجهة تستخدم نفس الدوال للعرض فقط.
 */

export type PlanId = "trial" | "basic" | "pro";

export interface PlanLimits {
  maxUnits: number;
  maxIcalFeedsPerUnit: number;
  webhooks: boolean;
  api: boolean;
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  trial: { maxUnits: 2, maxIcalFeedsPerUnit: 2, webhooks: false, api: false },
  basic: { maxUnits: 10, maxIcalFeedsPerUnit: 3, webhooks: false, api: false },
  pro: { maxUnits: 100, maxIcalFeedsPerUnit: 10, webhooks: true, api: true },
};

/** الاشتراكات التي تمنح كامل الصلاحيات */
const ACTIVE_STATUSES = new Set(["trialing", "active", "past_due"]);

export interface SubscriptionLike {
  plan_id: PlanId | string;
  status: string;
  trial_ends_at: string | null;
}

export function effectiveLimits(sub: SubscriptionLike | null): PlanLimits {
  if (!sub || !ACTIVE_STATUSES.has(sub.status)) {
    // منتهي/ملغى: قراءة فقط — صفر إنشاء
    return { maxUnits: 0, maxIcalFeedsPerUnit: 0, webhooks: false, api: false };
  }
  const limits = PLAN_LIMITS[sub.plan_id as PlanId] ?? PLAN_LIMITS.trial;
  // انتهاء التجربة دون ترقية → قراءة فقط
  if (sub.status === "trialing" && sub.trial_ends_at && new Date(sub.trial_ends_at) < new Date()) {
    return { maxUnits: 0, maxIcalFeedsPerUnit: 0, webhooks: false, api: false };
  }
  return limits;
}

export function canCreateUnit(sub: SubscriptionLike | null, currentUnits: number): boolean {
  return currentUnits < effectiveLimits(sub).maxUnits;
}

export function canCreateFeed(sub: SubscriptionLike | null, currentFeedsForUnit: number): boolean {
  return currentFeedsForUnit < effectiveLimits(sub).maxIcalFeedsPerUnit;
}
