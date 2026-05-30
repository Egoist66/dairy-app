<template>
  <Teleport to="body">
    <div v-if="entry" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ $t('edit_entry.title') }}</h3>
          <button class="modal-close" @click="emit('close')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSave">
          <div class="form-group">
            <label for="edit-tech">{{ $t('edit_entry.technology') }}</label>
            <input id="edit-tech" v-model="form.technology" type="text" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="edit-time">{{ $t('edit_entry.time') }}</label>
              <input id="edit-time" v-model.number="form.timeSpent" type="number" min="1" required />
            </div>
            <div class="form-group">
              <label for="edit-date">{{ $t('edit_entry.date') }}</label>
              <input id="edit-date" v-model="form.date" type="date" required />
            </div>
          </div>

          <div class="form-group">
            <label for="edit-color">{{ $t('edit_entry.color') }}</label>
            <div class="color-picker">
              <input id="edit-color" v-model="form.color" type="color" />
              <span class="color-value">{{ form.color }}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="edit-notes">{{ $t('edit_entry.notes') }}</label>
            <textarea id="edit-notes" v-model="form.notes" rows="3" :placeholder="$t('edit_entry.notes_placeholder')"></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-cancel" @click="emit('close')">{{ $t('edit_entry.cancel') }}</button>
            <button type="submit" class="btn btn-save">{{ $t('edit_entry.save') }}</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useJournalStore } from '../store/journal'
import type { JournalEntry } from '../types/journal'

const props = defineProps<{
  entry: JournalEntry | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const store = useJournalStore()

const form = ref({
  technology: '',
  timeSpent: 0,
  date: '',
  color: '#3b82f6',
  notes: '',
})

watch(() => props.entry, (entry) => {
  if (entry) {
    form.value = {
      technology: entry.technology,
      timeSpent: entry.timeSpent,
      date: entry.date,
      color: entry.color,
      notes: entry.notes || '',
    }
  }
}, { immediate: true })

function handleSave() {
  if (!props.entry) return
  if (form.value.technology.trim() === '' || form.value.timeSpent <= 0) return

  store.updateEntry(props.entry.id, {
    technology: form.value.technology.trim(),
    timeSpent: form.value.timeSpent,
    date: form.value.date,
    color: form.value.color,
    notes: form.value.notes.trim() || undefined,
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
  max-width: 460px;
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

.modal-close svg {
  width: 15px;
  height: 15px;
}

.modal-close:hover {
  background: var(--surface);
  color: var(--text-primary);
}

.form-group {
  margin-bottom: 0.85rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.form-group label {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 0.3rem;
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
  min-height: 70px;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.color-picker input[type="color"] {
  width: 38px;
  height: 38px;
  padding: 2px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  background: none;
}

.color-value {
  font-size: 0.82rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
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

.btn-cancel:hover {
  background: var(--surface);
  color: var(--text-primary);
}

.btn-save {
  background: var(--accent-1);
  color: white;
  font-weight: 600;
}

.btn-save:hover {
  background: #2563eb;
}
</style>
