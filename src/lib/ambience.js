/**
 * Ambient cinematic score for the RUWAQ film — generated with Web Audio.
 * A slow, warm chord pad (Fmaj7 → Dm9 → Am7 → Cmaj9) with a soft low-pass
 * filter. No files needed; starts only after a user gesture (unmute).
 */
const CHORDS = [
  [87.31, 130.81, 164.81, 220.0, 329.63], // Fmaj7
  [73.42, 146.83, 220.0, 261.63, 349.23], // Dm9
  [110.0, 164.81, 196.0, 261.63, 329.63], // Am7
  [98.0, 146.83, 196.0, 246.94, 293.66], // Cmaj9
]

export class Ambience {
  constructor() {
    this.ctx = null
    this.master = null
    this.timer = null
    this.step = 0
  }

  get running() {
    return !!this.timer
  }

  start() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return
      this.ctx = new AC()
      const filter = this.ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 1100
      filter.Q.value = 0.4
      this.master = this.ctx.createGain()
      this.master.gain.value = 0
      this.master.connect(filter)
      filter.connect(this.ctx.destination)
    }
    this.ctx.resume()
    if (this.timer) return
    const now = this.ctx.currentTime
    this.master.gain.cancelScheduledValues(now)
    this.master.gain.setValueAtTime(this.master.gain.value, now)
    this.master.gain.linearRampToValueAtTime(0.9, now + 3)
    this._chord()
    this.timer = setInterval(() => this._chord(), 9000)
  }

  stop() {
    if (!this.ctx || !this.timer) return
    clearInterval(this.timer)
    this.timer = null
    const now = this.ctx.currentTime
    this.master.gain.cancelScheduledValues(now)
    this.master.gain.setValueAtTime(this.master.gain.value, now)
    this.master.gain.linearRampToValueAtTime(0, now + 1.2)
  }

  _chord() {
    const notes = CHORDS[this.step % CHORDS.length]
    this.step++
    const t = this.ctx.currentTime
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator()
      osc.type = i === 0 ? 'sine' : 'triangle'
      osc.frequency.value = freq
      osc.detune.value = (i % 2 ? 3 : -3)
      const g = this.ctx.createGain()
      const peak = i === 0 ? 0.05 : 0.028
      g.gain.setValueAtTime(0.0001, t)
      g.gain.linearRampToValueAtTime(peak, t + 3.2)
      g.gain.setValueAtTime(peak, t + 6.5)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 13)
      osc.connect(g)
      g.connect(this.master)
      osc.start(t)
      osc.stop(t + 13.5)
    })
  }
}
