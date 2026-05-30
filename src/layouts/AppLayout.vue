<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <slot name="header-start" />
          <div class="header-brand">
            <div class="brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1>Tech Journal</h1>
              <p>Track your daily progression</p>
            </div>
          </div>
        </div>

        <nav class="app-nav">
          <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Journal
          </router-link>
          <router-link to="/analytics" class="nav-link" :class="{ active: $route.path === '/analytics' }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            Analytics
          </router-link>
          <router-link to="/tasks" class="nav-link" :class="{ active: $route.path === '/tasks' }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            Tasks
          </router-link>
        </nav>
        <slot name="header-end" />
      </div>
    </header>

    <main class="app-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
}

.app-header {
  border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.brand-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-gradient);
  border-radius: var(--radius-sm);
  color: white;
  flex-shrink: 0;
}

.brand-icon svg {
  width: 20px;
  height: 20px;
}

.header-brand h1 {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.header-brand p {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
}

.app-nav {
  display: flex;
  gap: 0.25rem;
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  padding: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.9rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-muted);
  text-decoration: none;
  transition: all var(--transition);
}

.nav-link svg {
  width: 16px;
  height: 16px;
}

.nav-link:hover {
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.04);
}

.nav-link.active {
  color: var(--accent-1);
  background: rgba(59, 130, 246, 0.1);
}

.app-main {
  animation: fadeIn 0.25s ease;
}

@media (max-width: 640px) {
  .header-content {
    padding: 0 0.75rem;
    height: 52px;
  }

  .header-brand p {
    display: none;
  }

  .nav-link span {
    display: none;
  }

  .nav-link {
    padding: 0.45rem 0.65rem;
  }
}
</style>
