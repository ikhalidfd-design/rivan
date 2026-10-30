import { NAV_LINKS, BRAND } from '../data/content'
import Logo from './Logo'

const FOOTER_LINKS = NAV_LINKS.filter((l) => l.id !== 'why')

export default function Footer() {
  const go = (id) => (e) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="on-dark bg-teal-deep pt-20 pb-10 text-offwhite">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col items-center gap-10 border-b border-offwhite/10 pb-14 md:flex-row md:justify-between">
          {/* الشعار */}
          <Logo onDark markClass="h-14 w-auto" textClass="text-2xl" subClass="text-[0.6rem]" />

          <p className="font-latin max-w-sm text-center text-sm leading-relaxed tracking-wide text-offwhite/50 md:text-left" dir="ltr">
            {BRAND.taglineEn}
            <br />
            Residency & Hospitality Services
          </p>

          {/* الروابط */}
          <nav aria-label="روابط التذييل">
            <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={go(link.id)}
                    className="text-sm font-light text-offwhite/70 transition-colors hover:text-gold-soft"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-latin text-xs tracking-wider text-offwhite/40" dir="ltr">
            © 2026 {BRAND.nameEn}. All Rights Reserved.
          </p>
          <p className="text-xs font-light text-offwhite/30">
            خدمات الإقامة، بتجربة أسهل
          </p>
        </div>
      </div>
    </footer>
  )
}
