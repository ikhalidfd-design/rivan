/**
 * E2E: مسار الحجز المباشر العام
 * يتطلب: Supabase محلي + db reset (seed فيه وحدة yasmin-1 منشورة)
 * npx playwright test
 */
import { expect, test } from "@playwright/test";

test.describe("صفحة الحجز العام /b/[slug]", () => {
  test("وحدة منشورة: تسعيرة ثم طلب حجز ناجح", async ({ page }) => {
    await page.goto("/b/yasmin-1");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("شقة الياسمين 1");

    // التواريخ (حقول date بدون سمات name — عبر التسميات)
    await page.getByLabel("الوصول").fill("2027-06-01");
    await page.getByLabel("المغادرة").fill("2027-06-03");

    // حاسبة السعر
    await page.getByRole("button", { name: "احسب السعر" }).click();
    await expect(page.getByText("الإجمالي")).toBeVisible({ timeout: 10_000 });

    // بيانات الضيف ثم الطلب
    await page.getByLabel("الاسم الكامل", { exact: false }).fill("ضيف E2E");
    await page.getByPlaceholder("05xxxxxxxx").fill("0500000088");
    await page.getByRole("button", { name: "اطلب الحجز" }).click();

    await expect(page.getByText("وصل طلبك للمالك")).toBeVisible({ timeout: 15_000 });
  });

  test("وحدة غير منشورة → 404", async ({ page }) => {
    const res = await page.goto("/b/yasmin-2");
    expect(res?.status()).toBe(404);
  });
});
