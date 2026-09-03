<template>
  <svg
    class="trend-chart"
    :viewBox="`0 0 ${W} ${H}`"
    role="img"
    aria-label="练习得分趋势图"
  >
    <!-- 网格线 -->
    <g class="grid">
      <line v-for="g in gridLines" :key="g.y" x1="40" :y1="g.y" :x2="W - 8" :y2="g.y" />
    </g>
    <g class="axis-label">
      <text v-for="g in gridLines" :key="'t' + g.y" x="34" :y="g.y + 4" text-anchor="end">{{ g.label }}</text>
    </g>

    <!-- 面积 -->
    <polygon v-if="points.length > 1" :points="areaPoints" class="area" />

    <!-- 折线 -->
    <polyline v-if="points.length > 1" :points="linePoints" class="line" />

    <!-- 数据点 -->
    <g>
      <circle v-for="(p, i) in coords" :key="i" :cx="p.x" :cy="p.y" r="3.5" class="dot">
        <title>{{ p.date }}：{{ p.value }} 分</title>
      </circle>
    </g>

    <!-- x 轴标签（最多 7 个均匀采样） -->
    <g class="axis-label">
      <text
        v-for="(p, i) in xLabels"
        :key="'x' + i"
        :x="p.x"
        :y="H - 6"
        text-anchor="middle"
      >{{ p.label }}</text>
    </g>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** [{date: 'MM-DD', value: 0-100}] */
  points: { type: Array, default: () => [] },
})

const W = 640
const H = 240
const PAD_L = 44
const PAD_B = 24
const PAD_T = 12

const gridLines = computed(() => {
  const bottom = H - PAD_B
  const step = (bottom - PAD_T) / 4
  return [0, 1, 2, 3, 4].map((i) => ({
    y: bottom - step * i,
    label: String(100 - i * 25),
  }))
})

const coords = computed(() => {
  const pts = props.points
  if (!pts.length) return []
  const bottom = H - PAD_B
  const usableW = W - PAD_L - 12
  const xStep = pts.length > 1 ? usableW / (pts.length - 1) : 0
  return pts.map((p, i) => ({
    x: PAD_L + xStep * i + (pts.length === 1 ? usableW / 2 : 0),
    y: bottom - (Math.max(0, Math.min(100, p.value)) / 100) * (bottom - PAD_T),
    date: p.date,
    value: p.value,
  }))
})

const linePoints = computed(() => coords.value.map((c) => `${c.x},${c.y}`).join(' '))

const areaPoints = computed(() => {
  if (coords.value.length < 2) return ''
  const bottom = H - PAD_B
  const first = coords.value[0]
  const last = coords.value[coords.value.length - 1]
  return `${first.x},${bottom} ${linePoints.value} ${last.x},${bottom}`
})

const xLabels = computed(() => {
  const pts = props.points
  if (!pts.length) return []
  const max = Math.min(7, pts.length)
  const idxs = new Set()
  for (let i = 0; i < max; i++) {
    idxs.add(Math.round((i * (pts.length - 1)) / (max - 1 || 1)))
  }
  return [...idxs].map((i) => ({ x: coords.value[i].x, label: pts[i].date }))
})
</script>

<style scoped>
.trend-chart { width: 100%; height: auto; display: block; }
.grid line { stroke: var(--color-border-2); stroke-width: 1; }
.axis-label text { fill: var(--color-text-3); font-size: 11px; font-family: var(--font-mono); }
.area { fill: var(--color-primary); opacity: 0.08; }
.line {
  fill: none;
  stroke: var(--color-primary);
  stroke-width: 2.5;
  stroke-linejoin: round;
  stroke-linecap: round;
}
.dot { fill: var(--color-surface); stroke: var(--color-primary); stroke-width: 2; }
</style>
