import { ref, computed } from 'vue'
import { useJournalStore } from '../store/journal'

export type SortField = 'date' | 'technology' | 'timeSpent'
export type SortOrder = 'asc' | 'desc'

export function useJournalFilter() {
  const store = useJournalStore()

  const selectedDate = ref<string | null>(null)
  const searchQuery = ref('')
  const sortField = ref<SortField>('date')
  const sortOrder = ref<SortOrder>('desc')

  const filteredEntries = computed(() => {
    let result = [...store.entries]

    if (selectedDate.value) {
      result = result.filter(e => e.date === selectedDate.value)
    }

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(e =>
        e.technology.toLowerCase().includes(q) ||
        (e.notes && e.notes.toLowerCase().includes(q))
      )
    }

    result.sort((a, b) => {
      let cmp = 0
      if (sortField.value === 'date') {
        cmp = a.date.localeCompare(b.date)
      } else if (sortField.value === 'technology') {
        cmp = a.technology.localeCompare(b.technology)
      } else if (sortField.value === 'timeSpent') {
        cmp = a.timeSpent - b.timeSpent
      }
      return sortOrder.value === 'desc' ? -cmp : cmp
    })

    return result
  })

  function toggleSort(field: SortField) {
    if (sortField.value === field) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortField.value = field
      sortOrder.value = 'desc'
    }
  }

  function clearFilter() {
    selectedDate.value = null
    searchQuery.value = ''
  }

  const hasActiveFilter = computed(() =>
    selectedDate.value !== null || searchQuery.value.trim() !== ''
  )

  return {
    selectedDate,
    searchQuery,
    sortField,
    sortOrder,
    filteredEntries,
    toggleSort,
    clearFilter,
    hasActiveFilter,
  }
}
