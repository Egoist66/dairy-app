import { ref, computed } from 'vue'
import { playComplete } from '../utils/audio'

const STORAGE_KEY = 'activeTimer'

interface SavedTimer {
  entryId: string
  startTime: number
  targetSeconds: number
  elapsedBefore: number
}

interface ActiveTimer {
  entryId: string
  startTime: number
  targetSeconds: number
  elapsedBefore: number
}

const activeTimer = ref<ActiveTimer | null>(null)
const elapsedRef = ref(0)
let intervalId: ReturnType<typeof setInterval> | null = null
let onComplete: ((entryId: string, elapsed: number) => void) | null = null

function saveToStorage() {
  if (!activeTimer.value) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  const data: SavedTimer = {
    entryId: activeTimer.value.entryId,
    startTime: activeTimer.value.startTime,
    targetSeconds: activeTimer.value.targetSeconds,
    elapsedBefore: activeTimer.value.elapsedBefore,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function loadFromStorage(): SavedTimer | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function useStudyTimer() {
  const pendingResume = ref<{ entryId: string; elapsed: number; targetSeconds: number } | null>(null)

  function checkPendingResume() {
    const saved = loadFromStorage()
    if (!saved) return

    if (activeTimer.value) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }

    const elapsed = Math.floor((Date.now() - saved.startTime) / 1000)
    if (saved.targetSeconds > 0 && elapsed >= saved.targetSeconds) {
      onComplete?.(saved.entryId, saved.targetSeconds)
      localStorage.removeItem(STORAGE_KEY)
      return
    }

    pendingResume.value = {
      entryId: saved.entryId,
      elapsed: elapsed + saved.elapsedBefore,
      targetSeconds: saved.targetSeconds,
    }
  }

  const runningEntryId = computed(() => activeTimer.value?.entryId ?? null)

  const currentElapsed = computed(() => elapsedRef.value)

  const targetSeconds = computed(() => activeTimer.value?.targetSeconds ?? 0)

  const hasTarget = computed(() => targetSeconds.value > 0)

  function tick() {
    if (!activeTimer.value) return

    elapsedRef.value = activeTimer.value.elapsedBefore + Math.floor((Date.now() - activeTimer.value.startTime) / 1000)

    if (activeTimer.value.targetSeconds > 0 && elapsedRef.value >= activeTimer.value.targetSeconds) {
      const id = activeTimer.value.entryId
      const elapsed = elapsedRef.value
      stop()
      onComplete?.(id, elapsed)
    }
  }

  function start(entryId: string, targetMinutes: number = 0) {
    stop()
    pendingResume.value = null
    activeTimer.value = {
      entryId,
      startTime: Date.now(),
      targetSeconds: targetMinutes * 60,
      elapsedBefore: 0,
    }
    elapsedRef.value = 0
    saveToStorage()
    intervalId = setInterval(tick, 1000)
  }

  function resume(entryId: string, elapsedSeconds: number, targetMinutes: number) {
    stop()
    pendingResume.value = null
    activeTimer.value = {
      entryId,
      startTime: Date.now(),
      targetSeconds: targetMinutes * 60,
      elapsedBefore: elapsedSeconds,
    }
    elapsedRef.value = elapsedSeconds
    saveToStorage()
    intervalId = setInterval(tick, 1000)
  }

  function stop(): number {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }

    const elapsed = elapsedRef.value
    activeTimer.value = null
    elapsedRef.value = 0
    localStorage.removeItem(STORAGE_KEY)

    if (elapsed > 0) {
      playComplete()
    }

    return elapsed
  }

  function dismissResume() {
    pendingResume.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  function isRunning(entryId: string): boolean {
    return activeTimer.value?.entryId === entryId
  }

  function setOnComplete(cb: (entryId: string, elapsed: number) => void) {
    onComplete = cb
    checkPendingResume()
  }

  function formatTime(totalSeconds: number): string {
    if (totalSeconds <= 0) return '0:00:00'
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return `${String(h)}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  function formatShort(totalSeconds: number): string {
    if (totalSeconds <= 0) return '0s'
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    const parts: string[] = []
    if (h > 0) parts.push(`${h}h`)
    if (m > 0) parts.push(`${m}m`)
    if (s > 0 || parts.length === 0) parts.push(`${s}s`)
    return parts.join(' ')
  }

  return {
    runningEntryId,
    currentElapsed,
    targetSeconds,
    hasTarget,
    pendingResume,
    start,
    resume,
    stop,
    dismissResume,
    isRunning,
    setOnComplete,
    formatTime,
    formatShort,
  }
}
