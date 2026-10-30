import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { IMAGES } from '../data/content'

const ease = [0.22, 1, 0.36, 1]

export default function Hero() {
  const go = (id) => (e) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="home" className="relative flex min-h-screen items-center overflow-hidden">
      {/* الخلفية */}
      <div className="absolute inset-0">
        <img
          src={IMAGES.hero}
          alt="وحدة سكنية فاخرة بإدارة رِفان"
          className="kenburns h-full w-full object-cover"
        />
        {/* تدرّج عاجي ناعم يقرأ النص بوضوح */}
        <div className="absolute inset-0 bg-gradient-to-l from-ivory/97 via-ivory/78 to-ivory/25" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ivory to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-28 pb-24 lg:px-10">
        <div className="max-w-2xl">
          {/* الشريط التعريفي */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="mb-8 flex items-center gap-4"
          >
            <span className="h-px w-12 bg-gold" />
            <span className="font-latin text-[0.68rem] tracking-[0.42em] text-gold uppercase">
              Luxury Hospitality · Property Management
            </span>
          </motion.div>

          {/* العنوان الرئيسي */}
          <h1 className="font-display text-5xl leading-[1.3] font-semibold text-ink sm:text-6xl lg:text-7xl">
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.35, ease }}
            >
              نُدير وحدتك...
            </motion.span>
            <motion.span
              className="block text-gold-deep"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.55, ease }}
            >
              ونصنع تجربة تستحق التكرار.
            </motion.span>
          </h1>

          {/* النص التعريفي */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.75, ease }}
            className="mt-8 max-w-xl text-lg leading-relaxed font-light text-ink-soft"
          >
            رِفان لإدارة وتشغيل الوحدات السكنية للإيجار قصير المدى، نقدم إدارة احترافية متكاملة
            تبدأ من التشغيل وتنتهي بتجربة ضيف استثنائية.
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
              className="group relative overflow-hidden rounded-full bg-ink px-9 py-4 text-sm font-medium text-ivory transition-transform duration-300 hover:-translate-y-0.5"
            >
              <span className="absolute inset-0 -translate-x-full bg-gold transition-transform duration-500 ease-out group-hover:translate-x-0" />
              <span className="relative">تعرّف على خدماتنا</span>
            </a>
            <a
              href="#contact"
              onClick={go('contact')}
              className="rounded-full border border-ink/30 px-9 py-4 text-sm font-medium text-ink transition-all duration-400 hover:border-gold hover:text-gold-deep"
            >
              تواصل معنا
            </a>
          </motion.div>
        </div>
      </div>

      {/* مؤشر التمرير */}
      <motion.a
        href="#about"
        onClick={go('about')}
        aria-label="مرر للأسفل"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 text-ink/50 transition-colors hover:text-gold md:block"
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
