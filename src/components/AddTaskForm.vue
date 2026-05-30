<template>
  <div class="add-task-card">
    <div class="card-header">
      <div class="card-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
      <div>
        <h2 class="card-title">New Task</h2>
        <p class="card-desc">Add a task to track</p>
      </div>
    </div>

    <form @submit.prevent="submit">
      <div class="form-row">
        <div class="form-group flex-1">
          <label for="task-title">Title</label>
          <input id="task-title" v-model="title" type="text" placeholder="What needs to be done?" ref="inputRef" />
        </div>
        <div class="form-group est-group">
          <label for="task-est">Est. min</label>
          <input id="task-est" v-model.number="estimated" type="number" min="1" placeholder="30" />
        </div>
      </div>

      <div class="form-row color-row">
        <div class="form-group flex-1">
          <label for="task-desc">Description</label>
          <textarea id="task-desc" v-model="description" rows="2" placeholder="Optional details..."></textarea>
        </div>
        <div class="form-group color-group">
          <label for="task-color">Color</label>
          <input id="task-color" v-model="color" type="color" />
        </div>
      </div>

      <button type="submit" class="submit-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
          <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
        </svg>
        Add Task
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTaskStore } from '../store/tasks'

const store = useTaskStore()
const inputRef = ref<HTMLInputElement | null>(null)

const title = ref('')
const estimated = ref(0)
const description = ref('')
const color = ref('#f59e0b')

function submit() {
  if (title.value.trim() === '' || estimated.value <= 0) return

  store.add({
    title: title.value.trim(),
    description: description.value.trim() || undefined,
    estimatedMinutes: estimated.value,
    actualTimeSpent: 0,
    color: color.value,
    status: 'todo',
    createdAt: new Date().toISOString().split('T')[0],
  })

  title.value = ''
  estimated.value = 0
  description.value = ''
  color.value = '#f59e0b'
  inputRef.value?.focus()
}
</script>

<style scoped>
.add-task-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-bottom: 1.25rem;
}

.card-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(245, 158, 11, 0.12);
  border-radius: var(--radius-sm);
  color: #fbbf24;
  flex-shrink: 0;
}

.card-icon svg { width: 20px; height: 20px; }

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.card-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.05rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 100px;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.color-row {
  grid-template-columns: 1fr 70px;
}

.color-group input[type="color"] {
  height: 38px;
  padding: 2px !important;
  cursor: pointer;
}

.form-group { margin-bottom: 0.75rem; }
.form-group:last-of-type { margin-bottom: 1rem; }

.form-group label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 0.3rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.6rem 0.8rem;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.88rem;
  font-family: inherit;
  transition: border-color var(--transition);
  outline: none;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--accent-1);
}

.form-group textarea {
  resize: vertical;
  min-height: 50px;
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  width: 100%;
  padding: 0.7rem;
  background: #f59e0b;
  border: none;
  border-radius: var(--radius-sm);
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition);
  font-family: inherit;
}

.submit-btn svg { width: 16px; height: 16px; }
.submit-btn:hover { background: #d97706; }
</style>
