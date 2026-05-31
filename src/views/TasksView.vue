<template>
  <div class="tasks-view">
    <div class="view-header">
      <div class="view-header-top">
        <div>
          <h1 class="view-title">{{ $t('page.tasks.title') }}</h1>
          <p class="view-desc">
            {{ store.todoCount }} {{ $t('page.tasks.todo') }} · {{ store.inProgressCount }} {{ $t('page.tasks.in_progress') }} · {{ store.doneCount }} {{ $t('page.tasks.done') }}
          </p>
        </div>
        <div class="view-controls">
          <div class="search-bar">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input v-model="searchQuery" type="text" :placeholder="$t('page.tasks.search_placeholder')" />
          </div>
          <div class="view-toggle">
            <button class="toggle-btn" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'" :title="$t('page.tasks.list_view')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
            <button class="toggle-btn" :class="{ active: viewMode === 'board' }" @click="viewMode = 'board'" :title="$t('page.tasks.board_view')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="filter-bar">
        <select v-model="filterStatus" class="filter-select">
          <option value="all">{{ $t('page.tasks.all_statuses') }}</option>
          <option value="todo">{{ $t('page.tasks.todo') }}</option>
          <option value="in_progress">{{ $t('page.tasks.in_progress') }}</option>
          <option value="done">{{ $t('page.tasks.done') }}</option>
        </select>
        <select v-model="filterPriority" class="filter-select">
          <option value="all">{{ $t('page.tasks.all_priorities') }}</option>
          <option value="critical">{{ $t('page.tasks.priority_critical') }}</option>
          <option value="high">{{ $t('page.tasks.priority_high') }}</option>
          <option value="medium">{{ $t('page.tasks.priority_medium') }}</option>
          <option value="low">{{ $t('page.tasks.priority_low') }}</option>
        </select>
        <select v-model="filterTag" class="filter-select">
          <option value="all">{{ $t('page.tasks.all_tags') }}</option>
          <option v-for="tag in store.availableTags" :key="tag" :value="tag">{{ tag }}</option>
        </select>
        <button v-if="hasActiveFilters" class="clear-filters-btn" @click="clearFilters">{{ $t('page.tasks.clear_filters') }}</button>
      </div>

      <div v-if="store.availableTags.length" class="tags-manage-row">
        <span class="tags-manage-label">{{ $t('page.tasks.tags') }}</span>
        <span v-for="tag in store.availableTags" :key="tag" class="tag-manage-pill">
          <button class="tag-manage-remove" @click="store.removeTag(tag)" :title="$t('page.tasks.delete_tag')">&times;</button>
          {{ tag }}
        </span>
      </div>
    </div>

    <div class="tasks-actions-bar">
      <button class="add-btn" @click="showAddModal = true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        {{ $t('add_task.title') }}
      </button>
    </div>

    <section class="tasks-content">
        <div v-if="viewMode === 'list'">
          <div class="tasks-card">
            <div v-if="filteredTasks.length === 0" class="empty">
              <p>{{ $t('page.tasks.empty') }}</p>
            </div>

            <div v-else>
              <div v-if="selectedIds.size > 0" class="bulk-bar">
                <span class="bulk-count">{{ selectedIds.size }} {{ $t('page.tasks.selected') }}</span>
                <div class="bulk-actions">
                  <button class="bulk-btn bulk-done" @click="bulkMarkDone">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {{ $t('page.tasks.mark_done') }}
                  </button>
                  <button class="bulk-btn bulk-delete" @click="bulkDelete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    </svg>
                    {{ $t('page.tasks.delete') }}
                  </button>
                  <button class="bulk-btn bulk-clear" @click="clearSelection">{{ $t('page.tasks.clear') }}</button>
                </div>
              </div>

              <div class="task-list">
                <div
                  v-for="task in filteredTasks"
                  :key="task.id"
                  class="task-row"
                  :class="[task.status, { selected: selectedIds.has(task.id) }]"
                  draggable="true"
                  @dragstart="onDragStart($event, task)"
                  @dragover.prevent
                  @drop.prevent="onDrop($event, task, undefined)"
                >
                  <div class="task-left">
                    <label class="select-check" @click.stop>
                      <input type="checkbox" :checked="selectedIds.has(task.id)" @change="toggleSelect(task.id)" />
                      <span class="check-visual"></span>
                    </label>
                    <span class="task-color-dot" :style="{ background: task.color }"></span>
                    <button class="task-check" :class="{ done: task.status === 'done' }" @click="toggleStatus(task)">
                      <svg v-if="task.status === 'done'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                    <div class="task-info">
                      <div class="task-title-row">
                        <span class="task-title" :class="{ crossed: task.status === 'done' }">{{ task.title }}</span>
                        <span class="priority-badge" :class="task.priority">{{ $t('page.tasks.prio_' + task.priority) }}</span>
                        <span v-if="task.dueDate" class="due-badge" :class="{ overdue: isOverdue(task.dueDate) && task.status !== 'done' }">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          {{ task.dueDate }}
                        </span>
                      </div>
                      <div class="task-meta">
                        <span v-if="task.description" class="task-desc">{{ task.description }}</span>
                        <span class="task-status-badge" :class="task.status">{{ $t('page.tasks.' + task.status) }}</span>
                      </div>
                      <div v-if="task.tags && task.tags.length" class="task-tags">
                        <span v-for="tag in task.tags" :key="tag" class="tag-pill">{{ tag }}</span>
                      </div>
                      <div v-if="task.checklist && task.checklist.length" class="checklist-progress">
                        <div class="checklist-bar-bg">
                          <div class="checklist-bar-fill" :style="{ width: checklistPercent(task) + '%' }"></div>
                        </div>
                        <span class="checklist-text">{{ checklistDone(task) }}/{{ task.checklist.length }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="task-right">
                    <div class="task-timer-col">
                      <div v-if="timer.isRunning(task.id)" class="timer-running">
                        <div class="timer-display">
                          <svg class="timer-icon pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                          </svg>
                          <span class="timer-value">{{ timer.formatTime(timer.currentElapsed.value) }}</span>
                          <span class="timer-sep">/</span>
                          <span class="timer-target">{{ timer.formatTime(timer.targetSeconds.value) }}</span>
                        </div>
                        <button class="timer-stop-btn" @click="stopTaskTimer(task)">
                          <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1" /></svg>
                        </button>
                      </div>
                      <div v-else class="timer-idle">
                        <button class="timer-start-btn" @click="startTaskTimer(task)">
                          <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                        </button>
                        <span class="timer-plan">{{ task.estimatedMinutes }} {{ $t('page.tasks.min') }}</span>
                        <template v-if="task.actualTimeSpent">
                          <span class="timer-sep-dot">·</span>
                          <span class="timer-actual">{{ timer.formatShort(task.actualTimeSpent) }}</span>
                        </template>
                      </div>
                    </div>

                    <div class="task-actions">
                      <button
                        v-if="task.status !== 'done'"
                        class="status-btn done-btn"
                        @click="store.update(task.id, { status: 'done' })"
                        :title="$t('page.tasks.mark_done_title')"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </button>
                      <button class="status-btn edit-btn" @click="openEdit(task)" :title="$t('page.tasks.edit')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
                          <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
                        </svg>
                      </button>
                      <button class="status-btn delete-btn" @click="confirmDelete(task)" :title="$t('page.tasks.delete_title')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else>
          <div class="board">
            <div
              v-for="col in columns" :key="col.status"
              class="board-column"
              @dragover.prevent="() => {}"
              @drop.prevent="onDrop($event, undefined, col.status)"
            >
              <div class="board-col-header" :class="col.status">
                <span class="board-col-dot"></span>
                <h3 class="board-col-title">{{ $t('page.tasks.' + col.status) }}</h3>
                <span class="board-col-count">{{ col.tasks.length }}</span>
              </div>
              <div class="board-col-body">
                <div
                  v-for="task in col.tasks"
                  :key="task.id"
                  class="board-card"
                  :class="task.status"
                  draggable="true"
                  @dragstart="onDragStart($event, task)"
                  @dragend="onDragEnd"
                >
                  <div class="board-card-top">
                    <span class="priority-badge" :class="task.priority">{{ $t('page.tasks.prio_' + task.priority) }}</span>
                    <button class="board-card-menu" @click="openEdit(task)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
                      </svg>
                    </button>
                  </div>
                  <div class="board-card-title" :class="{ crossed: task.status === 'done' }">{{ task.title }}</div>
                  <div v-if="task.description" class="board-card-desc">{{ task.description }}</div>
                  <div v-if="task.tags && task.tags.length" class="board-card-tags">
                    <span v-for="tag in task.tags" :key="tag" class="tag-pill">{{ tag }}</span>
                  </div>
                  <div v-if="task.dueDate" class="board-card-due" :class="{ overdue: isOverdue(task.dueDate) && task.status !== 'done' }">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {{ task.dueDate }}
                  </div>
                  <div v-if="task.checklist && task.checklist.length" class="board-card-checklist">
                    <div class="checklist-bar-bg">
                      <div class="checklist-bar-fill" :style="{ width: checklistPercent(task) + '%' }"></div>
                    </div>
                    <span class="checklist-text">{{ checklistDone(task) }}/{{ task.checklist.length }}</span>
                  </div>
                  <div class="board-card-footer">
                    <span class="board-card-time">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      {{ task.estimatedMinutes }}m
                    </span>
                    <div class="board-card-actions">
                      <button class="board-action-btn" :class="{ done: task.status === 'done' }" @click="toggleStatus(task)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </button>
                      <button class="board-action-btn danger" @click="confirmDelete(task)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    <Teleport to="body">
      <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ $t('add_task.title') }}</h3>
            <button class="modal-close" @click="showAddModal = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <AddTaskForm @added="showAddModal = false" />
        </div>
      </div>
    </Teleport>

    <EditTaskModal :task="editingTask" @close="editingTask = null" @saved="editingTask = null" />

    <DeleteConfirmModal
      :visible="deletingTask !== null"
      :title="$t('delete.title_task')"
      :message="`${$t('delete.confirm_task')} «${deletingTask?.title}»?`"
      @cancel="deletingTask = null"
      @confirm="doDelete"
    />

    <div v-if="timer.pendingResume.value" class="resume-banner">
      <div class="resume-info">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="resume-icon">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>
          {{ $t('page.tasks.timer_in_progress') }}
          <strong class="resume-time">{{ timer.formatTime(timer.pendingResume.value.elapsed) }}</strong> {{ $t('page.tasks.elapsed') }}
        </span>
      </div>
      <div class="resume-actions">
        <button class="resume-btn" @click="resumeTaskTimer">{{ $t('page.tasks.continue') }}</button>
        <button class="dismiss-btn" @click="timer.dismissResume()">{{ $t('page.tasks.dismiss') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTaskStore } from '../store/tasks'
import { useStudyTimer } from '../composables/useStudyTimer'
import AddTaskForm from '../components/AddTaskForm.vue'
import EditTaskModal from '../components/EditTaskModal.vue'
import DeleteConfirmModal from '../components/DeleteConfirmModal.vue'
import type { Task, TaskStatus } from '../types/task'
import { PRIORITY_ORDER } from '../types/task'

const store = useTaskStore()
const timer = useStudyTimer()
const editingTask = ref<Task | null>(null)
const deletingTask = ref<Task | null>(null)
const selectedIds = ref(new Set<string>())
const searchQuery = ref('')
const filterStatus = ref('all')
const filterPriority = ref('all')
const filterTag = ref('all')
const viewMode = ref<'list' | 'board'>('list')
const draggedTask = ref<Task | null>(null)
const showAddModal = ref(false)

try {
  const savedView = localStorage.getItem('taskViewMode')
  if (savedView === 'list' || savedView === 'board') viewMode.value = savedView
} catch {}

watch(viewMode, (v) => {
  localStorage.setItem('taskViewMode', v)
})

const hasActiveFilters = computed(() =>
  searchQuery.value || filterStatus.value !== 'all' || filterPriority.value !== 'all' || filterTag.value !== 'all'
)

function clearFilters() {
  searchQuery.value = ''
  filterStatus.value = 'all'
  filterPriority.value = 'all'
  filterTag.value = 'all'
}

const filteredTasks = computed(() => {
  let result = [...store.tasks]

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.tags && t.tags.some(tag => tag.includes(q)))
    )
  }

  if (filterStatus.value !== 'all') {
    result = result.filter(t => t.status === filterStatus.value)
  }

  if (filterPriority.value !== 'all') {
    result = result.filter(t => t.priority === filterPriority.value)
  }

  if (filterTag.value !== 'all') {
    result = result.filter(t => t.tags && t.tags.includes(filterTag.value))
  }

  result.sort((a, b) => {
    const sa = STATUS_ORDER[a.status]
    const sb = STATUS_ORDER[b.status]
    if (sa !== sb) return sa - sb
    const pa = PRIORITY_ORDER[a.priority] ?? 99
    const pb = PRIORITY_ORDER[b.priority] ?? 99
    if (pa !== pb) return pa - pb
    return (a.order ?? 0) - (b.order ?? 0)
  })

  return result
})

