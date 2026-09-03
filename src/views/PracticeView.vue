<template>
  <section class="page fade-in">
    <div class="page-header">
      <h1 class="page-title">语音练习</h1>
      <p class="page-subtitle">选一句话术，开口说出来，即时获得准确率与流利度评分</p>
    </div>

    <!-- 浏览器不支持语音识别 -->
    <div v-if="!speech.supported" class="card notice-card">
      <p>当前浏览器不支持语音识别，推荐使用 <strong>Chrome</strong> 或 <strong>Edge</strong>。</p>
      <p class="notice-sub">你仍可以手动输入复述内容进行评分（下拉见「手动输入」模式）。</p>
    </div>
    <div v-if="speech.error.value" class="card notice-card notice-error">
      <p>{{ speech.error.value }}</p>
    </div>

    <!-- 素材选择 -->
    <div class="card material-card">
      <div class="material-head">
        <h2 class="section-title">选择练习素材</h2>
        <button class="btn btn-ghost btn-sm" @click="randomPick">🎲 随机一句</button>
      </div>
      <div class="chip-row">
        <button
          v-for="g in phraseGroups"
          :key="g.id"
          class="chip"
          :class="{ active: activeGroup === g.id }"
          @click="activeGroup = g.id"
        >{{ g.name }}</button>
      </div>
      <div class="phrase-list">
        <button
          v-for="item in currentGroup.items"
          :key="item.id"
          class="phrase-item"
          :class="{ selected: target.text === item.text }"
          @click="pickPhrase(item)"
        >
          <span class="phrase-scene">{{ item.scene }}</span>
          <span class="phrase-text">{{ item.text }}</span>
        </button>
      </div>
    </div>

    <!-- 练习区 -->
    <div class="card practice-card">
      <div class="target-block">
        <span class="tag tag-primary">{{ target.scene || '自定义' }}</span>
        <p class="target-text">{{ target.text }}</p>
        <p v-if="target.tip" class="target-tip">💡 {{ target.tip }}</p>
      </div>

      <!-- 录音模式 -->
      <div v-if="speech.supported" class="record-zone">
        <button
          class="mic-btn"
          :class="{ recording: speech.listening.value }"
          :disabled="!target.text"
          @click="toggleRecord"
        >
          <span class="mic-icon">{{ speech.listening.value ? '⏹' : '🎙️' }}</span>
          <span class="mic-label">{{ speech.listening.value ? '停止' : '开始录音' }}</span>
        </button>
        <div class="record-meta">
          <span v-if="speech.listening.value" class="timer mono">{{ elapsedText }}</span>
          <p v-if="speech.listening.value" class="interim-text">
            {{ speech.interim.value || '请开口说话，识别内容会实时显示…' }}
          </p>
          <p v-else class="record-hint">点击麦克风，把上面这句话说出来</p>
        </div>
      </div>

      <!-- 手动输入模式（降级 / 自愿） -->
      <div v-if="!speech.supported || manualMode" class="manual-zone">
        <div v-if="speech.supported" class="manual-toggle">
          <button class="link-btn" @click="manualMode = false">返回录音模式</button>
        </div>
        <textarea
          v-model="manualText"
          class="textarea"
          placeholder="不看原文，凭记忆把这句话复述出来，写完点击提交评分"
        ></textarea>
        <button class="btn btn-primary" :disabled="!manualText.trim()" @click="submitManual">
          提交评分
        </button>
      </div>
      <div v-else class="manual-toggle">
        <button class="link-btn" @click="manualMode = true">不方便开口？切换手动输入 →</button>
      </div>

      <!-- 评分结果 -->
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
        <div class="result-extra">
          <div class="extra-item">
            <span class="extra-name">你说的内容</span>
            <p class="extra-val">{{ result.transcript }}</p>
          </div>
          <div class="extra-row">
            <span class="tag">语速 {{ result.rate }} 字/分</span>
            <span class="tag" :class="result.fillerCount > 2 ? 'tag-warning' : ''">
              填充词 {{ result.fillerCount }} 次<template v-if="result.fillerDetail">（{{ result.fillerDetail }}）</template>
            </span>
            <span class="tag">用时 {{ (result.durationMs / 1000).toFixed(1) }} 秒</span>
          </div>
        </div>
        <div class="result-actions">
          <button class="btn btn-ghost" @click="resetPractice">再练一遍</button>
          <button class="btn btn-primary" @click="randomPick">换一句练</button>
        </div>
      </div>
    </div>

    <!-- 练习历史 -->
    <div class="card history-card">
      <div class="material-head">
        <h2 class="section-title">最近练习 <span class="tag">{{ store.total }} 条 · 平均 {{ store.avgScore }} 分</span></h2>
        <button v-if="store.total" class="btn btn-ghost btn-sm" @click="confirmClear">清空历史</button>
      </div>
      <div v-if="!store.recent.length" class="empty-state">
        <div class="empty-icon">🎤</div>
        <p>还没有练习记录，完成第一次录音就会出现在这里</p>
      </div>
      <div v-else class="history-list">
        <div v-for="r in store.recent" :key="r.id" class="history-item">
          <div class="history-main">
            <span class="history-scene">{{ r.scene }}</span>
            <p class="history-target">{{ r.target }}</p>
            <p class="history-date">{{ formatDate(r.createdAt) }}</p>
          </div>
          <div class="history-score" :class="scoreClass(r.score)">{{ r.score }}</div>
          <button class="del-btn" title="删除" @click="store.removeRecord(r.id)">✕</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useSpeech } from '../composables/useSpeech'
