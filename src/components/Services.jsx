import Reveal, { SectionHeading } from './Reveal'
import { SERVICES } from '../data/content'

export default function Services() {
  return (
    <section id="services" className="relative bg-mist py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading label="Our Services" title="خدماتنا" />
          <Reveal delay={0.2}>
            <p className="max-w-md leading-relaxed font-light text-muted lg:pb-2 lg:text-left">
              إدارة متكاملة تغطي كل ما تحتاجه وحدتك — من أول حجز حتى آخر تقييم.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service, i) => {
            const Icon = service.icon
            return (
              <Reveal key={service.title} delay={0.06 * i} y={24}>
                <article className="group relative h-full bg-offwhite p-8 transition-colors duration-500 hover:bg-white">
                  {/* خط ذهبي يظهر أعلى الكرت عند المرور */}
                  <span className="absolute inset-x-0 top-0 h-[3px] origin-right scale-x-0 bg-gold transition-transform duration-500 ease-out group-hover:scale-x-100" />

                  <div className="flex items-start justify-between">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border border-line text-teal transition-all duration-500 group-hover:border-gold group-hover:bg-gold group-hover:text-teal-deep">
                      <Icon size={22} strokeWidth={1.5} />
                    </span>
                    <span className="font-latin text-sm text-muted/70 transition-colors duration-500 group-hover:text-gold">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <h3 className="font-display mt-8 text-xl font-semibold text-ink">{service.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed font-light text-muted">
                    {service.desc}
                  </p>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
