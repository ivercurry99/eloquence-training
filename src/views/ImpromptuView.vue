<template>
  <section class="page fade-in">
    <div class="page-header">
      <h1 class="page-title">即兴演讲</h1>
      <p class="page-subtitle">随机抽题 · 30 秒准备 · 1-3 分钟开讲，训练临场组织语言的能力</p>
    </div>

    <div v-if="speech.error.value" class="card notice-error"><p>{{ speech.error.value }}</p></div>

    <!-- 抽题阶段 -->
    <div v-if="phase === 'idle'" class="card">
      <div class="material-head">
        <h2 class="section-title">抽一道题</h2>
        <button class="btn btn-primary" @click="drawTopic('全部')">🎲 开始抽题</button>
      </div>
      <div class="chip-row">
        <button
          v-for="c in topicCategories"
          :key="c"
          class="chip"
          :class="{ active: category === c }"
          @click="drawTopic(c)"
        >{{ c }}</button>
      </div>
      <p class="mode-hint">点分类直接抽对应方向的题；抽到的题会附赠一个万能结构提示。</p>

      <!-- 最近记录 -->
      <div v-if="recentImpromptu.length" class="recent-zone">
        <h3 class="sub-title">最近的挑战</h3>
        <div v-for="r in recentImpromptu" :key="r.id" class="history-item">
          <div class="history-main">
            <p class="history-topic">{{ r.target }}</p>
            <p class="history-meta">{{ formatDate(r.createdAt) }} · {{ r.durationText }}</p>
          </div>
          <div class="history-right">
            <div class="stars-mini">自评 {{ avgSelf(r) }} 分</div>
            <span class="history-score" :class="scoreClass(r.score)">{{ r.score }}</span>
            <button class="del-btn" @click="store.removeRecord(r.id)">✕</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 题目卡 -->
    <div v-if="topic && phase !== 'result'" class="card topic-card">
      <div class="topic-head">
        <span class="tag tag-primary">{{ topic.category }}</span>
        <button v-if="phase === 'idle'" class="btn btn-ghost btn-sm" @click="drawTopic(category)">换一题</button>
      </div>
      <h2 class="topic-title">{{ topic.title }}</h2>
      <p class="topic-structure">🧭 结构提示：{{ topic.structure }}</p>
      <div v-if="phase === 'idle'" class="topic-actions">
        <button class="btn btn-primary" @click="startPrepare">开始准备（30 秒）</button>
      </div>
    </div>

    <!-- 准备阶段 -->
    <div v-if="phase === 'prepare'" class="card phase-card">
      <p class="phase-label">准备倒计时</p>
      <div class="countdown mono">{{ prepareLeft }}</div>
      <p class="phase-hint">用结构提示快速搭框架：观点 → 一两个例子 → 收尾。可以低声预演开头第一句。</p>
      <div class="phase-actions">
        <button class="btn btn-primary" @click="startSpeaking">我准备好了，开讲</button>
        <button class="btn btn-ghost" @click="addPrepareTime">+15 秒</button>
      </div>
    </div>

    <!-- 演讲阶段 -->
    <div v-if="phase === 'speak'" class="card phase-card">
      <div class="speak-head">
        <span class="rec-dot"></span>
        <span class="timer mono">{{ elapsedText }}</span>
        <span class="tag" v-if="elapsedMs < 60000">目标 1-3 分钟</span>
        <span class="tag tag-success" v-else-if="elapsedMs < 180000">节奏不错，继续</span>
        <span class="tag tag-warning" v-else>超过 3 分钟，考虑收尾</span>
      </div>
      <p class="interim-text">{{ speech.interim.value || speech.transcript.value || '开讲吧！识别内容会实时显示…' }}</p>
      <div class="phase-actions">
        <button class="btn btn-primary" @click="finishSpeaking">说完了</button>
        <button class="btn btn-ghost" @click="abandon">放弃本次</button>
      </div>
    </div>

    <!-- 结果阶段 -->
    <div v-if="phase === 'result' && result" class="card result-card">
      <h2 class="section-title">演讲完成 🎉</h2>
      <div class="stat-row">
        <div class="stat"><span class="stat-num mono">{{ result.chars }}</span><span class="stat-name">字数</span></div>
        <div class="stat"><span class="stat-num mono">{{ result.durationText }}</span><span class="stat-name">用时</span></div>
        <div class="stat"><span class="stat-num mono">{{ result.rate }}</span><span class="stat-name">语速(字/分)</span></div>
        <div class="stat"><span class="stat-num mono">{{ result.fillerCount }}</span><span class="stat-name">填充词</span></div>
      </div>

      <div class="transcript-block">
        <p class="block-label">你的演讲文字稿（语音识别）</p>
        <p class="transcript-text">{{ result.transcript }}</p>
      </div>

      <!-- 自评 -->
      <div class="self-eval">
        <p class="block-label">给自己打个分（1-5 星）</p>
        <div v-for="dim in evalDims" :key="dim.key" class="eval-row">
          <span class="eval-name">{{ dim.label }}</span>
          <div class="star-row">
            <button
              v-for="n in 5"
              :key="n"
              class="star"
              :class="{ on: n <= (selfRatings[dim.key] || 0) }"
              @click="selfRatings[dim.key] = n"
            >★</button>
          </div>
        </div>
      </div>

      <!-- AI 点评 -->
      <div v-if="settings.aiConfigured" class="ai-zone">
        <button class="btn btn-ghost" :disabled="aiLoading" @click="requestAiFeedback">
          {{ aiLoading ? '教练正在看你的稿…' : (aiFeedback ? '重新点评' : '🎓 请 AI 教练点评') }}
        </button>
        <div v-if="aiFeedback" class="feedback-card fade-in">
          <div class="feedback-head">🎓 教练点评</div>
          <p class="feedback-text">{{ aiFeedback }}</p>
        </div>
      </div>
      <p v-else class="ai-hint">在设置页配置 AI 接口后，可获得教练逐句点评</p>

      <div class="phase-actions">
        <button class="btn btn-ghost" @click="restart">再来一题</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useSpeech } from '../composables/useSpeech'
