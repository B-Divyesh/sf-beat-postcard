import type { Note } from './pattern';

type BrowserWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };

export class PercussionAudio {
  private context: AudioContext | null = null;
  private muted = false;

  get ready(): boolean {
    return this.context?.state === 'running';
  }

  get currentTime(): number {
    return this.context?.currentTime ?? 0;
  }

  setMuted(value: boolean): void {
    this.muted = value;
  }

  async enable(): Promise<boolean> {
    try {
      if (!this.context) {
        const Constructor = window.AudioContext ?? (window as BrowserWindow).webkitAudioContext;
        if (!Constructor) return false;
        this.context = new Constructor();
      }
      if (this.context.state !== 'running') await this.context.resume();
      return this.context.state === 'running';
    } catch {
      return false;
    }
  }

  hit(note: Note, when = this.currentTime + 0.008, accent = false): void {
    const context = this.context;
    if (!context || this.muted) return;
    const level = accent ? 0.34 : 0.25;
    if (note === 0) this.kick(context, when, level);
    if (note === 1) this.clap(context, when, level);
    if (note === 2) this.tick(context, when, level);
    if (note === 3) this.bell(context, when, level);
  }

  click(when = this.currentTime + 0.008): void {
    const context = this.context;
    if (!context || this.muted) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(920, when);
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(0.12, when + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.06);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(when);
    oscillator.stop(when + 0.07);
  }

  private kick(context: AudioContext, when: number, level: number): void {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(145, when);
    oscillator.frequency.exponentialRampToValueAtTime(48, when + 0.18);
    gain.gain.setValueAtTime(level, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.22);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(when);
    oscillator.stop(when + 0.24);
  }

  private clap(context: AudioContext, when: number, level: number): void {
    const length = Math.floor(context.sampleRate * 0.13);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < length; index += 1) data[index] = Math.random() * 2 - 1;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    filter.type = 'bandpass';
    filter.frequency.value = 1450;
    filter.Q.value = 0.7;
    gain.gain.setValueAtTime(level, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.13);
    source.connect(filter).connect(gain).connect(context.destination);
    source.start(when);
  }

  private tick(context: AudioContext, when: number, level: number): void {
    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    oscillator.type = 'square';
    oscillator.frequency.value = 2600;
    filter.type = 'highpass';
    filter.frequency.value = 1900;
    gain.gain.setValueAtTime(level * 0.45, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.045);
    oscillator.connect(filter).connect(gain).connect(context.destination);
    oscillator.start(when);
    oscillator.stop(when + 0.05);
  }

  private bell(context: AudioContext, when: number, level: number): void {
    [520, 780].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(level * (index ? 0.35 : 0.55), when);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.42);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(when);
      oscillator.stop(when + 0.44);
    });
  }
}
