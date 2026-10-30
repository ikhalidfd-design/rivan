import { motion } from 'framer-motion'
import {
  CalendarCheck,
  MessageSquare,
  Sparkles,
  Wrench,
  Star,
  Activity,
  ConciergeBell,
  LayoutGrid,
  LineChart,
} from 'lucide-react'
import { FILM_IMG } from '../../data/film'

const ease = [0.22, 1, 0.36, 1]

/* ——— image with graceful gradient fallback (offline / broken CDN) ——— */
export function FilmImg({ src, alt = '', className = '', style }) {
  return (
    <span className="absolute inset-0 block overflow-hidden bg-gradient-to-br from-teal-deep via-[#0b4a4b] to-forest">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        draggable={false}
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
        className={`h-full w-full object-cover ${className}`}
        style={style}
      />
    </span>
  )
}

const SceneShell = ({ children, zIndex = 0 }) => (
  <motion.div
    className="absolute inset-0 overflow-hidden bg-teal-deep"
    style={{ zIndex }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1, ease }}
  >
    {children}
  </motion.div>
)

const SceneTitle = ({ children, delay = 0.8, className = '' }) => (
  <motion.h3
    className={`font-display font-semibold text-offwhite ${className}`}
    initial={{ opacity: 0, y: 26 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1.2, delay, ease }}
  >
    {children}
  </motion.h3>
)

/* ————————————————— Scene 1 · Opening ————————————————— */
export function SceneOpening() {
  return (
    <SceneShell>
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [1, 1, 0] }}
        transition={{ duration: 11, times: [0, 0.5, 1], ease: 'easeInOut' }}
      >
        <FilmImg src={FILM_IMG.openingWide} alt="وحدة سكنية فاخرة في الرياض بإضاءة صباحية" className="kenburns" />
      </motion.div>
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 1, 1] }}
        transition={{ duration: 11, times: [0, 0.5, 0.68, 1], ease: 'easeInOut' }}
      >
        <FilmImg src={FILM_IMG.openingDetail} alt="تفاصيل التصميم الداخلي العصري للوحدة" className="kenburns" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-teal-deep/80 via-teal-deep/25 to-teal-deep/30" />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-[6cqw] text-center">
        <motion.span
          className="font-latin text-[1.1cqw] tracking-[0.5em] text-gold-soft/90 uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.4 }}
        >
          الرياض · صباحًا
        </motion.span>
        <SceneTitle className="mt-[2.4cqw] text-[4.6cqw] leading-[1.5]" delay={1.2}>
          وحدتك تستحق
          <br />
          <span className="text-gold-soft">أكثر من مجرد إعلان.</span>
        </SceneTitle>
      </div>
    </SceneShell>
  )
}

/* ————————————————— Scene 2 · Problem ————————————————— */
const PROBLEM_ITEMS = [
  { icon: CalendarCheck, text: 'حجز جديد ينتظر التأكيد' },
  { icon: MessageSquare, text: 'رسالة من ضيف تحتاج ردًّا' },
  { icon: Sparkles, text: 'موعد تنظيف غدًا' },
  { icon: Wrench, text: 'ملاحظة صيانة تحتاج متابعة' },
  { icon: Star, text: 'تقييم جديد بانتظار المراجعة' },
  { icon: Activity, text: 'متابعة تشغيل مستمرة' },
]

