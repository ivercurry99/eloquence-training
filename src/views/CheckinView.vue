<script setup>
import { computed, ref } from 'vue'
import { checkinStore } from '../stores/checkin'
import { trainingStore } from '../stores/training'
import { checkinLists } from '../data/checkinLists'

const checkin = checkinStore()
const training = trainingStore()

const expandedDay = ref(null)

const dayStats = computed(() => {
  const stats = {}
  for (let day = 1; day <= 14; day++) {
    const total = checkinLists[day].length
    const done = checkinLists[day].filter((_, i) => checkin.isChecked(day, String(i + 1))).length
    stats[day] = { total, done, percent: Math.round((done / total) * 100) }
  }
  return stats
})

const overallDone = computed(() =>
  Object.values(dayStats.value).reduce((sum, s) => sum + s.done, 0)
)
const overallTotal = computed(() =>
  Object.values(dayStats.value).reduce((sum, s) => sum + s.total, 0)
)

function toggleExpand(day) {
  expandedDay.value = expandedDay.value === day ? null : day
}
</script>

<template>
  <section class="page fade-in">
    <div class="page-header">
      <h1 class="page-title">📋 每日打卡</h1>
      <p class="page-subtitle">诚实记录，不追求完美 · 已勾 {{ overallDone }}/{{ overallTotal }} 项</p>
    </div>

    <div v-for="phase in training.phaseProgress" :key="phase.id" class="phase-block">
      <h2 class="phase-name">{{ phase.name }}</h2>

      <div v-for="day in phase.days" :key="day" class="card day-block">
        <button class="day-block-header" @click="toggleExpand(day)">
          <div class="day-info">
            <span class="day-label" :class="{ done: training.isCompleted(day) }">
              Day {{ day }}
            </span>
            <span class="day-name">{{ training.days[day].title.split('—')[1]?.trim() }}</span>
          </div>
          <div class="day-meta">
            <div class="progress-track mini">
              <div
                class="progress-fill"
                :class="{ full: dayStats[day].percent === 100 }"
                :style="{ width: dayStats[day].percent + '%' }"
              ></div>
            </div>
            <span class="day-count">{{ dayStats[day].done }}/{{ dayStats[day].total }}</span>
            <span class="expand-icon" :class="{ open: expandedDay === day }">▾</span>
          </div>
        </button>

        <div v-show="expandedDay === day" class="day-block-body">
          <label v-for="(item, i) in checkinLists[day]" :key="i" class="check-item">
            <input
              type="checkbox"
              :checked="checkin.isChecked(day, String(i + 1))"
              @change="checkin.setCheck(day, String(i + 1), $event.target.checked)"
            />
            <span>{{ item }}</span>
          </label>

          <div class="note-field">
            <label>今日笔记</label>
            <textarea
              class="textarea"
              :value="checkin.getNote(String(day))"
              placeholder="今天卡在哪里？哪一句最顺？"
              @input="checkin.setNote(String(day), $event.target.value)"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.phase-block {
  margin-bottom: var(--space-8);
}

.phase-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--space-4);
  color: var(--color-text-2);
}

.day-block {
  padding: 0;
  margin-bottom: var(--space-3);
  overflow: hidden;
}

.day-block-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  gap: var(--space-4);
}

.day-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.day-label {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-soft);
  padding: 2px 10px;
  border-radius: 999px;
  white-space: nowrap;
}

.day-label.done {
  color: var(--color-success);
  background: var(--color-success-soft);
}

.day-name {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.day-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
}

.progress-track.mini {
  width: 80px;
  height: 6px;
}

.progress-fill.full {
  background: var(--color-success);
}

.day-count {
  font-size: 13px;
  font-family: var(--font-mono);
  color: var(--color-text-3);
}

.expand-icon {
  color: var(--color-text-3);
  transition: transform 0.2s ease;
  font-size: 12px;
}

.expand-icon.open {
  transform: rotate(180deg);
}

.day-block-body {
  padding: var(--space-4) var(--space-5) var(--space-5);
  border-top: 1px solid var(--color-border-2);
}

.check-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-2) 0;
  font-size: 14px;
  cursor: pointer;
}

.check-item input {
  margin-top: 4px;
  accent-color: var(--color-primary);
}

.note-field {
  margin-top: var(--space-4);
}

.note-field label {
  display: block;
  font-size: 13px;
  color: var(--color-text-2);
  margin-bottom: var(--space-2);
}
</style>
