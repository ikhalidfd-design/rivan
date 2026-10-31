/**
 * حماية SSRF لاستيراد iCal — تُطبق قبل أي جلب لرابط خارجي.
 * القواعد (ADR: أمن الاستيراد):
 *  - HTTPS فقط (وHTTP يُرفض إلا في بيئة التطوير المحلية)
 *  - حل DNS والتحقق أن كل العناوين عامة (ليست loopback/خاصة/link-local)
 *  - منع إعادة الربين DNS: الحل والاتصال على نفس العنوان المُتحقق
 *  - حدود: مهلة 10 ثوانٍ، حجم استجابة ≤ 512KB، ≤ 3 قفزات إعادة توجيه (كل قفزة تُتحقق بنفس القواعد)
 */

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import net from "node:net";

export const ICAL_FETCH_TIMEOUT_MS = 10_000;
export const ICAL_MAX_BYTES = 512 * 1024;
export const ICAL_MAX_REDIRECTS = 3;

export class IcalFetchError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "NOT_HTTPS"
      | "PRIVATE_ADDRESS"
      | "DNS_FAILURE"
      | "TOO_LARGE"
      | "TIMEOUT"
      | "TOO_MANY_REDIRECTS"
      | "FETCH_FAILED",
  ) {
    super(message);
  }
}

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  const [a, b] = parts;
  if (a === 10 || a === 127 || a === 0) return true; // خاص/loopback/محجوز
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16/12
  if (a === 192 && b === 168) return true; // 192.168/16
  if (a === 169 && b === 254) return true; // link-local
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64/10
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1" || lower === "::") return true;
  if (lower.startsWith("fe80:") || lower.startsWith("fc") || lower.startsWith("fd")) return true; // link-local / ULA
  if (lower.startsWith("::ffff:")) return isPrivateIPv4(lower.slice(7)); // IPv4-mapped
  if (lower.startsWith("64:ff9b:")) return true; // NAT64 للعناوين الخاصة المحتملة
  return false;
}

export function isPrivateIp(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return isPrivateIPv4(ip);
  if (version === 6) return isPrivateIPv6(ip);
  return true; // ليس IP صالحًا → نتعامل معه كخطر
}

/** حل اسم المضيف والتأكد أن كل العناوين عامة. يعيد أول عنوان صالح للاتصال. */
export async function resolvePublicHost(hostname: string): Promise<string> {
  // إن كان المضيف نفسه IP
  if (isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new IcalFetchError("عنوان خاص مرفوض", "PRIVATE_ADDRESS");
    return hostname;
  }
  let records: { address: string }[];
  try {
    records = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new IcalFetchError("فشل حل اسم المضيف", "DNS_FAILURE");
  }
  if (records.length === 0) throw new IcalFetchError("لا سجلات DNS", "DNS_FAILURE");
  for (const r of records) {
    if (isPrivateIp(r.address)) {
      throw new IcalFetchError("اسم المضيف يحل إلى عنوان خاص", "PRIVATE_ADDRESS");
    }
  }
  return records[0].address; // verbatim: نفس الترتيب الذي سيتخدمه fetch تقريبًا
}

/** فحص رابط التغذية قبل تخزينه (شكل + مخطط) */
export function validateFeedUrl(rawUrl: string, allowHttp = false): URL {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new IcalFetchError("رابط غير صالح", "NOT_HTTPS");
  }
  if (url.protocol === "https:") return url;
  if (allowHttp && url.protocol === "http:") return url; // تطوير محلي فقط
  throw new IcalFetchError("مسموح HTTPS فقط", "NOT_HTTPS");
}

export function isLocalDevHost(url: URL): boolean {
  const h = url.hostname;
  return (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "[::1]" ||
    h.endsWith(".local") ||
    net.isIPv4(h) === true
  );
}
