<template>
  <section class="page fade-in">
    <div class="page-header">
      <h1 class="page-title">AI 陪练</h1>
      <p class="page-subtitle">选一个场景实战对话，结束后获取教练点评。支持 DeepSeek / 智谱 / Kimi 等 OpenAI 兼容接口</p>
    </div>

    <!-- 未配置 API 引导 -->
    <div v-if="!settings.aiConfigured" class="card guide-card">
      <div class="guide-icon">🔑</div>
      <h2 class="guide-title">先配置你的 AI 接口</h2>
      <p class="guide-text">AI 陪练使用你自己的 API Key（仅保存在本地浏览器，绝不上传）。</p>
      <p class="guide-text">推荐 DeepSeek：注册即送额度，接口完全兼容。到设置页填入地址、Key 和模型名即可。</p>
      <RouterLink to="/settings" class="btn btn-primary">前往设置</RouterLink>
    </div>

    <template v-else>
      <!-- 场景选择（无进行中会话） -->
      <template v-if="!chat.current">
        <div class="card">
          <div class="mode-tabs">
            <button class="chip" :class="{ active: mode === 'roleplay' }" @click="mode = 'roleplay'">🎭 角色扮演</button>
            <button class="chip" :class="{ active: mode === 'debate' }" @click="mode = 'debate'">⚔️ 自由辩论</button>
          </div>
          <p class="mode-hint">
            {{ mode === 'roleplay' ? '贴近真实社交与职场场景，AI 会按角色设定出招' : '你持一方立场，AI 是立场坚定的对手，寸步不让' }}
          </p>
          <div class="scenario-grid">
            <button
              v-for="s in scenariosOfMode"
              :key="s.id"
              class="scenario-card card-clickable"
              @click="startScenario(s)"
            >
              <div class="scenario-top">
                <span class="scenario-emoji">{{ s.emoji }}</span>
                <span class="tag" :class="diffClass(s.difficulty)">{{ s.difficulty }}</span>
              </div>
              <h3 class="scenario-name">{{ s.name }}</h3>
              <p class="scenario-desc">{{ s.desc }}</p>
              <p v-if="s.userSide" class="scenario-side">你的立场：{{ s.userSide }}</p>
            </button>
          </div>
        </div>

        <!-- 历史会话 -->
        <div class="card history-card" v-if="chat.sessions.length">
          <div class="material-head">
            <h2 class="section-title">过往会话 <span class="tag">{{ chat.sessions.length }} 场</span></h2>
            <button class="btn btn-ghost btn-sm" @click="confirmClearSessions">清空</button>
          </div>
          <div class="session-list">
            <div v-for="s in chat.sessions" :key="s.id" class="session-item">
              <span class="session-emoji">{{ s.emoji }}</span>
              <div class="session-main">
                <p class="session-name">{{ s.scenarioName }}</p>
                <p class="session-meta">{{ formatDate(s.endedAt) }} · {{ countTurns(s) }} 轮对话</p>
              </div>
              <button class="del-btn" title="删除" @click="chat.removeSession(s.id)">✕</button>
            </div>
          </div>
        </div>
      </template>

      <!-- 对话进行中 -->
      <div v-else class="card chat-card">
        <div class="chat-head">
          <div class="chat-title">
            <span class="scenario-emoji">{{ chat.current.emoji }}</span>
            <div>
              <h2 class="chat-name">{{ chat.current.scenarioName }}</h2>
              <p class="chat-meta">{{ chat.turnCount }} 轮对话{{ chat.current.feedback ? ' · 已点评' : '' }}</p>
            </div>
          </div>
          <div class="chat-actions">
            <button class="btn btn-ghost btn-sm" :disabled="loading" @click="abandonSession">放弃</button>
            <button class="btn btn-primary btn-sm" :disabled="loading" @click="requestFeedback">
              {{ chat.current.feedback ? '重新点评' : '结束并点评' }}
            </button>
          </div>
        </div>

        <div ref="chatBody" class="chat-body">
          <div
            v-for="(m, i) in chat.current.messages"
            :key="i"
            class="bubble-row"
            :class="m.role === 'user' ? 'mine' : 'theirs'"
          >
            <div class="bubble">
              <p class="bubble-text">{{ m.content }}</p>
            </div>
          </div>
          <div v-if="loading" class="bubble-row theirs">
            <div class="bubble bubble-loading">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>
          </div>

          <!-- 教练点评 -->
          <div v-if="chat.current.feedback" class="feedback-card fade-in">
            <div class="feedback-head">🎓 教练点评</div>
            <p class="feedback-text">{{ chat.current.feedback }}</p>
            <div class="feedback-actions">
              <button class="btn btn-primary btn-sm" @click="startNew">再战一场</button>
            </div>
          </div>
        </div>

        <div v-if="error" class="chat-error">{{ error }}</div>

        <div class="chat-input-row">
          <textarea
            v-model="draft"
            class="chat-input"
            :rows="draft.split('\n').length > 2 ? 3 : 1"
            placeholder="输入你的回应…（Enter 发送，Shift+Enter 换行）"
            :disabled="loading"
            @keydown.enter.exact.prevent="send"
          ></textarea>
          <button class="btn btn-primary send-btn" :disabled="loading || !draft.trim()" @click="send">发送</button>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import { settingsStore } from '../stores/settings'