const STATUS_ORDER: Record<string, number> = { todo: 0, in_progress: 1, done: 2 }

const columns = computed(() => {
  const statuses: TaskStatus[] = ['todo', 'in_progress', 'done']

  const all = store.tasks
  let filtered = all
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    filtered = all.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.tags && t.tags.some(tag => tag.includes(q)))
    )
  }
  if (filterPriority.value !== 'all') {
    filtered = filtered.filter(t => t.priority === filterPriority.value)
  }
  if (filterTag.value !== 'all') {
    filtered = filtered.filter(t => t.tags && t.tags.includes(filterTag.value))
  }

  return statuses.map(status => {
    const tasks = filtered
      .filter(t => t.status === status)
      .sort((a, b) => {
        const pa = PRIORITY_ORDER[a.priority] ?? 99
        const pb = PRIORITY_ORDER[b.priority] ?? 99
        if (pa !== pb) return pa - pb
        return (a.order ?? 0) - (b.order ?? 0)
      })
    return { status, tasks }
  })
})

function isOverdue(dueDate: string): boolean {
  if (!dueDate) return false
  const today = new Date().toISOString().split('T')[0]
  return dueDate < today
}

function checklistDone(task: Task): number {
  return task.checklist ? task.checklist.filter(c => c.done).length : 0
}

