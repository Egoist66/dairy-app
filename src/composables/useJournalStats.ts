import { computed } from 'vue'
import { useJournalStore } from '../store/journal'

export function useJournalStats() {
  const store = useJournalStore()

  const today = new Date().toISOString().split('T')[0]

  const todayEntries = computed(() => store.entriesByDate(today))

  const todayFocus = computed(() =>
    todayEntries.value.length > 0 ? todayEntries.value[0].technology : null
  )

  const todayTime = computed(() =>
    todayEntries.value.reduce((sum, e) => sum + (e.actualTimeSpent || 0), 0)
  )

  const statsVisible = computed(() => store.entries.length > 0)

  return {
    today,
    todayEntries,
    todayFocus,
    todayTime,
    statsVisible,
  }
}