import { aiChatStore } from '../stores/aiChat'
import { roleplayScenarios, debateTopics } from '../data/coachScenarios'
import { chat as aiChat, COACH_RULES, FEEDBACK_RULES } from '../services/ai'

const settings = settingsStore()
const chat = aiChatStore()

const mode = ref('roleplay')
const draft = ref('')
const loading = ref(false)
const error = ref('')
const chatBody = ref(null)

const scenariosOfMode = computed(() =>
  mode.value === 'roleplay' ? roleplayScenarios : debateTopics
)

/* ---------- 会话流程 ---------- */
function startScenario(s) {
  chat.startSession(s)
  error.value = ''
  draft.value = ''
}

function startNew() {
  chat.endSession()
  draft.value = ''
  error.value = ''
}

function abandonSession() {
  if (window.confirm('放弃当前对话？内容不会被保存。')) {
    chat.resetSession()
    error.value = ''
  }
}

/* ---------- 发送消息 ---------- */
async function send() {
  const text = draft.value.trim()
  if (!text || loading.value || !chat.current) return
  draft.value = ''
  error.value = ''
  chat.pushMessage('user', text)
  await callAssistant()
}

async function callAssistant() {
  const scenario = findCurrentScenario()
  if (!scenario) return
  loading.value = true
  try {
    const reply = await aiChat({
      baseUrl: settings.apiBase,
      apiKey: settings.apiKey,
      model: settings.apiModel,
      messages: [
        { role: 'system', content: `${COACH_RULES}\n\n角色设定：${scenario.systemPrompt}` },
        ...chat.current.messages,
      ],
    })
    chat.pushMessage('assistant', reply)
  } catch (e) {
    error.value = e.message || '请求失败，请重试'
  } finally {
    loading.value = false
  }
}

/* ---------- 教练点评 ---------- */
async function requestFeedback() {
  if (!chat.current) return
  if (chat.turnCount < 2) {
    error.value = '至少完成 2 轮对话再获取点评'
    return
  }
  error.value = ''
  loading.value = true
  try {
    const transcript = chat.current.messages
      .map((m) => `${m.role === 'user' ? '用户' : '陪练角色'}：${m.content}`)
      .join('\n')
    const feedback = await aiChat({
      baseUrl: settings.apiBase,
      apiKey: settings.apiKey,
      model: settings.apiModel,
      temperature: 0.4,
      messages: [
        { role: 'system', content: FEEDBACK_RULES },
        { role: 'user', content: `场景：${chat.current.scenarioName}\n\n对话记录：\n${transcript}` },
      ],
    })
    chat.setFeedback(feedback)
  } catch (e) {
    error.value = e.message || '请求失败，请重试'
  } finally {
    loading.value = false
  }
}

function findCurrentScenario() {
  const all = [...roleplayScenarios, ...debateTopics]
  return all.find((s) => s.id === chat.current?.scenarioId) || null
}

/* ---------- 工具 ---------- */
function diffClass(d) {
  if (d === '入门') return 'tag-success'
  if (d === '进阶') return 'tag-warning'
  return 'tag-danger'
}

function countTurns(s) {
  return s.messages.filter((m) => m.role === 'user').length
}

function confirmClearSessions() {
  if (window.confirm('确定清空全部历史会话吗？')) chat.clearSessions()
}

