# تقييم مزودي إدارة القنوات (Channel Managers) لمنصة رواق

> بحث ميداني بتاريخ 2026-10-31 لتقييم خيارات الشراكة/إعادة البيع لدعم مزامنة ثنائية الاتجاه مع:
> Airbnb، Booking.com، Agoda، Expedia، وجاذر (Gathern). كل ما لم يُتحقق منه موسوم **«غير مؤكد — يحتاج تواصل مباشر»**.

## خلاصة سريعة

- **ratesToGo (ratetogo.com) ليس مزيّد قنوات أصلًا** — هو موقع حجوزات فنادق لحظية (OTA) أسترالي تابع لمجموعة Wotif/Expedia. لا يقدم منتج channel manager ولا برنامج شراكة عام. يُنصح بحذفه من القائمة.
- **لا يوجد أي مزوّد دولي يُعلن رسميًا عن تكامل مع جاذر.** الوحيد الذي وجدناه يعلن مزامنة ثنائية مع جاذر هو منافسنا **rushd.tech** — ما يعني أن جاذر تمنح وصولًا عبر شراكة خاصة وليس API عام.
- **جاذر لا تنشر API عامًا للمطورين** (سجّلها على apis.io يوثّق: «لا تنشر سطح API مطوّرين عام» — 0 واجهات). الطريق الوحيد: تواصل B2B مباشر.
- **خيارات white-label حقيقية بأسعار منشورة:** Beds24 (الأرخص: من 15.50€/شهر + private label 19€/شهر) · Channex (0.5$/وحدة إيجار) · Rentals United (من 330$/شهر، شريك مفضّل لدى Airbnb/Booking/Vrbo) · eZee Centrix (OEM رسمي + عربية).
- **المسار المباشر الوحيد المنظم:** برنامج Booking.com Connectivity Partner — بقية المنصات إما مغلقة (Airbnb) أو تتطلب اتفاقًا تجاريًا (Expedia عرض، Agoda شراكة).

## جدول المقارنة

| المزوّد | التكلفة | القنوات (Airbnb/Booking/Agoda/Expedia/جاذر) | متطلبات الشراكة | إعادة البيع | دعم العربية |
|---|---|---|---|---|---|
| **Rentals United** | Pro (10–50 وحدة) **من 330$/شهر**؛ الأعلى بعرض سعر | الكل نعم (90+ قناة) عدا جاذر | شريك مفضّل لدى Airbnb/Booking/Vrbo | **نعم** — White Label Channel Management + API عام موثق (developer.rentalsunited.com) | غير مؤكد |
| **Beds24** | **من 15.50€/شهر** + 0.55€/رابط قناة/شهر — بلا عقد أو رسوم إعداد | الكل نعم (Premier لدى Booking.com) عدا جاذر | بلا حد أدنى — تسجيل مباشر | **نعم** — Private label بـ19€/شهر + API ضمن الاشتراك | لا |
| **Channex** | White-label من 130$/شهر + 7$/فندق أو **0.5$/وحدة إيجار** | Airbnb/Booking/Agoda/Expedia نعم · جاذر: لا (لكن يوفّر Channel API لبناء قنوات مخصصة) | مفتوح لمزودي PMS/SaaS؛ لا رسوم إعداد | **نعم** — مبني أصلًا للدمج داخل منتجات SaaS | لا (إنجليزي) |
| **eZee Centrix / YCS** (Yanolja) | من ~29–35$/شهر (طرف ثالث — رسميًا غير منشور) | Airbnb/Booking/Agoda نعم · Expedia نعم (100+ قناة) · جاذر: لا | Private Label Program + OEM Reseller برخص تجارية | **نعم** — برنامج White-label/OEM رسمي (بيع باسمك وبسعرك) | **نعم** (موثّق على Capterra) |
| **Hospitable** (ex-Smartbnb) | **باقة مجانية** (Essentials) تشمل مزامنة 4 قنوات | Airbnb/Booking/Agoda/Google نعم · **Expedia: لا** · جاذر: لا | منتج للمضيف النهائي مباشرة | لا | لا |
| **Hostaway** | بعرض سعر فقط | Airbnb (شريك مفضّل)/Booking/Expedia نعم · Agoda: غير مؤكد | برنامج Marketplace + API عام موثق (OpenAPI) | غير مؤكد — يحتاج تواصل مباشر | لا |
| **SiteMinder** | بعرض سعر (صفحة الأسعار تعرض فراغات) | مئات القنوات عدا جاذر (Agoda غير مؤكد) | برنامج Technology Partner رسمي | لا — لا يسمح بإعادة البيع/التغليف | ترجمة آلية 22 لغة لمحرك الحجز؛ واجهة عربية: غير مؤكد |
| **Cloudbeds** | بعرض سعر: ~120–600$/شهر (طرف ثالث) | الكل نعم (450+ OTA) عدا جاذر | برنامج Marketplace Partner رسمي | لا — تكامل فقط، لا إعادة بيع | غير مؤكد |
| **HotelRunner** (تركيا) | من ~100$/شهر (طرف ثالث — رسميًا غير منشور) | Airbnb/Booking/Expedia نعم · Agoda: نعم (موثق أدناه) · جاذر: لا | وثائق مطوّرين عامة + برنامج Partners | حقوق White-label: غير مؤكد | لا |
| **ResOnline / Resly** (أستراليا) | 81–183 AUD/شهر | Airbnb/Booking/Expedia نعم · Agoda: غير مؤكد · جاذر: لا | API مباشر موثق للربط كـ PMS | لا يوجد white-label عام — غير مؤكد | لا |
| **ratesToGo** | غير ينطبق — OTA وليس برمجية | — | لا يوجد برنامج | لا | لا |
| **AxisRooms / STAAH / Cubilis** | غير منشور (عرض سعر) | جزئيًا (طرف ثالث) | غير مؤكد | غير مؤكد | لا |