function checklistPercent(task: Task): number {
  if (!task.checklist || task.checklist.length === 0) return 0
  return Math.round((checklistDone(task) / task.checklist.length) * 100)
}

function toggleSelect(id: string) {
  const s = selectedIds.value
  if (s.has(id)) s.delete(id); else s.add(id)
  selectedIds.value = new Set(s)
}

function clearSelection() {
  selectedIds.value = new Set()
}

function bulkMarkDone() {
  selectedIds.value.forEach(id => store.update(id, { status: 'done' }))
  clearSelection()
}

function bulkDelete() {
  selectedIds.value.forEach(id => store.remove(id))
  clearSelection()
}

function openEdit(task: Task) {
  editingTask.value = task
}

function confirmDelete(task: Task) {
  deletingTask.value = task
}

function doDelete() {
  if (deletingTask.value) {
    store.remove(deletingTask.value.id)
    deletingTask.value = null
  }
}

function toggleStatus(task: Task) {
  if (task.status === 'done') {
    store.update(task.id, { status: 'todo' })
  } else {
    store.update(task.id, { status: 'done' })
  }
}

function startTaskTimer(task: Task) {
  const remaining = Math.max(1, task.estimatedMinutes * 60 - (task.actualTimeSpent || 0))
  timer.start(task.id, Math.ceil(remaining / 60))
}

