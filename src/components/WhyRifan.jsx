import Reveal, { SectionHeading } from './Reveal'
import { WHY_POINTS, IMAGES } from '../data/content'

export default function WhyRifan() {
  return (
    <section id="why" className="relative overflow-hidden bg-ivory-deep py-28 lg:py-36">
      {/* كلمة خلفية زخرفية */}
      <span
        aria-hidden="true"
        className="font-latin pointer-events-none absolute -top-6 left-0 text-[22vw] leading-none font-medium text-ink/[0.03] select-none"
      >
        RIFAN
      </span>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading label="Why RIFAN" title="لماذا رِفان؟" center />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_POINTS.map((point, i) => {
            const Icon = point.icon
            return (
              <Reveal key={point.title} delay={0.07 * i} y={28}>
                <article className="group relative h-full overflow-hidden rounded-3xl border border-line bg-ivory p-9 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-[0_24px_50px_-20px_rgba(150,118,58,0.3)]">
                  {/* وميض ذهبي خافت */}
                  <span className="absolute -top-16 -left-16 h-36 w-36 rounded-full bg-gold/0 blur-3xl transition-all duration-700 group-hover:bg-gold/15" />

                  <div className="relative">
                    <Icon
                      size={30}
                      strokeWidth={1.2}
                      className="text-gold transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"
                    />
                    <h3 className="font-display mt-6 text-2xl font-semibold text-ink">
                      {point.title}
                    </h3>
                    <p className="mt-3 leading-relaxed font-light text-muted">{point.desc}</p>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>

        {/* شريط صور عريض تحت النقاط */}
        <Reveal delay={0.2}>
          <div className="mt-16 grid gap-6 overflow-hidden rounded-3xl sm:grid-cols-2">
            <figure className="group overflow-hidden">
              <img
                src={IMAGES.living}
                alt="صالة معيشة أنيقة بإدارة رِفان"
                loading="lazy"
                className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </figure>
            <figure className="group overflow-hidden">
              <img
                src={IMAGES.bedroom}
                alt="غرفة نوم مريحة بإدارة رِفان"
                loading="lazy"
                className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </figure>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