## هل تقدّم جاذر (Gathern) API عام أو برنامج شراكات؟

- **لا يوجد API عام**: لا يوجد developer portal مفهرس، وملفها على apis.io (شبكة API Evangelist) يوثّق صراحة أنها «تطبيق سوق استهلاكي ولا تنشر حاليًا سطح API للمطورين» (0 واجهات، Kin Score 12.9/100).
- **حصلت على تمويل 72 مليون دولار (Series B، أغسطس 2025، بقيادة Sanabil/STV)** وتستعد لإدراج في تداول — ما يجعل فتح API تجاريًا واردًا مستقبلًا.
- **الدليل العملي**: rushd.tech يعلن مزامنة ثنائية الاتجاه مع جاذر — إذن الوصول ممكن عبر اتفاق خاص. **التوصية**: مخاطبة جاذر مبكرًا (partnerships@gathern.com عبر نموذج الموقع) لطلب وصول API كشريك تقني، مع الاستشهاد بحجم وحدات رواق.

## الوصول المباشر لمنصات OTA (حقائق موثقة)

- **Airbnb**: API مغلق — docs على developer.withairbnb.com خلف بوابة الشركاء المعتمدين فقط. لا تسجيل ذاتي.
- **Booking.com**: برنامج Connectivity Partner رسمي (partner.booking.com) بمستويات Standard → Advanced → Premier → Premier Plus تُمنح سنويًا حسب أداء API — **مسار منظم يمكن التقديم عليه**.
- **Expedia**: واجهة Rapid تُراجع طلباتها حالة بحالة، وهي أساسًا API للاستهلاك (عرض مخزون Expedia عندنا)؛ **رفع مخزوننا إلى Expedia/Vrbo يتطلب اتفاق ترابط جهة العرض** — ليس API عامًا ذاتيًا.
- **Agoda**: برنامج Connectivity Partner رسمي (2024) مع اعتراف Preferred/Strategic عبر YCS Partner Hub.

## توصية — نهج هجين (شراء أولًا + بناء مباشر + شراكة جاذر)

1. **Channex أو Rentals United (الشراء الأول)** — كلاهما white-label API مصمم للدمج داخل SaaS مثلنا ويغطي القنوات الأربع العالمية من اليوم الأول دون حاجة لموافقة Airbnb:
   - Channex: أرخص بوحدة الإيجار (0.5$/وحدة) مع Channel API لبناء موصّل جاذر مخصص لاحقًا.
   - Rentals United: الأثبت والأشمل (شريك مفضّل لدى Airbnb/Booking/Vrbo) لكن من 330$/شهر.
   - **Beds24** بديل أرخص بترخيص منشور بالكامل (15.50€ + 0.55€/رابط، private label 19€/شهر) إن أردنا اختبار السوق بأقل تكلفة.
2. **eZee Centrix/YCS** — لو أردنا إعادة بيع فورية: دعم عربية موثّق + OEM رسمي بالبيع باسمنا وسعرنا.
3. **التقديم المباشر على Booking.com Connectivity Partner Program** (مسار منظم وموثق) + التفاوض على اتفاق عرض مع Expedia.
4. **جاذر شراكة مباشرة إجبارية** — لا يغطيها أي مزوّد دولي، وحصولنا عليها أولًا يكون ميزة تنافسية حتى على rushd.tech في بقية القنوات.

