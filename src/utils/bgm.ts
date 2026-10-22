// 16-bit Retro RPG Chiptune Procedural Background Music Generator & Audio Player
import { getAudioContext, unlockAudioContext } from './audioContext';

class BgmManager {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.4;
  private masterGain: GainNode | null = null;
  private loopInterval: number | null = null;
  private noteTimeouts: number[] = [];
  private wasInterrupted = false;

  constructor() {
    // Lazy initialized on user gesture
  }

  private initAudio() {
    if (!this.ctx) {
      this.ctx = getAudioContext();
    }
    if (this.ctx && !this.masterGain) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.ctx.addEventListener('statechange', this.handleAudioStateChange);
    }
    if (this.ctx && this.ctx.state !== 'running') {
      this.ctx.resume().catch(() => {});
    }
  }

  /** Resume audio during a trusted user gesture (required by mobile browsers). */
  public unlock() {
    this.ctx = unlockAudioContext();
    if (this.ctx && !this.masterGain) this.initAudio();
  }

  private handleAudioStateChange = () => {
    if (!this.ctx) return;
    if (this.ctx.state !== 'running') {
      this.wasInterrupted = this.isPlaying;
      this.noteTimeouts.forEach((timeout) => clearTimeout(timeout));
      this.noteTimeouts = [];
    } else if (this.isPlaying && this.wasInterrupted) {
      this.wasInterrupted = false;
      this.playMelodyStep(0);
    }
  };

  // Pentatonic & diatonic town theme notes for a cozy 16-bit RPG tavern/inn
  // Frequency in Hz: C4(261.63), D4(293.66), E4(329.63), G4(392.00), A4(440.00), B4(493.88), C5(523.25), D5(587.33), E5(659.25), G5(783.99)
  private playMelodyStep(step: number, bpm: number = 100) {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;

    const beatDuration = 60 / bpm;
    const now = this.ctx.currentTime;

    // Harmonious retro RPG progression (8 bars)
    const melody: { note: number; duration: number }[] = [
      // Bar 1 (C maj)
      { note: 523.25, duration: 1 }, { note: 659.25, duration: 1 }, { note: 783.99, duration: 2 },
      // Bar 2 (A min)
      { note: 880.00, duration: 1 }, { note: 783.99, duration: 1 }, { note: 659.25, duration: 2 },
      // Bar 3 (F maj)
      { note: 698.46, duration: 1.5 }, { note: 659.25, duration: 0.5 }, { note: 587.33, duration: 1 }, { note: 523.25, duration: 1 },
      // Bar 4 (G maj)
      { note: 587.33, duration: 2 }, { note: 783.99, duration: 2 },
      // Bar 5 (C maj)
      { note: 523.25, duration: 1 }, { note: 659.25, duration: 1 }, { note: 880.00, duration: 1 }, { note: 783.99, duration: 1 },
      // Bar 6 (E min)
      { note: 659.25, duration: 1.5 }, { note: 587.33, duration: 0.5 }, { note: 523.25, duration: 2 },
      // Bar 7 (D min)
      { note: 587.33, duration: 1 }, { note: 659.25, duration: 1 }, { note: 587.33, duration: 1 }, { note: 493.88, duration: 1 },
      // Bar 8 (C maj resolution)
      { note: 523.25, duration: 4 },
    ];

    const currentNote = melody[step % melody.length];

    // Play Melody Voice (warm triangle wave with low pass filter)
    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(currentNote.note, now);

    const dur = currentNote.duration * beatDuration;
    noteGain.gain.setValueAtTime(0.001, now);
    noteGain.gain.exponentialRampToValueAtTime(0.24, now + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.001, now + dur * 0.95);

    osc.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + dur);

    // Play Arpeggiated Chime Accompaniment (sine wave)
    const arpNotes = [currentNote.note * 0.5, currentNote.note * 0.75, currentNote.note];
    arpNotes.forEach((f, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const arpOsc = this.ctx.createOscillator();
      const arpGain = this.ctx.createGain();
      arpOsc.type = 'sine';
      arpOsc.frequency.setValueAtTime(f, now + idx * (dur / 4));
      arpGain.gain.setValueAtTime(0.08, now + idx * (dur / 4));
      arpGain.gain.exponentialRampToValueAtTime(0.0001, now + (idx + 1) * (dur / 4));
      arpOsc.connect(arpGain);
      arpGain.connect(this.masterGain);
      arpOsc.start(now + idx * (dur / 4));
      arpOsc.stop(now + (idx + 1) * (dur / 4));
    });

    // Schedule next note
    const nextTimeout = window.setTimeout(() => {
      if (this.isPlaying) {
        this.playMelodyStep(step + 1, bpm);
      }
    }, dur * 1000);
    this.noteTimeouts.push(nextTimeout);
  }

  public async start(): Promise<boolean> {
    this.initAudio();
    if (this.isPlaying) return true;
    if (!this.ctx || !this.masterGain) return false;

    try {
      if (this.ctx.state !== 'running') await this.ctx.resume();
      if (this.ctx.state !== 'running') return false;
      this.isPlaying = true;
      this.wasInterrupted = false;
      this.playMelodyStep(0);
      return true;
    } catch {
      this.isPlaying = false;
      return false;
    }
  }

  public pause() {
    this.isPlaying = false;
    this.noteTimeouts.forEach(t => clearTimeout(t));
    this.noteTimeouts = [];
  }

  public async toggle(): Promise<boolean> {
    if (this.isPlaying) {
      this.pause();
      return false;
    } else {
      return this.start();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const bgmManager = new BgmManager();
