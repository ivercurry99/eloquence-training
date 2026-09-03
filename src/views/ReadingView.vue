<template>
  <section class="page fade-in">
    <div class="page-header">
      <h1 class="page-title">朗读训练</h1>
      <p class="page-subtitle">绕口令练咬字，美文练语感——开口读出来，AI 帮你测准确度与语速</p>
    </div>

    <div v-if="speech.error.value" class="card notice-error">
      <p>{{ speech.error.value }}</p>
    </div>

    <!-- 素材选择 -->
    <div class="card">
      <div class="material-head">
        <h2 class="section-title">选择素材</h2>
        <button class="btn btn-ghost btn-sm" @click="randomPick">🎲 随机一篇</button>
      </div>
      <div class="chip-row">
        <button
          v-for="c in readingCategories"
          :key="c.id"
          class="chip"
          :class="{ active: activeCat === c.id }"
          @click="activeCat = c.id"
        >{{ c.name }}</button>
      </div>
      <div class="item-list">
        <button
          v-for="item in currentItems"
          :key="item.id"
          class="item-card"
          :class="{ selected: selected && selected.id === item.id }"
          @click="selectItem(item)"
        >
          <div class="item-top">
            <span class="item-title">{{ item.title }}</span>
            <span v-if="item.level" class="tag" :class="levelClass(item.level)">{{ item.level }}</span>
          </div>
          <p class="item-text">{{ item.text }}</p>
        </button>
      </div>
    </div>

    <!-- 朗读区 -->
    <div v-if="selected" class="card practice-card">
      <div class="target-block">
        <div class="target-top">
          <span class="tag tag-primary">{{ selected.title }}</span>
          <span v-if="bestScore" class="tag tag-success">最佳 {{ bestScore }} 分</span>
        </div>
        <p class="target-text">{{ selected.text }}</p>
        <p class="target-tip">💡 {{ selected.tip }}</p>
      </div>

      <div v-if="speech.supported" class="record-zone">
        <button
          class="mic-btn"
          :class="{ recording: speech.listening.value }"
          @click="toggleRecord"
        >
          <span class="mic-icon">{{ speech.listening.value ? '⏹' : '🎙️' }}</span>
          <span class="mic-label">{{ speech.listening.value ? '停止' : '开始朗读' }}</span>
        </button>
        <div class="record-meta">
          <span v-if="speech.listening.value" class="timer mono">{{ elapsedText }}</span>
          <p v-if="speech.listening.value" class="interim-text">
            {{ speech.interim.value || '朗读内容实时识别中…' }}
          </p>
          <p v-else class="record-hint">先默读一遍，再匀速朗读，追求准确不追求快</p>
        </div>
      </div>
      <div v-else class="card notice-card">
        <p>当前浏览器不支持语音识别，推荐 Chrome / Edge。</p>
      </div>

      <!-- 结果 -->
      <div v-if="result" class="result-zone fade-in">
        <div class="result-score">
          <div class="score-big" :class="scoreClass(result.score)">{{ result.score }}</div>
          <div class="score-label">综合得分</div>
          <p class="score-feedback" :class="`feedback-${feedback.type}`">{{ feedback.text }}</p>
        </div>
        <div class="metric-grid">
          <div class="metric">
            <span class="metric-name">准确率</span>
            <div class="progress-track"><div class="progress-fill" :style="{ width: result.accuracy + '%' }"></div></div>
            <span class="metric-val mono">{{ result.accuracy }}%</span>
          </div>
          <div class="metric">
            <span class="metric-name">完整度</span>
            <div class="progress-track"><div class="progress-fill" :style="{ width: result.completeness + '%' }"></div></div>
            <span class="metric-val mono">{{ result.completeness }}%</span>
          </div>
          <div class="metric">
            <span class="metric-name">流利度</span>
            <div class="progress-track"><div class="progress-fill" :style="{ width: result.fluency + '%' }"></div></div>
            <span class="metric-val mono">{{ result.fluency }}%</span>
          </div>
        </div>
        <div class="extra-row">
          <span class="tag">语速 {{ result.rate }} 字/分</span>
          <span class="tag" :class="result.fillerCount > 2 ? 'tag-warning' : ''">填充词 {{ result.fillerCount }} 次</span>
          <span class="tag">用时 {{ (result.durationMs / 1000).toFixed(1) }} 秒</span>
        </div>
        <div class="result-actions">
          <button class="btn btn-ghost" @click="resetResult">再读一遍</button>
          <button class="btn btn-primary" @click="randomPick">换一篇</button>
        </div>
      </div>
    </div>

    <!-- 历史成绩 -->
    <div class="card" v-if="history.length">
      <h2 class="section-title" style="margin-bottom: 16px">这篇的往期成绩</h2>
      <div class="history-list">
        <div v-for="r in history" :key="r.id" class="history-item">
          <span class="history-date">{{ formatDate(r.createdAt) }}</span>
          <span class="history-text">{{ r.transcript.slice(0, 40) }}{{ r.transcript.length > 40 ? '…' : '' }}</span>
          <span class="history-score" :class="scoreClass(r.score)">{{ r.score }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useSpeech } from '../composables/useSpeech'
