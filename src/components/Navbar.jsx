import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { NAV_LINKS } from '../data/content'
import Logo from './Logo'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('home')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      // active section state
      const pos = window.scrollY + window.innerHeight * 0.35
      for (const link of NAV_LINKS) {
        const el = document.getElementById(link.id)
        if (el && el.offsetTop <= pos && el.offsetTop + el.offsetHeight > pos) {
          setActive(link.id)
        }
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => (document.body.style.overflow = '')
  }, [open])

  const go = (id) => (e) => {
    e.preventDefault()
    setOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'border-b border-line/70 bg-offwhite/90 shadow-[0_8px_30px_rgba(7,63,64,0.08)] backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
          {/* الشعار */}
          <a href="#home" onClick={go('home')} aria-label="رُواق الإقامة — الرئيسية">
            <Logo
              onDark={!scrolled}
              markClass={`transition-all duration-500 ${scrolled ? 'h-10' : 'h-12'}`}
            />
          </a>

          {/* روابط سطح المكتب */}
          <ul className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={go(link.id)}
                  className={`link-underline text-sm font-medium transition-colors ${
                    active === link.id
                      ? 'active text-gold'
                      : scrolled
                        ? 'text-ink-soft hover:text-ink'
                        : 'text-offwhite/85 hover:text-offwhite'
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <a
              href="#contact"
              onClick={go('contact')}
              className={`hidden rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-400 lg:inline-block ${
                scrolled
                  ? 'bg-teal-deep text-offwhite hover:bg-teal'
                  : 'bg-gold text-teal-deep hover:bg-gold-soft'
              }`}
            >
              تحدث معنا
            </a>
            {/* زر القائمة */}
            <button
              onClick={() => setOpen(!open)}
              aria-label="القائمة"
              aria-expanded={open}
              className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors hover:border-gold hover:text-gold lg:hidden ${
                scrolled ? 'border-line text-ink' : 'border-offwhite/40 text-offwhite'
              }`}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* قائمة الجوال */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="on-dark fixed inset-0 z-40 bg-teal-deep/97 backdrop-blur-sm lg:hidden"
          >
            <ul className="flex h-full flex-col items-center justify-center gap-2">
              {NAV_LINKS.map((link, i) => (
                <motion.li
                  key={link.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <a
                    href={`#${link.id}`}
                    onClick={go(link.id)}
                    className={`font-display block px-6 py-3 text-3xl font-medium transition-colors ${
                      active === link.id ? 'text-gold' : 'text-offwhite hover:text-gold-soft'
                    }`}
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-6"
              >
                <a
                  href="#contact"
                  onClick={go('contact')}
                  className="rounded-full bg-gold px-10 py-3.5 font-display text-lg text-teal-deep"
                >
                  تحدث معنا
                </a>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