function formatDate(ts) {
  const d = new Date(ts)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${mm}-${dd} ${hh}:${mi}`
}

// 新消息自动滚到底部
watch(
  () => chat.current?.messages.length,
  async () => {
    await nextTick()
    if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight
  },
  { flush: 'post' }
)
</script>

<style scoped>
/* 引导卡 */
.guide-card {
  text-align: center;
  padding: var(--space-10) var(--space-6);
  display: grid;
  gap: var(--space-3);
  justify-items: center;
}
.guide-icon { font-size: 44px; }
.guide-title { font-size: 18px; font-weight: 600; }
.guide-text { font-size: 14px; color: var(--color-text-2); max-width: 420px; }

/* 场景选择 */
.mode-tabs { display: flex; gap: var(--space-2); }
.chip {
  padding: 6px 16px;
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
.mode-hint { margin: var(--space-3) 0 var(--space-5); font-size: 13px; color: var(--color-text-3); }

.scenario-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-4);
}
.scenario-card {
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  display: grid;
  gap: var(--space-2);
  align-content: start;
}
.scenario-top { display: flex; justify-content: space-between; align-items: center; }
.scenario-emoji { font-size: 26px; }
.scenario-name { font-size: 16px; font-weight: 600; }
.scenario-desc { font-size: 13px; color: var(--color-text-2); line-height: 1.5; }
.scenario-side { font-size: 12px; color: var(--color-accent); }

/* 历史会话 */
.history-card { margin-top: var(--space-4); }
.material-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}
.section-title { font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: var(--space-2); }
.btn-sm { padding: 5px 12px; font-size: 13px; }
.session-list { display: grid; gap: var(--space-2); }
.session-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-md);
}
.session-emoji { font-size: 20px; }
.session-main { flex: 1; min-width: 0; }
.session-name { font-size: 14px; font-weight: 500; }
.session-meta { font-size: 12px; color: var(--color-text-3); }
.del-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  color: var(--color-text-3);
  font-size: 13px;
  flex-shrink: 0;
}
.del-btn:hover { background: var(--color-danger-soft); color: var(--color-danger); }

/* 对话区 */
.chat-card { display: flex; flex-direction: column; gap: var(--space-4); }
.chat-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;
}
.chat-title { display: flex; align-items: center; gap: var(--space-3); }
.chat-name { font-size: 17px; font-weight: 600; }
.chat-meta { font-size: 12px; color: var(--color-text-3); }
.chat-actions { display: flex; gap: var(--space-2); }

.chat-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-height: 480px;
  overflow-y: auto;
  padding: var(--space-2);
}

.bubble-row { display: flex; }
.bubble-row.mine { justify-content: flex-end; }
.bubble {
  max-width: 78%;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-size: 14px;
  line-height: 1.6;
}
.theirs .bubble {
  background: var(--color-surface-3);
  border-bottom-left-radius: 4px;
}
.mine .bubble {
  background: var(--color-primary);
  color: #fff;
  border-bottom-right-radius: 4px;
}
.bubble-text { white-space: pre-wrap; }

.bubble-loading {
  display: flex;
  gap: 5px;
  align-items: center;
  padding: var(--space-4);
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-text-3);
  animation: bounce 1.2s infinite;
}
.dot:nth-child(2) { animation-delay: 0.15s; }
.dot:nth-child(3) { animation-delay: 0.3s; }
@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
  30% { transform: translateY(-4px); opacity: 1; }
}

/* 点评卡 */
.feedback-card {
  align-self: stretch;
  padding: var(--space-5);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  background: var(--color-primary-soft);
}
.feedback-head { font-size: 15px; font-weight: 600; margin-bottom: var(--space-2); }
.feedback-text { font-size: 14px; line-height: 1.8; white-space: pre-wrap; }
.feedback-actions { margin-top: var(--space-4); display: flex; justify-content: flex-end; }

.chat-error {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  background: var(--color-danger-soft);
  color: var(--color-danger);
  font-size: 13px;
}

/* 输入区 */
.chat-input-row { display: flex; gap: var(--space-3); align-items: flex-end; }
.chat-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  min-height: 40px;
  max-height: 120px;
}
.chat-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}
.send-btn { flex-shrink: 0; }

@media (max-width: 640px) {
  .bubble { max-width: 88%; }
  .chat-actions { width: 100%; justify-content: flex-end; }
  .chat-body { max-height: 52vh; }
}
</style>