import { practiceStore } from '../stores/practice'
import { readingCategories } from '../data/readings'
import { scorePhrase, speechRate, countFillers, scoreFeedback } from '../services/scoring'

const store = practiceStore()
const speech = useSpeech()

const activeCat = ref(readingCategories[0].id)
const selected = ref(null)
const result = ref(null)

const currentItems = computed(
  () => readingCategories.find((c) => c.id === activeCat.value)?.items || []
)

const history = computed(() =>
  selected.value
    ? store.history
        .filter((r) => r.type === 'reading' && r.target === selected.value.text)
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5)
    : []
)

const bestScore = computed(() =>
  history.value.length ? Math.max(...history.value.map((r) => r.score)) : null
)

/* ---------- 选择 ---------- */
function selectItem(item) {
  selected.value = item
  resetResult()
}

function randomPick() {
  const cat = readingCategories[Math.floor(Math.random() * readingCategories.length)]
  activeCat.value = cat.id
  selectItem(cat.items[Math.floor(Math.random() * cat.items.length)])
}

/* ---------- 录音 ---------- */
let startTime = 0
let timerId = null
const elapsedMs = ref(0)
const pendingFinish = ref(false)

const elapsedText = computed(() => (elapsedMs.value / 1000).toFixed(1) + 's')

function toggleRecord() {
  if (speech.listening.value) {
    pendingFinish.value = true
    speech.stop()
  } else {
    resetResult()
    startTime = Date.now()
    elapsedMs.value = 0
    timerId = setInterval(() => (elapsedMs.value = Date.now() - startTime), 100)
    if (!speech.start()) clearInterval(timerId)
  }
}

watch(
  () => speech.listening.value,
  (listening) => {
    if (!listening && pendingFinish.value) {
      pendingFinish.value = false
      clearInterval(timerId)
      const duration = Date.now() - startTime
      const text = speech.transcript.value.trim()
      if (text) finishReading(text, duration)
      else speech.error.value = '没有识别到内容，请靠近麦克风重试'
    }
  }
)

/* ---------- 结算 ---------- */
function finishReading(transcript, durationMs) {
  const s = scorePhrase(selected.value.text, transcript)
  const fillers = countFillers(transcript)
  result.value = {
    ...s,
    transcript,
    rate: speechRate(transcript, durationMs),
    fillerCount: fillers.count,
    fillerDetail: fillers.detail,
    durationMs,
  }
  store.addRecord({
    type: 'reading',
    scene: selected.value.title,
    target: selected.value.text,
    transcript,
    score: s.score,
    accuracy: s.accuracy,
    completeness: s.completeness,
    fluency: s.fluency,
    rate: result.value.rate,
    fillerCount: fillers.count,
    durationMs,
  })
}

const feedback = computed(() => scoreFeedback(result.value ? result.value.score : 0))

function resetResult() {
  result.value = null
}

function scoreClass(score) {
  if (score >= 80) return 'score-good'
  if (score >= 60) return 'score-mid'
  return 'score-low'
}

function levelClass(level) {
  if (level === '初级') return 'tag-success'
  if (level === '中级') return 'tag-warning'
  return 'tag-danger'
}

