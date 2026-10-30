import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { IMAGES, BRAND } from '../data/content'

const ease = [0.22, 1, 0.36, 1]

export default function Hero() {
  const go = (id) => (e) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="home"
      className="on-dark relative flex min-h-screen items-center overflow-hidden bg-teal-deep"
    >
      {/* زخرفة الأقواس — امتداد لهوية الشعار */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <svg
          viewBox="0 0 120 140.3"
          className="absolute -top-24 -left-16 w-[46vw] opacity-[0.07]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 51.0,0.2 A 64.1 64.1 0 0 1 107.6,101.4 L 77.6,82.6 A 32.5 32.5 0 0 0 50.8,29.6 Z"
            fill="#F8F7F3"
          />
        </svg>
        <svg
          viewBox="0 0 120 140.3"
          className="absolute -right-20 -bottom-28 w-[38vw] opacity-[0.06]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 51.0,0.2 A 64.1 64.1 0 0 1 107.6,101.4 L 77.6,82.6 A 32.5 32.5 0 0 0 50.8,29.6 Z"
            fill="#F8F7F3"
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-32 pb-24 lg:px-10">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-12">
          {/* النص */}
          <div>
            {/* الشريط التعريفي */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease }}
              className="mb-8 flex items-center gap-4"
            >
              <span className="h-px w-12 bg-gold" />
              <span
                className="font-latin text-[0.68rem] tracking-[0.42em] text-gold uppercase"
                dir="ltr"
              >
                {BRAND.nameEn}
              </span>
            </motion.div>

            {/* العنوان الرئيسي */}
            <h1 className="font-display text-5xl leading-[1.25] font-semibold text-offwhite sm:text-6xl lg:text-7xl">
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.35, ease }}
              >
                خدمات الإقامة،
              </motion.span>
              <motion.span
                className="block text-gold"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.55, ease }}
              >
                بتجربة أسهل.
              </motion.span>
            </h1>

            {/* النص التعريفي */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.75, ease }}
              className="mt-8 max-w-xl text-lg leading-relaxed font-light text-offwhite/75"
            >
              رُواق الإقامة — منصة سعودية متخصصة في خدمات الإقامة. ندير تجربة الضيافة من الحجز
              حتى المغادرة، بخدمة محترفة وشفافية كاملة، لتستثمر وقتك في ما يهمك.
            </motion.p>

            {/* الأزرار */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.95, ease }}
              className="mt-12 flex flex-wrap items-center gap-4"
            >
              <a
                href="#services"
                onClick={go('services')}
                className="group relative overflow-hidden rounded-full bg-gold px-9 py-4 text-sm font-medium text-teal-deep transition-transform duration-300 hover:-translate-y-0.5"
              >
                <span className="absolute inset-0 -translate-x-full bg-gold-soft transition-transform duration-500 ease-out group-hover:translate-x-0" />
                <span className="relative">تعرّف على خدماتنا</span>
              </a>
              <a
                href="#contact"
                onClick={go('contact')}
                className="rounded-full border border-offwhite/30 px-9 py-4 text-sm font-medium text-offwhite transition-all duration-400 hover:border-gold hover:text-gold"
              >
                تواصل معنا
              </a>
            </motion.div>
          </div>

          {/* الصورة بقوس مستوحى من الشعار */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.5, ease }}
            className="relative mx-auto w-full max-w-md lg:max-w-none"
          >
            <div className="absolute -top-4 -right-4 h-full w-full rounded-t-[12rem] border border-gold/40" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-t-[12rem]">
              <img
                src={IMAGES.hero}
                alt="وحدة إقامة بإدارة رُواق الإقامة"
                className="kenburns aspect-[4/5] w-full object-cover"
              />
              <div className="absolute inset-0 bg-teal-deep/15" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* تدرّج الانتقال للقسم التالي */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-offwhite/95 to-transparent" aria-hidden="true" />

      {/* مؤشر التمرير */}
      <motion.a
        href="#about"
        onClick={go('about')}
        aria-label="مرر للأسفل"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 text-offwhite/60 transition-colors hover:text-gold md:block"
      >
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          className="block"
        >
          <ChevronDown size={26} />
        </motion.span>
      </motion.a>
    </section>
  )
}
