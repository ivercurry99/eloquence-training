<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

defineProps({ title: { type: String, default: '' }, wide: { type: Boolean, default: false } })
const emit = defineEmits(['close'])

function onKeydown(e) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('close')">
      <div class="modal-card" :class="{ wide }">
        <header class="modal-header">
          <h2 class="modal-title">{{ title }}</h2>
          <button class="modal-close" aria-label="关闭" @click="emit('close')">×</button>
        </header>
        <div class="modal-body">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(10, 10, 20, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 4vh var(--space-4) var(--space-8);
  overflow-y: auto;
}

.modal-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 640px;
  animation: modal-in 0.22s cubic-bezier(0.2, 0.9, 0.3, 1.2) both;
}

.modal-card.wide {
  max-width: 860px;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  background: var(--color-surface);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  z-index: 1;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  font-size: 22px;
  line-height: 1;
  color: var(--color-text-3);
  transition: all 0.15s ease;
}

.modal-close:hover {
  background: var(--color-surface-3);
  color: var(--color-text-1);
}

.modal-body {
  padding: var(--space-6);
}
</style>