function formatDate(ts) {
  const d = new Date(ts)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${mm}-${dd} ${hh}:${mi}`
}

selectItem(currentItems.value[0])
</script>

<style scoped>
.notice-error {
  margin-bottom: var(--space-4);
  padding: var(--space-4) var(--space-6);
  border-color: var(--color-danger);
  font-size: 14px;
}
.notice-card { margin: var(--space-4) 0; font-size: 14px; }

.section-title { font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: var(--space-2); }
.material-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-4); }
.btn-sm { padding: 5px 12px; font-size: 13px; }

.chip-row { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-4); }
.chip {
  padding: 5px 14px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  font-size: 13px;
  color: var(--color-text-2);
  transition: all 0.15s ease;
}
.chip:hover { border-color: var(--color-primary); color: var(--color-primary); }
.chip.active { background: var(--color-primary); border-color: var(--color-primary); color: #fff; }

.item-list { display: grid; gap: var(--space-2); max-height: 280px; overflow-y: auto; }
.item-card {
  display: grid;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  text-align: left;
  transition: all 0.15s ease;
}
.item-card:hover { border-color: var(--color-primary); }
.item-card.selected { border-color: var(--color-primary); background: var(--color-primary-soft); }
.item-top { display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); }
.item-title { font-size: 14px; font-weight: 500; }
.item-text {
  font-size: 13px;
  color: var(--color-text-2);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.practice-card { margin-top: var(--space-4); }
.target-block { margin-bottom: var(--space-6); }
.target-top { display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2); }
.target-text { font-size: 17px; font-weight: 600; line-height: 1.8; }
.target-tip { margin-top: var(--space-2); font-size: 13px; color: var(--color-text-2); }

.record-zone { display: flex; align-items: center; gap: var(--space-5); }
.mic-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 92px;
  height: 92px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  box-shadow: var(--shadow-primary);
  flex-shrink: 0;
  transition: all 0.18s ease;
}
.mic-btn:hover { transform: translateY(-2px); background: var(--color-primary-hover); }
.mic-btn.recording { background: var(--color-danger); animation: pulse 1.4s ease infinite; }
.mic-icon { font-size: 26px; }
.mic-label { font-size: 12px; }
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 var(--color-danger-soft); }
  50% { box-shadow: 0 0 0 14px transparent; }
}
.record-meta { flex: 1; min-width: 0; }
.timer { font-size: 22px; font-weight: 600; color: var(--color-danger); }
.interim-text { font-size: 14px; color: var(--color-text-2); margin-top: var(--space-1); line-height: 1.6; }
.record-hint { font-size: 13px; color: var(--color-text-3); }

.result-zone {
  margin-top: var(--space-6);
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-border);
  display: grid;
  gap: var(--space-5);
}
.result-score { text-align: center; }
.score-big { font-size: 56px; font-weight: 700; line-height: 1; font-family: var(--font-mono); }
.score-good { color: var(--color-success); }
.score-mid { color: var(--color-warning); }
.score-low { color: var(--color-danger); }
.score-label { margin-top: var(--space-1); font-size: 13px; color: var(--color-text-3); }
.score-feedback { margin-top: var(--space-2); font-size: 14px; }
.feedback-positive { color: var(--color-success); }
.feedback-neutral { color: var(--color-warning); }
.feedback-negative { color: var(--color-danger); }

.metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); }
.metric { display: grid; gap: var(--space-2); }
.metric-name { font-size: 13px; color: var(--color-text-2); }
.metric-val { font-size: 14px; font-weight: 600; }

.extra-row { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.result-actions { display: flex; gap: var(--space-3); justify-content: center; }

.history-list { display: grid; gap: var(--space-2); margin-top: var(--space-3); }
.history-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-md);
  font-size: 13px;
}
.history-date { color: var(--color-text-3); flex-shrink: 0; }
.history-text { flex: 1; min-width: 0; color: var(--color-text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.history-score { font-size: 18px; font-weight: 700; font-family: var(--font-mono); flex-shrink: 0; }
.card { margin-top: var(--space-4); }
.card:first-of-type { margin-top: 0; }

.mono { font-family: var(--font-mono); }

@media (max-width: 640px) {
  .metric-grid { grid-template-columns: 1fr; }
  .record-zone { flex-direction: column; text-align: center; }
  .history-item { flex-wrap: wrap; }
}
</style>
