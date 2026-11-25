// audio.js — efek suara yang disintesis dengan WebAudio, tanpa file audio.
// Semua suara dibuat dari osilator + gain envelope; tidak ada network request.
const audio = {
  ctx: null,
  muted: false,

  ensure() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
      } catch (e) {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  tone(freq, durMs, type, vol, slideTo) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + durMs / 1000);
    gain.gain.setValueAtTime(vol || 0.12, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + durMs / 1000);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + durMs / 1000 + 0.02);
  },

  chop() { this.tone(180, 70, 'square', 0.10, 90); },
  toss() { this.tone(520, 90, 'triangle', 0.08, 760); },
  sizzle() { this.tone(1400, 220, 'sawtooth', 0.04, 900); this.tone(2100, 160, 'sine', 0.03, 1600); },
  ding() { this.tone(880, 140, 'sine', 0.12); setTimeout(() => this.tone(1318, 200, 'sine', 0.10), 90); },
  error() { this.tone(140, 180, 'sawtooth', 0.10, 90); },
  click() { this.tone(660, 50, 'triangle', 0.06); },
  tick() { this.tone(980, 40, 'sine', 0.05); },
};

export default audio;
