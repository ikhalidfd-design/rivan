import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Mail, Instagram, Send, CheckCircle2 } from 'lucide-react'
import Reveal, { SectionHeading } from './Reveal'
import { CONTACT } from '../data/content'

/** أيقونة تيك توك (غير متوفرة في lucide) */
const TikTokIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

const SOCIALS = [
  { label: 'Instagram', handle: 'I0.rifan', href: CONTACT.instagram, Icon: Instagram },
  { label: 'TikTok', handle: 'I0.rifan', href: CONTACT.tiktok, Icon: TikTokIcon },
]

const INITIAL = { name: '', phone: '', email: '', city: '', units: '', message: '' }

export default function Contact() {
  const [form, setForm] = useState(INITIAL)
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(false)

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setError(false)
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${CONTACT.email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: 'طلب جديد من موقع رِفان',
          _template: 'table',
          _captcha: 'false',
          'الاسم': form.name,
          'رقم الجوال': form.phone,
          'البريد الإلكتروني': form.email,
          'المدينة': form.city,
          'عدد الوحدات': form.units,
          'الرسالة': form.message || '—',
        }),
      })
      if (!res.ok) throw new Error('send failed')
      setSent(true)
    } catch {
      setError(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="contact" className="bg-ivory-deep py-28 lg:py-36">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-[1fr_1.2fr] lg:gap-24 lg:px-10">
        {/* اليمين: النص + وسائل التواصل */}
        <div>
          <SectionHeading label="Contact Us" title="تواصل معنا" />
          <Reveal delay={0.2}>
            <p className="mt-8 text-lg leading-loose font-light text-ink-soft">
              يسعدنا التعرف على وحدتك ومناقشة أفضل طريقة لإدارتها وتشغيلها.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <a
              href={`mailto:${CONTACT.email}`}
              className="group mt-10 flex items-center gap-4 rounded-2xl border border-line bg-ivory p-5 transition-all duration-500 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_18px_40px_-18px_rgba(150,118,58,0.3)]"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink text-gold transition-colors duration-500 group-hover:bg-gold group-hover:text-white">
                <Mail size={20} strokeWidth={1.5} />
              </span>
              <span>
                <span className="block text-xs text-muted">البريد الإلكتروني</span>
                <span className="font-latin text-sm text-ink sm:text-base" dir="ltr">
                  {CONTACT.email}
                </span>
              </span>
            </a>
          </Reveal>

          <div className="mt-4 grid grid-cols-2 gap-4">
            {SOCIALS.map(({ label, handle, href, Icon }, i) => (
              <Reveal key={label} delay={0.35 + 0.08 * i}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-line bg-ivory p-6 transition-all duration-500 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_18px_40px_-18px_rgba(150,118,58,0.3)]"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line text-gold transition-all duration-500 group-hover:bg-gold group-hover:text-white">
                    <Icon size={20} />
                  </span>
                  <span className="font-latin text-xs tracking-wider text-muted" dir="ltr">
                    {handle}
                  </span>
                  <span className="text-xs font-medium text-ink-soft">{label}</span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>

        {/* اليسار: النموذج */}
        <Reveal delay={0.25}>
          <div className="relative rounded-3xl border border-line bg-ivory p-8 sm:p-12">
            <span className="absolute inset-x-12 top-0 h-px bg-gold/60" />

            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex min-h-[28rem] flex-col items-center justify-center text-center"
                >
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/10 text-gold">
                    <CheckCircle2 size={40} strokeWidth={1.2} />
                  </span>
                  <h3 className="font-display mt-8 text-3xl font-semibold text-ink">
                    تم استلام طلبك بنجاح
                  </h3>
                  <p className="mt-4 max-w-sm leading-relaxed font-light text-muted">
                    شكرًا لتواصلك مع رِفان. سيتواصل معك فريقنا قريبًا لمناقشة وحدتك.
                  </p>
                  <button
                    onClick={() => {
                      setForm(INITIAL)
                      setSent(false)
                    }}
                    className="mt-8 rounded-full border border-ink/20 px-8 py-3 text-sm font-medium text-ink transition-colors hover:border-gold hover:text-gold-deep"
                  >
                    إرسال طلب آخر
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={onSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="grid gap-7 sm:grid-cols-2"
                >
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-ink-soft">
                      الاسم
                    </label>
                    <input
                      id="name"
                      required
                      value={form.name}
                      onChange={set('name')}
                      className="field"
                      placeholder="اسمك الكريم"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="mb-1.5 block text-xs font-medium text-ink-soft">
                      رقم الجوال
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      dir="ltr"
                      value={form.phone}
                      onChange={set('phone')}
                      className="field text-right"
                      placeholder="05xxxxxxxx"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-ink-soft">
                      البريد الإلكتروني
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      dir="ltr"
                      value={form.email}
                      onChange={set('email')}
                      className="field text-right"
                      placeholder="name@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="mb-1.5 block text-xs font-medium text-ink-soft">
                      المدينة
                    </label>
                    <select id="city" required value={form.city} onChange={set('city')} className="field">
                      <option value="" disabled>
                        اختر المدينة
                      </option>
                      <option>الرياض</option>
                      <option>المنطقة الشرقية</option>
                      <option>أخرى</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="units" className="mb-1.5 block text-xs font-medium text-ink-soft">
                      عدد الوحدات
                    </label>
                    <select id="units" required value={form.units} onChange={set('units')} className="field">
                      <option value="" disabled>
                        اختر عدد الوحدات
                      </option>
                      <option>وحدة واحدة</option>
                      <option>2 – 5 وحدات</option>
                      <option>6 – 10 وحدات</option>
                      <option>أكثر من 10 وحدات</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="message" className="mb-1.5 block text-xs font-medium text-ink-soft">
                      رسالتك
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      value={form.message}
                      onChange={set('message')}
                      className="field resize-none"
                      placeholder="أخبرنا عن وحدتك وما تحتاجه..."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={sending}
                      className="group relative mt-2 w-full overflow-hidden rounded-full bg-ink py-4 text-sm font-medium text-ivory transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70"
                    >
                      <span className="absolute inset-0 -translate-x-full bg-gold transition-transform duration-500 ease-out group-hover:translate-x-0" />
                      <span className="relative flex items-center justify-center gap-2">
                        {sending ? 'جارٍ الإرسال...' : 'إرسال الطلب'}
                        {!sending && <Send size={16} className="-scale-x-100" />}
                      </span>
                    </button>
                    {error && (
                      <p className="mt-4 text-center text-xs leading-relaxed text-gold-deep">
                        تعذّر الإرسال حاليًا — يمكنك مراسلتنا مباشرة على{' '}
                        <a href={`mailto:${CONTACT.email}`} dir="ltr" className="font-latin underline">
                          {CONTACT.email}
                        </a>
                      </p>
                    )}
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
