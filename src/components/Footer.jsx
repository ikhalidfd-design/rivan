import { NAV_LINKS } from '../data/content'

const FOOTER_LINKS = NAV_LINKS.filter((l) => l.id !== 'why')

export default function Footer() {
  const go = (id) => (e) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="bg-ink pt-20 pb-10 text-ivory">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col items-center gap-10 border-b border-ivory/10 pb-14 md:flex-row md:justify-between">
          {/* الشعار */}
          <div className="flex flex-col items-center gap-4 md:items-start">
            <img src="/logo.png" alt="شعار رِفان" className="h-16" />
            <div className="text-center md:text-right">
              <p className="font-display text-2xl font-semibold">رِفان</p>
              <p className="font-latin text-xs tracking-[0.45em] text-gold">RIFAN</p>
            </div>
          </div>

          <p className="font-latin max-w-sm text-center text-sm leading-relaxed tracking-wide text-ivory/50 md:text-left">
            Luxury Hospitality
            <br />+ Professional Property Management
          </p>

          {/* الروابط */}
          <nav aria-label="روابط التذييل">
            <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={go(link.id)}
                    className="text-sm font-light text-ivory/70 transition-colors hover:text-gold-soft"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-latin text-xs tracking-wider text-ivory/40">
            © 2026 RIFAN. All Rights Reserved.
          </p>
          <p className="text-xs font-light text-ivory/30">
            إدارة وتشغيل احترافي للوحدات السكنية للإيجار قصير المدى
          </p>
        </div>
      </div>
    </footer>
  )
}
