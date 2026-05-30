import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task } from '../types/task'

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])

  function load() {
    try {
      const raw = localStorage.getItem('tasks')
      if (raw) tasks.value = JSON.parse(raw)
    } catch { 
      console.warn('Failed to load entries from localStorage');
    }
  }

  function save() {
    localStorage.setItem('tasks', JSON.stringify(tasks.value))
  }

  function add(task: Omit<Task, 'id'>) {
    const t: Task = { ...task, id: crypto.randomUUID() }
    tasks.value.push(t)
    save()
  }

  function update(id: string, patch: Partial<Task>) {
    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      tasks.value[idx] = { ...tasks.value[idx], ...patch }
      save()
    }
  }

  function remove(id: string) {
    tasks.value = tasks.value.filter(t => t.id !== id)
    save()
  }

  const todoCount = computed(() => tasks.value.filter(t => t.status === 'todo').length)
  const doneCount = computed(() => tasks.value.filter(t => t.status === 'done').length)

  const totalActualTime = computed(() =>
    tasks.value.reduce((sum, t) => sum + (t.actualTimeSpent || 0), 0)
  )

  const totalEstimated = computed(() =>
    tasks.value.reduce((sum, t) => sum + t.estimatedMinutes, 0)
  )

  const doneActualTime = computed(() =>
    tasks.value.filter(t => t.status === 'done').reduce((sum, t) => sum + (t.actualTimeSpent || 0), 0)
  )

  load()
  return { tasks, add, update, remove, todoCount, doneCount, totalActualTime, totalEstimated, doneActualTime }
})
