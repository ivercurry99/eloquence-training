<script setup>
import { ref } from 'vue'
import { trainingStore } from '../stores/training'
import DayDetailModal from '../components/training/DayDetailModal.vue'

const training = trainingStore()
const selectedDay = ref(null)

function openDay(day) {
  selectedDay.value = day
}
</script>

<template>
  <section class="page fade-in">
    <div class="hero card">
      <div class="hero-text">
        <h1 class="hero-title">14 天口才蜕变计划</h1>
        <p class="hero-sub">从「脑子想得到」到「嘴巴说得顺」的神经通路</p>
      </div>
      <div class="hero-progress">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: training.progressPercent + '%' }"></div>
        </div>
        <p class="progress-label">
          已完成 <strong>{{ training.completedCount }}</strong> / {{ training.totalDays }} 天
          <span v-if="training.currentDay" class="tag tag-primary" style="margin-left: 8px">
            当前 Day {{ training.currentDay }}
          </span>
          <span v-else class="tag tag-success" style="margin-left: 8px">🎉 全部完成</span>
        </p>
      </div>
    </div>

    <div v-for="phase in training.phaseProgress" :key="phase.id" class="phase">
      <div class="phase-header">
        <div>
          <h2 class="phase-name">{{ phase.name }}</h2>
          <p class="phase-desc">{{ phase.desc }}</p>
        </div>
        <span class="tag" :class="phase.percent === 100 ? 'tag-success' : ''">{{ phase.done }}/{{ phase.total }}</span>
      </div>

      <div class="day-grid">
        <button
          v-for="day in phase.days"
          :key="day"
          class="card card-clickable day-card"
          :class="{ done: training.isCompleted(day), current: training.isCurrent(day) }"
          @click="openDay(day)"
        >
          <div class="day-top">
            <span class="day-num">{{ day }}</span>
            <span v-if="training.isCompleted(day)" class="day-badge done-badge">✓</span>
            <span v-else-if="training.isCurrent(day)" class="day-badge current-badge">▶</span>
          </div>
          <p class="day-title">{{ training.days[day].title.split('—')[1]?.trim() || training.days[day].title }}</p>
        </button>
      </div>
    </div>

    <DayDetailModal v-if="selectedDay" :day="selectedDay" @close="selectedDay = null" />
  </section>
</template>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
  margin-bottom: var(--space-8);
  padding: var(--space-8);
  background: linear-gradient(135deg, var(--color-primary-soft), var(--color-surface) 60%);
}

.hero-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.hero-sub {
  margin-top: var(--space-2);
  color: var(--color-text-2);
  font-size: 14px;
}

.hero-progress {
  min-width: 260px;
  flex: 1;
  max-width: 380px;
}

.progress-label {
  margin-top: var(--space-2);
  font-size: 14px;
  color: var(--color-text-2);
}

.progress-label strong {
  color: var(--color-primary);
}

.phase {
  margin-bottom: var(--space-8);
}

.phase-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.phase-name {
  font-size: 18px;
  font-weight: 600;
}

.phase-desc {
  font-size: 13px;
  color: var(--color-text-3);
  margin-top: 2px;
}

.day-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--space-4);
}

.day-card {
  padding: var(--space-5);
}

.day-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.day-num {
  font-size: 28px;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--color-primary);
}

.day-card.done .day-num {
  color: var(--color-success);
}

.day-badge {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.done-badge {
  background: var(--color-success);
  color: #fff;
}

.current-badge {
  background: var(--color-primary);
  color: #fff;
}

.day-title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
}

.day-card.done {
  border-color: var(--color-success);
  background: var(--color-success-soft);
}

.day-card.done:hover {
  border-color: var(--color-success);
}

.day-card.current {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}

@media (max-width: 720px) {
  .hero {
    flex-direction: column;
    align-items: stretch;
    padding: var(--space-5);
  }

  .hero-progress {
    max-width: none;
  }
}
</style>
