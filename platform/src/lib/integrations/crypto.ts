import "server-only";
import crypto from "node:crypto";

/**
 * تشفير بيانات الربط — AES-256-GCM بمفتاح من بيئة الخادم.
 * الصيغة المخزنة: iv(12) + ciphertext + tag(16)
 * لا تُعاد القيم للعميل أبدًا — فقط credentials_hint (آخر 4 أحرف).
 */

function getKey(): Buffer {
  const raw = process.env.INTEGRATIONS_ENCRYPTION_KEY;
  if (!raw || !/^[0-9a-f]{64}$/i.test(raw)) {
    throw new Error("INTEGRATIONS_ENCRYPTION_KEY مفقود أو غير صالح (64 حرفًا hex)");
  }
  return Buffer.from(raw, "hex");
}

export function encryptCredentials(plaintext: string): Buffer {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, enc, tag]);
}

export function decryptCredentials(payload: Buffer): string {
  if (payload.length < 29) throw new Error("حمولة مشفرة غير صالحة");
  const iv = payload.subarray(0, 12);
  const tag = payload.subarray(payload.length - 16);
  const data = payload.subarray(12, payload.length - 16);
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

/** تلميح آمن للعرض: آخر 4 أحرف فقط */
export function credentialHint(plaintext: string): string {
  return plaintext.length <= 4 ? "••••" : `••••${plaintext.slice(-4)}`;
}
