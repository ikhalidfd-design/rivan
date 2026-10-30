import { useEffect, useRef, useState } from 'react'
import Reveal, { SectionHeading } from './Reveal'
import RuwaqFilm from './film/RuwaqFilm'

/** يحمّل مشغّل الفيديو فقط عند اقترابه من الشاشة (Lazy Loading) */
function LazyFilm() {
  const ref = useRef(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            setShow(true)
            io.disconnect()
          }
        },
        { rootMargin: '400px' }
      )
      io.observe(el)
      return () => io.disconnect()
    }
    setShow(true)
  }, [])

  return (
    <div ref={ref} className="relative">
      {/* Poster أولي يظهر لحظة تحميل المشغّل */}
      <img
        src="/poster-film.svg"
        alt=""
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
          show ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <div className={show ? '' : 'invisible'}>
        {show && <RuwaqFilm />}
      </div>
    </div>
  )
}

export default function VideoShowcase() {
  const go = (id) => (e) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="film" className="relative overflow-hidden bg-mist py-28 lg:py-36">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <SectionHeading
          center
          label="The RUWAQ Film"
          title={'التفاصيل التي لا تراها…\nنحن نديرها.'}
        />
        <Reveal delay={0.2}>
          <p className="mx-auto mt-8 max-w-2xl text-center text-lg leading-relaxed font-light text-ink-soft">
            من التشغيل اليومي إلى تجربة الضيف، تتولى رُواق التفاصيل التي تصنع الفرق.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="relative mt-14">
            {/* إطار ذهبي خلفي */}
            <div className="absolute -top-4 -right-4 h-full w-full rounded-sm border border-gold/40" aria-hidden="true" />
            <LazyFilm />
          </div>
        </Reveal>

        <Reveal delay={0.4}>
          <div className="mt-12 text-center">
            <a
              href="#services"
              onClick={go('services')}
              className="group relative inline-block overflow-hidden rounded-full bg-teal-deep px-9 py-4 text-sm font-medium text-offwhite transition-transform duration-300 hover:-translate-y-0.5"
            >
              <span className="absolute inset-0 -translate-x-full bg-gold transition-transform duration-500 ease-out group-hover:translate-x-0" />
              <span className="relative transition-colors duration-500 group-hover:text-teal-deep">تعرّف على خدماتنا</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
