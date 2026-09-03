<template>
  <div class="heatmap-wrap">
    <svg
      class="heatmap"
      :viewBox="`0 0 ${svgW} ${svgH}`"
      role="img"
      aria-label="学习活跃热力图"
    >
      <!-- 月份标签 -->
      <g class="month-label">
        <text
          v-for="m in monthMarks"
          :key="m.key"
          :x="m.x"
          y="10"
        >{{ m.label }}</text>
      </g>
      <!-- 星期标签 -->
      <g class="weekday-label">
        <text x="14" :y="cellTop(1) + cellSize * 0.7">一</text>
        <text x="14" :y="cellTop(3) + cellSize * 0.7">三</text>
        <text x="14" :y="cellTop(5) + cellSize * 0.7">五</text>
      </g>
      <!-- 单元格 -->
      <g>
        <rect
          v-for="cell in cells"
          :key="cell.key"
          :x="cell.x"
          :y="cell.y"
          :width="cellSize"
          :height="cellSize"
          rx="3"
          class="cell"
          :class="`lv${cell.level}`"
        >
          <title>{{ cell.date }}：{{ cell.count }} 次学习</title>
        </rect>
      </g>
    </svg>
    <div class="legend">
      <span class="legend-text">少</span>
      <span class="legend-cell lv0"></span>
      <span class="legend-cell lv1"></span>
      <span class="legend-cell lv2"></span>
      <span class="legend-cell lv3"></span>
      <span class="legend-text">多</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** [{date: 'YYYY-MM-DD', count: number}]，缺省日期视为 0 */
  data: { type: Array, default: () => [] },
  weeks: { type: Number, default: 16 },
})

const cellSize = 13
const cellGap = 3
const padLeft = 24
const padTop = 18

const svgW = padLeft + props.weeks * (cellSize + cellGap)
const svgH = padTop + 7 * (cellSize + cellGap)

const countMap = computed(() => {
  const map = new Map()
  for (const d of props.data) map.set(d.date, d.count)
  return map
})

/** 从本周周一往前推 weeks 周，生成 cells（旧→新） */
const cells = computed(() => {
  const today = new Date()
  const day = today.getDay() === 0 ? 7 : today.getDay() // 周一=1
  const monday = new Date(today)
  monday.setDate(today.getDate() - day + 1)
  monday.setHours(0, 0, 0, 0)

  const out = []
  const maxCount = Math.max(1, ...countMap.value.values())
  for (let w = props.weeks - 1; w >= 0; w--) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() - w * 7 + d)
      if (date > today) continue
      const key = fmt(date)
      const count = countMap.value.get(key) || 0
      const level = count === 0 ? 0 : Math.ceil((count / maxCount) * 3)
      out.push({
        key,
        x: padLeft + (props.weeks - 1 - w) * (cellSize + cellGap),
        y: padTop + d * (cellSize + cellGap),
        date: key,
        count,
        level: Math.min(3, level),
      })
    }
  }
  return out
})

const monthMarks = computed(() => {
  const marks = []
  let lastMonth = -1
  for (const c of cells.value) {
    const m = Number(c.date.slice(5, 7))
    if (m !== lastMonth) {
      marks.push({ key: c.key, x: c.x, label: `${m}月` })
      lastMonth = m
    }
  }
  return marks
})

function cellTop(row) {
  return padTop + row * (cellSize + cellGap)
}

function fmt(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}
</script>

<style scoped>
.heatmap-wrap { overflow-x: auto; }
.heatmap { display: block; min-width: 560px; }
.cell.lv0 { fill: var(--color-surface-3); }
.cell.lv1 { fill: var(--color-primary); opacity: 0.35; }
.cell.lv2 { fill: var(--color-primary); opacity: 0.65; }
.cell.lv3 { fill: var(--color-primary); opacity: 1; }
.month-label text, .weekday-label text { fill: var(--color-text-3); font-size: 10px; }
.legend {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: var(--space-2);
  justify-content: flex-end;
}
.legend-text { font-size: 11px; color: var(--color-text-3); }
.legend-cell {
  width: 11px;
  height: 11px;
  border-radius: 3px;
}
.legend-cell.lv0 { background: var(--color-surface-3); }
.legend-cell.lv1 { background: var(--color-primary); opacity: 0.35; }
.legend-cell.lv2 { background: var(--color-primary); opacity: 0.65; }
.legend-cell.lv3 { background: var(--color-primary); }
</style>
