const SOUND_KEY = 'shc_sound_enabled';
const LEGACY_MUTE_KEY = 'shc_muted';

export const HAPTIC_PATTERNS = {
  light: 15,
  medium: 35,
  success: [40, 60, 80],
  error: [60, 50, 60],
} as const;

export type HapticType = keyof typeof HAPTIC_PATTERNS;

/** C5, E5, G5. */
export const CORRECT_NOTES = [523.25, 659.25, 783.99] as const;

type AudioCtor = typeof AudioContext;

let audioContext: AudioContext | null = null;

function audioCtor(): AudioCtor | null {
  if (typeof window === 'undefined') return null;
  const legacy = (window as Window & { webkitAudioContext?: AudioCtor }).webkitAudioContext;
  return window.AudioContext ?? legacy ?? null;
}

function getContext(): AudioContext | null {
  const Ctor = audioCtor();
  if (!Ctor) return null;
  if (!audioContext) audioContext = new Ctor();
  return audioContext;
}

/** Missing key means sound is on. `'false'` is the muted preference. */
export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = window.localStorage.getItem(SOUND_KEY);
  if (stored === 'false') return false;
  if (stored === 'true') return true;
  return window.localStorage.getItem(LEGACY_MUTE_KEY) !== 'true';
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SOUND_KEY, enabled ? 'true' : 'false');
}

export function toggleSoundEnabled(): boolean {
  const enabled = !isSoundEnabled();
  setSoundEnabled(enabled);
  if (enabled) void runningContext();
  return enabled;
}

export function isSoundMuted(): boolean {
  return !isSoundEnabled();
}

export function toggleSoundMute(): boolean {
  return !toggleSoundEnabled();
}

async function runningContext(): Promise<AudioContext | null> {
  if (isSoundMuted()) return null;
  const ctx = getContext();
  if (!ctx) return null;
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      return null;
    }
  }
  return ctx.state === 'running' ? ctx : null;
}

function tone(
  ctx: AudioContext,
  start: number,
  frequency: number,
  duration: number,
  type: OscillatorType,
  peak: number,
  endFrequency?: number,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  if (endFrequency) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), start + duration);
  }
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + Math.min(0.02, duration / 3));
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function playWhistle(): void {
  void runningContext().then((ctx) => {
    if (!ctx) return;
    const start = ctx.currentTime;
    tone(ctx, start, 2400, 0.12, 'sine', 0.12, 2800);
    tone(ctx, start + 0.16, 2400, 0.14, 'sine', 0.12, 2800);
  });
}

export function playCluePenalty(): void {
  void runningContext().then((ctx) => {
    if (!ctx) return;
    const start = ctx.currentTime;
    const length = Math.floor(ctx.sampleRate * 0.32);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(720, start);
    filter.frequency.exponentialRampToValueAtTime(70, start + 0.32);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.32);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(start);
    tone(ctx, start, 180, 0.28, 'sine', 0.08, 55);
  });
}

function noiseTick(ctx: AudioContext, start: number, duration: number, peak: number) {
  const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(1400, start);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(peak, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(start);
  source.stop(start + duration);
}

/** Crisp mechanical tile tick. */
export function playTileUnlock(): void {
  void runningContext().then((ctx) => {
    if (!ctx) return;
    const start = ctx.currentTime;
    noiseTick(ctx, start, 0.018, 0.22);
    tone(ctx, start, 1860, 0.035, 'square', 0.045, 980);
  });
}

/** Two rapid clicks, like a camera shutter. */
export function playPhotoReveal(): void {
  void runningContext().then((ctx) => {
    if (!ctx) return;
    const start = ctx.currentTime;
    noiseTick(ctx, start, 0.012, 0.2);
    tone(ctx, start, 2400, 0.02, 'square', 0.04);
    noiseTick(ctx, start + 0.045, 0.014, 0.16);
    tone(ctx, start + 0.045, 1500, 0.028, 'square', 0.035);
  });
}

/** C5 → E5 → G5. */
export function playCorrect(): void {
  void runningContext().then((ctx) => {
    if (!ctx) return;
    const start = ctx.currentTime;
    CORRECT_NOTES.forEach((frequency, index) => {
      tone(ctx, start + index * 0.13, frequency, 0.22, 'triangle', 0.1);
    });
  });
}

/** Low double thud. */
export function playIncorrect(): void {
  void runningContext().then((ctx) => {
    if (!ctx) return;
    const start = ctx.currentTime;
    tone(ctx, start, 120, 0.09, 'square', 0.08);
    tone(ctx, start + 0.13, 78, 0.14, 'square', 0.08);
  });
}

export function playUnlockClick(): void {
  playTileUnlock();
}

export function playWrongBuzzer(): void {
  playIncorrect();
}

export function playVictoryFanfare(): void {
  playCorrect();
}

export function triggerHaptic(type: HapticType): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  try {
    const pattern = HAPTIC_PATTERNS[type];
    navigator.vibrate(typeof pattern === 'number' ? pattern : [...pattern]);
  } catch {
    // Some browsers expose vibrate but reject the call.
  }
}
