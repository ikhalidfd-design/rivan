import Reveal, { SectionHeading } from './Reveal'
import { OWNER_JOURNEY } from '../data/content'

export default function OwnerExperience() {
  return (
    <section className="py-28 lg:py-36">
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
        <SectionHeading label="Owner Experience" title={'أنت تملك الوحدة...\nونحن نتولى تشغيلها.'} center />

        <div className="relative mt-20">
          {/* خط رابط رأسي */}
          <div className="absolute top-8 right-1/2 h-[calc(100%-4rem)] w-px translate-x-1/2 bg-line" />

          <div className="space-y-6">
            {OWNER_JOURNEY.map((item, i) => (
              <Reveal key={i} delay={0.12 * i} y={30}>
                <div
                  className={`relative mx-auto flex max-w-xl items-center justify-between gap-6 rounded-2xl border p-6 transition-all duration-500 hover:-translate-y-1 ${
                    item.you
                      ? 'border-line bg-ivory hover:border-gold/50 hover:shadow-[0_18px_40px_-18px_rgba(150,118,58,0.3)]'
                      : 'border-transparent bg-ink text-ivory hover:shadow-[0_18px_40px_-14px_rgba(33,29,24,0.5)]'
                  }`}
                >
                  <div className="text-right">
                    <span
                      className={`font-latin text-[0.6rem] tracking-[0.35em] uppercase ${
                        item.you ? 'text-gold' : 'text-gold-soft'
                      }`}
                    >
                      {item.you ? 'YOU' : i === 1 ? 'RIFAN' : 'GUEST'}
                    </span>
                    <h3 className={`font-display mt-1.5 text-2xl font-semibold ${item.you ? 'text-ink' : ''}`}>
                      {item.text}
                    </h3>
                  </div>
                  <span
                    className={`font-display shrink-0 rounded-full px-5 py-2.5 text-lg font-semibold ${
                      item.you ? 'bg-sand text-ink-soft' : 'bg-gold text-white'
                    }`}
                  >
                    {item.actor}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