export function SceneProblem() {
  return (
    <SceneShell>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#0c4849_0%,#073f40_65%)]" />
      <div className="absolute inset-0 flex items-center justify-between gap-[4cqw] px-[8cqw]">
        <div className="flex-1">
          <SceneTitle className="text-[3.8cqw] leading-[1.6]" delay={0.8}>
            لأن تشغيل الوحدة…
            <br />
            <span className="text-gold-soft">تفاصيل كثيرة.</span>
          </SceneTitle>
        </div>
        <ul className="flex w-[42%] flex-col gap-[1.1cqw]">
          {PROBLEM_ITEMS.map((item, i) => (
            <motion.li
              key={item.text}
              className="flex items-center gap-[1.4cqw] rounded-[0.6cqw] border border-gold-soft/15 bg-offwhite/[0.04] px-[1.8cqw] py-[1.3cqw] backdrop-blur-sm"
              initial={{ opacity: 0, x: 48 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.9 + i * 1.05, ease }}
            >
              <item.icon className="shrink-0 text-gold" size={null} style={{ width: '2cqw', height: '2cqw' }} />
              <span className="text-[1.55cqw] font-light text-offwhite/90">{item.text}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </SceneShell>
  )
}

/* ————————————————— Scene 3 · Brand reveal + operations ————————————————— */
const OPS_CLIPS = [
  { img: FILM_IMG.prep, label: 'تجهيز الوحدة' },
  { img: FILM_IMG.clean, label: 'التنظيف والفحص' },
  { img: FILM_IMG.welcome, label: 'استقبال الضيف' },
]

export function SceneBrand() {
  return (
    <SceneShell>
      {/* 0–4.2s: wordmark reveal */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center"
        animate={{ opacity: [1, 1, 0], scale: [1, 1.04, 1.1] }}
        transition={{ duration: 12, times: [0, 0.35, 0.42], ease: 'easeInOut' }}
      >
        <motion.span
          className="h-px w-[16cqw] bg-gold"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.6, delay: 0.5, ease }}
        />
        <motion.h3
          className="font-display mt-[2.2cqw] text-[6.4cqw] leading-none font-semibold text-offwhite"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 0.8, ease }}
        >
          رُواق الإقامة
        </motion.h3>
        <motion.span
          className="font-latin mt-[1.4cqw] text-[1.3cqw] tracking-[0.6em] text-gold uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.5 }}
          dir="ltr"
        >
          RUWAQ AL-IKAMA
        </motion.span>
        <motion.span
          className="mt-[2.6cqw] h-px w-[16cqw] bg-gold"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.6, delay: 1.1, ease }}
        />
      </motion.div>

      {/* 4.2s+: operations montage */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 1, 1] }}
        transition={{ duration: 12, times: [0, 0.36, 0.44, 1] }}
      >
        {OPS_CLIPS.map((clip, i) => (
          <motion.div
            key={clip.label}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 1, 1, 0] }}
            transition={{
              duration: 7.6,
              times: [0, i / 3, i / 3 + 0.06, (i + 1) / 3, (i + 1) / 3 + 0.06],
              ease: 'easeInOut',
            }}
          >
            <FilmImg src={clip.img} alt={clip.label} className="kenburns" />
            <div className="absolute inset-0 bg-teal-deep/45" />
            <div className="absolute right-[5cqw] bottom-[10cqw] text-right">
              <motion.span
                className="inline-block rounded-full border border-gold-soft/40 bg-teal-deep/40 px-[2cqw] py-[0.9cqw] text-[1.5cqw] font-light text-offwhite backdrop-blur-sm"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease }}
              >
                {clip.label}
              </motion.span>
            </div>
          </motion.div>
        ))}
        <div className="absolute inset-x-0 bottom-[4cqw] text-center">
          <SceneTitle className="text-[3.4cqw]" delay={0.6}>
            رُواق <span className="text-gold-soft">تتولى التفاصيل.</span>
          </SceneTitle>
        </div>
      </motion.div>
    </SceneShell>
  )
}

/* ————————————————— Scene 4 · Services ————————————————— */
const FILM_SERVICES = [
  { icon: CalendarCheck, title: 'إدارة الحجوزات' },
  { icon: ConciergeBell, title: 'خدمة الضيوف' },
  { icon: Sparkles, title: 'التنظيف والتجهيز' },
  { icon: Wrench, title: 'الصيانة' },
  { icon: LayoutGrid, title: 'إدارة المنصات' },
  { icon: Star, title: 'متابعة التقييمات' },
  { icon: LineChart, title: 'متابعة الأداء' },
]

export function SceneServices() {
  return (
    <SceneShell>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0c4849_0%,#073f40_70%)]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-[3.4cqw] px-[7cqw]">
        <div className="grid w-full max-w-[72cqw] grid-cols-4 gap-[1.6cqw]">
          {FILM_SERVICES.map((s, i) => (
            <motion.div
              key={s.title}
              className="flex flex-col items-center gap-[1.2cqw] rounded-[0.7cqw] border border-gold-soft/12 bg-offwhite/[0.03] px-[1cqw] py-[2cqw] text-center"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 + i * 0.55, ease }}
            >
              <s.icon className="text-gold" size={null} style={{ width: '2.6cqw', height: '2.6cqw' }} />
              <span className="text-[1.5cqw] font-light text-offwhite/90">{s.title}</span>
            </motion.div>
          ))}
          <motion.div
            className="flex items-center justify-center rounded-[0.7cqw] border border-gold/30 bg-gold/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 + 7 * 0.55, ease }}
          >
            <span className="font-display text-[2.4cqw] font-semibold text-gold-soft">رُواق</span>
          </motion.div>
        </div>
      </div>
    </SceneShell>
  )
}

/* ————————————————— Scene 5 · Guest experience ————————————————— */
const GUEST_CLIPS = [
  { img: FILM_IMG.guestArrive, label: 'الوصول' },
  { img: FILM_IMG.guestLiving, label: 'استقبال الوحدة' },
  { img: FILM_IMG.guestRest, label: 'الراحة' },
]

