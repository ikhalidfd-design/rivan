import Reveal from './Reveal'
import { IMAGES } from '../data/content'

export default function Cinematic() {
  return (
    <section className="on-dark relative flex min-h-[85vh] items-center overflow-hidden">
      {/* الصورة السينمائية */}
      <div className="absolute inset-0">
        <img
          src={IMAGES.cinematic}
          alt="وحدة سكنية فاخرة بإدارة رُواق الإقامة"
          loading="lazy"
          className="kenburns h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-teal-deep/60" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-mist/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-teal-deep/40 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 text-center lg:px-10">
        <Reveal>
          <div className="mb-8 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-gold" />
            <span className="font-latin text-[0.68rem] tracking-[0.42em] text-gold-soft uppercase" dir="ltr">
              The RUWAQ Standard
            </span>
            <span className="h-px w-12 bg-gold" />
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <h2 className="font-display text-4xl leading-[1.35] font-semibold text-offwhite sm:text-5xl lg:text-6xl">
            وحدتك تستحق
            <br />
            <span className="text-gold-soft">إدارة مختلفة</span>
          </h2>
        </Reveal>

        <Reveal delay={0.3}>
          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed font-light text-offwhite/80">
            نعتني بكل تفصيل، لأن التفاصيل الصغيرة هي التي تصنع تجربة كبيرة.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
