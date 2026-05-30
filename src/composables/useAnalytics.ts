import { ref, computed } from 'vue'
import { useJournalStore } from '../store/journal'
import { useTaskStore } from '../store/tasks'

function fmt(seconds: number): string {
  if (!seconds) return '0s'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function fmtMin(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }
  return `${minutes} min`
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function useAnalytics() {
  const store = useJournalStore()
  const taskStore = useTaskStore()

  const activeTab = ref<'study' | 'tasks'>('study')

  /* Study */
  const avgPerDay = computed(() => {
    const d = new Set(store.entries.map(e => e.date))
    if (d.size === 0) return 0
    return Math.round(store.totalActualTime / d.size / 60)
  })

  const techCount = computed(() => new Set(store.entries.map(e => e.technology)).size)

  const dailyData = computed(() => {
    const r: { date: string; minutes: number; short: string; percent: number; color: string }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const s = d.toISOString().split('T')[0]
      const sec = store.entries
        .filter(e => e.date === s)
        .reduce((a, e) => a + (e.actualTimeSpent || 0), 0)
      const m = Math.round(sec / 60)
      r.push({
        date: s,
        minutes: m,
        short: d.toLocaleDateString(undefined, { weekday: 'short' }),
        percent: Math.min((m / 60) * 100, 100),
        color: m > 0 ? (m > 40 ? '#3b82f6' : m > 20 ? '#60a5fa' : '#93c5fd') : 'transparent',
      })
    }
    return r
  })

  const techSummary = computed(() => {
    const m = new Map<string, { count: number; planned: number; total: number; dates: string[] }>()
    for (const e of store.entries) {
      const x = m.get(e.technology) || { count: 0, planned: 0, total: 0, dates: [] }
      x.count++
      x.planned += e.timeSpent
      x.total += e.actualTimeSpent || 0
      x.dates.push(e.date)
      m.set(e.technology, x)
    }
    return Array.from(m)
      .map(([tech, d]) => ({
        tech,
        count: d.count,
        planned: d.planned,
        total: d.total,
        lastDate: d.dates.sort().reverse()[0],
      }))
      .sort((a, b) => b.total - a.total)
  })

  function pct(tech: string): string {
    const planned = (store.timeByTechnology[tech] || 0) * 60
    if (!planned) return '0'
    const actual = store.actualTimeByTechnology[tech] || 0
    return Math.min(100, (actual / planned) * 100).toFixed(1)
  }

  function barPct(tech: string): number {
    const planned = (store.timeByTechnology[tech] || 0) * 60
    if (!planned) return 0
    const actual = store.actualTimeByTechnology[tech] || 0
    return Math.min(100, (actual / planned) * 100)
  }

  /* Tasks */
  const donePct = computed(() =>
    taskStore.tasks.length > 0
      ? Math.round((taskStore.doneCount / taskStore.tasks.length) * 100)
      : 0
  )

  const estPct = computed(() => {
    const est = taskStore.totalEstimated * 60
    if (est === 0) return 0
    return Math.min((taskStore.totalActualTime / est) * 100, 100)
  })

  const doneEstPct = computed(() => {
    const est = taskStore.totalEstimated * 60
    if (est === 0) return 0
    return Math.min((taskStore.doneActualTime / est) * 100, 100)
  })

  /* Export */
  function downloadHtml(title: string, subtitle: string, body: string) {
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Tech Journal — ${escape(title)}</title><style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;color:#333;padding:2rem;margin:0}
    h1{font-size:1.5rem;margin:0 0 .25rem} p{color:#666;margin:0 0 1.5rem}
    h2{font-size:1.1rem;margin:2rem 0 .75rem;border-bottom:2px solid #e0e0e0;padding-bottom:.25rem}
    table{width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.1);margin-bottom:1.5rem}
    th{background:#3b82f6;color:#fff;padding:.6rem .8rem;text-align:left;font-size:.75rem;text-transform:uppercase;letter-spacing:.05em}
    td{padding:.5rem .8rem;border-bottom:1px solid #eee;font-size:.85rem}
    tr:nth-child(even) td{background:#fafafa} tr:hover td{background:#eff6ff}
    .stats{display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:1.5rem}
    .stat{background:#fff;border-radius:8px;padding:1rem 1.5rem;box-shadow:0 1px 4px rgba(0,0,0,.1);min-width:140px}
    .stat-label{font-size:.7rem;text-transform:uppercase;color:#666;letter-spacing:.05em}
    .stat-value{font-size:1.3rem;font-weight:700;color:#111;margin-top:.15rem}
    .meta{color:#999;font-size:.8rem}
  </style></head><body>
    <h1>Tech Journal — ${escape(title)}</h1><p>${escape(subtitle)}<br>Generated on ${new Date().toLocaleString()}</p>
    ${body}<p class="meta">Exported from Tech Journal</p></body></html>`
    const blob = new Blob([html], { type: 'text/html' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `tech-journal-${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.html`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  function exportStudyHtml() {
    const rows = store.entries
      .map(
        e =>
          `<tr><td>${e.date}</td><td>${escape(e.technology)}</td><td>${fmtMin(e.timeSpent)}</td><td>${fmt(e.actualTimeSpent || 0)}</td><td>${e.color}</td><td>${escape(e.notes || '—')}</td></tr>`
      )
      .join('')
    const techRows = techSummary.value
      .map(
        r =>
          `<tr><td>${escape(r.tech)}</td><td>${r.count}</td><td>${fmtMin(r.planned)}</td><td>${fmt(r.total)}</td><td>${r.lastDate}</td></tr>`
      )
      .join('')
    downloadHtml(
      'Study Export',
      `Study Analytics — ${store.entries.length} entries`,
      `<div class="stats"><div class="stat"><div class="stat-label">Total Actual Time</div><div class="stat-value">${fmt(store.totalActualTime)}</div></div><div class="stat"><div class="stat-label">Entries</div><div class="stat-value">${store.totalEntries}</div></div><div class="stat"><div class="stat-label">Technologies</div><div class="stat-value">${techCount.value}</div></div><div class="stat"><div class="stat-label">Avg/Day</div><div class="stat-value">${avgPerDay.value} min</div></div></div>
    <h2>All Entries</h2><table><thead><tr><th>Date</th><th>Technology</th><th>Planned</th><th>Actual</th><th>Color</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table>
    <h2>Technology Summary</h2><table><thead><tr><th>Tech</th><th>Entries</th><th>Planned</th><th>Actual</th><th>Last</th></tr></thead><tbody>${techRows}</tbody></table>`
    )
  }

  function exportTasksHtml() {
    const rows = taskStore.tasks
      .map(
        t =>
          `<tr><td>${t.createdAt}</td><td>${escape(t.title)}</td><td>${t.status}</td><td>${fmtMin(t.estimatedMinutes)}</td><td>${fmt(t.actualTimeSpent || 0)}</td><td>${t.color}</td></tr>`
      )
      .join('')
    downloadHtml(
      'Tasks Export',
      `Tasks — ${taskStore.tasks.length} items`,
      `<div class="stats"><div class="stat"><div class="stat-label">Total Tasks</div><div class="stat-value">${taskStore.tasks.length}</div></div><div class="stat"><div class="stat-label">Done</div><div class="stat-value">${taskStore.doneCount}</div></div><div class="stat"><div class="stat-label">Todo</div><div class="stat-value">${taskStore.todoCount}</div></div><div class="stat"><div class="stat-label">Actual Time</div><div class="stat-value">${fmt(taskStore.totalActualTime)}</div></div></div>
    <h2>All Tasks</h2><table><thead><tr><th>Created</th><th>Title</th><th>Status</th><th>Estimated</th><th>Actual</th><th>Color</th></tr></thead><tbody>${rows}</tbody></table>`
    )
  }

  return {
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
  }
}