function stopTaskTimer(task: Task) {
  const elapsed = timer.stop()
  if (elapsed > 0) {
    store.update(task.id, {
      actualTimeSpent: (task.actualTimeSpent || 0) + elapsed,
    })
  }
}

function resumeTaskTimer() {
  const p = timer.pendingResume.value
  if (!p) return
  const task = store.tasks.find(t => t.id === p.entryId)
  if (!task) { timer.dismissResume(); return }
  const remaining = Math.max(1, task.estimatedMinutes * 60 - (task.actualTimeSpent || 0))
  timer.resume(p.entryId, p.elapsed, Math.ceil(remaining / 60))
}

timer.setOnComplete((id, elapsed) => {
  const task = store.tasks.find(t => t.id === id)
  if (task) {
    store.update(id, { actualTimeSpent: (task.actualTimeSpent || 0) + elapsed })
  }
})

function onDragStart(event: DragEvent, task: Task) {
  draggedTask.value = task
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', task.id)
  }
}

function onDragEnd() {
  draggedTask.value = null
}

function onDrop(event: DragEvent, targetTask: Task | undefined, targetStatus: TaskStatus | undefined) {
  const taskId = event.dataTransfer?.getData('text/plain')
  if (!taskId) return

  const task = store.tasks.find(t => t.id === taskId)
  if (!task) return

  let newStatus: TaskStatus
  let newOrder: number | undefined

  if (targetStatus) {
    newStatus = targetStatus
  } else if (targetTask) {
    newStatus = targetTask.status
  } else {
    return
  }

  if (targetTask && targetTask.id !== taskId) {
    newOrder = targetTask.order !== undefined ? targetTask.order + 0.5 : undefined
  }

  store.moveTask(taskId, newStatus, newOrder)
  draggedTask.value = null
}
</script>