export function SceneGuest() {
  return (
    <SceneShell>
      {GUEST_CLIPS.map((clip, i) => (
        <motion.div
          key={clip.label}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 1, 1, 0] }}
          transition={{
            duration: 12,
            times: [0, i / 3, i / 3 + 0.07, (i + 1) / 3, (i + 1) / 3 + 0.07],
            ease: 'easeInOut',
          }}
        >
          <FilmImg src={clip.img} alt={`ضيف يصل إلى الوحدة — ${clip.label}`} className="kenburns" />
          <div className="absolute inset-0 bg-gradient-to-t from-teal-deep/75 via-teal-deep/15 to-teal-deep/25" />
          <div className="absolute top-[6cqw] right-[5cqw]">
            <motion.span
              className="font-latin text-[1cqw] tracking-[0.5em] text-gold-soft/90 uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {clip.label}
            </motion.span>
          </div>
        </motion.div>
      ))}
      <div className="absolute inset-x-0 bottom-[9cqw] text-center">
        <SceneTitle className="text-[3.8cqw]" delay={0.7}>
          تجربة <span className="text-gold-soft">أفضل للضيف.</span>
        </SceneTitle>
      </div>
    </SceneShell>
  )
}

/* ————————————————— Scene 6 · Owner clarity (UI mock, no fabricated numbers) ————————————————— */
const OWNER_ROWS = [
  { label: 'الحجوزات', bar: 0.86 },
  { label: 'الإشغال', bar: 0.72 },
  { label: 'الأداء', bar: 0.78 },
  { label: 'التقييمات', bar: 0.94 },
]

export function SceneOwner() {
  return (
    <SceneShell>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,#0c4849_0%,#073f40_70%)]" />
      <div className="absolute inset-0 flex items-center justify-between gap-[5cqw] px-[9cqw]">
        <SceneTitle className="flex-1 text-[3.8cqw] leading-[1.6]" delay={0.7}>
          وإدارة
          <br />
          <span className="text-gold-soft">أوضح للمالك.</span>
        </SceneTitle>

        <motion.div
          className="w-[30cqw] rounded-[1cqw] border border-gold-soft/20 bg-offwhite/[0.04] p-[2.2cqw] shadow-2xl backdrop-blur-sm"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease }}
        >
          <div className="mb-[1.6cqw] flex items-center justify-between border-b border-gold-soft/15 pb-[1.2cqw]">
            <span className="text-[1.4cqw] font-medium text-offwhite">أداء وحدتك</span>
            <span className="font-latin text-[0.95cqw] tracking-[0.35em] text-gold uppercase" dir="ltr">RUWAQ</span>
          </div>
          <ul className="flex flex-col gap-[1.5cqw]">
            {OWNER_ROWS.map((row, i) => (
              <li key={row.label}>
                <div className="mb-[0.6cqw] flex items-center justify-between">
                  <span className="text-[1.3cqw] font-light text-offwhite/85">{row.label}</span>
                </div>
                <div className="h-[0.45cqw] overflow-hidden rounded-full bg-offwhite/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-l from-gold to-gold-soft"
                    initial={{ width: 0 }}
                    animate={{ width: `${row.bar * 100}%` }}
                    transition={{ duration: 1.4, delay: 1 + i * 0.35, ease }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </SceneShell>
  )
}

/* ————————————————— Scene 7 · Finale ————————————————— */
export function SceneFinale() {
  const goContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <SceneShell>
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0.25] }}
        transition={{ duration: 13, times: [0, 0.28, 0.55, 1], ease: 'easeInOut' }}
      >
        <FilmImg src={FILM_IMG.evening} alt="الوحدة في المساء" className="kenburns" />
        <div className="absolute inset-0 bg-teal-deep/60" />
      </motion.div>

      <div className="absolute inset-0 flex flex-col items-center justify-center px-[6cqw] text-center">
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: [0, 0, 1] }}
          transition={{ duration: 13, times: [0, 0.52, 0.66], ease }}
        >
          <span className="h-px w-[12cqw] bg-gold" />
          <h3 className="font-display mt-[1.8cqw] text-[5.4cqw] leading-none font-semibold text-offwhite">رُواق الإقامة</h3>
          <span className="font-latin mt-[1cqw] text-[1.1cqw] tracking-[0.55em] text-gold uppercase" dir="ltr">RUWAQ AL-IKAMA</span>
          <span className="mt-[1.2cqw] text-[1.25cqw] font-light text-offwhite/70" dir="ltr">
            Residency Services, Made Simpler.
          </span>
          <span className="h-px mt-[1.8cqw] w-[12cqw] bg-gold" />
          <p className="font-display mt-[2.4cqw] text-[2.9cqw] leading-[1.7] font-medium text-offwhite">
            أنت تملك الوحدة…
            <br />
            <span className="text-gold-soft">ونحن نتولى تشغيلها.</span>
          </p>
          <motion.button
            type="button"
            onClick={goContact}
            className="mt-[2.6cqw] rounded-full bg-gold px-[3.4cqw] py-[1.3cqw] text-[1.5cqw] font-medium text-teal-deep transition-colors hover:bg-gold-soft"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.4, ease }}
          >
            تواصل مع رُواق
          </motion.button>
        </motion.div>
      </div>
    </SceneShell>
  )
}

export const SCENE_COMPONENTS = {
  opening: SceneOpening,
  problem: SceneProblem,
  brand: SceneBrand,
  services: SceneServices,
  guest: SceneGuest,
  owner: SceneOwner,
  finale: SceneFinale,
}
