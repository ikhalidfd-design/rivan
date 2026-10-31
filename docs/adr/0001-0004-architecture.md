# ADR 0001 — فصل المنصة كمشروع Vercel مستقل في platform/

**الحالة:** معتمد · **التاريخ:** 2026-10-31

## السياق
الموقع التسويقي (Vite SPA) منشور على Vercel كمشروع `rivan` (ruwaq.vercel.app). المنصة SaaS تتطلب Next.js 15 + Supabase.

## القرار
تبقى شجرة الموقع التسويقي في جذر المستودع دون تعديل. تُبنى المنصة في `platform/` كمشروع npm مستقل يُنشر كمشروع Vercel منفصل (`rivan-platform`, Root Directory = `platform/`).

## المبررات
- صفر مخاطر على الإنتاج الحالي: بناء/هيدرز/روابط الموقع لا تتأثر بأي نشر للمنصة.
- استرجاع مستقل: Vercel instant rollback لكل مشروع على حدة.
- متغيرات بيئة الخدمة (service-role, CRON_SECRET) لا تلمس مشروع الموقع أبدًا.
- توكنات الهوية تُنسخ (وليس تُستورد) — ~20 سطر في `@theme`، أرخص من workspace package يغيّر بنية جذر المستودع.

## العواقب
- بقاء مسار للدمج مستقبلًا: صفحات تسويقية داخل Next.js مع 301s (P2) دون أي عائق.
- التعديل الوحيد المسموح على الموقع: رابط "دخول المنصة" في Navbar (آخر P0، بموافقة).

---

# ADR 0002 — منع الحجز المزدوج بقيد Postgres EXCLUDE

**الحالة:** معتمد · **التاريخ:** 2026-10-31

## القرار
جدول `bookings` موحّد للحجوزات الداخلية والكتل الخارجية (iCal)، مع:

```sql
exclude using gist (unit_id with =, stay with &&)
where (kind = 'block' or status in ('pending','confirmed','checked_in'))
```

`stay` عمود daterange متولد `[check_in, check_out)`.

## المبررات
- التطبيق على مستوى DB محصّن ضد السباقات من أي كاتب (لوحة، صفحة عامة، مزامنة iCal، API مستقبلي).
- جدول واحد = قيد واحد يغطي كل المصادر؛ كاش `ical_events` منفصل للـdiff فقط.
- الليالي `[in,out)` — صباح المغادرة متاح لوصول نفس اليوم (عرف الضيافة).
- الخطأ `23P01` يُحوَّل إلى 409 برسالة عربية موحدة.

## البدائل المرفوضة
- أقفال تطبيقية: تفشل عبر PostgREST/anon RPC متعددي الكتّاب.
- SELECT-then-INSERT: نافذة سباق.

## ملاحظات
- يتطلب `btree_gist`. التحقق من صحة العمود المتولد `daterange(date,date,text)` على نسخة Supabase Postgres أثناء migration 0001؛ البديل: عمود عادي يُدار بـ trigger.

---

# ADR 0003 — قائمة مهام Postgres + عامل HTTP (بلا Redis)

**الحالة:** معتمد · **التاريخ:** 2026-10-31

## القرار
جدول `jobs` في Postgres + عامل `/api/cron/worker` (Node runtime) يطلب صفوفًا بـ `FOR UPDATE SKIP LOCKED`، محمي بـ Bearer CRON_SECRET. الجدولة عبر Vercel Cron (كل 5 دقائق) أو pg_cron+pg_net على Supabase عند خطة Hobby.

## الموثوقية (متطلب صارم)
- **Idempotency:** كل job يحمل `idempotency_key` فريد؛ المعالجات مصممة لتكون آمنة لإعادة التشغيل (diff بـ UID للمزامنة، فحص الحالة قبل التغيير).
- **Retries:** أسّ 2^n (30s, 60s, 2m, ...) حتى `max_attempts`.
- **Dead-letter:** بعد استنفاد المحاولات → `status='dead'` + صف في `job_failures` للمراجعة، ولا يُعاد جدولته أبدًا تلقائيًا.
- **Monitoring:** عدادات pending/running/dead في Super Admin + إعادة تسليح `running` العالقة (>5 دقائق) تلقائيًا.
- **حدود الاستضافة:** موثقة في `docs/ops-limits.md` — لا اعتماد أي جدولة قبل التحقق من حدود الخطة.

## البدائل المرفوضة
- pg-boss: يحتاج اتصالًا مباشرًا/session mode — عبء تشغيل إضافي.
- Edge Functions لكل شيء: لا تدعم node-ical وبناء اختبارات أصعب.

---

# ADR 0004 — Integration Engine مستقلة وiCal كتوافر فقط

**الحالة:** معتمد · **التاريخ:** 2026-10-31

## القرار
طبقة تكامل مستقلة (`lib/integrations/`) بواجهة Adapter موحدة:

```ts
interface ChannelAdapter {
  capabilities(): { availability: boolean; rates: boolean; bookings: boolean; twoWay: boolean };
  syncAvailability(ctx): Promise<SyncResult>;
  syncRates?(ctx): Promise<SyncResult>;
  pullBookings?(ctx): Promise<SyncResult>;
  pushBooking?(ctx, b): Promise<SyncResult>;   // ثنائية الاتجاه عند توفر API رسمي
}
```

- **iCal** = `capabilities: { availability: true, rates: false, bookings: false, twoWay: false }` — يُوسم في الواجهة "توافر فقط".
- كل Adapter (Airbnb/Booking/Gathern/Agoda/Expedia/Moyasar/WhatsApp/TTLock) موجود الكود والبنية، **غير مفعّل** حتى مفاتيح/موافقات موثقة.
- حالة كل تكامل + بيانات الربط (مشفرة AES-256-GCM) + آخر مزامنة ناجحة/فاشلة في جدول `integrations`، والمشكلات في `sync_issues` مع تنبيه المالك.
- مزامنة ثنائية الاتجاه (توافر+أسعار+حجوزات) تُنفَّذ فقط عبر API رسمي أو مزود Channel Manager معتمد — التقييم في `channel-manager-evaluation.md`.

## مبادئ ملزمة
1. لا يظهر أي تكامل بحالة "مفعّل" إلا بعد اختبار فعلي موثق.
2. لا استخدام لأي API غير رسمي (scraping/nodes خاصة).
3. فشل مزامنة قناة لا يعطّل بقية القنوات (عزل لكل Adapter) ولا يوقف العامل.
