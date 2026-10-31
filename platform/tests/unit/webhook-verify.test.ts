import { describe, expect, it } from "vitest";
import crypto from "node:crypto";
import { verifyHmacSignature } from "@/lib/webhooks/verify";

const secret = "whsec_test_123";
const body = JSON.stringify({ event: "payment.succeeded", id: "pay_1" });

function sign(payload: string, key: string): string {
  return "sha256=" + crypto.createHmac("sha256", key).update(payload, "utf8").digest("hex");
}

describe("تحقق توقيع Webhook (HMAC)", () => {
  it("توقيع صحيح → قبول", () => {
    expect(verifyHmacSignature(body, sign(body, secret), secret)).toBe(true);
  });

  it("سر مختلف / جسم معدل → رفض", () => {
    expect(verifyHmacSignature(body, sign(body, "wrong"), secret)).toBe(false);
    expect(verifyHmacSignature(body + "x", sign(body, secret), secret)).toBe(false);
  });

  it("بلا ترويسة أو بصيغة خاطئة → رفض", () => {
    expect(verifyHmacSignature(body, null, secret)).toBe(false);
    expect(verifyHmacSignature(body, "md5=abc", secret)).toBe(false);
    expect(verifyHmacSignature(body, "sha256=zzzz", secret)).toBe(false);
  });

  it("hex غير صالح (64) → رفض دون استثناء", () => {
    const short = "sha256=" + "a".repeat(32);
    expect(verifyHmacSignature(body, short, secret)).toBe(false);
  });
});
