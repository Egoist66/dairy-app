<template>
  <div class="tasks-view">
    <div class="view-header">
      <div>
        <h1 class="view-title">Tasks</h1>
        <p class="view-desc">
          {{ store.todoCount }} todo · {{ store.doneCount }} done
        </p>
      </div>
    </div>

    <div class="tasks-layout">
      <aside class="tasks-sidebar">
        <AddTaskForm />
      </aside>

      <section class="tasks-content">
        <div class="tasks-card">
          <div v-if="store.tasks.length === 0" class="empty">
            <p>No tasks yet. Add your first task.</p>
          </div>

          <template v-else>
            <div v-if="selectedIds.size > 0" class="bulk-bar">
              <span class="bulk-count">{{ selectedIds.size }} selected</span>
              <div class="bulk-actions">
                <button class="bulk-btn bulk-done" @click="bulkMarkDone">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Mark Done
                </button>
                <button class="bulk-btn bulk-delete" @click="bulkDelete">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  </svg>
                  Delete
                </button>
                <button class="bulk-btn bulk-clear" @click="clearSelection">Clear</button>
              </div>
            </div>

            <div class="task-list">
              <div
                v-for="task in sortedTasks"
                :key="task.id"
                class="task-row"
                :class="[task.status, { selected: selectedIds.has(task.id) }]"
              >
                <div class="task-left">
                  <label class="select-check" @click.stop>
                    <input
                      type="checkbox"
                      :checked="selectedIds.has(task.id)"
                      @change="toggleSelect(task.id)"
                    />
                    <span class="check-visual"></span>
                  </label>
                  <span class="task-color-dot" :style="{ background: task.color }"></span>
                  <button
                    class="task-check"
                    :class="{ done: task.status === 'done' }"
                    @click="toggleStatus(task)"
                  >
                    <svg v-if="task.status === 'done'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                  <div class="task-info">
                    <span class="task-title" :class="{ crossed: task.status === 'done' }">{{ task.title }}</span>
                    <div class="task-meta">
                      <span v-if="task.description" class="task-desc">{{ task.description }}</span>
                      <span class="task-status-badge" :class="task.status">{{ task.status === 'in_progress' ? 'in progress' : task.status }}</span>
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
                    <span class="timer-plan">{{ task.estimatedMinutes }} min</span>
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
                    title="Mark done"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                  <button
                    class="status-btn edit-btn"
                    @click="openEdit(task)"
                    title="Edit"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
                      <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
                    </svg>
                  </button>
                  <button
                    class="status-btn delete-btn"
                    @click="store.remove(task.id)"
                    title="Delete"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    </svg>
                  </button>
                </div>
              </div>
              </div>
            </div>
          </template>
        </div>
      </section>
    </div>

    <EditTaskModal :task="editingTask" @close="editingTask = null" @saved="editingTask = null" />

    <div v-if="timer.pendingResume.value" class="resume-banner">
      <div class="resume-info">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="resume-icon">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>
          Timer in progress for task —
          <strong class="resume-time">{{ timer.formatTime(timer.pendingResume.value.elapsed) }}</strong> elapsed
        </span>
      </div>
      <div class="resume-actions">
        <button class="resume-btn" @click="resumeTaskTimer">Continue</button>
        <button class="dismiss-btn" @click="timer.dismissResume()">Dismiss</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTaskStore } from '../store/tasks'
import { useStudyTimer } from '../composables/useStudyTimer'
import AddTaskForm from '../components/AddTaskForm.vue'
import EditTaskModal from '../components/EditTaskModal.vue'
import type { Task } from '../types/task'

const store = useTaskStore()
const timer = useStudyTimer()
const editingTask = ref<Task | null>(null)
const selectedIds = ref(new Set<string>())

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

const sortedTasks = computed(() =>
  [...store.tasks].sort((a, b) => {
    const order: Record<string, number> = { todo: 0, in_progress: 1, done: 2 }
    return order[a.status] - order[b.status]
  })
)

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

.tasks-layout {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 1.5rem;
  align-items: start;
}

.tasks-sidebar {
  position: sticky;
  top: 1.5rem;
}

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

.bulk-actions {
  display: flex;
  gap: 0.4rem;
}

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

.bulk-done:hover {
  background: rgba(34, 197, 94, 0.1);
  border-color: var(--success);
  color: var(--success);
}

.bulk-delete:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--danger);
  color: var(--danger);
}

.bulk-clear:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

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

.select-check:hover .check-visual {
  border-color: var(--accent-1);
}

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
}

.task-row.done {
  opacity: 0.6;
}

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

.task-status-badge.todo {
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
}

.task-status-badge.in_progress {
  background: rgba(59, 130, 246, 0.12);
  color: #60a5fa;
}

.task-status-badge.done {
  background: rgba(34, 197, 94, 0.12);
  color: #4ade80;
}

.task-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.task-timer-col {
  min-width: 160px;
}

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

.task-actions {
  display: flex;
  gap: 0.25rem;
}

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

.done-btn:hover {
  background: rgba(34, 197, 94, 0.1);
  border-color: var(--success);
  color: var(--success);
}

.edit-btn:hover {
  background: rgba(245, 158, 11, 0.1);
  border-color: #f59e0b;
  color: #fbbf24;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--danger);
  color: var(--danger);
}

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
  .tasks-layout { grid-template-columns: 1fr; }
  .tasks-sidebar { position: static; }
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
  .task-timer-col {
    min-width: 0;
  }
  .timer-idle {
    flex-wrap: wrap;
  }
  .bulk-bar {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
  .bulk-actions {
    justify-content: center;
  }
  .resume-banner {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    width: calc(100% - 2rem);
    bottom: 0.75rem;
    text-align: center;
  }
  .resume-actions {
    margin-left: 0;
  }
}
</style>
