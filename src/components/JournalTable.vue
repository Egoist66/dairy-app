<template>
  <div class="journal-table-wrapper">
    <div v-if="timer.pendingResume.value" class="resume-banner">
      <div class="resume-info">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="resume-icon">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>
          {{ $t('journal.timer_in_progress') }}
          <strong>{{ getResumeTech }}</strong> —
          <strong class="resume-time">{{ timer.formatTime(timer.pendingResume.value.elapsed) }}</strong> {{ $t('journal.elapsed') }}
        </span>
      </div>
      <div class="resume-actions">
        <button class="resume-btn" @click="resumeTimer">{{ $t('journal.continue') }}</button>
        <button class="dismiss-btn" @click="timer.dismissResume()">{{ $t('journal.dismiss') }}</button>
      </div>
    </div>
    <div class="table-toolbar">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          v-model="filter.searchQuery.value"
          type="text"
          :placeholder="$t('journal.search_placeholder')"
        />
      </div>
      <div class="filter-controls">
        <div class="date-filter">
          <svg class="cal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <input
            type="date"
            v-model="filter.selectedDate.value"
          />
        </div>
        <button
          v-if="filter.hasActiveFilter.value"
          class="clear-btn"
          @click="filter.clearFilter()"
        >
          {{ $t('journal.clear') }}
        </button>
      </div>
    </div>

    <div class="table-container">
      <table class="journal-table">
        <thead>
          <tr>
            <th class="col-color"></th>
            <th
              class="col-date sortable"
              :class="{ active: filter.sortField.value === 'date' }"
              @click="filter.toggleSort('date')"
            >
              {{ $t('journal.date') }}
              <span v-if="filter.sortField.value === 'date'" class="sort-arrow">
                {{ filter.sortOrder.value === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th
              class="col-tech sortable"
              :class="{ active: filter.sortField.value === 'technology' }"
              @click="filter.toggleSort('technology')"
            >
              {{ $t('journal.technology') }}
              <span v-if="filter.sortField.value === 'technology'" class="sort-arrow">
                {{ filter.sortOrder.value === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th
              class="col-time sortable"
              :class="{ active: filter.sortField.value === 'timeSpent' }"
              @click="filter.toggleSort('timeSpent')"
            >
              {{ $t('journal.time') }}
              <span v-if="filter.sortField.value === 'timeSpent'" class="sort-arrow">
                {{ filter.sortOrder.value === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th class="col-timer">{{ $t('journal.timer') }}</th>
            <th class="col-notes">{{ $t('journal.notes') }}</th>
            <th class="col-actions">{{ $t('journal.actions') }}</th>
          </tr>
        </thead>
        <TransitionGroup tag="tbody" name="row">
          <tr
            v-for="entry in filter.filteredEntries.value"
            :key="entry.id"
            class="journal-row"
          >
            <td class="col-color">
              <span class="color-dot" :style="{ background: entry.color }"></span>
            </td>
            <td class="col-date">{{ formatDate(entry.date) }}</td>
            <td class="col-tech">
              <span class="tech-badge" :style="{ '--badge-color': entry.color }">
                {{ entry.technology }}
              </span>
            </td>
            <td class="col-time">
              <span class="time-badge">{{ entry.timeSpent }} {{ $t('journal.min') }}</span>
            </td>
            <td class="col-timer">
              <div v-if="timer.isRunning(entry.id)" class="timer-running">
                <div class="timer-display">
                  <svg class="timer-icon pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span class="timer-value">{{ timer.formatTime(timer.currentElapsed.value) }}</span>
                  <span class="timer-sep">/</span>
                  <span class="timer-target">{{ timer.formatTime(timer.targetSeconds.value) }}</span>
                </div>
                <button class="timer-stop-btn" @click="stopTimer(entry)" :title="$t('journal.stop')">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="1" />
                  </svg>
                </button>
              </div>
              <div v-else class="timer-idle">
                <button class="timer-start-btn" @click="startTimer(entry)" :title="$t('journal.start_timer')">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </button>
                <span class="timer-plan">{{ entry.timeSpent }} {{ $t('journal.min') }}</span>
                <template v-if="entry.actualTimeSpent">
                  <span class="timer-actual-sep">·</span>
                  <span class="timer-actual">{{ timer.formatShort(entry.actualTimeSpent) }}</span>
                </template>
              </div>
            </td>
            <td class="col-notes">
              <span v-if="entry.notes" class="notes-text" :title="entry.notes">
                {{ entry.notes }}
              </span>
              <span v-else class="no-notes">—</span>
            </td>
            <td class="col-actions">
              <button class="action-btn edit-btn" :title="$t('journal.edit')" @click="emit('edit', entry)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button class="action-btn delete-btn" :title="$t('journal.delete')" @click="handleDelete(entry)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </td>
          </tr>
        </TransitionGroup>
      </table>
    </div>

    <div v-if="filter.filteredEntries.value.length === 0" class="table-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
      <p class="empty-title">{{ $t('journal.empty_title') }}</p>
      <p class="empty-desc" v-if="filter.hasActiveFilter.value">
        {{ $t('journal.empty_filtered') }}
      </p>
      <p class="empty-desc" v-else>
        {{ $t('journal.empty_start') }}
      </p>
    </div>

    <DeleteConfirmModal
      :visible="deleteTarget !== null"
      :technology="deleteTarget?.technology ?? ''"
      :date="formatDate(deleteTarget?.date ?? '')"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useJournalStore } from '../store/journal'
import { useJournalFilter } from '../composables/useJournalFilter'
import { useStudyTimer } from '../composables/useStudyTimer'
import type { JournalEntry } from '../types/journal'
import DeleteConfirmModal from './DeleteConfirmModal.vue'

const store = useJournalStore()
const filter = useJournalFilter()
const timer = useStudyTimer()

const emit = defineEmits<{
  edit: [entry: JournalEntry]
}>()

const deleteTarget = ref<JournalEntry | null>(null)

function saveElapsed(entryId: string, elapsedSeconds: number) {
  if (elapsedSeconds <= 0) return
  const entry = store.entries.find(e => e.id === entryId)
  if (!entry) return
  store.updateEntry(entryId, {
    actualTimeSpent: (entry.actualTimeSpent || 0) + elapsedSeconds,
  })
}

timer.setOnComplete((entryId, elapsed) => {
  saveElapsed(entryId, elapsed)
})

const getResumeTech = computed(() => {
  const id = timer.pendingResume.value?.entryId
  if (!id) return ''
  const entry = store.entries.find(e => e.id === id)
  return entry?.technology ?? ''
})

function resumeTimer() {
  const p = timer.pendingResume.value
  if (!p) return
  const entry = store.entries.find(e => e.id === p.entryId)
  if (!entry) {
    timer.dismissResume()
    return
  }
  const remaining = Math.max(1, entry.timeSpent * 60 - (entry.actualTimeSpent || 0))
  timer.resume(p.entryId, p.elapsed, Math.ceil(remaining / 60))
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function handleDelete(entry: JournalEntry) {
  deleteTarget.value = entry
}

function confirmDelete() {
  if (deleteTarget.value) {
    store.deleteEntry(deleteTarget.value.id)
    deleteTarget.value = null
  }
}

function startTimer(entry: JournalEntry) {
  const remaining = Math.max(1, entry.timeSpent * 60 - (entry.actualTimeSpent || 0))
  timer.start(entry.id, Math.ceil(remaining / 60))
}

function stopTimer(entry: JournalEntry) {
  const elapsedSeconds = timer.stop()
  saveElapsed(entry.id, elapsedSeconds)
}
</script>

<style scoped>
.journal-table-wrapper {
  animation: fadeIn 0.35s ease 0.05s both;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.45rem 0.75rem;
  flex: 1;
  min-width: 180px;
  max-width: 300px;
  transition: border-color var(--transition);
}

.search-box:focus-within {
  border-color: var(--accent-1);
}

.search-icon {
  width: 15px;
  height: 15px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.search-box input {
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 0.85rem;
  width: 100%;
  outline: none;
  font-family: inherit;
}

.search-box input::placeholder {
  color: var(--text-muted);
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-filter {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.45rem 0.65rem;
  transition: border-color var(--transition);
}

.date-filter:focus-within {
  border-color: var(--accent-1);
}

.cal-icon {
  width: 14px;
  height: 14px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.date-filter input {
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 0.82rem;
  outline: none;
  font-family: inherit;
  color-scheme: dark;
}

.clear-btn {
  padding: 0.45rem 0.85rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: border-color var(--transition), color var(--transition);
  font-family: inherit;
  white-space: nowrap;
}

.clear-btn:hover {
  border-color: var(--danger);
  color: var(--danger);
}

.table-container {
  overflow-x: auto;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.journal-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

.journal-table thead {
  background: var(--bg-secondary);
}

.journal-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
  user-select: none;
}

.journal-table th.sortable {
  cursor: pointer;
  transition: color var(--transition);
}

.journal-table th.sortable:hover {
  color: var(--text-secondary);
}

.journal-table th.sortable.active {
  color: var(--accent-1);
}

.sort-arrow {
  margin-left: 0.25rem;
  font-size: 0.7rem;
}

.journal-row {
  transition: background var(--transition);
}

.journal-row:nth-child(even) {
  background: rgba(255, 255, 255, 0.015);
}

.journal-row:hover {
  background: rgba(59, 130, 246, 0.06);
}

.journal-table td {
  padding: 0.7rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.035);
  vertical-align: middle;
}

.journal-row:last-child td {
  border-bottom: none;
}

.col-color {
  width: 16px;
  padding-right: 0 !important;
}

.color-dot {
  display: block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.tech-badge {
  display: inline-block;
  padding: 0.15rem 0.55rem;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 500;
  background: color-mix(in srgb, var(--badge-color) 12%, var(--bg-primary));
  color: var(--badge-color);
  border: 1px solid color-mix(in srgb, var(--badge-color) 20%, transparent);
}

.time-badge {
  display: inline-block;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  background: var(--bg-primary);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.col-timer {
  width: 190px;
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
  flex-shrink: 0;
}

.timer-start-btn svg {
  width: 11px;
  height: 11px;
}

.timer-start-btn:hover {
  border-color: var(--accent-1);
  color: var(--accent-1);
  background: rgba(59, 130, 246, 0.06);
}

.timer-plan {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.timer-actual-sep {
  color: var(--text-muted);
  font-size: 0.7rem;
}

.timer-actual {
  font-size: 0.75rem;
  color: var(--accent-1);
  font-weight: 500;
}

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

.timer-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

.timer-icon.pulse {
  color: #4ade80;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.timer-value {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  font-weight: 600;
  color: #4ade80;
  min-width: 62px;
  text-align: center;
}

.timer-sep {
  color: rgba(74, 222, 128, 0.4);
  font-size: 0.75rem;
}

.timer-target {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: rgba(74, 222, 128, 0.6);
  font-weight: 500;
}

.timer-remain-label {
  font-size: 0.65rem;
  color: rgba(74, 222, 128, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.03em;
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
  flex-shrink: 0;
}

.timer-stop-btn svg {
  width: 11px;
  height: 11px;
}

.timer-stop-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--danger);
}

.notes-text {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--text-secondary);
  max-width: 200px;
  cursor: help;
}

.no-notes {
  color: var(--text-muted);
}

.col-actions {
  width: 90px;
  text-align: right;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition);
}

.action-btn + .action-btn {
  margin-left: 0.25rem;
}

.action-btn svg {
  width: 14px;
  height: 14px;
}

.edit-btn:hover {
  background: rgba(6, 182, 212, 0.1);
  border-color: rgba(6, 182, 212, 0.3);
  color: #22d3ee;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: var(--danger);
}

.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.5rem;
  border: 1px dashed var(--border);
  border-radius: var(--radius-md);
  text-align: center;
  gap: 0.4rem;
}

.empty-icon {
  width: 36px;
  height: 36px;
  color: var(--text-muted);
  margin-bottom: 0.4rem;
  opacity: 0.4;
}

.empty-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.empty-desc {
  font-size: 0.82rem;
  color: var(--text-muted);
}

.row-enter-active,
.row-leave-active {
  transition: all 0.3s ease;
}

.row-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.97);
}

.row-leave-to {
  opacity: 0;
  transform: translateX(-30px) scale(0.95);
}

.row-move {
  transition: transform 0.35s ease;
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

.resume-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.resume-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--accent-1);
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

.dismiss-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .table-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .search-box {
    max-width: none;
  }
  .col-notes,
  .col-actions {
    display: none;
  }
  .col-timer {
    width: 140px;
  }
  .timer-value {
    min-width: 48px;
  }
}

@media (max-width: 480px) {
  .journal-table-wrapper {
    padding: 0;
  }
  .journal-card {
    padding: 0.75rem !important;
  }
  .table-container {
    border: none;
    border-radius: 0;
  }
  .journal-table th,
  .journal-table td {
    padding: 0.5rem 0.4rem;
  }
  .col-color {
    display: none;
  }
  .col-date {
    font-size: 0.78rem;
  }
  .col-tech {
    font-size: 0.8rem;
  }
  .col-timer {
    width: 120px;
  }
  .timer-idle {
    gap: 0.2rem;
  }
  .timer-plan {
    font-size: 0.7rem;
  }
  .timer-display {
    padding: 0.1rem 0.35rem;
  }
  .timer-value {
    font-size: 0.75rem;
    min-width: 40px;
  }
  .timer-target {
    font-size: 0.7rem;
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
