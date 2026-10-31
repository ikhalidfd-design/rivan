import "server-only";
import crypto from "node:crypto";

/**
 * تحقق توقيع Webhook وارد: HMAC-SHA256 بمقارنة زمنية ثابتة.
 * الترويسة: x-ruwaq-signature: sha256=<hex>
 */
export function verifyHmacSignature(
  rawBody: string,
  header: string | null,
  secret: string,
): boolean {
  if (!header?.startsWith("sha256=")) return false;
  const provided = header.slice(7);
  if (!/^[0-9a-f]{64}$/i.test(provided)) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(provided, "hex"));
}
