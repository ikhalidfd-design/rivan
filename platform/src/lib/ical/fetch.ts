import "server-only";
import { fetch as undiciFetch, Agent } from "undici";
import {
  IcalFetchError,
  ICAL_FETCH_TIMEOUT_MS,
  ICAL_MAX_BYTES,
  ICAL_MAX_REDIRECTS,
  resolvePublicHost,
  validateFeedUrl,
} from "./guard";

export interface FetchedFeed {
  body: string;
  etag: string | null;
}

/**
 * جلب تغذية iCal بحماية SSRF كاملة:
 *  - تحقق المخطط قبل الاتصال
 *  - حل DNS + رفض العناوين الخاصة (يمنع rebinding عبر dispatcher مخصص)
 *  - مهلة 10s، حجم ≤ 512KB، ≤ 3 قفزات توجيه (كل قفزة تُتحقق)
 */
export async function fetchIcalFeed(
  rawUrl: string,
  opts: { etag?: string | null } = {},
): Promise<FetchedFeed> {
  const allowHttp = process.env.NODE_ENV !== "production";
  const url = validateFeedUrl(rawUrl, allowHttp);

  let current: URL = url;
  for (let hop = 0; hop <= ICAL_MAX_REDIRECTS; hop++) {
    // تحقق SSRF لكل قفزة: حل DNS والتأكد أن العنوان عام
    const connectIp = await resolvePublicHost(current.hostname);

    // dispatcher يثبّت الاتصال على العنوان المُتحقق (يمنع DNS rebinding بين الفحص والاتصال)
    const dispatcher = new Agent({
      connect: {
        lookup: (_hostname: string, _options: unknown, callback: (err: Error | null, addresses: { address: string; family: 4 | 6 }[]) => void) => {
          callback(null, [{ address: connectIp, family: connectIp.includes(":") ? 6 : 4 }]);
        },
      },
    });

    let res: Awaited<ReturnType<typeof undiciFetch>>;
    try {
      res = await undiciFetch(current.toString(), {
        method: "GET",
        headers: {
          "user-agent": "RUWAQ-iCal-Sync/1.0",
          accept: "text/calendar, text/plain, */*",
          ...(opts.etag ? { "if-none-match": opts.etag } : {}),
        },
        signal: AbortSignal.timeout(ICAL_FETCH_TIMEOUT_MS),
        dispatcher,
        redirect: "manual",
      });
    } catch (e) {
      if (e instanceof Error && e.name === "TimeoutError")
        throw new IcalFetchError("انتهت مهلة الجلب", "TIMEOUT");
      throw new IcalFetchError("فشل الجلب", "FETCH_FAILED");
    }

    // لم تتغير (304) — بدون ETag جديد
    if (res.status === 304) {
      return { body: "", etag: opts.etag ?? null };
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) throw new IcalFetchError("إعادة توجيه بلا هدف", "FETCH_FAILED");
      const next = new URL(location, current);
      if (hop === ICAL_MAX_REDIRECTS)
        throw new IcalFetchError("قفزات توجيه كثيرة", "TOO_MANY_REDIRECTS");
      current = validateFeedUrl(next.toString(), allowHttp);
      continue;
    }

    if (!res.ok) throw new IcalFetchError(`استجابة ${res.status}`, "FETCH_FAILED");

    const length = Number(res.headers.get("content-length") ?? 0);
    if (length > ICAL_MAX_BYTES) throw new IcalFetchError("ملف كبير جدًا", "TOO_LARGE");

    const reader = res.body?.getReader();
    if (!reader) throw new IcalFetchError("جسم استجابة فارغ", "FETCH_FAILED");
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > ICAL_MAX_BYTES) {
        await reader.cancel();
        throw new IcalFetchError("ملف كبير جدًا", "TOO_LARGE");
      }
      chunks.push(value);
    }
    const body = Buffer.concat(chunks).toString("utf8");
    return { body, etag: res.headers.get("etag") };
  }

  throw new IcalFetchError("قفزات توجيه كثيرة", "TOO_MANY_REDIRECTS");
}
