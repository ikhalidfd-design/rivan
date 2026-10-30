import Reveal, { SectionHeading } from './Reveal'
import { IMAGES } from '../data/content'

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden py-28 lg:py-36">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:gap-24 lg:px-10">
        {/* النص */}
        <div>
          <SectionHeading label="About RUWAQ" title="رُواق... أكثر من إدارة وحدة" />
          <Reveal delay={0.2}>
            <p className="mt-10 text-lg leading-loose font-light text-ink-soft">
              في رُواق الإقامة، نؤمن أن نجاح الوحدة السكنية لا يعتمد على عرضها فقط، بل على جودة
              إدارتها اليومية والتفاصيل التي تصنع تجربة الضيف.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="mt-6 text-lg leading-loose font-light text-ink-soft">
              نتولى إدارة وتشغيل الوحدة باحترافية، من إدارة الحجوزات وخدمة الضيوف إلى التنسيق مع
              فرق التنظيف والصيانة، ومتابعة الأداء والتقييمات.
            </p>
          </Reveal>
          <Reveal delay={0.4}>
            <div className="mt-10 flex items-center gap-4">
              <span className="h-px w-16 bg-gold/60" />
              <span className="font-latin text-xs tracking-[0.3em] text-muted" dir="ltr">
                Professional Hospitality Management
              </span>
            </div>
          </Reveal>
        </div>

        {/* التكوين البصري: صورتان متداخلتان + إطار ذهبي */}
        <div className="relative">
          <Reveal delay={0.15}>
            <div className="relative">
              {/* إطار ذهبي مزاح */}
              <div className="absolute -top-5 -right-5 h-full w-full rounded-t-[10rem] border border-gold/50" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-t-[10rem]">
                <img
                  src={IMAGES.about}
                  alt="إدارة رُواق الإقامة لوحدة سكنية عصرية"
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out hover:scale-105"
                />
              </div>
              {/* صورة صغيرة متراكبة */}
              <div className="absolute -bottom-10 -left-4 hidden w-48 overflow-hidden rounded-2xl border-4 border-offwhite shadow-2xl sm:block lg:-left-10 lg:w-60">
                <img
                  src={IMAGES.aboutSmall}
                  alt="غرفة نوم فاخرة بإدارة رُواق الإقامة"
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
              {/* شارة الاسم */}
              <div className="absolute -bottom-6 right-8 rounded-full bg-teal-deep px-7 py-3.5 shadow-xl">
                <span className="font-latin text-sm tracking-[0.3em] text-gold" dir="ltr">
                  RUWAQ
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