import { practiceStore } from '../stores/practice'
import { settingsStore } from '../stores/settings'
import { topicCategories, randomTopic } from '../data/topics'
import { speechRate, countFillers } from '../services/scoring'
import { chat as aiChat, IMPROMPTU_FEEDBACK_RULES } from '../services/ai'

const store = practiceStore()
const settings = settingsStore()
const speech = useSpeech()

const phase = ref('idle') // idle | prepare | speak | result
const category = ref('全部')
const topic = ref(null)
const prepareLeft = ref(30)
const elapsedMs = ref(0)
const result = ref(null)
const selfRatings = ref({ structure: 0, fluency: 0, confidence: 0 })
const aiFeedback = ref('')
const aiLoading = ref(false)

const evalDims = [
  { key: 'structure', label: '结构清晰' },
  { key: 'fluency', label: '表达流畅' },
  { key: 'confidence', label: '自信从容' },
]

const recentImpromptu = computed(() =>
  store.history.filter((r) => r.type === 'impromptu').slice(-5).reverse()
)

/* ---------- 抽题与准备 ---------- */
let prepareTimer = null
let speakTimer = null

function drawTopic(cat) {
  category.value = cat
  topic.value = randomTopic(cat)
  result.value = null
  aiFeedback.value = ''
  selfRatings.value = { structure: 0, fluency: 0, confidence: 0 }
  prepareLeft.value = 30
}

function startPrepare() {
  phase.value = 'prepare'
  prepareLeft.value = 30
  clearInterval(prepareTimer)
  prepareTimer = setInterval(() => {
    prepareLeft.value -= 1
    if (prepareLeft.value <= 0) startSpeaking()
  }, 1000)
}

function addPrepareTime() {
  prepareLeft.value += 15
}

function startSpeaking() {
  clearInterval(prepareTimer)
  speakStart = Date.now()
  elapsedMs.value = 0
  phase.value = 'speak'
  speech.start()
  speakTimer = setInterval(() => (elapsedMs.value = Date.now() - speakStart), 100)
}

let speakStart = 0
const pendingFinalize = ref(false)

/* ---------- 演讲结束 ---------- */
function finishSpeaking() {
  clearInterval(speakTimer)
  pendingFinalize.value = true
  speech.stop()
}