<style scoped>
.tasks-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  animation: fadeIn 0.3s ease;
}

.view-header {
  margin-bottom: 1.5rem;
}

.view-header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.view-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.view-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.15rem;
}

.view-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.65rem;
  width: 16px;
  height: 16px;
  color: var(--text-muted);
  pointer-events: none;
}

.search-bar input {
  width: 220px;
  padding: 0.45rem 0.75rem 0.45rem 2.1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.82rem;
  font-family: inherit;
  outline: none;
  transition: border-color var(--transition);
}

.search-bar input:focus {
  border-color: var(--accent-1);
}

.search-bar input::placeholder {
  color: var(--text-muted);
}

.view-toggle {
  display: flex;
  gap: 2px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 2px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 4px;
  transition: all var(--transition);
}

.toggle-btn svg { width: 14px; height: 14px; }

.toggle-btn.active {
  background: var(--accent-1);
  color: white;
}

.toggle-btn:not(.active):hover {
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.04);
}

.filter-bar {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.35rem 0.6rem;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-family: inherit;
  cursor: pointer;
  outline: none;
  appearance: auto;
}

.filter-select:focus {
  border-color: var(--accent-1);
}

.clear-filters-btn {
  padding: 0.35rem 0.7rem;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--accent-1);
  font-size: 0.78rem;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition);
}

.clear-filters-btn:hover {
  background: rgba(59, 130, 246, 0.08);
  border-color: var(--accent-1);
}

.tags-manage-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0 0;
  flex-wrap: wrap;
}

.tags-manage-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-right: 0.2rem;
}

.tag-manage-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  padding: 0.15rem 0.5rem 0.15rem 0.2rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.72rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.tag-manage-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 3px;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  transition: all var(--transition);
}

.tag-manage-remove:hover {
  background: rgba(239, 68, 68, 0.15);
  color: var(--danger);
}

.tasks-actions-bar {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 1rem;
  background: var(--accent-1);
  border: none;
  border-radius: var(--radius-sm);
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: background var(--transition);
}

.add-btn svg { width: 16px; height: 16px; }
.add-btn:hover { background: #2563eb; }

.tasks-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
}

.bulk-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.75rem;
  background: rgba(59, 130, 246, 0.06);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: var(--radius-md);
}

.bulk-count {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--accent-1);
}

.bulk-actions { display: flex; gap: 0.4rem; }

.bulk-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.6rem;
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-family: inherit;
  transition: all var(--transition);
}

.bulk-btn svg { width: 13px; height: 13px; }

.bulk-done:hover { background: rgba(34, 197, 94, 0.1); border-color: var(--success); color: var(--success); }
.bulk-delete:hover { background: rgba(239, 68, 68, 0.1); border-color: var(--danger); color: var(--danger); }
.bulk-clear:hover { background: rgba(255, 255, 255, 0.05); color: var(--text-primary); }

.select-check {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
}

.select-check input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.check-visual {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 2px solid var(--border);
  background: transparent;
  transition: all var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.select-check input:checked + .check-visual {
  background: var(--accent-1);
  border-color: var(--accent-1);
}

.select-check input:checked + .check-visual::after {
  content: '';
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  margin-top: -1px;
}

.select-check:hover .check-visual { border-color: var(--accent-1); }

.task-row.selected {
  border-color: var(--accent-1);
  background: rgba(59, 130, 246, 0.04);
}

.empty {
  text-align: center;
  padding: 2.5rem;
  color: var(--text-muted);
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.task-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  transition: border-color var(--transition);
  cursor: default;
}

.task-row:active { cursor: grabbing; }

.task-row.dragging { opacity: 0.4; }

.task-row.done { opacity: 0.6; }

.task-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.task-color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.task-check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--border);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition);
}

.task-check svg { width: 12px; height: 12px; }
.task-check:hover { border-color: var(--accent-1); }

