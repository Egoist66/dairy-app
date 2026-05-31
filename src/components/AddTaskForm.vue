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
        <h2 class="card-title">{{ $t('add_task.title') }}</h2>
        <p class="card-desc">{{ $t('add_task.subtitle') }}</p>
      </div>
    </div>

    <form @submit.prevent="submit">
      <div class="form-row">
        <div class="form-group flex-1">
          <label for="task-title">{{ $t('add_task.title_label') }}</label>
          <input id="task-title" v-model="title" type="text" :placeholder="$t('add_task.title_placeholder')" ref="inputRef" />
        </div>
        <div class="form-group est-group">
          <label for="task-est">{{ $t('add_task.est_min') }}</label>
          <input id="task-est" v-model.number="estimated" type="number" min="1" :placeholder="$t('add_task.est_placeholder')" />
        </div>
      </div>

      <div class="form-row color-row">
        <div class="form-group flex-1">
          <label for="task-desc">{{ $t('add_task.description') }}</label>
          <textarea id="task-desc" v-model="description" rows="2" :placeholder="$t('add_task.desc_placeholder')"></textarea>
        </div>
        <div class="form-group color-group">
          <label for="task-color">{{ $t('add_task.color') }}</label>
          <input id="task-color" v-model="color" type="color" />
        </div>
      </div>

      <div class="form-row-row">
        <div class="form-group">
          <label for="task-priority">{{ $t('add_task.priority') }}</label>
          <select id="task-priority" v-model="priority">
            <option value="low">{{ $t('add_task.priority_low') }}</option>
            <option value="medium">{{ $t('add_task.priority_medium') }}</option>
            <option value="high">{{ $t('add_task.priority_high') }}</option>
            <option value="critical">{{ $t('add_task.priority_critical') }}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="task-due">{{ $t('add_task.due_date') }}</label>
          <input id="task-due" v-model="dueDate" type="date" />
        </div>
      </div>

      <div class="form-group">
        <label>{{ $t('add_task.tags') }}</label>
        <div class="tag-selector">
          <div class="tag-chips">
            <span v-for="tag in selectedTags" :key="tag" class="tag-chip">
              {{ tag }}
              <button type="button" class="tag-remove" @click="removeTag(tag)">&times;</button>
            </span>
          </div>
          <div class="tag-input-row">
            <input v-model="tagInput" type="text" :placeholder="$t('add_task.tag_placeholder')" @keydown.enter.prevent="addTag" @keydown.,.prevent="addTag" />
            <button type="button" class="tag-add-btn" @click="addTag">{{ $t('add_task.add') }}</button>
          </div>
          <div v-if="store.availableTags.length" class="tag-suggestions">
            <button
              v-for="tag in store.availableTags.filter(t => !selectedTags.includes(t))"
              :key="tag"
              type="button"
              class="tag-suggestion"
              @click="selectSuggestion(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </div>
      </div>

      <button type="submit" class="submit-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
          <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
        </svg>
        {{ $t('add_task.add') }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTaskStore } from '../store/tasks'
import type { TaskPriority } from '../types/task'

const emit = defineEmits<{
  added: []
}>()

const store = useTaskStore()
const inputRef = ref<HTMLInputElement | null>(null)

const title = ref('')
const estimated = ref(0)
const description = ref('')
const color = ref('#f59e0b')
const priority = ref<TaskPriority>('medium')
const dueDate = ref('')
const selectedTags = ref<string[]>([])
const tagInput = ref('')

function addTag() {
  const t = tagInput.value.trim().toLowerCase()
  if (t && !selectedTags.value.includes(t)) {
    selectedTags.value.push(t)
    store.addTag(t)
  }
  tagInput.value = ''
}

function removeTag(tag: string) {
  selectedTags.value = selectedTags.value.filter(t => t !== tag)
}

function selectSuggestion(tag: string) {
  if (!selectedTags.value.includes(tag)) {
    selectedTags.value.push(tag)
  }
}

function submit() {
  if (title.value.trim() === '' || estimated.value <= 0) return

  store.add({
    title: title.value.trim(),
    description: description.value.trim() || undefined,
    estimatedMinutes: estimated.value,
    actualTimeSpent: 0,
    color: color.value,
    status: 'todo',
    priority: priority.value,
    tags: [...selectedTags.value],
    dueDate: dueDate.value || undefined,
    checklist: [],
    createdAt: new Date().toISOString().split('T')[0],
  })

  title.value = ''
  estimated.value = 0
  description.value = ''
  color.value = '#f59e0b'
  priority.value = 'medium'
  dueDate.value = ''
  selectedTags.value = []
  tagInput.value = ''
  emit('added')
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

.form-row-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
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
.form-group textarea,
.form-group select {
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

.form-group select {
  cursor: pointer;
  appearance: auto;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: var(--accent-1);
}

.form-group textarea {
  resize: vertical;
  min-height: 50px;
}

.tag-selector {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.5rem;
  background: rgba(59, 130, 246, 0.12);
  color: #60a5fa;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}

.tag-remove {
  background: none;
  border: none;
  color: #60a5fa;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  opacity: 0.6;
}

.tag-remove:hover { opacity: 1; }

.tag-input-row {
  display: flex;
  gap: 0.4rem;
}

.tag-input-row input {
  flex: 1;
  padding: 0.4rem 0.6rem;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.8rem;
  font-family: inherit;
  outline: none;
}

.tag-input-row input:focus { border-color: var(--accent-1); }

.tag-add-btn {
  padding: 0.4rem 0.7rem;
  background: var(--accent-1);
  border: none;
  border-radius: var(--radius-sm);
  color: white;
  font-size: 0.75rem;
  cursor: pointer;
  font-weight: 500;
  font-family: inherit;
  white-space: nowrap;
}

.tag-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.tag-suggestion {
  padding: 0.1rem 0.45rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-muted);
  font-size: 0.7rem;
  cursor: pointer;
  font-family: inherit;
}

.tag-suggestion:hover {
  border-color: var(--accent-1);
  color: var(--accent-1);
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