// 识别真正结束后再结算，保证 transcript 完整
watch(
  () => speech.listening.value,
  (listening) => {
    if (!listening && pendingFinalize.value) {
      pendingFinalize.value = false
      finalizeSpeech()
    }
  }
)

function finalizeSpeech() {
  const transcript = speech.transcript.value.trim()
  const duration = elapsedMs.value
  if (!transcript) {
    speech.error.value = '没有识别到演讲内容，请靠近麦克风重试'
    phase.value = 'idle'
    return
  }
  const fillers = countFillers(transcript)
  const chars = transcript.replace(/[，。！？、；：\s]/g, '').length
  result.value = {
    transcript,
    chars,
    durationMs: duration,
    durationText: (duration / 1000).toFixed(0) + ' 秒',
    rate: speechRate(transcript, duration),
    fillerCount: fillers.count,
    fillerDetail: fillers.detail,
    score: computeScore(transcript, duration, chars, fillers.count),
  }
  phase.value = 'result'
  store.addRecord({
    type: 'impromptu',
    scene: topic.value.category,
    target: topic.value.title,
    transcript,
    score: result.value.score,
    rate: result.value.rate,
    fillerCount: fillers.count,
    durationMs: duration,
    durationText: result.value.durationText,
    selfRatings: { ...selfRatings.value },
  })
}

/** 即兴演讲综合分：时长合理 + 字数达标 + 填充词少 + 有自评加成 */
function computeScore(transcript, durationMs, chars, fillerCount) {
  let s = 0
  // 时长（30s-3min 得满分权重）
  const sec = durationMs / 1000
  if (sec >= 60 && sec <= 180) s += 30
  else if (sec >= 30 && sec < 60) s += 22
  else s += 12
  // 内容量
  if (chars >= 200) s += 30
  else if (chars >= 100) s += 22
  else if (chars >= 50) s += 14
  else s += 6
  // 干净度
  if (fillerCount === 0) s += 25
  else if (fillerCount <= 3) s += 18
  else if (fillerCount <= 6) s += 10
  else s += 4
  // 语速
  const rate = speechRate(transcript, durationMs)
  if (rate >= 120 && rate <= 260) s += 15
  else if (rate > 0) s += 8
  return Math.min(100, s)
}

function avgSelf(r) {
  const sr = r.selfRatings || {}
  const vals = [sr.structure, sr.fluency, sr.confidence].filter(Boolean)
  if (!vals.length) return '—'
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
}

/* ---------- AI 点评 ---------- */
async function requestAiFeedback() {
  if (!result.value || aiLoading.value) return
  aiLoading.value = true
  try {
    aiFeedback.value = await aiChat({
      baseUrl: settings.apiBase,
      apiKey: settings.apiKey,
      model: settings.apiModel,
      temperature: 0.4,
      messages: [
        { role: 'system', content: IMPROMPTU_FEEDBACK_RULES },
        {
          role: 'user',
          content: `题目：${topic.value.title}\n结构提示：${topic.value.structure}\n用时：${result.value.durationText}\n\n演讲文字稿：\n${result.value.transcript}`,
        },
      ],
    })
  } catch (e) {
    speech.error.value = e.message || 'AI 点评失败，请重试'
  } finally {
    aiLoading.value = false
  }
}

/* ---------- 流程控制 ---------- */
function abandon() {
  clearInterval(speakTimer)
  speech.abort()
  phase.value = 'idle'
  speech.error.value = ''
}

function restart() {
  phase.value = 'idle'
  drawTopic(category.value)
}

const elapsedText = computed(() => (elapsedMs.value / 1000).toFixed(0) + 's')

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

onUnmounted(() => {
  clearInterval(prepareTimer)
  clearInterval(speakTimer)
})
</script>

<style scoped>
.notice-error {
  margin-bottom: var(--space-4);
  padding: var(--space-4) var(--space-6);
  border-color: var(--color-danger);
  font-size: 14px;
}

.section-title { font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: var(--space-2); }
.sub-title { font-size: 14px; font-weight: 600; margin-bottom: var(--space-3); }
.material-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-4); }
.btn-sm { padding: 5px 12px; font-size: 13px; }
.mode-hint { font-size: 13px; color: var(--color-text-3); }

.chip-row { display: flex; flex-wrap: wrap; gap: var(--space-2); }
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