.task-check.done {
  background: var(--success);
  border-color: var(--success);
  color: white;
}

.task-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
  flex: 1;
}

.task-title-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.task-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-title.crossed {
  text-decoration: line-through;
  color: var(--text-muted);
}

.priority-badge {
  display: inline-block;
  padding: 0 0.35rem;
  border-radius: 4px;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.6;
}

.priority-badge.critical { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
.priority-badge.high { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
.priority-badge.medium { background: rgba(59, 130, 246, 0.12); color: #60a5fa; }
.priority-badge.low { background: rgba(148, 163, 184, 0.12); color: #94a3b8; }

.due-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.68rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.due-badge svg { width: 11px; height: 11px; }

.due-badge.overdue {
  color: var(--danger);
  font-weight: 600;
}

.task-desc {
  font-size: 0.78rem;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.1rem;
}

.task-status-badge {
  display: inline-block;
  padding: 0.05rem 0.4rem;
  border-radius: 8px;
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: capitalize;
  letter-spacing: 0.02em;
  line-height: 1.4;
}

.task-status-badge.todo { background: rgba(245, 158, 11, 0.12); color: #fbbf24; }
.task-status-badge.in_progress { background: rgba(59, 130, 246, 0.12); color: #60a5fa; }
.task-status-badge.done { background: rgba(34, 197, 94, 0.12); color: #4ade80; }

.task-tags {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
  margin-top: 0.15rem;
}

.tag-pill {
  display: inline-block;
  padding: 0.05rem 0.45rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 0.65rem;
  color: var(--text-muted);
  font-weight: 500;
}

.checklist-progress {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.2rem;
}

.checklist-bar-bg {
  flex: 1;
  max-width: 100px;
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  overflow: hidden;
}

.checklist-bar-fill {
  height: 100%;
  background: var(--accent-1);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.checklist-text {
  font-size: 0.68rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.task-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.task-timer-col { min-width: 160px; }

.timer-idle {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  white-space: nowrap;
}

.timer-start-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition);
}

.timer-start-btn svg { width: 11px; height: 11px; }

.timer-start-btn:hover {
  border-color: var(--accent-1);
  color: var(--accent-1);
  background: rgba(59, 130, 246, 0.06);
}

.timer-plan { font-size: 0.75rem; color: var(--text-muted); }
.timer-sep-dot { color: var(--text-muted); font-size: 0.7rem; }
.timer-actual { font-size: 0.75rem; color: var(--accent-1); font-weight: 500; }

.timer-running {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.timer-display {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.15rem 0.5rem;
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid #22c55e;
  border-radius: 4px;
}

.timer-icon.pulse { color: #4ade80; animation: spin 2s linear infinite; }
.timer-icon { width: 12px; height: 12px; }

@keyframes spin { to { transform: rotate(360deg); } }

.timer-value {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  font-weight: 600;
  color: #4ade80;
  min-width: 62px;
  text-align: center;
}

.timer-sep { color: rgba(74, 222, 128, 0.4); font-size: 0.75rem; }

.timer-target {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: rgba(74, 222, 128, 0.6);
  font-weight: 500;
}

.timer-stop-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 4px;
  background: transparent;
  color: var(--danger);
  cursor: pointer;
  transition: all var(--transition);
}

.timer-stop-btn svg { width: 11px; height: 11px; }

.timer-stop-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--danger);
}

.task-actions { display: flex; gap: 0.25rem; }

.status-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition);
}

.status-btn svg { width: 14px; height: 14px; }

.done-btn:hover { background: rgba(34, 197, 94, 0.1); border-color: var(--success); color: var(--success); }
.edit-btn:hover { background: rgba(245, 158, 11, 0.1); border-color: #f59e0b; color: #fbbf24; }
.delete-btn:hover { background: rgba(239, 68, 68, 0.1); border-color: var(--danger); color: var(--danger); }

/* Board View */
.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  min-height: 400px;
}

.board-column {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  min-height: 300px;
  transition: background var(--transition);
}

.board-column[dragover] {
  background: rgba(59, 130, 246, 0.04);
  border-color: var(--accent-1);
}

.board-col-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--border);
}

.board-col-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.board-col-header.todo .board-col-dot { background: #fbbf24; }
.board-col-header.in_progress .board-col-dot { background: #60a5fa; }
.board-col-header.done .board-col-dot { background: #4ade80; }

.board-col-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin: 0;
  flex: 1;
}

.board-col-count {
  font-size: 0.75rem;
  color: var(--text-muted);
  background: var(--bg-primary);
  padding: 0.1rem 0.45rem;
  border-radius: 6px;
  font-weight: 600;
}

.board-col-body {
  padding: 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  flex: 1;
}

.board-card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  cursor: grab;
  transition: all var(--transition);
}

.board-card:active { cursor: grabbing; }
.board-card:hover { border-color: var(--border-hover); }

.board-card.done { opacity: 0.65; }

.board-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.35rem;
}

.board-card-menu {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 4px;
  opacity: 0;
  transition: all var(--transition);
}

.board-card:hover .board-card-menu { opacity: 1; }

.board-card-menu svg { width: 16px; height: 16px; }

.board-card-menu:hover {
  background: var(--surface);
  color: var(--text-primary);
}

.board-card-title {
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  line-height: 1.3;
}

.board-card-title.crossed {
  text-decoration: line-through;
  color: var(--text-muted);
}

.board-card-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.4rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.board-card-tags {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  margin-bottom: 0.35rem;
}

.board-card-tags .tag-pill {
  font-size: 0.6rem;
  padding: 0 0.35rem;
}

.board-card-due {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.68rem;
  color: var(--text-muted);
  margin-bottom: 0.35rem;
}

.board-card-due svg { width: 11px; height: 11px; }

.board-card-due.overdue {
  color: var(--danger);
  font-weight: 600;
}

.board-card-checklist {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.45rem;
}

.board-card-checklist .checklist-bar-bg { max-width: 60px; }

.board-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.4rem;
  border-top: 1px solid var(--border);
}

.board-card-time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  color: var(--text-muted);
}

