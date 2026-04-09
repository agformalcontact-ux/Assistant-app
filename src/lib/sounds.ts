const playSound = (freq: number, type: OscillatorType = 'sine', duration: number = 0.1) => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + duration);
};

export const sounds = {
  wake: () => {
    playSound(440, 'sine', 0.1);
    setTimeout(() => playSound(880, 'sine', 0.1), 50);
  },
  success: () => {
    playSound(660, 'sine', 0.1);
    setTimeout(() => playSound(990, 'sine', 0.2), 100);
  },
  error: () => {
    playSound(220, 'sawtooth', 0.3);
  }
};
