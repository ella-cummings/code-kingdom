/**
 * ChiptunePlayer — procedural 8-bit music via Web Audio API.
 * No audio files required. Exports a singleton instance.
 *
 * Composition: "Code Kingdom Theme" — D major, BPM 156, anime RPG style.
 * Structure: 8-bar loop (64 eighth-note steps) with melody + bass + hi-hat.
 */

const BPM = 156;
const E   = 60 / BPM / 2; // eighth-note duration ≈ 0.192 s

// Note → Hz (equal temperament)
const N = {
  D3: 146.83, Fs3: 185.00, G3: 196.00, A3: 220.00, B3: 246.94,
  Cs4: 277.18, D4: 293.66,  E4: 329.63,
  A4: 440.00,  B4: 493.88,
  Cs5: 554.37, D5: 587.33,  E5: 659.25, Fs5: 739.99,
  G5: 783.99,  A5: 880.00,  B5: 987.77,
  _: 0,  // rest
};

// Each entry: [freq_hz, duration_in_eighth_notes]
// 8 bars × 8 eighth notes = 64 steps per track

const MELODY = [
  // Bar 1 — D tonic, ascending figure
  [N.D5,2],[N.E5,1],[N.Fs5,1],[N.A5,2],[N.Fs5,2],
  // Bar 2 — G colour, descending answer
  [N.G5,1],[N.Fs5,1],[N.E5,2],[N.D5,2],[N._,1],[N.D5,1],
  // Bar 3 — D, chromatic shimmer
  [N.Cs5,1],[N.D5,1],[N.E5,2],[N.Fs5,2],[N.A5,1],[N.Fs5,1],
  // Bar 4 — A dominant, suspension
  [N.A4,2],[N.B4,1],[N.Cs5,1],[N.E5,2],[N._,1],[N.E5,1],
  // Bar 5 — D, fast ascending run (anime energy)
  [N.D5,1],[N.E5,1],[N.Fs5,1],[N.A5,1],[N.B5,1],[N.A5,1],[N.Fs5,1],[N.E5,1],
  // Bar 6 — G, call-and-answer
  [N.G5,2],[N.E5,1],[N.G5,1],[N.D5,2],[N.B4,2],
  // Bar 7 — A, fast arpeggio climb
  [N.Cs5,1],[N.E5,1],[N.A5,1],[N.Cs5,1],[N.E5,1],[N.A5,1],[N.G5,1],[N.Fs5,1],
  // Bar 8 — D resolution
  [N.D5,2],[N.A4,1],[N.D5,1],[N.Fs5,2],[N.D5,2],
];

const BASS = [
  // Bar 1 — D: root-fifth-third walking
  [N.D3,2],[N.A3,1],[N.Fs3,1],[N.D3,2],[N.A3,2],
  // Bar 2 — G: root-fifth-third
  [N.G3,2],[N.D4,1],[N.B3,1],[N.G3,2],[N.D4,2],
  // Bar 3 — D again
  [N.D3,2],[N.A3,1],[N.Fs3,1],[N.D3,2],[N.A3,2],
  // Bar 4 — A: root-fifth-third
  [N.A3,2],[N.E4,1],[N.Cs4,1],[N.A3,2],[N.E4,2],
  // Bar 5 — D: fast walking run (matches melody energy)
  [N.D3,1],[N.Fs3,1],[N.A3,1],[N.D4,1],[N.A3,1],[N.Fs3,1],[N.D3,1],[N.A3,1],
  // Bar 6 — G: fast walking
  [N.G3,1],[N.B3,1],[N.D4,1],[N.G3,1],[N.D4,1],[N.B3,1],[N.G3,1],[N.D4,1],
  // Bar 7 — A: fast walking
  [N.A3,1],[N.Cs4,1],[N.E4,1],[N.A3,1],[N.E4,1],[N.Cs4,1],[N.A3,1],[N.E4,1],
  // Bar 8 — D: resolved
  [N.D3,2],[N.Fs3,1],[N.A3,1],[N.D4,2],[N.D3,2],
];

// Hi-hat: 1 = hit, 0 = skip (16-step pattern, repeated 4× for 64 steps)
const HAT_PATTERN = [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0];

// ─────────────────────────────────────────────────────────────────────────────

class ChiptunePlayer {
  constructor() {
    this.ctx        = null;
    this.master     = null;
    this.playing    = false;
    this._timer     = null;
    this._loopStart = 0;
    this._loopDur   = MELODY.reduce((s, [, n]) => s + n * E, 0);
  }

  // ── Lazy-init AudioContext (must be called after a user gesture) ───────────
  _init() {
    if (this.ctx) return;
    this.ctx    = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.07;
    this.master.connect(this.ctx.destination);
  }

  // ── Schedule a single pitched note ────────────────────────────────────────
  _note(freq, when, dur, vol, type = 'square') {
    if (!freq) return;
    const ctx = this.ctx;
    const g   = ctx.createGain();
    const o   = ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    // Envelope: near-instant attack, hold, quick release
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(vol, when + 0.004);
    g.gain.setValueAtTime(vol, when + dur * 0.82);
    g.gain.linearRampToValueAtTime(0,   when + dur * 0.97);
    o.connect(g);
    g.connect(this.master);
    o.start(when);
    o.stop(when + dur);
  }

  // ── Schedule a white-noise hi-hat tick ────────────────────────────────────
  _hat(when, dur) {
    const ctx  = this.ctx;
    const size = Math.ceil(ctx.sampleRate * dur);
    const buf  = ctx.createBuffer(1, size, ctx.sampleRate);
    const d    = buf.getChannelData(0);
    for (let i = 0; i < size; i++) d[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 6000;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.08, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + dur * 0.9);

    src.connect(hp);
    hp.connect(g);
    g.connect(this.master);
    src.start(when);
    src.stop(when + dur);
  }

  // ── Schedule one full loop starting at `when` ─────────────────────────────
  _loop(when) {
    this._loopStart = when;

    // Melody — square wave, slight legato
    let t = when;
    MELODY.forEach(([freq, steps]) => {
      this._note(freq, t, steps * E, 0.28, 'square');
      t += steps * E;
    });

    // Bass — square wave, staccato (70% of step)
    let bt = when;
    BASS.forEach(([freq, steps]) => {
      this._note(freq, bt, steps * E * 0.68, 0.38, 'square');
      bt += steps * E;
    });

    // Hi-hat — 16-step pattern × 4 repetitions
    const hatStep = E / 2; // 16th-note intervals
    for (let rep = 0; rep < 4; rep++) {
      HAT_PATTERN.forEach((hit, i) => {
        if (hit) this._hat(when + (rep * 16 + i) * hatStep, hatStep * 0.5);
      });
    }

    // Re-schedule next loop just before this one ends
    this._timer = setTimeout(
      () => { if (this.playing) this._loop(this._loopStart + this._loopDur); },
      (this._loopDur - 0.08) * 1000,
    );
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  start() {
    this._init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    if (this.playing) return;
    this.playing = true;
    this._loop(this.ctx.currentTime + 0.05);
  }

  stop() {
    this.playing = false;
    clearTimeout(this._timer);
  }

  setVolume(v) {
    this._init();
    this.master.gain.value = Math.max(0, Math.min(1, v));
  }
}

export const chiptunePlayer = new ChiptunePlayer();