.board-card-time svg { width: 11px; height: 11px; }

.board-card-actions {
  display: flex;
  gap: 0.2rem;
}

.board-action-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition);
}

.board-action-btn svg { width: 12px; height: 12px; }

.board-action-btn.done { border-color: transparent; }
.board-action-btn.done:hover { background: rgba(34, 197, 94, 0.1); border-color: var(--success); color: var(--success); }
.board-action-btn.danger:hover { background: rgba(239, 68, 68, 0.1); border-color: var(--danger); color: var(--danger); }

.resume-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--accent-1);
}

.resume-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.resume-time {
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.resume-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.resume-banner {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow);
  z-index: 100;
  font-size: 0.85rem;
  color: var(--text-secondary);
  animation: fadeIn 0.3s ease;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.15s ease;
  padding: 1rem;
}

.modal-content {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  width: 100%;
  max-width: 520px;
  box-shadow: var(--shadow);
  animation: scaleIn 0.2s ease;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.modal-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-close {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition);
}

.modal-close svg { width: 15px; height: 15px; }
.modal-close:hover { background: var(--surface); color: var(--text-primary); }

.resume-btn {
  padding: 0.35rem 0.85rem;
  background: var(--accent-1);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: background var(--transition);
}

.resume-btn:hover { background: #2563eb; }

.dismiss-btn {
  padding: 0.35rem 0.65rem;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-size: 0.82rem;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition);
}

.dismiss-btn:hover { border-color: var(--border-hover); color: var(--text-secondary); }

@media (max-width: 1024px) {
  .tasks-view { padding: 1rem; }
  .board { grid-template-columns: 1fr; }
  .view-header-top { flex-direction: column; }
  .view-controls { width: 100%; }
  .search-bar { flex: 1; }
  .search-bar input { width: 100%; }
}

@media (max-width: 640px) {
  .tasks-view { padding: 0.75rem; }
  .task-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.6rem 0.75rem;
  }
  .task-right {
    width: 100%;
    justify-content: space-between;
  }
  .task-timer-col { min-width: 0; }
  .timer-idle { flex-wrap: wrap; }
  .bulk-bar { flex-direction: column; gap: 0.5rem; align-items: stretch; }
  .bulk-actions { justify-content: center; }
  .filter-bar { flex-direction: column; }
  .filter-select { width: 100%; }
  .resume-banner {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    width: calc(100% - 2rem);
    bottom: 0.75rem;
    text-align: center;
  }
  .resume-actions { margin-left: 0; }
}
</style>
