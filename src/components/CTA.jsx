import Reveal from './Reveal'

export default function CTA() {
  const go = (e) => {
    e.preventDefault()
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative overflow-hidden bg-ink py-28 lg:py-32">
      {/* إشعاع ذهبي خافت */}
      <div className="pointer-events-none absolute -top-40 right-1/2 h-96 w-[60rem] translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />
      <span
        aria-hidden="true"
        className="font-latin pointer-events-none absolute bottom-0 left-0 text-[18vw] leading-none text-ivory/[0.025] select-none"
      >
        RIFAN
      </span>

      <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-10">
        <Reveal>
          <span className="font-latin text-[0.68rem] tracking-[0.42em] text-gold uppercase">
            Let's Talk
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display mt-6 text-4xl leading-[1.3] font-semibold text-ivory sm:text-5xl">
            هل لديك وحدة وتبحث
            <br />
            عن <span className="text-gold-soft">إدارة احترافية؟</span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed font-light text-ivory/70">
            دع رِفان تتولى التفاصيل، وامنح وحدتك إدارة تليق بها.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <a
            href="#contact"
            onClick={go}
            className="group relative mt-10 inline-block overflow-hidden rounded-full bg-gold px-12 py-4.5 text-base font-medium text-white transition-transform duration-300 hover:-translate-y-1"
          >
            <span className="absolute inset-0 -translate-x-full bg-ivory transition-transform duration-500 ease-out group-hover:translate-x-0" />
            <span className="relative transition-colors duration-500 group-hover:text-ink">
              ابدأ التواصل مع رِفان
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  )
}
