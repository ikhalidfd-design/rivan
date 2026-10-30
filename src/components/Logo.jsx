/* شعار رُواق الإقامة — SVG مبني من الإحداثيات المستخرجة من الشعار الرسمي */
import { BRAND } from '../data/content'

const PANEL = '0.7,30.8 40.5,47.3 40.3,140.1 0.7,140.1'
const ARCH =
  'M 51.0,0.2 A 64.1 64.1 0 0 1 107.6,101.4 L 77.6,82.6 A 32.5 32.5 0 0 0 50.8,29.6 Z'
const LEG = '57.3,79.8 72.0,90.5 118.1,139.5 72.7,139.1 51.5,115.0 50.8,101.6'

/* الرمز وحده */
export function LogoMark({ className = 'h-10 w-auto', onDark = false }) {
  return (
    <svg viewBox="0 0 120 140.3" className={className} role="img" aria-label="رمز رُواق الإقامة">
      <polygon points={PANEL} fill={onDark ? '#F8F7F3' : '#073F40'} />
      <path
        d={ARCH}
        fill={onDark ? '#F8F7F3' : '#1D7273'}
        opacity={onDark ? 0.85 : 1}
      />
      <polygon points={LEG} fill="#C5A477" />
    </svg>
  )
}

/* التكوين الأفقي: رمز + اسم عربي + اسم لاتيني */
export default function Logo({
  onDark = false,
  className = '',
  markClass = 'h-11 w-auto',
  textClass = 'text-xl',
  subClass = 'text-[0.55rem]',
}) {
  return (
    <span className={`group flex items-center gap-3 ${className}`}>
      <LogoMark className={markClass} onDark={onDark} />
      <span className="hidden flex-col leading-tight sm:flex">
        <span
          className={`font-display font-semibold ${textClass} ${
            onDark ? 'text-offwhite' : 'text-teal-deep'
          }`}
        >
          {BRAND.nameAr}
        </span>
        <span
          className={`font-latin tracking-[0.32em] ${subClass} ${
            onDark ? 'text-gold' : 'text-teal'
          }`}
          dir="ltr"
        >
          {BRAND.nameEn}
        </span>
      </span>
    </span>
  )
}
