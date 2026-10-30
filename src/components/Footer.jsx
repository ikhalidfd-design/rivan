import { NAV_LINKS, BRAND, CONTACT } from '../data/content'
import { Instagram, Mail } from 'lucide-react'
import Logo from './Logo'

const TikTokIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

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
          <div className="flex items-center gap-3">
            {[
              CONTACT.instagram && { href: CONTACT.instagram, label: 'Instagram', Icon: Instagram },
              CONTACT.tiktok && { href: CONTACT.tiktok, label: 'TikTok', Icon: TikTokIcon },
              CONTACT.email && { href: `mailto:${CONTACT.email}`, label: 'Email', Icon: Mail },
            ]
              .filter(Boolean)
              .map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-offwhite/15 text-offwhite/60 transition-colors hover:border-gold hover:text-gold"
                >
                  <Icon size={15} />
                </a>
              ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
