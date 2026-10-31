# تقرير التنفيذ — منصة رواق SaaS (P0)

**التاريخ:** 2026-10-31 · **الحالة:** تنفيذ محلي — لم يُنشر في الإنتاج (بموافقة صريحة فقط)

## تحديث 2026-10-31 (بعد إصلاح Docker): كل الاختبارات الحية ناجحة ✅

1. **`supabase db reset`** — ينجح (migration 0001 + seed). يُشغَّل الستاق بـ `npx supabase start -x edge-runtime` (صورة edge-runtime تالفة في مخزن containerd ولا نحتاجها).
2. **`npm run test:rls`** — **15/15 ناجحة** (عزل RLS 11 + منع الحجز المزدوج 4، بما فيها تزامن طلبين متوازيين: نجاح واحد + 23P01). تتطلب `ANON_KEY_LOCAL` و`SERVICE_KEY_LOCAL` في البيئة (من مخرجات `supabase start`).
3. **`npx playwright test`** — 2/2 ناجحة (حجز مباشر ناجح + وحدة غير منشورة 404).
4. **iCal حي:** تصدير 200 بترويسات صحيحة وأحداث يوم كامل + توكن خاطئ 404؛ استيراد: حرس SSRF يرفض HTTP (400)، المصادقة مطلوبة (401)، وطابور الوظائف كامل (feed→job→worker) سجّل فشل 404 الخارجي في `sync_issues` بالعربية.

### إصلاحات اكتشفتها الاختبارات الحية (في 0001_init.sql وseed.sql)
- `calc_quote`: متغير `d` كان يلتبس مع عمود `rates.d` (خطأ 42702) — أُعيدت تسميته `cur_day`.
- `request_booking`: `RETURNING expires_at` كان يلتبس مع عمود الإخراج — حُسّن بطرافة `bk`.
- seed: أعمدة `email_change` و`phone_change*` أصبحت `''` وphone بلا قيمة، وإلا فشل تسجيل دخول GoTrue (Scan NULL) وقيود فريدة phone.
- `public_units` view: أُزيل `cleaning_fee` (بيانات تكلفة داخلية) — `/b/[slug]` و`BookingPageClient` لم يعودا يطلبانه.
- `jobs`/`job_failures`/`rate_limits`: `REVOKE` صريح من anon/authenticated (كانت تعرض نتيجة فارغة بدل خطأ).
- اختبار «A لا يستطيع تحديث وحدة B» صُحح ليطابق دلالات RLS (صفر صفوف متأثرة بلا خطأ + التحقق أن الاسم لم يتغير).

## ما نُفّذ واختُبر فعليًا ✅

## ما نُفّذ واختُبر فعليًا ✅

### البنية
- مشروع مستقل `platform/` (Next.js 15 App Router + TypeScript strict + Tailwind v4 RTL) — بناء الإنتاج ينجح: **27 مسارًا تُجمَّع بدون أخطاء أنواع** (`next build`).
- الموقع التسويقي الحالي **لم يُمس إطلاقًا** — صفر تعديلات على الجذر.
- مخطط كامل في `platform/supabase/migrations/0001_init.sql`: 15 جدولًا + RLS + 8 دوال RPC + قيد منع الحجز المزدوج `EXCLUDE USING gist`.

### اختبارات الوحدة (Vitest) — 32/32 ناجحة ✅
| المجموعة | الملف | التغطية |
|---|---|---|
| آلة حالات الحجز | `tests/unit/transitions.test.ts` | كل الانتقالات المسموحة/المرفوضة + الحالات النهائية |
| Entitlements | `tests/unit/entitlements.ts` | حدود الباقات، انتهاء التجربة، الملغي = قراءة فقط، past_due مسموح |
| حماية SSRF | `tests/unit/guard.test.ts` | IPv4/IPv6 الخاصة (خصوصًا 169.254.169.254 وCGNAT وNAT64)، HTTPS فقط |
| توقيع Webhook | `tests/unit/webhook-verify.test.ts` | HMAC صحيح/خاطئ/مشوه، مقارنة زمنية ثابتة |
| iCal | `tests/unit/ical.test.ts` | تفسير Airbnb/Booking fixtures، DTEND حصري، صفر ليالٍ، الأفق، البناء للتصدير |

**اكتشاف حقيقي من الاختبارات:** خلل منطقة زمنية في تفسير iCal (أيام VALUE=DATE كانت تنزاح يومًا للخلف على مضيف UTC+3) — أُصلح واستُبعد بالاختبار.

### الوظائف المنفذة (كود مكتمل)
- **iCal تصدير:** `/api/ical/[token]/ruwaq.ics` — أحداث يوم كامل، DTEND حصري، Cache 30 دقيقة.
- **iCal استيراد:** جلب بتحقق SSRF كامل (DNS مثبّت ضد rebinding، مهلة 10s، 512KB، ≤3 قفزات) + مزامنة diff بـ UID.
- **طابور وظائف Postgres:** claim بـ `FOR UPDATE SKIP LOCKED`، idempotency، إعادة محاولة أُسّية، dead-letter، عامل `/api/cron/worker`.
- **الحجز المباشر العام:** `/b/[slug]` + RPC `request_booking` (security definer) + rate limiting 5/ساعة.
- **مركز التكاملات:** كل مزود يعرض الحقيقة (غير مفعّل) + متطلبات التفعيل الدقيقة — iCal وحده يعمل الآن.
- **الباقات والاشتراكات:** trial/basic/pro، حدود تطبق من الخادم، Super Admin `/admin`.
- **Webhooks واردة:** 503 صريح لكل مزود بلا مفاتيح + تحقق HMAC + تخزين خام.
- **CI:** GitHub Actions (typecheck → vitest → build) على `platform/**`.

## ما يحتاج DB حي — أُنجز كاملًا ✅ (انظر «تحديث 2026-10-31» أعلاه)

## ما يحتاج مفاتيح/موافقات خارجية 🔑 (لا ادعاء تفعيل)
| المزود | الناقص |
|---|---|
| Airbnb/Booking/Agoda/Expedia | موافقة شريك رسمي أو Channel Manager معتمد (التقييم: `docs/channel-manager-evaluation.md`) |
| Moyasar / HyperPay | حساب تاجر + مفاتيح |
| WhatsApp Business Cloud | اعتماد Meta |
| TTLock | اعتماد مطور TTLock |
| الدفع (فواتير المنصة) | مفاتيح بوابة الدفع (P1) |

## متعمد تأجيله إلى P1
الدفع الفعلي، اللوحة المالية، بوابة المالك، رفع الصور لـ Storage، WhatsApp wa.me، مهام التنظيف/الصيانة، مساعد AI.
