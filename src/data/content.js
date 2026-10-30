import {
  CalendarCheck,
  ConciergeBell,
  Settings2,
  Sparkles,
  Wrench,
  LayoutGrid,
  Star,
  LineChart,
  KeyRound,
  ClipboardList,
  PlayCircle,
  Users,
  Gauge,
  TrendingUp,
  ShieldCheck,
  Gem,
  Eye,
  Layers,
  Handshake,
  Award,
} from 'lucide-react'

export const NAV_LINKS = [
  { id: 'home', label: 'الرئيسية' },
  { id: 'about', label: 'من نحن' },
  { id: 'services', label: 'خدماتنا' },
  { id: 'how', label: 'آلية العمل' },
  { id: 'why', label: 'لماذا رِفان' },
  { id: 'contact', label: 'تواصل معنا' },
]

export const SERVICES = [
  {
    icon: CalendarCheck,
    title: 'إدارة الحجوزات',
    desc: 'متابعة الحجوزات وتنظيمها وإدارة تفاصيل الإقامة.',
  },
  {
    icon: ConciergeBell,
    title: 'خدمة الضيوف',
    desc: 'التواصل مع الضيوف ومتابعة احتياجاتهم قبل وأثناء وبعد الإقامة.',
  },
  {
    icon: Settings2,
    title: 'التشغيل اليومي',
    desc: 'إدارة التفاصيل التشغيلية للوحدة ومتابعة سير العمل.',
  },
  {
    icon: Sparkles,
    title: 'التنظيف والتجهيز',
    desc: 'تنسيق أعمال التنظيف وتجهيز الوحدة بما يضمن جاهزيتها للضيف.',
  },
  {
    icon: Wrench,
    title: 'الصيانة والمتابعة',
    desc: 'متابعة احتياجات الصيانة والتنسيق لمعالجة الملاحظات والمشكلات.',
  },
  {
    icon: LayoutGrid,
    title: 'إدارة المنصات',
    desc: 'إدارة حسابات ومنصات الإيجار قصير المدى وتحسين ظهور الوحدة.',
  },
  {
    icon: Star,
    title: 'إدارة التقييمات',
    desc: 'متابعة تقييمات الضيوف وتحسين تجربة الإقامة وبناء سمعة أفضل للوحدة.',
  },
  {
    icon: LineChart,
    title: 'متابعة الأداء',
    desc: 'متابعة مؤشرات الأداء والإشغال والإيرادات وتقديم رؤية واضحة للمالك.',
  },
]

export const STEPS = [
  { icon: KeyRound, title: 'نتعرف على وحدتك' },
  { icon: ClipboardList, title: 'نجهز خطة التشغيل' },
  { icon: PlayCircle, title: 'نبدأ الإدارة والتشغيل' },
  { icon: Users, title: 'نتابع الضيوف والحجوزات' },
  { icon: Gauge, title: 'نراقب الأداء والتقييمات' },
  { icon: TrendingUp, title: 'نرفع مستوى التجربة باستمرار' },
]

export const WHY_POINTS = [
  {
    icon: Layers,
    title: 'إدارة متكاملة',
    desc: 'لا نترك المالك أمام تفاصيل التشغيل اليومية.',
  },
  {
    icon: Gem,
    title: 'تجربة ضيافة احترافية',
    desc: 'نهتم بالتفاصيل التي تصنع الفرق في تجربة الضيف.',
  },
  {
    icon: Eye,
    title: 'متابعة مستمرة',
    desc: 'نراقب التشغيل والحجوزات والتقييمات والأداء.',
  },
  {
    icon: Handshake,
    title: 'حل واحد للمالك',
    desc: 'من الحجوزات إلى التنظيف والصيانة وخدمة الضيوف.',
  },
  {
    icon: ShieldCheck,
    title: 'شفافية في الأداء',
    desc: 'المالك على اطلاع واضح على أداء وحدته.',
  },
  {
    icon: Award,
    title: 'خبرة تشغيلية',
    desc: 'نعتمد على خبرة عملية وفريق متخصص في تشغيل الوحدات.',
  },
]

export const OWNER_JOURNEY = [
  { actor: 'أنت', text: 'تملك الوحدة', you: true },
  { actor: 'رِفان', text: 'تتولى الإدارة والتشغيل', you: false },
  { actor: 'الضيف', text: 'يحصل على تجربة متكاملة', you: false },
  { actor: 'أنت', text: 'تتابع أداء وحدتك بوضوح', you: true },
]

export const FAQ_ITEMS = [
  {
    q: 'كيف تبدأ رِفان بإدارة وحدتي؟',
    a: 'نبدأ بزيارة الوحدة وتقييمها، ثم نجهّز خطة التشغيل المناسبة لها — من التجهيز والتصوير إلى الإطلاق على منصات الحجز — ونبدأ الإدارة والتشغيل الفعلي.',
  },
  {
    q: 'ما المدن التي تعمل بها رِفان حاليًا؟',
    a: 'نعمل حاليًا في الرياض والمنطقة الشرقية، مع خطط للتوسع في مناطق أخرى قريبًا.',
  },
  {
    q: 'هل تبقى الوحدة مسجلة باسمي؟',
    a: 'نعم، دائمًا. نعمل بعقد إدارة وتشغيل يوثّق ملكيتك الكاملة للوحدة، ونتولى فقط إدارتها وتشغيلها باحترافية.',
  },
  {
    q: 'كيف أتابع أداء وحدتي؟',
    a: 'تحصل على تقارير دورية واضحة تشمل معدل الإشغال والإيرادات وتقييمات الضيوف، مع تواصل مباشر مع فريقنا لأي استفسار.',
  },
  {
    q: 'هل توجد رسوم قبل بدء التشغيل؟',
    a: 'التقييم الأولي وخطة التشغيل بدون أي رسوم. أتعابنا مرتبطة بالنتائج الفعلية لعمل وحدتك.',
  },
  {
    q: 'هل يمكنني إيقاف التعاون في أي وقت؟',
    a: 'نعمل بعقد مرن ينص على فترة إشعار مسبق متفق عليها، لن تُلزم بأي التزامات طويلة المدى.',
  },
]

export const PLATFORMS = ['AIRBNB', 'BOOKING.COM', 'GATHERN', 'EXPEDIA', 'TRIP.COM']

export const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2400&auto=format&fit=crop',
  about: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1400&auto=format&fit=crop',
  aboutSmall: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=900&auto=format&fit=crop',
  cinematic: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2400&auto=format&fit=crop',
  bedroom: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop',
  living: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&auto=format&fit=crop',
}

export const CONTACT = {
  email: 'b.rifan.mk@gmail.com',
  instagram: 'https://instagram.com/I0.rifan',
  tiktok: 'https://tiktok.com/@I0.rifan',
}
