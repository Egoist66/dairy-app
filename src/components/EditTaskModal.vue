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
import type { Task } from '../types/task'

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
})

watch(() => props.task, (t) => {
  if (t) {
    form.value = {
      title: t.title,
      description: t.description || '',
      estimatedMinutes: t.estimatedMinutes,
      actualTimeSpent: t.actualTimeSpent,
      color: t.color,
      status: t.status,
    }
  }
}, { immediate: true })

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
  max-width: 520px;
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
  grid-template-columns: 1fr 1fr 1fr;
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
