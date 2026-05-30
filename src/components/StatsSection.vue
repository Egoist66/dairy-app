<template>
  <div class="stats-section">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Time</span>
          <span class="stat-value">{{ fmt(store.totalActualTime) }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon cyan">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Today's Focus</span>
          <span class="stat-value">{{ stats.todayFocus.value || '—' }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon amber">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Today</span>
          <span class="stat-value">{{ fmt(stats.todayTime.value) }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Entries</span>
          <span class="stat-value">{{ store.totalEntries }}</span>
        </div>
      </div>
    </div>

    <div v-if="store.sortedActualTimeByTechnology.length > 0" class="tech-breakdown">
      <h3 class="breakdown-title">Actual Time by Technology</h3>
      <div class="breakdown-chart">
        <div
          v-for="[tech, time] in store.sortedActualTimeByTechnology"
          :key="tech"
          class="breakdown-bar"
        >
          <div class="bar-label">
            <span class="bar-tech">{{ tech }}</span>
            <span class="bar-time">{{ fmt(time) }}</span>
          </div>
          <div class="bar-track">
            <div
              class="bar-fill"
              :style="{ width: barPct(tech) + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useJournalStore } from '../store/journal'
import { useJournalStats } from '../composables/useJournalStats'

const store = useJournalStore()
const stats = useJournalStats()

function fmt(s: number): string {
  if (!s) return '0s'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${m}m ${sec}s`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

function barPct(tech: string): number {
  const planned = (store.timeByTechnology[tech] || 0) * 60
  if (!planned) return 0
  const actual = store.actualTimeByTechnology[tech] || 0
  return Math.min(100, (actual / planned * 100))
}
</script>

<style scoped>
.stats-section {
  animation: fadeIn 0.35s ease;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.25rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  transition: border-color var(--transition);
}

.stat-card:hover {
  border-color: var(--border-hover);
}

.stat-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.stat-icon svg {
  width: 20px;
  height: 20px;
}

.stat-icon.blue {
  background: rgba(59, 130, 246, 0.12);
  color: #60a5fa;
}

.stat-icon.cyan {
  background: rgba(6, 182, 212, 0.12);
  color: #22d3ee;
}

.stat-icon.amber {
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
}

.stat-icon.green {
  background: rgba(34, 197, 94, 0.12);
  color: #4ade80;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  font-weight: 500;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-unit {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-muted);
  margin-left: 0.2rem;
}

.tech-breakdown {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
}

.breakdown-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.breakdown-chart {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.breakdown-bar {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.bar-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bar-tech {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.bar-time {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 500;
}

.bar-track {
  height: 6px;
  background: var(--bg-primary);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 3px;
  background: var(--accent-gradient);
  transition: width 0.6s ease;
}
</style>
