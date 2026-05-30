<template>
  <div class="analytics-view">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('page.analytics.title') }}</h1>
        <p class="page-desc">{{ $t('page.analytics.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button
          class="export-btn"
          @click="exportStudyHtml"
          v-if="activeTab === 'study' && store.entries.length > 0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {{ $t('page.analytics.export_study') }}
        </button>
        <button
          class="export-btn"
          @click="exportTasksHtml"
          v-if="activeTab === 'tasks' && taskStore.tasks.length > 0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {{ $t('page.analytics.export_tasks') }}
        </button>
      </div>
    </div>

    <div class="tabs">
      <button
        class="tab"
        :class="{ active: activeTab === 'study' }"
        @click="activeTab = 'study'"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        {{ $t('page.analytics.tab_study') }}
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'tasks' }"
        @click="activeTab = 'tasks'"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
        {{ $t('page.analytics.tab_tasks') }}
      </button>
    </div>

    <!-- STUDY TAB -->
    <template v-if="activeTab === 'study'">
      <div v-if="!stats.statsVisible.value" class="empty-state">
        <p>{{ $t('page.analytics.empty_study') }}</p>
      </div>

      <template v-else>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div class="stat-body">
              <span class="stat-label">{{ $t('page.analytics.total_time') }}</span
              ><span class="stat-value">{{ fmt(store.totalActualTime) }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div class="stat-body">
              <span class="stat-label">{{ $t('page.analytics.entries') }}</span
              ><span class="stat-value">{{ store.totalEntries }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div class="stat-body">
              <span class="stat-label">{{ $t('page.analytics.avg_per_day') }}</span
              ><span class="stat-value"
                >{{ avgPerDay }}<span class="stat-unit">{{ $t('page.analytics.min') }}</span></span
              >
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon cyan">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div class="stat-body">
              <span class="stat-label">{{ $t('page.analytics.technologies') }}</span
              ><span class="stat-value">{{ techCount }}</span>
            </div>
          </div>
        </div>

        <div class="charts-grid">
          <div class="chart-card">
            <h3 class="chart-title">
              {{ $t('page.analytics.daily_activity') }} <span class="chart-sub">{{ $t('page.analytics.last_14_days') }}</span>
            </h3>
            <div class="daily-chart" v-if="dailyData.length > 0">
              <div v-for="day in dailyData" :key="day.date" class="daily-bar-wrap">
                <div class="daily-bar-container">
                  <div
                    class="daily-bar"
                    :style="{ height: day.percent + '%', background: day.color }"
                    :title="day.date + ': ' + day.minutes + ' min'"
                  ></div>
                </div>
                <span class="daily-label">{{ day.short }}</span>
              </div>
            </div>
            <div v-else class="chart-empty">{{ $t('page.analytics.empty_daily') }}</div>
          </div>
          <div class="chart-card">
            <h3 class="chart-title">{{ $t('page.analytics.actual_time_by_tech') }}</h3>
            <div class="tech-chart" v-if="store.sortedActualTimeByTechnology.length > 0">
              <div
                v-for="[tech, time] in store.sortedActualTimeByTechnology"
                :key="tech"
                class="tech-row"
              >
                <div class="tech-row-label">
                  <span class="tech-name">{{ tech }}</span
                  ><span class="tech-stat">{{ fmt(time) }} · {{ pct(tech) }}%</span>
                </div>
                <div class="tech-bar-track">
                  <div class="tech-bar-fill" :style="{ width: barPct(tech) + '%' }"></div>
                </div>
              </div>
            </div>
            <div v-else class="chart-empty">{{ $t('page.analytics.empty_tech') }}</div>
          </div>
        </div>

        <div class="chart-card full-width">
          <h3 class="chart-title">{{ $t('page.analytics.tech_summary') }}</h3>
          <div class="summary-table-container">
            <table class="summary-table">
              <thead>
                <tr>
                  <th>{{ $t('page.analytics.col_technology') }}</th>
                  <th>{{ $t('page.analytics.col_entries') }}</th>
                  <th>{{ $t('page.analytics.col_planned') }}</th>
                  <th>{{ $t('page.analytics.col_actual') }}</th>
                  <th>{{ $t('page.analytics.col_avg_session') }}</th>
                  <th>{{ $t('page.analytics.col_last_studied') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in techSummary" :key="row.tech">
                  <td>
                    <span class="summary-tech">{{ row.tech }}</span>
                  </td>
                  <td>{{ row.count }}</td>
                  <td>{{ fmtMin(row.planned) }}</td>
                  <td>
                    <span class="actual-value">{{ fmt(row.total) }}</span>
                  </td>
                  <td>{{ Math.round(row.total / row.count / 60) }} min</td>
                  <td>{{ row.lastDate }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </template>

    <!-- TASKS TAB -->
    <template v-if="activeTab === 'tasks'">
      <div v-if="taskStore.tasks.length === 0" class="empty-state">
        <p>{{ $t('page.analytics.empty_tasks') }}</p>
      </div>

      <template v-else>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div class="stat-body">
              <span class="stat-label">{{ $t('page.analytics.total_tasks') }}</span
              ><span class="stat-value">{{ taskStore.tasks.length }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div class="stat-body">
              <span class="stat-label">{{ $t('page.analytics.done') }}</span
              ><span class="stat-value">{{ taskStore.doneCount }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div class="stat-body">
              <span class="stat-label">{{ $t('page.analytics.todo') }}</span
              ><span class="stat-value">{{ taskStore.todoCount }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon cyan">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div class="stat-body">
              <span class="stat-label">{{ $t('page.analytics.actual_time') }}</span
              ><span class="stat-value">{{ fmt(taskStore.totalActualTime) }}</span>
            </div>
          </div>
        </div>

        <div class="charts-grid">
          <div class="chart-card">
            <h3 class="chart-title">{{ $t('page.analytics.completion') }}</h3>
            <div class="donut-wrap">
              <svg viewBox="0 0 36 36" class="donut">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--border)"
                  stroke-width="3"
                />
                <path
                  v-if="donePct > 0"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#22c55e"
                  stroke-width="3"
                  :stroke-dasharray="`${donePct} ${100 - donePct}`"
                  stroke-linecap="round"
                />
              </svg>
              <div class="donut-label">{{ donePct }}%</div>
            </div>
            <div class="done-text">
              {{ taskStore.doneCount }} {{ $t('page.analytics.of') }} {{ taskStore.tasks.length }} {{ $t('page.analytics.done_tasks') }}
            </div>
          </div>
          <div class="chart-card">
            <h3 class="chart-title">{{ $t('page.analytics.time_overview') }}</h3>
            <div class="tech-chart">
              <div class="tech-row">
                <div class="tech-row-label">
                  <span class="tech-name">{{ $t('page.analytics.estimated') }}</span
                  ><span class="tech-stat">{{ fmtMin(taskStore.totalEstimated) }}</span>
                </div>
                <div class="tech-bar-track">
                  <div
                    class="tech-bar-fill"
                    style="width: 100%; background: var(--border)"
                  ></div>
                </div>
              </div>
              <div class="tech-row">
                <div class="tech-row-label">
                  <span class="tech-name">{{ $t('page.analytics.actual_all') }}</span
                  ><span class="tech-stat">{{ fmt(taskStore.totalActualTime) }}</span>
                </div>
                <div class="tech-bar-track">
                  <div
                    class="tech-bar-fill"
                    :style="{ width: estPct + '%', background: 'var(--accent-gradient)' }"
                  ></div>
                </div>
              </div>
              <div class="tech-row">
                <div class="tech-row-label">
                  <span class="tech-name">{{ $t('page.analytics.actual_done') }}</span
                  ><span class="tech-stat">{{ fmt(taskStore.doneActualTime) }}</span>
                </div>
                <div class="tech-bar-track">
                  <div
                    class="tech-bar-fill"
                    :style="{ width: doneEstPct + '%', background: '#22c55e' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-card full-width">
          <h3 class="chart-title">{{ $t('page.analytics.all_tasks') }}</h3>
          <div class="summary-table-container">
            <table class="summary-table">
              <thead>
                <tr>
                  <th></th>
                  <th>{{ $t('page.analytics.col_title') }}</th>
                  <th>{{ $t('page.analytics.col_status') }}</th>
                  <th>{{ $t('page.analytics.col_estimated') }}</th>
                  <th>{{ $t('page.analytics.col_actual') }}</th>
                  <th>{{ $t('page.analytics.col_created') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="task in taskStore.tasks"
                  :key="task.id"
                  :style="{ borderLeft: '3px solid ' + task.color }"
                >
                  <td>
                    <span class="task-dot" :style="{ background: task.color }"></span>
                  </td>
                  <td>
                    <span class="summary-tech">{{ task.title }}</span>
                  </td>
                  <td>
                    <span class="status-badge" :class="task.status">{{
                      task.status
                    }}</span>
                  </td>
                  <td>{{ fmtMin(task.estimatedMinutes) }}</td>
                  <td>
                    <span class="actual-value">{{ fmt(task.actualTimeSpent || 0) }}</span>
                  </td>
                  <td>{{ task.createdAt }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useAnalytics } from '../composables/useAnalytics'
import { useJournalStats } from '../composables/useJournalStats'

const {
  store,
  taskStore,
  activeTab,
  avgPerDay,
  techCount,
  dailyData,
  techSummary,
  pct,
  barPct,
  donePct,
  estPct,
  doneEstPct,
  exportStudyHtml,
  exportTasksHtml,
  fmt,
  fmtMin,
} = useAnalytics()

const stats = useJournalStats()
</script>

<style scoped>
.analytics-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  animation: fadeIn 0.3s ease;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}
.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}
.page-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.15rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}
.export-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.85rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition);
  white-space: nowrap;
}
.export-btn svg {
  width: 15px;
  height: 15px;
}
.export-btn:hover {
  border-color: var(--accent-1);
  color: var(--accent-1);
  background: rgba(59, 130, 246, 0.06);
}

.tabs {
  display: flex;
  gap: 0.25rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.25rem;
  margin-bottom: 1.25rem;
  width: fit-content;
}
.tab {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition);
}
.tab svg {
  width: 16px;
  height: 16px;
}
.tab:hover {
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.04);
}
.tab.active {
  color: var(--accent-1);
  background: rgba(59, 130, 246, 0.1);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
  background: var(--surface);
  border: 1px dashed var(--border);
  border-radius: var(--radius-lg);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.25rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
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
.stat-icon.green {
  background: rgba(34, 197, 94, 0.12);
  color: #4ade80;
}
.stat-icon.amber {
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
}
.stat-icon.cyan {
  background: rgba(6, 182, 212, 0.12);
  color: #22d3ee;
}
.stat-body {
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

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}
.chart-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}
.chart-card.full-width {
  grid-column: 1 / -1;
}
.chart-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0 0 1rem;
}
.chart-sub {
  font-weight: 400;
  color: var(--text-muted);
  font-size: 0.8rem;
}
.chart-empty {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.daily-chart {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  height: 160px;
  padding-top: 0.5rem;
}
.daily-bar-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  height: 100%;
}
.daily-bar-container {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.daily-bar {
  width: 70%;
  max-width: 28px;
  border-radius: 4px 4px 0 0;
  transition: height 0.4s ease;
  min-height: 4px;
}
.daily-label {
  font-size: 0.65rem;
  color: var(--text-muted);
  text-transform: uppercase;
}
.tech-chart {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.tech-row {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.tech-row-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}
.tech-name {
  font-weight: 500;
  color: var(--text-secondary);
}
.tech-stat {
  color: var(--text-muted);
  font-size: 0.8rem;
}
.tech-bar-track {
  height: 6px;
  background: var(--bg-primary);
  border-radius: 3px;
  overflow: hidden;
}
.tech-bar-fill {
  height: 100%;
  border-radius: 3px;
  background: var(--accent-gradient);
  transition: width 0.6s ease;
}

.summary-table-container {
  overflow-x: auto;
}
.summary-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}
.summary-table th {
  padding: 0.65rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
}
.summary-table td {
  padding: 0.6rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.035);
  color: var(--text-secondary);
}
.summary-table tbody tr:hover {
  background: rgba(59, 130, 246, 0.04);
}
.summary-tech {
  font-weight: 500;
  color: var(--text-primary);
}
.actual-value {
  color: var(--accent-1);
  font-weight: 600;
}

.task-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.status-badge {
  display: inline-block;
  padding: 0.1rem 0.45rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}
.status-badge.todo {
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
}
.status-badge.in_progress {
  background: rgba(59, 130, 246, 0.12);
  color: #60a5fa;
}
.status-badge.done {
  background: rgba(34, 197, 94, 0.12);
  color: #4ade80;
}

.donut-wrap {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 0.5rem;
}
.donut {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.donut-label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}
.done-text {
  text-align: center;
  font-size: 0.82rem;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .analytics-view {
    padding: 1rem;
  }
  .charts-grid {
    grid-template-columns: 1fr;
  }
  .page-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .header-actions {
    width: 100%;
  }
  .export-btn {
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .analytics-view { padding: 0.75rem; }
  .stats-grid { grid-template-columns: 1fr; }
  .summary-table th,
  .summary-table td {
    padding: 0.5rem 0.5rem;
    font-size: 0.8rem;
  }
  .chart-card { padding: 1rem; }
}
</style>