**ملاحظة صادقة**: SiteMinder وCloudbeds الأقوى عالميًا لكنهما لا يسمحان بإعادة البيع/التغليف — صالحان للاستخدام الداخلي فقط وليسا مناسبين لمنتجنا متعدد المستأجرين. وHospitable رغم باقته المجانية لا يدعم Expedia ولا يصلح كأساس منتج.

## المصادر

- Rentals United — التسعير (Pro من 330$/شهر): <https://rentalsunited.com/pricing/> · الشريك المفضل: <https://rentalsunited.com> · White-label API: <https://rentalsunited.com/blog/what-is-a-white-label-channel-manager-api> · وثائق المطورين: <https://developer.rentalsunited.com>
- Beds24 — التسعير الكامل المنشور: <https://www.beds24.com/en/pricing>
- Hospitable — القنوات الأربع المجانية: <https://hospitable.com/best-channel-manager-for-vacation-rentals> · التسعير: <https://hospitable.com/pricing>
- Hostaway: <https://www.hostaway.com>
- ratesToGo هو OTA وليس مزيّد قنوات (نتائج البحث المجمّعة): <https://www.ratestogo.com> · مقارنة: <https://ratetiger.com/the-complete-guide-to-hotel-channel-management-in-2026>
- ResOnline — التسعير: <https://www.resonline.com/pricing/individual-accommodation> · المزايا: <https://www.resonline.com/features/channel-manager> · Resly API: <https://docs.resly.com.au/reference/resly-direct>
- SiteMinder — التسعير والتجربة: <https://www.siteminder.com/pricing/> · التحليل: <https://usewhale.io/blog/siteminder-pricing/> · التقديم كشريك تقني: <https://www.siteminder.com/partners/technology-partners/> · ترجمة 22 لغة: <https://www.siteminder.com/product-release-hub/>
- Cloudbeds — التسعير: <https://www.cloudbeds.com/pricing> · التكاليف الفعلية: <https://www.roommaster.com/blog/cloudbeds-pricing> · قنوات: <https://www.cloudbeds.com/channel-manager> · ربط Expedia: <https://www.cloudbeds.com/integrations/expedia/>
- HotelRunner — مقارنة الأسعار (~100$/شهر): <https://hoteltechreport.com/compare/hotelrunner-vs-viato> · شريك Booking.com المميز: <https://hotelrunner.com/en> · الشركاء: <https://hotelrunner.com/en/partners>
- AxisRooms/Hotelogix — الموقع: <https://www.axisrooms.com> · عدم نشر الأسعار: <https://www.capterra.com/p/170914/Hotel-Channel-Manager> · STAAH (طرف ثالث): <https://www.capterra.com.au/software/129409/staah-channel-manager>
- eZee Centrix/YCS — القنوات: <https://www.ezeecentrix.com/channel-connections.php> · التسعير (من 29$/شهر): <https://www.ezeecentrix.com/pricing.php> · برنامج White-label: <https://www.ezeecentrix.com/private-label-program.php> · برنامج OEM: <https://www.ezeeabsolute.com/white-label-solution.php> · دعم العربية: <https://hoteltechreport.com/revenue-management/channel-managers/ezee-centrix>
- Channex — التسعير white-label: <https://channex.io/pricing> · الوثائق: <https://docs.channex.io> · الواجهة: <https://channex.io>
- Booking.com — دليل الشركاء والبرنامج: <https://partner.booking.com/en-gb/help> · دليل المنصات (600+ شريك): <https://partner.booking.com/en-gb/platforms>
- Airbnb — بوابة المطورين (خلف اعتماد الشريك): <https://developer.withairbnb.com/> · قائمة شركاء إدارة القنوات: <https://www.airbnb.com/help/article/2701>
- Expedia — Rapid API (مراجعة حالة بحالة): <https://partner.expediagroup.com/en-us/join-us/rapid-api> · وثائق المطورين: <https://developers.expediagroup.com/docs>
- Agoda — YCS Partner Hub وإدارة Channel Manager: <https://partnerhub.agoda.com/how-do-i-manage-my-channel-manager-connection>
- جاذر — لا API عام (توثيق apis.io/API Evangelist): <https://apis.io/providers/gathern> · بوابة المضيفين فقط: <https://gathern.co/en/business> · ترخيص وزارة السياحة 73102999 · تمويل 72 مليون دولار: <https://www.phocuswire.com/saudi-arabian-vacation-rental-platform-gathern-lands-72-million-dollars>
- rushd.tech يعلن مزامنة ثنائية مع Airbnb/Booking/Expedia/Agoda/جاذر: <https://rushd.tech/ar>
