import { motion } from 'framer-motion'

/** غلاف حركة موحّد لظهور العناصر عند التمرير */
export default function Reveal({ children, delay = 0, y = 36, once = true, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/** عنوان قسم موحّد: تسمية لاتينية + عنوان عربي كبير */
export function SectionHeading({ label, title, light = false, center = false }) {
  return (
    <div className={center ? 'text-center' : ''}>
      <Reveal>
        <div className={`flex items-center gap-4 ${center ? 'justify-center' : ''}`}>
          <span className="section-label">{label}</span>
          <span className={`h-px w-14 ${light ? 'bg-gold' : 'bg-gold/60'}`} />
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <h2
          className={`font-display mt-5 text-4xl leading-[1.25] font-semibold whitespace-pre-line sm:text-5xl ${
            light ? 'text-ivory' : 'text-ink'
          }`}
        >
          {title}
        </h2>
      </Reveal>
    </div>
  )
}
