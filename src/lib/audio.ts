const MUTE_KEY = 'shc_muted';

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

export function isSoundMuted(): boolean {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem(MUTE_KEY) === 'true';
}

export function toggleSoundMute(): boolean {
  const muted = !isSoundMuted();
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(MUTE_KEY, muted ? 'true' : 'false');
  }
  if (!muted) void runningContext();
  return muted;
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

export function playWrongBuzzer(): void {
  void runningContext().then((ctx) => {
    if (!ctx) return;
    const start = ctx.currentTime;
    tone(ctx, start, 150, 0.16, 'square', 0.08);
    tone(ctx, start + 0.2, 110, 0.2, 'square', 0.08);
  });
}

export function playVictoryFanfare(): void {
  void runningContext().then((ctx) => {
    if (!ctx) return;
    const start = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((frequency, index) => {
      tone(ctx, start + index * 0.12, frequency, 0.22, 'triangle', 0.1);
    });
  });
}

export function triggerHaptic(pattern: number | number[]): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Some browsers expose vibrate but reject the call.
  }
}
