<template>
  <svg
    class="radar-chart"
    :viewBox="`0 0 ${size} ${size}`"
    role="img"
    aria-label="能力雷达图"
  >
    <!-- 同心网格 -->
    <polygon
      v-for="ring in rings"
      :key="ring"
      :points="ringPoints(ring)"
      class="grid"
    />
    <!-- 轴线 -->
    <line
      v-for="(a, i) in axes"
      :key="'axis' + i"
      :x1="cx"
      :y1="cy"
      :x2="vertex(i, 1).x"
      :y2="vertex(i, 1).y"
      class="axis"
    />
    <!-- 数据面 -->
    <polygon :points="dataPoints" class="data" />
    <g v-for="(p, i) in dataCoords" :key="'d' + i">
      <circle :cx="p.x" :cy="p.y" r="3.5" class="data-dot">
        <title>{{ axes[i].label }}：{{ axes[i].value }} 分</title>
      </circle>
    </g>
    <!-- 轴标签 -->
    <g class="labels">
      <text
        v-for="(a, i) in axes"
        :key="'l' + i"
        :x="vertex(i, 1.22).x"
        :y="vertex(i, 1.22).y"
        :text-anchor="labelAnchor(i)"
        :dominant-baseline="labelBaseline(i)"
      >{{ a.label }}</text>
    </g>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** [{label, value(0-100)}]，2-8 个维度 */
  axes: { type: Array, required: true },
})

const size = 320
const cx = size / 2
const cy = size / 2
const radius = 118

const rings = [0.33, 0.66, 1]

function angleOf(i) {
  const n = props.axes.length
  return -Math.PI / 2 + (i * 2 * Math.PI) / n
}

function vertex(i, scale) {
  return {
    x: cx + Math.cos(angleOf(i)) * radius * scale,
    y: cy + Math.sin(angleOf(i)) * radius * scale,
  }
}

const ringPoints = (scale) =>
  props.axes.map((_, i) => {
    const v = vertex(i, scale)
    return `${v.x},${v.y}`
  }).join(' ')

const dataCoords = computed(() =>
  props.axes.map((a, i) => {
    const v = Math.max(0, Math.min(100, a.value)) / 100
    return vertex(i, v)
  })
)

const dataPoints = computed(() =>
  dataCoords.value.map((c) => `${c.x},${c.y}`).join(' ')
)

function labelAnchor(i) {
  const x = Math.cos(angleOf(i))
  if (Math.abs(x) < 0.3) return 'middle'
  return x > 0 ? 'start' : 'end'
}

function labelBaseline(i) {
  const y = Math.sin(angleOf(i))
  if (Math.abs(y) < 0.3) return 'middle'
  return y > 0 ? 'hanging' : 'auto'
}
</script>

<style scoped>
.radar-chart { width: 100%; max-width: 340px; height: auto; display: block; margin: 0 auto; }
.grid { fill: none; stroke: var(--color-border-2); stroke-width: 1; }
.axis { stroke: var(--color-border-2); stroke-width: 1; }
.data {
  fill: var(--color-primary);
  fill-opacity: 0.18;
  stroke: var(--color-primary);
  stroke-width: 2;
  stroke-linejoin: round;
}
.data-dot { fill: var(--color-primary); }
.labels text { fill: var(--color-text-2); font-size: 12px; }
</style>
