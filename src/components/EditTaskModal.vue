<template>
  <Teleport to="body">
    <div v-if="task" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ $t('edit_task.title') }}</h3>
          <button class="modal-close" @click="emit('close')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSave">
          <div class="form-group">
            <label for="edit-task-title">{{ $t('edit_task.title_label') }}</label>
            <input id="edit-task-title" v-model="form.title" type="text" required />
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label for="edit-task-desc">{{ $t('edit_task.description') }}</label>
              <textarea id="edit-task-desc" v-model="form.description" rows="2" :placeholder="$t('edit_task.desc_placeholder')"></textarea>
            </div>
            <div class="form-group color-group">
              <label for="edit-task-color">{{ $t('edit_task.color') }}</label>
              <input id="edit-task-color" v-model="form.color" type="color" />
            </div>
          </div>

          <div class="form-row-row">
            <div class="form-group">
              <label for="edit-task-est">{{ $t('edit_task.estimated') }}</label>
              <input id="edit-task-est" v-model.number="form.estimatedMinutes" type="number" min="1" required />
            </div>
            <div class="form-group">
              <label for="edit-task-actual">{{ $t('edit_task.actual_time') }}</label>
              <input id="edit-task-actual" v-model.number="form.actualTimeSpent" type="number" min="0" required />
            </div>
            <div class="form-group">
              <label for="edit-task-status">{{ $t('edit_task.status') }}</label>
              <select id="edit-task-status" v-model="form.status">
                <option value="todo">{{ $t('edit_task.status_todo') }}</option>
                <option value="in_progress">{{ $t('edit_task.status_in_progress') }}</option>
                <option value="done">{{ $t('edit_task.status_done') }}</option>
              </select>
            </div>
          </div>

          <div class="form-row-row">
            <div class="form-group">
              <label for="edit-task-priority">{{ $t('edit_task.priority') }}</label>
              <select id="edit-task-priority" v-model="form.priority">
                <option value="low">{{ $t('edit_task.priority_low') }}</option>
                <option value="medium">{{ $t('edit_task.priority_medium') }}</option>
                <option value="high">{{ $t('edit_task.priority_high') }}</option>
                <option value="critical">{{ $t('edit_task.priority_critical') }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="edit-task-due">{{ $t('edit_task.due_date') }}</label>
              <input id="edit-task-due" v-model="form.dueDate" type="date" />
            </div>
          </div>

          <div class="form-group">
            <label>{{ $t('edit_task.tags') }}</label>
            <div class="tag-selector">
              <div class="tag-chips">
                <span v-for="tag in form.tags" :key="tag" class="tag-chip">
                  {{ tag }}
                  <button type="button" class="tag-remove" @click="removeTag(tag)">&times;</button>
                </span>
              </div>
              <div class="tag-input-row">
                <input v-model="tagInput" type="text" :placeholder="$t('edit_task.tag_placeholder')" @keydown.enter.prevent="addTag" @keydown.,.prevent="addTag" />
                <button type="button" class="tag-add-btn" @click="addTag">{{ $t('edit_task.add_tag') }}</button>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>{{ $t('edit_task.checklist') }}</label>
            <div class="checklist">
              <div v-for="item in form.checklist" :key="item.id" class="checklist-item">
                <label class="checklist-label">
                  <input type="checkbox" :checked="item.done" @change="toggleChecklistItem(item.id)" />
                  <span class="checklist-check"></span>
                </label>
                <input v-model="item.text" type="text" class="checklist-text" @change="updateChecklistItemText(item.id, item.text)" />
                <button type="button" class="checklist-remove" @click="removeChecklistItem(item.id)">&times;</button>
              </div>
              <div class="checklist-add-row">
                <input v-model="checklistInput" type="text" :placeholder="$t('edit_task.checklist_placeholder')" @keydown.enter.prevent="addChecklistItem" />
                <button type="button" class="tag-add-btn" @click="addChecklistItem">{{ $t('edit_task.add') }}</button>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-cancel" @click="emit('close')">{{ $t('edit_task.cancel') }}</button>
            <button type="submit" class="btn btn-save">{{ $t('edit_task.save') }}</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTaskStore } from '../store/tasks'
import type { Task, TaskPriority, ChecklistItem } from '../types/task'

