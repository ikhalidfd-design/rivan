import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react'
import { Ambience } from '../../lib/ambience'
import { FILM_SRC, FILM_TOTAL, SCENES, captionAt, sceneIndexAt } from '../../data/film'
import { SCENE_COMPONENTS } from './scenes'

const fmt = (t) => {
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

const CtrlBtn = ({ label, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className="flex h-10 w-10 items-center justify-center rounded-full text-ivory/85 transition-colors hover:bg-ivory/10 hover:text-gold-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
  >
    {children}
  </button>
)

/* ————————— real-file mode (drop public/video/rifan.mp4 + set FILM_SRC) ————————— */
function VideoFilePlayer({ onError }) {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [t, setT] = useState(0)
  const frameRef = useRef(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && v.paused && v.currentTime === 0) v.play().catch(() => {})
        else if (!e.isIntersecting && !v.paused) v.pause()
      },
      { threshold: 0.5 }
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  const toggle = () => {
    const v = videoRef.current
    if (!v) return
    v.paused ? v.play().catch(() => {}) : v.pause()
  }

  return (
    <figure
      ref={frameRef}
      className="film-frame group relative aspect-video w-full overflow-hidden bg-ink"
    >
      <video
        ref={videoRef}
        src={FILM_SRC}
        poster="/poster-film.svg"
        playsInline
        muted={muted}
        preload="metadata"
        className="h-full w-full object-cover"
        onClick={toggle}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
        onError={onError}
      />
      {!playing && (
        <button
          type="button"
          onClick={toggle}
          aria-label="تشغيل"
          className="absolute inset-0 m-auto flex h-20 w-20 items-center justify-center rounded-full border border-gold-soft/50 bg-ink/50 text-gold-soft backdrop-blur-sm transition-transform hover:scale-105"
        >
          <Play size={30} className="ms-1" fill="currentColor" />
        </button>
      )}
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-ink/85 to-transparent px-4 pt-10 pb-3">
        <CtrlBtn label={playing ? 'إيقاف' : 'تشغيل'} onClick={toggle}>
          {playing ? <Pause size={20} /> : <Play size={20} />}
        </CtrlBtn>
        <CtrlBtn label={muted ? 'تشغيل الصوت' : 'كتم الصوت'} onClick={() => setMuted((m) => !m)}>
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </CtrlBtn>
        <div
          dir="ltr"
          className="group/bar relative mx-2 h-1.5 flex-1 cursor-pointer rounded-full bg-ivory/25"
          onClick={(e) => {
            const v = videoRef.current
            if (!v || !v.duration) return
            const r = e.currentTarget.getBoundingClientRect()
            v.currentTime = ((e.clientX - r.left) / r.width) * v.duration
          }}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gold transition-[width]"
            style={{ width: `${(t / (videoRef.current?.duration || FILM_TOTAL)) * 100}%` }}
          />
        </div>
        <span dir="ltr" className="font-latin text-xs text-ivory/80">{fmt(t)}</span>
        {typeof document !== 'undefined' && document.fullscreenEnabled && (
          <CtrlBtn
            label="ملء الشاشة"
            onClick={() => {
              const el = frameRef.current
              if (!document.fullscreenElement) el?.requestFullscreen?.().catch(() => {})
              else document.exitFullscreen()
            }}
          >
            <Maximize size={18} />
          </CtrlBtn>
        )}
      </div>
    </figure>
  )
}

/* ————————— programmatic film player ————————— */
export default function RifanFilm() {
  const [fileFailed, setFileFailed] = useState(false)
  const useFile = !!FILM_SRC && !fileFailed

  const frameRef = useRef(null)
  const progressRef = useRef(null)
  const timeRef = useRef(null)
  const sliderRef = useRef(null)
  const tRef = useRef(0)
  const sceneIdxRef = useRef(0)
  const capRef = useRef(null)
  const ambRef = useRef(null)
  const autoRef = useRef(false)

  const [sceneIdx, setSceneIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [started, setStarted] = useState(false)
  const [ended, setEnded] = useState(false)
  const [caption, setCaption] = useState(null)
  const [isFs, setIsFs] = useState(false)

  if (!ambRef.current) ambRef.current = new Ambience()

  /* timeline engine */
  useEffect(() => {
    if (useFile || !playing) return
    let raf
    let last = performance.now()
    const tick = (now) => {
      const dt = (now - last) / 1000
      last = now
      tRef.current = Math.min(tRef.current + dt, FILM_TOTAL)
      const p = tRef.current / FILM_TOTAL
      if (progressRef.current) progressRef.current.style.width = `${p * 100}%`
      if (timeRef.current) timeRef.current.textContent = fmt(tRef.current)
      if (sliderRef.current) sliderRef.current.setAttribute('aria-valuenow', Math.round(tRef.current))
      const idx = sceneIndexAt(tRef.current)
      if (idx !== sceneIdxRef.current) {
        sceneIdxRef.current = idx
        setSceneIdx(idx)
      }
      const cap = captionAt(tRef.current)
      if (cap !== capRef.current) {
        capRef.current = cap
        setCaption(cap)
      }
      if (tRef.current >= FILM_TOTAL) {
        setPlaying(false)
        setEnded(true)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, useFile])

  /* score follows play state & mute */
  useEffect(() => {
    const amb = ambRef.current
    if (!useFile && playing && !muted) amb.start()
    else amb.stop()
  }, [playing, muted, useFile])

  useEffect(() => () => ambRef.current?.stop(), [])

  /* autoplay muted when the film enters the viewport */
  useEffect(() => {
    if (useFile) return
    const el = frameRef.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio > 0.55 && !started && !reduced && !ended) {
          autoRef.current = true
          setStarted(true)
          setPlaying(true)
        } else if (e.intersectionRatio < 0.15 && playing && autoRef.current) {
          setPlaying(false)
        }
      },
      { threshold: [0, 0.15, 0.55, 1] }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [useFile, started, ended, playing])

  /* fullscreen state */
  useEffect(() => {
    const h = () => setIsFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])

  const play = useCallback(() => {
    if (ended) {
      tRef.current = 0
      sceneIdxRef.current = 0
      capRef.current = null
      setSceneIdx(0)
      setCaption(null)
      setEnded(false)
    }
    setStarted(true)
    autoRef.current = false
    setPlaying(true)
  }, [ended])

  const togglePlay = useCallback(() => {
    if (!playing) play()
    else setPlaying(false)
  }, [playing, play])

  const unmute = useCallback(() => {
    setMuted(false)
    if (!playing) play()
  }, [playing, play])

  const toggleMute = useCallback(() => {
    if (muted) unmute()
    else setMuted(true)
  }, [muted, unmute])

  const seekFrac = useCallback((frac) => {
    const f = Math.min(1, Math.max(0, frac))
    tRef.current = f * FILM_TOTAL
    const idx = sceneIndexAt(tRef.current)
    if (idx !== sceneIdxRef.current) {
      sceneIdxRef.current = idx
      setSceneIdx(idx)
    }
    const cap = captionAt(tRef.current)
    capRef.current = cap
    setCaption(cap)
    if (ended && f < 1) setEnded(false)
    if (progressRef.current) progressRef.current.style.width = `${f * 100}%`
    if (timeRef.current) timeRef.current.textContent = fmt(tRef.current)
  }, [ended])

  const onSliderPointer = useCallback(
    (e) => {
      const el = e.currentTarget
      el.setPointerCapture(e.pointerId)
      const rect = el.getBoundingClientRect()
      const move = (ev) => seekFrac((ev.clientX - rect.left) / rect.width)
      move(e)
      const up = () => {
        el.removeEventListener('pointermove', move)
        el.removeEventListener('pointerup', up)
      }
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerup', up)
    },
    [seekFrac]
  )

  const toggleFs = useCallback(() => {
    const el = frameRef.current
    if (!document.fullscreenElement) el?.requestFullscreen?.().catch(() => {})
    else document.exitFullscreen()
  }, [])

  if (useFile) return <VideoFilePlayer onError={() => setFileFailed(true)} />

  const Scene = SCENE_COMPONENTS[SCENES[sceneIdx].id]
  const fsSupported = typeof document !== 'undefined' && !!document.fullscreenEnabled

  return (
    <figure
      ref={frameRef}
      className="film-frame group relative aspect-video w-full overflow-hidden bg-ink shadow-[0_40px_90px_-30px_rgba(33,29,24,0.5)]"
      aria-label="الإعلان التعريفي لرِفان"
    >
      {/* scenes */}
      <AnimatePresence>
        <Scene key={sceneIdx} />
      </AnimatePresence>

      {/* tap surface (mobile) */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? 'إيقاف مؤقت' : 'تشغيل'}
        className="absolute inset-0 cursor-pointer focus:outline-none"
      />

      {/* center controls */}
      <AnimatePresence>
        {(!playing || ended) && (
          <motion.button
            type="button"
            onClick={togglePlay}
            aria-label={ended ? 'إعادة المشاهدة' : 'تشغيل'}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 m-auto flex h-[9cqw] w-[9cqw] min-h-16 min-w-16 items-center justify-center rounded-full border border-gold-soft/60 bg-ink/45 text-gold-soft backdrop-blur-md transition-transform hover:scale-105"
          >
            {ended ? (
              <RotateCcw size={null} style={{ width: '3.4cqw', height: '3.4cqw', minHeight: 22, minWidth: 22 }} />
            ) : (
              <Play size={null} fill="currentColor" style={{ width: '3.4cqw', height: '3.4cqw', marginLeft: '0.6cqw', minHeight: 22, minWidth: 22 }} />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* muted hint */}
      <AnimatePresence>
        {playing && muted && (
          <motion.button
            type="button"
            onClick={unmute}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute top-[3cqw] left-[3cqw] flex items-center gap-[0.8cqw] rounded-full border border-ivory/20 bg-ink/50 px-[1.6cqw] py-[0.8cqw] text-[1.15cqw] font-light text-ivory/85 backdrop-blur-sm transition-colors hover:border-gold-soft/50"
          >
            <VolumeX size={null} style={{ width: '1.6cqw', height: '1.6cqw', minWidth: 14, minHeight: 14 }} />
            تشغيل الصوت
          </motion.button>
        )}
      </AnimatePresence>

      {/* caption */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[9cqw] px-[8cqw] text-center">
        <AnimatePresence mode="wait">
          {caption && (
            <motion.p
              key={caption}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-[70%] text-[1.55cqw] leading-[1.9] font-light text-ivory/90 [text-shadow:0_1px_8px_rgba(33,29,24,0.8)]"
            >
              {caption}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* controls bar */}
      <div
        className={`absolute inset-x-0 bottom-0 flex items-center gap-[1cqw] bg-gradient-to-t from-ink/90 via-ink/60 to-transparent px-[2.4cqw] pt-[6cqw] pb-[1.8cqw] transition-opacity duration-500 ${
          playing ? 'opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100' : 'opacity-100'
        }`}
      >
        <CtrlBtn label={playing ? 'إيقاف مؤقت' : 'تشغيل'} onClick={togglePlay}>
          {playing ? (
            <Pause size={18} />
          ) : (
            <Play size={18} />
          )}
        </CtrlBtn>
        <CtrlBtn label={muted ? 'تشغيل الصوت' : 'كتم الصوت'} onClick={toggleMute}>
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </CtrlBtn>

        <div
          dir="ltr"
          ref={sliderRef}
          role="slider"
          tabIndex={0}
          aria-label="تقدم الفيديو"
          aria-valuemin={0}
          aria-valuemax={FILM_TOTAL}
          aria-valuenow={0}
          onPointerDown={onSliderPointer}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') seekFrac((tRef.current + 5) / FILM_TOTAL)
            if (e.key === 'ArrowLeft') seekFrac((tRef.current - 5) / FILM_TOTAL)
          }}
          className="group/slider relative mx-[1cqw] h-[0.55cqw] min-h-1 flex-1 cursor-pointer rounded-full bg-ivory/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <div ref={progressRef} className="absolute inset-y-0 left-0 rounded-full bg-gold" style={{ width: '0%' }} />
        </div>

        <span
          dir="ltr"
          ref={timeRef}
          className="font-latin text-[max(1.1cqw,0.72rem)] text-ivory/85"
        >
          0:00
        </span>
        <span dir="ltr" className="font-latin text-[max(1.1cqw,0.72rem)] text-ivory/45">
          {fmt(FILM_TOTAL)}
        </span>

        {fsSupported && (
          <CtrlBtn label={isFs ? 'إنهاء ملء الشاشة' : 'ملء الشاشة'} onClick={toggleFs}>
            <Maximize size={16} />
          </CtrlBtn>
        )}
      </div>
    </figure>
  )
}
