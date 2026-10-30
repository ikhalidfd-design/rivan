import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import Reveal, { SectionHeading } from './Reveal'
import { FAQ_ITEMS } from '../data/content'

export default function FAQ() {
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" className="py-28 lg:py-36">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <SectionHeading label="FAQ" title="الأسئلة الشائعة" center />

        <div className="mt-14">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i
            return (
              <Reveal key={item.q} delay={0.05 * i}>
                <div
                  className={`border-b border-line transition-colors duration-300 ${
                    isOpen ? 'border-gold/40' : ''
                  }`}
                >
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-6 py-6 text-right"
                  >
                    <span
                      className={`font-display text-lg font-medium transition-colors duration-300 sm:text-xl ${
                        isOpen ? 'text-gold-deep' : 'text-ink'
                      }`}
                    >
                      {item.q}
                    </span>
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ${
                        isOpen
                          ? 'rotate-45 border-gold bg-gold text-teal-deep'
                          : 'border-line text-gold'
                      }`}
                    >
                      <Plus size={16} />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pr-15 pb-7 leading-loose font-light text-ink-soft">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
