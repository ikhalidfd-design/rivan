/**
 * تفسير تغذية iCal الواردة إلى أحداث محجوبة ضمن أفق محدود.
 */

export interface ParsedIcalEvent {
  uid: string;
  summary: string | null;
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD (حصري)
}

/** تحويل قيمة تاريخ من node-ical إلى YYYY-MM-DD (يوم كامل) */
function toDateOnly(v: unknown): string | null {
  if (v instanceof Date) {
    // node-ical يفسر VALUE=DATE كمنتصف الليل المحلي — نستخدم مكونات التاريخ المحلية
    // (toISOString كان يزيح اليوم للخلف على مضيف بتوقيت UTC+3)
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, "0");
    const d = String(v.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  return null;
}

/**
 * يفسر نص ICS ويعيد الأحداث المحجوبة فقط (TRANSP OPAQUE أو بدونها) ضمن الأفق.
 * @param horizonStart تاريخ البداية (YYYY-MM-DD) — عادةً اليوم - 1
 * @param horizonEnd نهاية الأفق — عادةً +180 يومًا
 */
export async function parseIcalToBlocks(
  icsText: string,
  horizonStart: string,
  horizonEnd: string,
): Promise<ParsedIcalEvent[]> {
  // node-ical يصدّر parseICS مباشرة (sync كائن لا دالة)
  const mod = (await import("node-ical")) as unknown as {
    default?: { parseICS?: (text: string) => Record<string, unknown> };
    parseICS?: (text: string) => Record<string, unknown>;
  };
  const parseICS = mod.parseICS ?? mod.default?.parseICS;
  if (!parseICS) throw new Error("node-ical parseICS غير متاح");

  const parsed = parseICS(icsText) as Record<string, Record<string, unknown>>;
  const events: ParsedIcalEvent[] = [];

  for (const key of Object.keys(parsed)) {
    const ev = parsed[key];
    if (ev.type !== "VEVENT") continue;
    const uid = typeof ev.uid === "string" ? ev.uid : key;
    if (!uid) continue;

    const start = toDateOnly(ev.start);
    if (!start) continue;
    // DTEND حصري؛ بعض المنصات ترسل نهاية = البداية (حدث يوم واحد بلا DTEND) → ليلة واحدة
    const end = toDateOnly(ev.end) ?? nextDay(start);
    if (end <= start) continue; // صفر ليالٍ — تجاهل
    if (end <= horizonStart || start >= horizonEnd) continue; // خارج الأفق

    events.push({
      uid,
      summary: typeof ev.summary === "string" ? ev.summary : null,
      start,
      end,
    });
  }

  return events;
}

function nextDay(d: string): string {
  const dt = new Date(d + "T00:00:00Z");
  dt.setUTCDate(dt.getUTCDate() + 1);
  return dt.toISOString().slice(0, 10);
}
