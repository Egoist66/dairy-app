<template>
  <div class="add-entry-card">
    <div class="card-header">
      <div class="card-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
      <div>
        <h2 class="card-title">{{ $t('entry.new_entry') }}</h2>
        <p class="card-desc">{{ $t('entry.subtitle') }}</p>
      </div>
    </div>

    <form @submit.prevent="submitForm">
      <div class="form-row">
        <div class="form-group flex-1">
          <label for="tech">{{ $t('entry.technology') }}</label>
          <input
            id="tech"
            v-model="technology"
            type="text"
            :placeholder="$t('entry.tech_placeholder')"
            ref="techInput"
          />
        </div>
        <div class="form-group time-group">
          <label for="time">{{ $t('entry.minutes') }}</label>
          <input
            id="time"
            v-model.number="timeSpent"
            type="number"
            min="1"
            :placeholder="$t('entry.min_placeholder')"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group flex-1">
          <label for="entry-date">{{ $t('entry.date') }}</label>
          <input id="entry-date" v-model="date" type="date" />
        </div>
        <div class="form-group color-group">
          <label for="entry-color">{{ $t('entry.color') }}</label>
          <input id="entry-color" v-model="color" type="color" />
        </div>
      </div>

      <div class="form-group">
        <label for="entry-notes">{{ $t('entry.notes') }}</label>
        <textarea
          id="entry-notes"
          v-model="notes"
          rows="2"
          :placeholder="$t('entry.notes_placeholder')"
        ></textarea>
      </div>

      <button type="submit" class="submit-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
          <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
        </svg>
        {{ $t('entry.add') }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useJournalStore } from '../store/journal'

const store = useJournalStore()

const techInput = ref<HTMLInputElement | null>(null)

const technology = ref('')
const timeSpent = ref(0)
const date = ref(new Date().toISOString().split('T')[0])
const color = ref('#3b82f6')
const notes = ref('')

function submitForm() {
  if (technology.value.trim() === '' || timeSpent.value <= 0) {
    return
  }

  store.addEntry({
    technology: technology.value.trim(),
    timeSpent: timeSpent.value,
    actualTimeSpent: 0,
    date: date.value,
    color: color.value,
    notes: notes.value.trim() || undefined,
  })

  technology.value = ''
  timeSpent.value = 0
  notes.value = ''
  date.value = new Date().toISOString().split('T')[0]

  techInput.value?.focus()
}
</script>

<style scoped>
.add-entry-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  transition: border-color var(--transition);
}

.add-entry-card:hover {
  border-color: var(--border-hover);
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
  background: rgba(59, 130, 246, 0.12);
  border-radius: var(--radius-sm);
  color: var(--accent-1);
  flex-shrink: 0;
}

.card-icon svg {
  width: 20px;
  height: 20px;
}

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

.form-row:has(.color-group) {
  grid-template-columns: 1fr 70px;
}

.flex-1 {
  flex: 1;
}

.form-group {
  margin-bottom: 0.75rem;
}

.form-group:last-of-type {
  margin-bottom: 1rem;
}

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
  transition: border-color var(--transition), background var(--transition);
  outline: none;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--accent-1);
  background: var(--bg-secondary);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--text-muted);
}

.form-group textarea {
  resize: vertical;
  min-height: 56px;
}

input[type="color"] {
  height: 38px;
  padding: 2px !important;
  cursor: pointer;
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  width: 100%;
  padding: 0.7rem;
  background: var(--accent-1);
  border: none;
  border-radius: var(--radius-sm);
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition);
  font-family: inherit;
}

.submit-btn svg {
  width: 16px;
  height: 16px;
}

.submit-btn:hover {
  background: #2563eb;
}

.submit-btn:active {
  background: #1d4ed8;
}
</style>
