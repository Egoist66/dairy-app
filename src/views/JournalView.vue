<template>
  <div class="journal-view">
    <div class="main-grid">
      <aside class="sidebar">
        <AddEntryForm />
      </aside>

      <section class="content">
        <StatsSection v-if="stats.statsVisible" />

        <div class="journal-card">
          <JournalTable @edit="openEditModal" />
        </div>
      </section>
    </div>

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

useJournalStore()
const stats = useJournalStats()

const editingEntry = ref<JournalEntry | null>(null)

function openEditModal(entry: JournalEntry) {
  editingEntry.value = entry
}
</script>

<style scoped>
.journal-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
}

.main-grid {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 1.5rem;
  align-items: start;
}

.sidebar {
  position: sticky;
  top: 1.5rem;
}

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

@media (max-width: 1024px) {
  .journal-view {
    padding: 1rem;
  }

  .main-grid {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
  }
}

@media (max-width: 640px) {
  .journal-view {
    padding: 0.75rem;
  }
}
</style>
