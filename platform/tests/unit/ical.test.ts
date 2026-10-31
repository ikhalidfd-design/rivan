import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseIcalToBlocks } from "@/lib/ical/parse";
import { buildUnitIcal } from "@/lib/ical/build";

const fixtures = path.resolve(__dirname, "..", "fixtures");
const HORIZON_START = "2026-01-01";
const HORIZON_END = "2026-12-31";

describe("تفسير iCal الوارد", () => {
  it("تفسير تغذية Airbnb: VEVENT واحد بتواريخ صحيحة (DTEND حصري)", async () => {
    const ics = await readFile(path.join(fixtures, "airbnb.ics"), "utf8");
    const events = await parseIcalToBlocks(ics, HORIZON_START, HORIZON_END);
    expect(events).toHaveLength(2);
    const e = events.find((x) => x.uid === "abcdefgh1234@airbnb.com");
    expect(e).toBeDefined();
    expect(e!.start).toBe("2026-02-10");
    expect(e!.end).toBe("2026-02-15");
  });

  it("حدث بصفر ليالٍ (بداية=نهاية) يُتجاهل", async () => {
    const ics = await readFile(path.join(fixtures, "booking.ics"), "utf8");
    const events = await parseIcalToBlocks(ics, HORIZON_START, HORIZON_END);
    expect(events.map((e) => e.uid)).toEqual(["booking-res-777@booking.com"]);
  });

  it("حدث بلا DTEND → ليلة واحدة (نهاية = البداية + 1)", async () => {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//X//EN
BEGIN:VEVENT
UID:no-end@x
DTSTART;VALUE=DATE:20260501
SUMMARY:Blocked
END:VEVENT
END:VCALENDAR`;
    const events = await parseIcalToBlocks(ics, HORIZON_START, HORIZON_END);
    expect(events).toHaveLength(1);
    expect(events[0].start).toBe("2026-05-01");
    expect(events[0].end).toBe("2026-05-02");
  });

  it("خارج الأفق يُتجاهل", async () => {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//X//EN
BEGIN:VEVENT
UID:past@x
DTSTART;VALUE=DATE:20250101
DTEND;VALUE=DATE:20250110
SUMMARY:Old
END:VEVENT
END:VCALENDAR`;
    const events = await parseIcalToBlocks(ics, HORIZON_START, HORIZON_END);
    expect(events).toHaveLength(0);
  });
});

describe("بناء iCal للتصدير", () => {
  it("يولّد VEVENT بتواريخ يوم كامل وDTEND حصري", () => {
    const out = buildUnitIcal("jasmin-3", [
      { id: "b1", check_in: "2026-02-10", check_out: "2026-02-15", kind: "booking", status: "confirmed" },
      { id: "b2", check_in: "2026-03-01", check_out: "2026-03-05", kind: "block", status: "confirmed" },
    ]);
    expect(out).toContain("BEGIN:VCALENDAR");
    expect(out).toContain("DTSTART;VALUE=DATE:20260210");
    expect(out).toContain("DTEND;VALUE=DATE:20260215");
    expect(out).toContain("DTSTART;VALUE=DATE:20260301");
    expect(out.match(/BEGIN:VEVENT/g)?.length).toBe(2);
  });
});
