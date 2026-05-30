<template>
  <Teleport to="body">
    <div v-if="visible" class="confirm-overlay" @click.self="emit('cancel')">
      <div class="confirm-dialog">
        <div class="confirm-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </div>
        <h3 class="confirm-title">{{ $t('delete.title') }}</h3>
        <p class="confirm-desc">
          {{ $t('delete.confirm') }} "{{ technology }}" — {{ date }}?
        </p>
        <div class="confirm-actions">
          <button class="btn btn-cancel" @click="emit('cancel')">{{ $t('delete.cancel') }}</button>
          <button class="btn btn-delete" @click="emit('confirm')">{{ $t('delete.confirm') }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  technology: string
  date: string
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<style scoped>
.confirm-overlay {
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

.confirm-dialog {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.75rem;
  width: 100%;
  max-width: 380px;
  text-align: center;
  box-shadow: var(--shadow);
  animation: scaleIn 0.2s ease;
}

.confirm-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.12);
  color: var(--danger);
  margin: 0 auto 1rem;
}

.confirm-icon svg {
  width: 22px;
  height: 22px;
}

.confirm-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
}

.confirm-desc {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0 0 1.5rem;
}

.confirm-desc strong {
  color: var(--text-primary);
}

.confirm-actions {
  display: flex;
  gap: 0.65rem;
  justify-content: center;
}

.btn {
  padding: 0.6rem 1.25rem;
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
  border: 1px solid transparent;
  font-family: inherit;
  min-width: 100px;
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

.btn-delete {
  background: var(--danger);
  color: white;
  font-weight: 600;
}

.btn-delete:hover {
  background: #dc2626;
}
</style>
