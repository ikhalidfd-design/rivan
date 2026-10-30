/**
 * RIFAN film — scene timeline & copy.
 *
 * FILM_SRC: when a real produced MP4 is ready, drop the file at
 * public/video/rifan.mp4 and set FILM_SRC = '/video/rifan.mp4'.
 * The player switches automatically to the real video with the same
 * controls. Until then the film is rendered programmatically below.
 */
export const FILM_SRC = null

export const FILM_IMG = {
  openingWide:
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2000&auto=format&fit=crop',
  openingDetail:
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=2000&auto=format&fit=crop',
  prep: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1600&auto=format&fit=crop',
  clean: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1600&auto=format&fit=crop',
  welcome:
    'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1600&auto=format&fit=crop',
  guestArrive:
    'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=1600&auto=format&fit=crop',
  guestLiving:
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1600&auto=format&fit=crop',
  guestRest:
    'https://images.unsplash.com/photo-1521401830884-6c03c1c87ebb?q=80&w=1600&auto=format&fit=crop',
  evening:
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop',
}

export const SCENES = [
  { id: 'opening', dur: 11 },
  { id: 'problem', dur: 11 },
  { id: 'brand', dur: 12 },
  { id: 'services', dur: 12 },
  { id: 'guest', dur: 12 },
  { id: 'owner', dur: 11 },
  { id: 'finale', dur: 13 },
]

export const FILM_TOTAL = SCENES.reduce((a, s) => a + s.dur, 0)

/** scene start times */
export const SCENE_STARTS = SCENES.reduce((acc, s, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SCENES[i - 1].dur)
  return acc
}, [])

export function sceneIndexAt(t) {
  for (let i = SCENES.length - 1; i >= 0; i--) {
    if (t >= SCENE_STARTS[i]) return i
  }
  return 0
}

/** timed captions (voice-over script) */
export const CAPTIONS = [
  { from: 2.0, to: 10.5, text: 'كل وحدة لها قيمة… لكن إدارتها هي اللي تصنع الفرق.' },
  { from: 11.0, to: 16.0, text: 'من أول حجز… إلى لحظة وصول الضيف.' },
  { from: 22.5, to: 27.0, text: 'نهتم بكل التفاصيل.' },
  { from: 34.0, to: 45.5, text: 'الحجوزات، خدمة الضيوف، التجهيز، التنظيف والصيانة، ومتابعة الأداء.' },
  { from: 46.0, to: 51.0, text: 'تجربة أفضل للضيف.' },
  { from: 58.0, to: 63.0, text: 'وإدارة أوضح للمالك.' },
  { from: 68.0, to: 76.0, text: 'أنت تملك الوحدة… ونحن نتولى تشغيلها.' },
  { from: 76.5, to: 81.0, text: 'رِفان.' },
]

export function captionAt(t) {
  return CAPTIONS.find((c) => t >= c.from && t < c.to)?.text || null
}
