import Reveal from './Reveal'
import { PLATFORMS } from '../data/content'

export default function Platforms() {
  return (
    <section className="border-y border-line bg-mist py-14">
      <div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
        <Reveal>
          <p className="font-latin text-[0.68rem] tracking-[0.42em] text-gold uppercase">
            Where Guests Find You
          </p>
          <p className="mt-3 text-sm font-light text-ink-soft">
            نطلق وحدتك وندير حضورها على أبرز منصات الحجز العالمية والمحلية
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 sm:gap-x-14">
            {PLATFORMS.map((name) => (
              <li
                key={name}
                className="font-latin text-sm tracking-[0.28em] text-ink/45 transition-colors duration-300 hover:text-gold-deep sm:text-base"
              >
                {name}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