.recent-zone { margin-top: var(--space-6); padding-top: var(--space-5); border-top: 1px solid var(--color-border); }
.history-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-2);
}
.history-main { flex: 1; min-width: 0; }
.history-topic { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.history-meta { font-size: 12px; color: var(--color-text-3); }
.history-right { display: flex; align-items: center; gap: var(--space-3); flex-shrink: 0; }
.stars-mini { font-size: 12px; color: var(--color-text-2); }
.history-score { font-size: 18px; font-weight: 700; font-family: var(--font-mono); }
.del-btn {
  width: 26px; height: 26px; border-radius: 50%;
  color: var(--color-text-3); font-size: 13px;
}
.del-btn:hover { background: var(--color-danger-soft); color: var(--color-danger); }

/* 题目卡 */
.topic-card { margin-top: var(--space-4); }
.topic-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3); }
.topic-title { font-size: 19px; font-weight: 700; line-height: 1.5; }
.topic-structure { margin-top: var(--space-3); font-size: 13px; color: var(--color-accent); }
.topic-actions { margin-top: var(--space-5); }

/* 阶段卡 */
.phase-card { margin-top: var(--space-4); text-align: center; padding: var(--space-8) var(--space-6); }
.phase-label { font-size: 13px; color: var(--color-text-3); }
.countdown { font-size: 72px; font-weight: 700; line-height: 1.2; color: var(--color-primary); }
.phase-hint { font-size: 13px; color: var(--color-text-2); margin: var(--space-3) auto var(--space-5); max-width: 420px; }
.phase-actions { display: flex; gap: var(--space-3); justify-content: center; }

.speak-head { display: flex; align-items: center; justify-content: center; gap: var(--space-3); margin-bottom: var(--space-4); }
.rec-dot {
  width: 12px; height: 12px; border-radius: 50%;
  background: var(--color-danger);
  animation: blink 1s infinite;
}
@keyframes blink { 50% { opacity: 0.3; } }
.timer { font-size: 26px; font-weight: 700; color: var(--color-danger); }
.interim-text {
  font-size: 14px; color: var(--color-text-2); line-height: 1.8;
  min-height: 80px; max-width: 560px; margin: 0 auto var(--space-5);
}

/* 结果 */
.result-card { margin-top: var(--space-4); display: grid; gap: var(--space-5); }
.stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-3); }
.stat {
  display: grid; gap: 2px; justify-items: center;
  padding: var(--space-4) var(--space-2);
  background: var(--color-surface-2);
  border-radius: var(--radius-md);
}
.stat-num { font-size: 20px; font-weight: 700; }
.stat-name { font-size: 12px; color: var(--color-text-3); }

.block-label { font-size: 12px; color: var(--color-text-3); margin-bottom: var(--space-2); }
.transcript-block { display: grid; }
.transcript-text {
  font-size: 14px; line-height: 1.8;
  padding: var(--space-4);
  background: var(--color-surface-2);
  border-radius: var(--radius-md);
  white-space: pre-wrap;
}

.self-eval { display: grid; }
.eval-row { display: flex; align-items: center; justify-content: space-between; padding: var(--space-2) 0; }
.eval-name { font-size: 14px; }
.star-row { display: flex; gap: var(--space-1); }
.star {
  font-size: 22px; color: var(--color-border);
  transition: color 0.12s ease, transform 0.12s ease;
}
.star.on { color: #f5a623; }
.star:hover { transform: scale(1.15); }

.ai-zone { display: grid; gap: var(--space-3); justify-items: start; }
.ai-hint { font-size: 13px; color: var(--color-text-3); }
.feedback-card {
  width: 100%;
  padding: var(--space-5);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  background: var(--color-primary-soft);
}
.feedback-head { font-size: 15px; font-weight: 600; margin-bottom: var(--space-2); }
.feedback-text { font-size: 14px; line-height: 1.8; white-space: pre-wrap; }

.mono { font-family: var(--font-mono); }
.score-good { color: var(--color-success); }
.score-mid { color: var(--color-warning); }
.score-low { color: var(--color-danger); }

@media (max-width: 640px) {
  .stat-row { grid-template-columns: repeat(2, 1fr); }
}
</style>
