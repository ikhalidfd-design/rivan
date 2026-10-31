/**
 * سجل التكاملات — المصدر الموحد لبطاقات مركز التكاملات.
 * مبدأ صارم: status 'active' يُضبط فقط في قاعدة البيانات بعد اختبار فعلي موثق.
 * هذا السجل يصف القدرات والمتطلبات — لا يدّعي حالة تشغيلية أبدًا.
 */

export type ProviderId =
  | "ical"
  | "airbnb"
  | "booking"
  | "gathern"
  | "agoda"
  | "expedia"
  | "moyasar"
  | "hyperpay"
  | "whatsapp"
  | "ttlock"
  | "zatca";

export interface ProviderMeta {
  id: ProviderId;
  nameAr: string;
  category: "channels" | "payments" | "messaging" | "locks" | "compliance";
  capabilities: { availability: boolean; rates: boolean; bookings: boolean; twoWay: boolean };
  requirementsAr: string[];       // متطلبات التفعيل الدقيقة
  icalAvailableNow: boolean;      // يمكن التصدير/الاستيراد عبر iCal فورًا
  notesAr?: string;
}

export const PROVIDERS: Record<ProviderId, ProviderMeta> = {
  ical: {
    id: "ical",
    nameAr: "iCal (توافر فقط)",
    category: "channels",
    capabilities: { availability: true, rates: false, bookings: false, twoWay: false },
    requirementsAr: ["لا شيء — يعمل فورًا لكل وحدة"],
    icalAvailableNow: true,
    notesAr: "استورد التغذيات الخارجية وصدّر رابط تقويم لكل منصة. يزامن التوافر فقط كل 6 ساعات كحد أقصى.",
  },
  airbnb: {
    id: "airbnb",
    nameAr: "Airbnb",
    category: "channels",
    capabilities: { availability: true, rates: true, bookings: true, twoWay: true },
    requirementsAr: [
      "قبول في برنامج Airbnb Developer Apps (طلب + مراجعة + اتفاقية)",
      "مفاتيح OAuth بعد الاعتماد",
    ],
    icalAvailableNow: true,
    notesAr: "متاح الآن: تصدير توافر (لصق الرابط في Airbnb) واستيراد تغذية Airbnb — توافر فقط.",
  },
  booking: {
    id: "booking",
    nameAr: "Booking.com",
    category: "channels",
    capabilities: { availability: true, rates: true, bookings: true, twoWay: true },
    requirementsAr: [
      "عقد شراكة في Booking.com Connectivity Partner Program",
      "اجتياز بيئة الاختبار والشهادة",
    ],
    icalAvailableNow: true,
    notesAr: "متاح الآن عبر iCal — توافر فقط.",
  },
  gathern: {
    id: "gathern",
    nameAr: "جاذرن Gathern",
    category: "channels",
    capabilities: { availability: true, rates: false, bookings: false, twoWay: false },
    requirementsAr: [
      "التواصل مع جاذرن لوثائق شراكة API رسمية — غير موثقة علنًا بعد",
    ],
    icalAvailableNow: true,
    notesAr: "متاح الآن عبر iCal إن وفرت المنصة روابط تقويم — نتحقق من كل حالة على حدة.",
  },
  agoda: {
    id: "agoda",
    nameAr: "Agoda",
    category: "channels",
    capabilities: { availability: true, rates: true, bookings: true, twoWay: true },
    requirementsAr: ["شراكة Agoda Channel Manager API", "مفاتيح بعد العقد"],
    icalAvailableNow: true,
  },
  expedia: {
    id: "expedia",
    nameAr: "Expedia",
    category: "channels",
    capabilities: { availability: true, rates: true, bookings: true, twoWay: true },
    requirementsAr: ["اعتماد شريك في Expedia Group Rapid API", "مفاتيح بعد الاعتماد"],
    icalAvailableNow: true,
  },
  moyasar: {
    id: "moyasar",
    nameAr: "Moyasar (مدى / Apple Pay)",
    category: "payments",
    capabilities: { availability: false, rates: false, bookings: true, twoWay: false },
    requirementsAr: ["حساب Moyasar", "Publishable + Secret Keys", "تكوين Webhook للدفع"],
    icalAvailableNow: false,
  },
  hyperpay: {
    id: "hyperpay",
    nameAr: "HyperPay",
    category: "payments",
    capabilities: { availability: false, rates: false, bookings: true, twoWay: false },
    requirementsAr: ["حساب تاجر معتمد", "مفاتيح الواجهة + Webhook"],
    icalAvailableNow: false,
  },
  whatsapp: {
    id: "whatsapp",
    nameAr: "WhatsApp Business",
    category: "messaging",
    capabilities: { availability: false, rates: false, bookings: false, twoWay: true },
    requirementsAr: [
      "حساب Meta Business + رقم معتمد",
      "WhatsApp Business Cloud API (WABA) + Token",
    ],
    icalAvailableNow: false,
    notesAr: "متاح الآن بدون API: روابط wa.me برسائل معبأة لكل حجز.",
  },
  ttlock: {
    id: "ttlock",
    nameAr: "TTLock الأقفال الذكية",
    category: "locks",
    capabilities: { availability: false, rates: false, bookings: true, twoWay: false },
    requirementsAr: ["اعتماد مطور TTLock (developer.ttlock.com)", "Client ID/Secret OAuth2"],
    icalAvailableNow: false,
  },
  zatca: {
    id: "zatca",
    nameAr: "فوترة ZATCA",
    category: "compliance",
    capabilities: { availability: false, rates: false, bookings: false, twoWay: false },
    requirementsAr: [
      "تسجيل المنشأة لدى هيئة الزكاة والضريبة والجمارك",
      "اعتماد الحل + شهادات ومفاتيح الفوترة",
    ],
    icalAvailableNow: false,
  },
};

export const PROVIDER_ORDER: ProviderId[] = [
  "ical", "airbnb", "booking", "gathern", "agoda", "expedia",
  "moyasar", "hyperpay", "whatsapp", "ttlock", "zatca",
];

export const CATEGORY_LABELS_AR: Record<ProviderMeta["category"], string> = {
  channels: "قنوات التوزيع",
  payments: "المدفوعات",
  messaging: "التواصل",
  locks: "الأقفال الذكية",
  compliance: "الامتثال",
};