import { practiceStore } from '../stores/practice'
import { phraseGroups } from '../data/phrases'
import { scorePhrase, speechRate, countFillers, scoreFeedback } from '../services/scoring'

const store = practiceStore()
const speech = useSpeech()

const activeGroup = ref(phraseGroups[0].id)
const target = ref({ scene: '', text: '', tip: '' })
const manualMode = ref(false)
const manualText = ref('')
const result = ref(null)

const currentGroup = computed(
  () => phraseGroups.find((g) => g.id === activeGroup.value) || phraseGroups[0]
)

/* ---------- 素材选择 ---------- */
function pickPhrase(item) {
  target.value = { scene: item.scene, text: item.text, tip: item.tip }
  resetResult()
}

function randomPick() {
  const pool = phraseGroups.flatMap((g) => g.items)
  const item = pool[Math.floor(Math.random() * pool.length)]
  const group = phraseGroups.find((g) => g.items.includes(item))
  activeGroup.value = group.id
  pickPhrase(item)
}

/* ---------- 录音流程 ---------- */
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
    manualMode.value = false
    startTime = Date.now()
    elapsedMs.value = 0
    timerId = setInterval(() => (elapsedMs.value = Date.now() - startTime), 100)
    const ok = speech.start()
    if (!ok) clearInterval(timerId)
  }
}

// 识别结束（listening→false）后统一结算，保证拿到最终 transcript
watch(
  () => speech.listening.value,
  (listening) => {
    if (!listening && pendingFinish.value) {
      pendingFinish.value = false
      clearInterval(timerId)
      const duration = Date.now() - startTime
      const text = speech.transcript.value.trim()
      if (text) {
        finishPractice(text, duration)
      } else {
        speech.error.value = '没有识别到内容，请靠近麦克风重试'
      }
    }
  }
)

/* ---------- 手动提交（降级模式） ---------- */
function submitManual() {
  const text = manualText.value.trim()
  if (!text) return
  finishPractice(text, 0)
}

/* ---------- 结算 ---------- */
function finishPractice(transcript, durationMs) {
  const s = scorePhrase(target.value.text, transcript)
  const rate = durationMs > 0 ? speechRate(transcript, durationMs) : 0
  const fillers = countFillers(transcript)
  result.value = {
    ...s,
    transcript,
    rate,
    fillerCount: fillers.count,
    fillerDetail: fillers.detail,
    durationMs,
  }
  store.addRecord({
    type: 'phrase',
    scene: target.value.scene || '自定义',
    target: target.value.text,
    transcript,
    score: s.score,
    accuracy: s.accuracy,
    completeness: s.completeness,
    fluency: s.fluency,
    rate,
    fillerCount: fillers.count,
    durationMs,
  })
}

const feedback = computed(() => scoreFeedback(result.value ? result.value.score : 0))

function resetResult() {
  result.value = null
  manualText.value = ''
}

function resetPractice() {
  resetResult()
}

function confirmClear() {
  if (window.confirm('确定清空全部练习记录吗？此操作不可恢复。')) {
    store.clearHistory()
  }
}

function scoreClass(score) {
  if (score >= 80) return 'score-good'
  if (score >= 60) return 'score-mid'
  return 'score-low'
}

