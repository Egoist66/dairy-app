import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { JournalEntry } from '../types/journal'

export const useJournalStore = defineStore('journal', () => {
  const entries = ref<JournalEntry[]>([])

  function loadEntries() {
    try {
      const saved = localStorage.getItem('journalEntries')
      if (saved) {
        entries.value = JSON.parse(saved)
      }
    } catch {
      console.warn('Failed to load entries from localStorage')
    }
  }

  function saveEntries() {
    localStorage.setItem('journalEntries', JSON.stringify(entries.value))
  }

  function addEntry(entry: Omit<JournalEntry, 'id'>) {
    const newEntry: JournalEntry = {
      ...entry,
      actualTimeSpent: entry.actualTimeSpent ?? 0,
      id: crypto.randomUUID(),
    }
    entries.value.push(newEntry)
    saveEntries()
  }

  function updateEntry(id: string, updates: Partial<JournalEntry>) {
    const index = entries.value.findIndex(e => e.id === id)
    if (index !== -1) {
      entries.value[index] = { ...entries.value[index], ...updates }
      saveEntries()
    }
  }

  function deleteEntry(id: string) {
    entries.value = entries.value.filter(e => e.id !== id)
    saveEntries()
  }

  const totalTimeSpent = computed(() =>
    entries.value.reduce((sum, e) => sum + e.timeSpent, 0)
  )

  const timeByTechnology = computed(() => {
    const result: Record<string, number> = {}
    entries.value.forEach(e => {
      result[e.technology] = (result[e.technology] || 0) + e.timeSpent
    })
    return result
  })

  const sortedTimeByTechnology = computed(() =>
    Object.entries(timeByTechnology.value)
      .sort(([, a], [, b]) => b - a)
  )

  const totalEntries = computed(() => entries.value.length)

  const totalActualTime = computed(() =>
    entries.value.reduce((sum, e) => sum + (e.actualTimeSpent || 0), 0)
  )

  const actualTimeByTechnology = computed(() => {
    const result: Record<string, number> = {}
    entries.value.forEach(e => {
      const t = e.actualTimeSpent || 0
      if (t > 0) result[e.technology] = (result[e.technology] || 0) + t
    })
    return result
  })

  const sortedActualTimeByTechnology = computed(() =>
    Object.entries(actualTimeByTechnology.value)
      .sort(([, a], [, b]) => b - a)
  )

  function entriesByDate(date: string) {
    return entries.value.filter(e => e.date === date)
  }

  
 

  return {
    entries,
    addEntry,
    loadEntries,
    updateEntry,
    deleteEntry,
    totalTimeSpent,
    totalActualTime,
    timeByTechnology,
    actualTimeByTechnology,
    sortedTimeByTechnology,
    sortedActualTimeByTechnology,
    totalEntries,
    entriesByDate,
  }
})
