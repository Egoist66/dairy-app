let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext()
  }
  return ctx
}

export function playComplete() {
  try {
    const c = getCtx()
    const now = c.currentTime

    const notes = [
      { freq: 523.25, time: 0, dur: 0.15 },    // C5
      { freq: 659.25, time: 0.12, dur: 0.15 },  // E5
      { freq: 783.99, time: 0.24, dur: 0.15 },  // G5
      { freq: 1046.50, time: 0.36, dur: 0.4 },  // C6
    ]

    notes.forEach(({ freq, time, dur }) => {
      const osc = c.createOscillator()
      const gain = c.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + time)

      gain.gain.setValueAtTime(0, now + time)
      gain.gain.linearRampToValueAtTime(0.25, now + time + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.01, now + time + dur)

      osc.connect(gain)
      gain.connect(c.destination)
      osc.start(now + time)
      osc.stop(now + time + dur)
    })
  } catch {
    console.warn('Audio not available')
  }
}
