let sharedContext: AudioContext | null = null;

type NavigatorWithAudioSession = Navigator & {
  audioSession?: { type: string };
};

/** A single context is more reliable on mobile browsers than separate contexts per sound engine. */
export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!sharedContext) {
    const AudioContextConstructor = window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextConstructor) sharedContext = new AudioContextConstructor();
  }

  return sharedContext;
}

/** Call directly from a trusted touch/click/key event to satisfy mobile autoplay rules. */
export function unlockAudioContext(): AudioContext | null {
  // Safari on iPhone defaults Web Audio to an ambient session, which can be
  // muted by the device's Ring/Silent setting. The user explicitly enabled
  // sound in the app, so use playback mode where the Audio Session API exists.
  try {
    const audioSession = (navigator as NavigatorWithAudioSession).audioSession;
    if (audioSession) audioSession.type = 'playback';
  } catch {
    // Older browsers do not expose AudioSession; keep the normal Web Audio path.
  }

  const context = getAudioContext();
  if (!context) return null;

  try {
    const buffer = context.createBuffer(1, 1, context.sampleRate);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);
  } catch {
    // Browsers may reject audio while the document is changing state.
  }

  if (context.state !== 'running') void context.resume().catch(() => {});
  return context;
}
