import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import Reveal, { SectionHeading } from './Reveal'
import { STEPS } from '../data/content'

export default function HowItWorks() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.75', 'end 0.6'],
  })
  const lineScale = useSpring(scrollYProgress, { stiffness: 60, damping: 20 })

  return (
    <section id="how" className="py-28 lg:py-36">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        <SectionHeading label="How We Work" title="كيف نعمل؟" center />

        <div ref={ref} className="relative mt-20">
          {/* الخط الزمني — ينمو مع التمرير */}
          <div className="absolute top-0 right-[27px] h-full w-px bg-line sm:right-1/2 sm:translate-x-1/2" />
          <motion.div
            style={{ scaleY: lineScale }}
            className="absolute top-0 right-[27px] h-full w-px origin-top bg-gold sm:right-1/2 sm:translate-x-1/2"
          />

          <div className="space-y-14">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              const isStart = i % 2 === 0
              return (
                <div key={step.title} className="relative grid items-center gap-6 sm:grid-cols-2">
                  {/* العقدة */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 z-10 flex h-14 w-14 items-center justify-center rounded-full border border-gold/50 bg-ivory text-gold shadow-[0_0_0_8px_var(--color-ivory)] sm:right-1/2 sm:translate-x-1/2"
                  >
                    <Icon size={20} strokeWidth={1.5} />
                  </motion.div>

                  {/* المحتوى */}
                  <Reveal
                    delay={0.1}
                    className={`pr-20 sm:pr-0 ${
                      isStart ? 'sm:col-start-1 sm:pl-0 sm:pr-16 sm:text-left' : 'sm:col-start-2 sm:pl-16'
                    }`}
                  >
                    <div
                      className={`group rounded-2xl border border-line bg-white/60 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_20px_40px_-18px_rgba(150,118,58,0.25)] ${
                        isStart ? 'sm:ml-auto' : ''
                      } max-w-md`}
                    >
                      <span className="font-latin text-xs tracking-[0.3em] text-gold">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="font-display mt-2 text-2xl font-semibold text-ink">
                        {step.title}
                      </h3>
                    </div>
                  </Reveal>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
