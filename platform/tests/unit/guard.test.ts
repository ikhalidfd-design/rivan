import { describe, expect, it } from "vitest";
import { isPrivateIp, validateFeedUrl } from "@/lib/ical/guard";

describe("حماية SSRF — isPrivateIp", () => {
  it("عناوين خاصة IPv4 مرفوضة", () => {
    for (const ip of [
      "10.0.0.1",
      "10.255.255.255",
      "127.0.0.1",
      "0.0.0.0",
      "172.16.0.1",
      "172.31.255.255",
      "192.168.1.1",
      "169.254.169.254", // metadata cloud
      "100.64.0.1", // CGNAT
      "100.127.255.255",
    ]) {
      expect(isPrivateIp(ip), ip).toBe(true);
    }
  });

  it("عناوين عامة IPv4 مقبولة", () => {
    for (const ip of ["172.32.0.1", "172.15.0.1", "8.8.8.8", "100.128.0.1", "185.199.108.153"]) {
      expect(isPrivateIp(ip), ip).toBe(false);
    }
  });

  it("عناوين خاصة IPv6 مرفوضة", () => {
    for (const ip of ["::1", "::", "fe80::1", "fc00::1", "fd12::1", "::ffff:127.0.0.1", "::ffff:10.0.0.1", "64:ff9b::1"]) {
      expect(isPrivateIp(ip), ip).toBe(true);
    }
  });

  it("عنوان عام IPv6 مقبول، وليس IP → خطر", () => {
    expect(isPrivateIp("2606:4700::1111")).toBe(false);
    expect(isPrivateIp("example.com")).toBe(true);
  });
});

describe("حماية SSRF — validateFeedUrl", () => {
  it("HTTPS مقبول", () => {
    expect(validateFeedUrl("https://example.com/feed.ics").hostname).toBe("example.com");
  });

  it("HTTP مرفوض افتراضيًا ومسموح في التطوير فقط", () => {
    expect(() => validateFeedUrl("http://example.com/feed.ics")).toThrowError(/HTTPS/);
    expect(validateFeedUrl("http://localhost:3000/x.ics", true).protocol).toBe("http:");
  });

  it("المخططات الأخرى مرفوضة", () => {
    for (const u of ["file:///etc/passwd", "ftp://x/y.ics", "gopher://x"]) {
      expect(() => validateFeedUrl(u)).toThrowError();
    }
  });

  it("رابط مشوه مرفوض", () => {
    expect(() => validateFeedUrl("ليس رابطًا")).toThrowError();
  });
});
