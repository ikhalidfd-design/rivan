"use client";

import Link from "next/link";

interface UnitLite {
  id: string;
  name: string;
}

interface BookingLite {
  id: string;
  unit_id: string;
  kind: "booking" | "block";
  status: "pending" | "confirmed" | "checked_in";
  source: string;
  check_in: string;
  check_out: string;
  guest_name: string | null;
}

const WEEKDAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const MONTHS_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

function cellColor(b: BookingLite): string {
  if (b.kind === "block") return "bg-st-external"; // حجز خارجي iCal
  switch (b.status) {
    case "pending": return "bg-st-pending";
    case "confirmed": return "bg-st-confirmed";
    case "checked_in": return "bg-teal";
    default: return "bg-st-free";
  }
}

export default function UnifiedCalendar({
  year,
  month,
  units,
  bookings,
}: {
  year: number;
  month: number; // 1-12
  units: UnitLite[];
  bookings: BookingLite[];
}) {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const startWeekday = first.getUTCDay(); // 0=الأحد
  const todayStr = new Date().toISOString().slice(0, 10);

  const dayKeys = Array.from({ length: daysInMonth }, (_, i) =>
    new Date(Date.UTC(year, month - 1, i + 1)).toISOString().slice(0, 10),
  );

  const prevMonth = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
  const nextMonth = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };

  function bookingForDay(unitId: string, day: string): BookingLite | null {
    // [check_in, check_out) — اليوم الأخير حر
    return (
      bookings.find(
        (b) =>
          b.unit_id === unitId &&
          b.check_in <= day &&
          day < b.check_out,
      ) ?? null
    );
  }

  return (
    <div className="space-y-4">
      {/* التنقل بين الأشهر */}
      <div className="flex items-center justify-between">
        <Link
          href={`/app/calendar?m=${prevMonth.y}-${String(prevMonth.m).padStart(2, "0")}`}
          className="rounded-lg border border-line px-3 py-1.5 text-sm hover:border-teal"
        >
          → الشهر السابق
        </Link>
        <p className="font-display text-lg font-semibold text-teal-deep">
          {MONTHS_AR[month - 1]} <span className="num">{year}</span>
        </p>
        <Link
          href={`/app/calendar?m=${nextMonth.y}-${String(nextMonth.m).padStart(2, "0")}`}
          className="rounded-lg border border-line px-3 py-1.5 text-sm hover:border-teal"
        >
          الشهر التالي ←
        </Link>
      </div>

      {/* مفتاح الألوان */}
      <div className="flex flex-wrap gap-3 text-xs text-muted">
        <span className="flex items-center gap-1"><i className="inline-block size-3 rounded bg-st-free" /> متاح</span>
        <span className="flex items-center gap-1"><i className="inline-block size-3 rounded bg-st-pending" /> بانتظار التأكيد</span>
        <span className="flex items-center gap-1"><i className="inline-block size-3 rounded bg-st-confirmed" /> مؤكد</span>
        <span className="flex items-center gap-1"><i className="inline-block size-3 rounded bg-teal" /> ضيف داخلي</span>
        <span className="flex items-center gap-1"><i className="inline-block size-3 rounded bg-st-external" /> حجز خارجي (iCal)</span>
      </div>

      {/* الشبكة: صف لكل وحدة — RTL */}
      <div className="overflow-x-auto rounded-xl border border-line bg-offwhite">
        <div className="min-w-[720px]">
          {/* رأس الأيام */}
          <div
            className="grid border-b border-line bg-mist text-xs"
            style={{ gridTemplateColumns: "10rem repeat(7, 1fr)" }}
          >
            <div className="p-2 font-medium text-muted">الوحدة</div>
            {WEEKDAYS_AR.map((d) => (
              <div key={d} className="p-2 text-center font-medium text-muted">{d}</div>
            ))}
          </div>

          {/* صفوف الوحدات: أسابيع الشهر */}
          {units.map((u) => {
            const weeks = Math.ceil((startWeekday + daysInMonth) / 7);
            return (
              <div key={u.id} className="border-b border-line last:border-0">
                {/* اسم الوحدة فوق صفوفها */}
                <div
                  className="grid border-b border-line/60"
                  style={{ gridTemplateColumns: "10rem 1fr" }}
                >
                  <div className="p-2 text-sm font-semibold text-teal-deep">{u.name}</div>
                  <div />
                </div>
                {Array.from({ length: weeks }, (_, w) => (
                  <div
                    key={w}
                    className="grid border-b border-line/40 last:border-0"
                    style={{ gridTemplateColumns: "10rem repeat(7, 1fr)" }}
                  >
                    <div /> {/* خلية اسم الوحدة */}
                    {Array.from({ length: 7 }, (_, d) => {
                      const dayIndex = w * 7 + d - startWeekday;
                      if (dayIndex < 0 || dayIndex >= daysInMonth)
                        return <div key={d} className="h-8 border-s border-line/30" />;
                      const day = dayKeys[dayIndex];
                      const b = bookingForDay(u.id, day);
                      const isToday = day === todayStr;
                      return (
                        <div
                          key={d}
                          title={
                            b
                              ? `${b.kind === "block" ? "حجز خارجي" : b.guest_name ?? ""} (${b.check_in} → ${b.check_out})`
                              : "متاح"
                          }
                          className={`h-8 border-s border-line/30 text-center text-[10px] leading-8 ${
                            b ? cellColor(b) : "bg-st-free"
                          } ${isToday ? "ring-2 ring-inset ring-gold" : ""}`}
                        >
                          <span className="num text-muted">{dayIndex + 1}</span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
