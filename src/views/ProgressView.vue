<template>
  <section class="page fade-in">
    <div class="page-header">
      <h1 class="page-title">学习进度</h1>
      <p class="page-subtitle">坚持的每一天都在这里留下痕迹</p>
    </div>

    <!-- 总览数字 -->
    <div class="stat-grid">
      <div class="card stat-card">
        <span class="stat-num mono">{{ training.completedCount }}<small>/{{ training.totalDays }}</small></span>
        <span class="stat-name">训练天数</span>
        <div class="progress-track"><div class="progress-fill" :style="{ width: training.progressPercent + '%' }"></div></div>
      </div>
      <div class="card stat-card">
        <span class="stat-num mono">{{ practice.total }}</span>
        <span class="stat-name">练习次数</span>
        <span class="stat-sub">语音 · 朗读 · 即兴</span>
      </div>
      <div class="card stat-card">
        <span class="stat-num mono">{{ practice.avgScore }}</span>
        <span class="stat-name">平均得分</span>
        <span class="stat-sub">{{ practice.avgScore >= 80 ? '相当能打' : practice.avgScore >= 60 ? '稳步提升中' : '练起来！' }}</span>
      </div>
      <div class="card stat-card">
        <span class="stat-num mono">{{ checkinDaysCount }}</span>
        <span class="stat-name">打卡天数</span>
        <span class="stat-sub">每日清单勾选</span>
      </div>
      <div class="card stat-card">
        <span class="stat-num mono">{{ review.totalActive }}<small>/{{ review.cards.length }}</small></span>
        <span class="stat-name">复习卡片</span>
        <span class="stat-sub">在学/全部 · {{ review.graduatedCount }} 张已毕业</span>
      </div>
      <div class="card stat-card">
        <span class="stat-num mono">{{ ai.sessions.length }}</span>
        <span class="stat-name">AI 对战</span>
        <span class="stat-sub">陪练场次</span>
      </div>
    </div>

    <!-- 趋势 -->
    <div class="card chart-card">
      <h2 class="section-title">得分趋势 <span class="tag">近 14 天练习均分</span></h2>
      <TrendChart v-if="trendPoints.length" :points="trendPoints" />
      <div v-else class="empty-state">
        <div class="empty-icon">📈</div>
        <p>完成几次语音练习后，这里会出现你的得分曲线</p>
      </div>
    </div>

    <!-- 热力图 -->
    <div class="card chart-card">
      <h2 class="section-title">学习热力图 <span class="tag">近 16 周</span></h2>
      <HeatmapChart :data="heatmapData" />
    </div>

    <!-- 雷达 -->
    <div class="card chart-card">
      <h2 class="section-title">能力雷达 <span class="tag">六维</span></h2>
      <RadarChart :axes="radarAxes" />
      <div class="radar-legend">
        <p v-for="a in radarAxes" :key="a.label" class="legend-item">
          <span class="legend-dot"></span>{{ a.label }} · {{ a.value }} 分
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { trainingStore } from '../stores/training'
import { checkinStore } from '../stores/checkin'
import { practiceStore } from '../stores/practice'
import { reviewStore } from '../stores/review'
import { aiChatStore } from '../stores/aiChat'
import TrendChart from '../components/charts/TrendChart.vue'
import HeatmapChart from '../components/charts/HeatmapChart.vue'
import RadarChart from '../components/charts/RadarChart.vue'

const training = trainingStore()
const checkin = checkinStore()
const practice = practiceStore()
const review = reviewStore()
const ai = aiChatStore()

/* ---------- 打卡天数 ---------- */
const checkinDaysCount = computed(
  () => Object.values(checkin.checkins).filter((items) => Object.values(items).some(Boolean)).length
)

/* ---------- 趋势：近 14 天每日均分 ---------- */
const trendPoints = computed(() => {
  const byDay = new Map()
  const now = new Date()
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    byDay.set(fmtDate(d), [])
  }
  for (const r of practice.history) {
    const key = fmtDate(new Date(r.createdAt))
    if (byDay.has(key)) byDay.get(key).push(r.score)
  }
  return [...byDay.entries()]
    .filter(([, scores]) => scores.length > 0)
    .map(([date, scores]) => ({
      date: date.slice(5).replace('-', '/'),
      value: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }))
})

/* ---------- 热力图：每日学习次数 ---------- */
const heatmapData = computed(() => {
  const count = new Map()
  const bump = (ts) => {
    const key = fmtDate(new Date(ts))
    count.set(key, (count.get(key) || 0) + 1)
  }
  practice.history.forEach((r) => bump(r.createdAt))
  ai.sessions.forEach((s) => bump(s.endedAt || s.createdAt))
  return [...count.entries()].map(([date, c]) => ({ date, count: c }))
})

/* ---------- 雷达六维 ---------- */
const radarAxes = computed(() => [
  { label: '课程进度', value: Math.round((training.completedCount / training.totalDays) * 100) },
  { label: '练习质量', value: practice.avgScore },
  { label: '练习量', value: cap(practice.total / 20) },
  { label: '话术积累', value: cap(review.cards.length / 20) },
  { label: 'AI 实战', value: cap(ai.sessions.length / 5) },
  { label: '打卡习惯', value: cap(checkinDaysCount.value / 14) },
])

function cap(ratio) {
  return Math.round(Math.min(1, Math.max(0, ratio)) * 100)
}

function fmtDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}
</script>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}
.stat-card {
  padding: var(--space-4);
  display: grid;
  gap: var(--space-1);
  align-content: start;
}
.stat-num {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
}
.stat-num small { font-size: 15px; color: var(--color-text-3); font-weight: 500; }
.stat-name { font-size: 13px; color: var(--color-text-2); }
.stat-sub { font-size: 12px; color: var(--color-text-3); }
.progress-track { margin-top: var(--space-2); }

.chart-card { margin-bottom: var(--space-4); }
.section-title {
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
}

.radar-legend {
  margin-top: var(--space-4);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-5);
  justify-content: center;
}
.legend-item { font-size: 13px; color: var(--color-text-2); display: flex; align-items: center; gap: 6px; }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary); }

.mono { font-family: var(--font-mono); }
</style>