const props = defineProps<{
  task: Task | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const store = useTaskStore()

const form = ref({
  title: '',
  description: '',
  estimatedMinutes: 0,
  actualTimeSpent: 0,
  color: '#f59e0b',
  status: 'todo' as Task['status'],
  priority: 'medium' as TaskPriority,
  dueDate: '',
  tags: [] as string[],
  checklist: [] as ChecklistItem[],
})

const tagInput = ref('')
const checklistInput = ref('')

watch(() => props.task, (t) => {
  if (t) {
    form.value = {
      title: t.title,
      description: t.description || '',
      estimatedMinutes: t.estimatedMinutes,
      actualTimeSpent: t.actualTimeSpent,
      color: t.color,
      status: t.status,
      priority: t.priority ?? 'medium',
      dueDate: t.dueDate ?? '',
      tags: [...(t.tags ?? [])],
      checklist: t.checklist ? t.checklist.map(c => ({ ...c })) : [],
    }
  }
}, { immediate: true })

function addTag() {
  const t = tagInput.value.trim().toLowerCase()
  if (t && !form.value.tags.includes(t)) {
    form.value.tags.push(t)
    store.addTag(t)
  }
  tagInput.value = ''
}

function removeTag(tag: string) {
  form.value.tags = form.value.tags.filter(t => t !== tag)
}

function addChecklistItem() {
  const text = checklistInput.value.trim()
  if (!text) return
  form.value.checklist.push({ id: crypto.randomUUID(), text, done: false })
  checklistInput.value = ''
}

function toggleChecklistItem(id: string) {
  const item = form.value.checklist.find(c => c.id === id)
  if (item) item.done = !item.done
}

function updateChecklistItemText(id: string, text: string) {
  const item = form.value.checklist.find(c => c.id === id)
  if (item) item.text = text
}

function removeChecklistItem(id: string) {
  form.value.checklist = form.value.checklist.filter(c => c.id !== id)
}

function handleSave() {
  if (!props.task) return
  if (form.value.title.trim() === '' || form.value.estimatedMinutes <= 0) return

  store.update(props.task.id, {
    title: form.value.title.trim(),
    description: form.value.description.trim() || undefined,
    estimatedMinutes: form.value.estimatedMinutes,
    actualTimeSpent: form.value.actualTimeSpent,
    color: form.value.color,
    status: form.value.status,
    priority: form.value.priority,
    dueDate: form.value.dueDate || undefined,
    tags: [...form.value.tags],
    checklist: form.value.checklist.map(c => ({ ...c })),
  })

  emit('saved')
}
</script>

<style scoped>
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
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow);
  animation: scaleIn 0.2s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
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

.form-group { margin-bottom: 0.85rem; }

.form-row {
  display: grid;
  grid-template-columns: 1fr 70px;
  gap: 0.75rem;
}

.form-row-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.flex-1 { flex: 1; }
.color-group input[type="color"] { height: 38px; padding: 2px; cursor: pointer; }

.form-group label {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 0.3rem;
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

.checklist {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.checklist-label {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
}

.checklist-label input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checklist-check {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 2px solid var(--border);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition);
}

.checklist-label input:checked + .checklist-check {
  background: var(--accent-1);
  border-color: var(--accent-1);
}

.checklist-label input:checked + .checklist-check::after {
  content: '';
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  margin-top: -1px;
}

.checklist-text {
  flex: 1;
  padding: 0.35rem 0.5rem;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 0.82rem;
  font-family: inherit;
  outline: none;
}

.checklist-text:focus { border-color: var(--accent-1); }

.checklist-remove {
  background: none;
  border: none;
  color: var(--danger);
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  padding: 0 0.2rem;
  opacity: 0.6;
}

.checklist-remove:hover { opacity: 1; }

.checklist-add-row {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.3rem;
}

.checklist-add-row input {
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

.checklist-add-row input:focus { border-color: var(--accent-1); }

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  margin-top: 1.25rem;
}

.btn {
  padding: 0.6rem 1.25rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
  border: 1px solid transparent;
  font-family: inherit;
}

.btn-cancel {
  background: transparent;
  border-color: var(--border);
  color: var(--text-secondary);
}

.btn-cancel:hover { background: var(--surface); color: var(--text-primary); }

.btn-save {
  background: var(--accent-1);
  color: white;
  font-weight: 600;
}

.btn-save:hover { background: #2563eb; }
</style>
