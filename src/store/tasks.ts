import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, TaskStatus, ChecklistItem } from '../types/task'
import { PRIORITY_ORDER } from '../types/task'

function createDefaultTags(): string[] {
  try {
    const raw = localStorage.getItem('taskTags')
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

function saveTags(tags: string[]) {
  localStorage.setItem('taskTags', JSON.stringify(tags))
}

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const availableTags = ref<string[]>(createDefaultTags())

  function nextOrder(): number {
    if (tasks.value.length === 0) return 0
    return Math.max(...tasks.value.map(t => t.order ?? 0)) + 1
  }

  function load() {
    try {
      const raw = localStorage.getItem('tasks')
      if (raw) {
        const parsed: Task[] = JSON.parse(raw)
        tasks.value = parsed.map(t => ({
          ...t,
          priority: t.priority ?? 'medium',
          tags: t.tags ?? [],
          dueDate: t.dueDate ?? undefined,
          checklist: t.checklist ?? [],
          order: t.order ?? 0,
        }))
      }
    } catch {
      console.warn('Failed to load tasks from localStorage')
    }
  }

  function save() {
    localStorage.setItem('tasks', JSON.stringify(tasks.value))
  }

  function add(task: Omit<Task, 'id' | 'order'>) {
    const t: Task = { ...task, id: crypto.randomUUID(), order: nextOrder() }
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

  function moveTask(taskId: string, newStatus: TaskStatus, newOrder?: number) {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return
    task.status = newStatus
    if (newOrder !== undefined) {
      task.order = newOrder
    }
    save()
  }

  function addChecklistItem(taskId: string, text: string) {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return
    const item: ChecklistItem = { id: crypto.randomUUID(), text, done: false }
    task.checklist.push(item)
    save()
  }

  function updateChecklistItem(taskId: string, itemId: string, patch: Partial<ChecklistItem>) {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return
    const idx = task.checklist.findIndex(c => c.id === itemId)
    if (idx !== -1) {
      task.checklist[idx] = { ...task.checklist[idx], ...patch }
      save()
    }
  }

  function removeChecklistItem(taskId: string, itemId: string) {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return
    task.checklist = task.checklist.filter(c => c.id !== itemId)
    save()
  }

  function addTag(tag: string) {
    const t = tag.trim().toLowerCase()
    if (t && !availableTags.value.includes(t)) {
      availableTags.value.push(t)
      saveTags(availableTags.value)
    }
  }

  function removeTag(tag: string) {
    availableTags.value = availableTags.value.filter(t => t !== tag)
    saveTags(availableTags.value)
  }

  const todoCount = computed(() => tasks.value.filter(t => t.status === 'todo').length)
  const inProgressCount = computed(() => tasks.value.filter(t => t.status === 'in_progress').length)
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

  const tasksByStatus = computed(() => {
    const groups: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] }
    for (const t of tasks.value) {
      groups[t.status]?.push(t)
    }
    for (const key of Object.keys(groups)) {
      groups[key as TaskStatus].sort((a, b) => {
        const pa = PRIORITY_ORDER[a.priority] ?? 99
        const pb = PRIORITY_ORDER[b.priority] ?? 99
        if (pa !== pb) return pa - pb
        return (a.order ?? 0) - (b.order ?? 0)
      })
    }
    return groups
  })

  load()
  return {
    tasks, availableTags,
    add, update, remove, moveTask,
    addChecklistItem, updateChecklistItem, removeChecklistItem,
    addTag, removeTag,
    todoCount, inProgressCount, doneCount,
    totalActualTime, totalEstimated, doneActualTime,
    tasksByStatus,
  }
})