function formatDate(ts) {
  const d = new Date(ts)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${mm}-${dd} ${hh}:${mi}`
}

onUnmounted(() => clearInterval(timerId))

// 默认选中第一句
pickPhrase(phraseGroups[0].items[0])
</script>

<style scoped>
.notice-card {
  margin-bottom: var(--space-4);
  padding: var(--space-4) var(--space-6);
}
.notice-card p { font-size: 14px; }
.notice-sub { margin-top: var(--space-1); color: var(--color-text-2); }
.notice-error { border-color: var(--color-danger); }

.section-title {
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.material-card { margin-bottom: var(--space-4); }
.material-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.btn-sm { padding: 5px 12px; font-size: 13px; }

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}
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
.chip.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.phrase-list {
  display: grid;
  gap: var(--space-2);
  max-height: 264px;
  overflow-y: auto;
}
.phrase-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  text-align: left;
  transition: all 0.15s ease;
}
.phrase-item:hover { border-color: var(--color-primary); }
.phrase-item.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}
.phrase-scene { font-size: 12px; color: var(--color-text-3); }
.phrase-text { font-size: 14px; line-height: 1.5; }

/* 练习区 */
.practice-card { margin-bottom: var(--space-4); }
.target-block { margin-bottom: var(--space-6); }
.target-text {
  margin-top: var(--space-2);
  font-size: 18px;
  font-weight: 600;
  line-height: 1.6;
}
.target-tip { margin-top: var(--space-1); font-size: 13px; color: var(--color-text-2); }

.record-zone {
  display: flex;
  align-items: center;
  gap: var(--space-5);
}
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
.mic-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
.mic-btn.recording {
  background: var(--color-danger);
  animation: pulse 1.4s ease infinite;
}
.mic-icon { font-size: 26px; }
.mic-label { font-size: 12px; }

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 var(--color-danger-soft); }
  50% { box-shadow: 0 0 0 14px transparent; }
}

.record-meta { flex: 1; min-width: 0; }
.timer { font-size: 22px; font-weight: 600; color: var(--color-danger); }
.interim-text {
  font-size: 14px;
  color: var(--color-text-2);
  margin-top: var(--space-1);
  line-height: 1.6;
}
.record-hint { font-size: 13px; color: var(--color-text-3); }

.manual-zone { display: grid; gap: var(--space-3); margin-top: var(--space-4); }
.manual-toggle { margin-top: var(--space-3); }
.link-btn {
  font-size: 13px;
  color: var(--color-accent);
  padding: 0;
}
.link-btn:hover { text-decoration: underline; }

/* 结果区 */
.result-zone {
  margin-top: var(--space-6);
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-border);
  display: grid;
  gap: var(--space-5);
}
.result-score { text-align: center; }
.score-big {
  font-size: 56px;
  font-weight: 700;
  line-height: 1;
  font-family: var(--font-mono);
}
.score-good { color: var(--color-success); }
.score-mid { color: var(--color-warning); }
.score-low { color: var(--color-danger); }
.score-label { margin-top: var(--space-1); font-size: 13px; color: var(--color-text-3); }
.score-feedback { margin-top: var(--space-2); font-size: 14px; }
.feedback-positive { color: var(--color-success); }
.feedback-neutral { color: var(--color-warning); }
.feedback-negative { color: var(--color-danger); }

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}
.metric { display: grid; gap: var(--space-2); }
.metric-name { font-size: 13px; color: var(--color-text-2); }
.metric-val { font-size: 14px; font-weight: 600; }

.result-extra { display: grid; gap: var(--space-3); }
.extra-item { display: grid; gap: var(--space-1); }
.extra-name { font-size: 12px; color: var(--color-text-3); }
.extra-val {
  font-size: 14px;
  line-height: 1.6;
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface-2);
  border-radius: var(--radius-md);
}
.extra-row { display: flex; flex-wrap: wrap; gap: var(--space-2); }

.result-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
}

/* 历史 */
.history-list { display: grid; gap: var(--space-2); }
.history-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-md);
}
.history-main { flex: 1; min-width: 0; }
.history-scene { font-size: 12px; color: var(--color-text-3); }
.history-target {
  font-size: 14px;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.history-date { font-size: 12px; color: var(--color-text-3); }
.history-score {
  font-size: 20px;
  font-weight: 700;
  font-family: var(--font-mono);
  flex-shrink: 0;
}
.del-btn {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  color: var(--color-text-3);
  font-size: 13px;
  transition: all 0.15s ease;
}
.del-btn:hover { background: var(--color-danger-soft); color: var(--color-danger); }

.mono { font-family: var(--font-mono); }

@media (max-width: 640px) {
  .metric-grid { grid-template-columns: 1fr; }
  .record-zone { flex-direction: column; text-align: center; }
  .history-item { flex-wrap: wrap; }
}
</style>
