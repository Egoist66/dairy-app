<template>
  <div class="journal-view">
    <div class="view-header">
      <div class="view-header-left">
        <h1 class="view-title">{{ $t('nav.journal') }}</h1>
        <p class="view-desc">{{ store.totalEntries }} {{ $t('stats.entries') }} · {{ fmt(store.totalActualTime) }} {{ $t('stats.total_time') }}</p>
      </div>
      <button class="add-btn" @click="showAddModal = true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        {{ $t('entry.new_entry') }}
      </button>
    </div>

    <StatsSection v-if="stats.statsVisible" />

    <div class="journal-card">
      <JournalTable @edit="openEditModal" />
    </div>

    <Teleport to="body">
      <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ $t('entry.new_entry') }}</h3>
            <button class="modal-close" @click="showAddModal = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <AddEntryForm @added="showAddModal = false" />
        </div>
      </div>
    </Teleport>

    <EditEntryModal
      :entry="editingEntry"
      @close="editingEntry = null"
      @saved="editingEntry = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useJournalStore } from '../store/journal'
import { useJournalStats } from '../composables/useJournalStats'
import AddEntryForm from '../components/AddEntryForm.vue'
import StatsSection from '../components/StatsSection.vue'
import JournalTable from '../components/JournalTable.vue'
import EditEntryModal from '../components/EditEntryModal.vue'
import type { JournalEntry } from '../types/journal'

const store = useJournalStore()
const stats = useJournalStats()

const showAddModal = ref(false)
const editingEntry = ref<JournalEntry | null>(null)

function openEditModal(entry: JournalEntry) {
  editingEntry.value = entry
}

function fmt(s: number): string {
  if (!s) return '0s'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${m}m ${sec}s`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}
</script>

<style scoped>
.journal-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  animation: fadeIn 0.3s ease;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  gap: 1rem;
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
  flex-shrink: 0;
}

.add-btn svg { width: 16px; height: 16px; }
.add-btn:hover { background: #2563eb; }

.content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-width: 0;
}

.journal-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
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
  max-width: 480px;
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

@media (max-width: 1024px) {
  .journal-view { padding: 1rem; }
}

@media (max-width: 640px) {
  .journal-view { padding: 0.75rem; }
  .view-header { flex-direction: column; align-items: stretch; }
  .add-btn { justify-content: center; }
}
</style>
