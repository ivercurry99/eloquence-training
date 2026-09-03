<template>
  <section class="page fade-in">
    <div class="page-header">
      <h1 class="page-title">设置</h1>
      <p class="page-subtitle">外观与 AI 接口配置，所有数据仅保存在本地浏览器</p>
    </div>

    <!-- 外观 -->
    <div class="card">
      <h2 class="section-title">外观</h2>
      <div class="theme-row">
        <button
          v-for="t in themes"
          :key="t.value"
          class="theme-btn"
          :class="{ active: settings.theme === t.value }"
          @click="settings.setTheme(t.value)"
        >
          <span class="theme-icon">{{ t.icon }}</span>
          <span>{{ t.label }}</span>
        </button>
      </div>
    </div>

    <!-- AI 接口 -->
    <div class="card">
      <h2 class="section-title">AI 接口 <span class="tag" :class="settings.aiConfigured ? 'tag-success' : 'tag-warning'">{{ settings.aiConfigured ? '已配置' : '未配置' }}</span></h2>
      <p class="card-hint">
        配置后解锁 AI 陪练与即兴演讲点评。使用 OpenAI 兼容接口（DeepSeek / 智谱 / Kimi 等）。
        Key 只存在你的浏览器里，导出备份时会被自动剔除。
      </p>
      <div class="form-grid">
        <label class="field">
          <span class="field-label">接口地址（Base URL）</span>
          <input v-model.trim="form.apiBase" class="input" :placeholder="placeholderBase" />
        </label>
        <label class="field">
          <span class="field-label">API Key</span>
          <input
            v-model.trim="form.apiKey"
            class="input"
            type="password"
            placeholder="sk-…"
            autocomplete="off"
          />
        </label>
        <label class="field">
          <span class="field-label">模型名称</span>
          <input v-model.trim="form.apiModel" class="input" placeholder="deepseek-chat" />
        </label>
      </div>
      <div class="preset-row">
        <span class="preset-label">快速填充：</span>
        <button v-for="p in presets" :key="p.name" class="chip" @click="applyPreset(p)">{{ p.name }}</button>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" :disabled="!changed" @click="save">保存配置</button>
        <button class="btn btn-ghost" :disabled="!settings.aiConfigured" @click="testConn">{{ testing ? '测试中…' : '测试连接' }}</button>
      </div>
      <p v-if="testResult" class="test-result" :class="testOk ? 'ok' : 'bad'">{{ testResult }}</p>
    </div>

    <!-- 数据管理 -->
    <div class="card">
      <h2 class="section-title">数据管理</h2>
      <p class="card-hint">
        练习记录、打卡、笔记、复习卡全部保存在本地。建议定期导出备份（不含 API Key）。
      </p>
      <div class="form-actions">
        <button class="btn btn-ghost" @click="exportData">导出备份</button>
        <button class="btn btn-ghost" @click="pickFile">导入备份</button>
        <button class="btn btn-danger" @click="clearData">清空全部数据</button>
        <input ref="fileInput" type="file" accept="application/json" style="display: none" @change="onFile" />
      </div>
      <p v-if="importMsg" class="test-result" :class="importOk ? 'ok' : 'bad'">{{ importMsg }}</p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { settingsStore } from '../stores/settings'
import { exportBackup, importBackup, clearAll } from '../repos/storage'
import { chat } from '../services/ai'

const settings = settingsStore()

const themes = [
  { value: 'light', label: '浅色', icon: '☀️' },
  { value: 'dark', label: '深色', icon: '🌙' },
  { value: 'auto', label: '跟随系统', icon: '🖥️' },
]

const presets = [
  { name: 'DeepSeek', base: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  { name: '智谱', base: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash' },
  { name: 'Kimi', base: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k' },
  { name: 'OpenAI', base: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
]
const placeholderBase = 'https://api.deepseek.com/v1'

const form = reactive({
  apiBase: settings.apiBase,
  apiKey: settings.apiKey,
  apiModel: settings.apiModel,
})

const changed = computed(
  () =>
    form.apiBase !== settings.apiBase ||
    form.apiKey !== settings.apiKey ||
    form.apiModel !== settings.apiModel
)

function applyPreset(p) {
  form.apiBase = p.base
  form.apiModel = p.model
}

function save() {
  settings.setAiConfig({ ...form })
}

/* ---------- 连接测试 ---------- */
const testing = ref(false)
const testResult = ref('')
const testOk = ref(false)

async function testConn() {
  testing.value = true
  testResult.value = ''
  try {
    const reply = await chat({
      baseUrl: form.apiBase || settings.apiBase,
      apiKey: form.apiKey || settings.apiKey,
      model: form.apiModel || settings.apiModel,
      messages: [{ role: 'user', content: '回复"连接成功"四个字' }],
      temperature: 0,
    })
    testOk.value = true
    testResult.value = `连接成功，模型说：${reply.slice(0, 20)}`
    // 测试通过顺手保存
    if (changed.value) save()
  } catch (e) {
    testOk.value = false
    testResult.value = e.message || '连接失败'
  } finally {
    testing.value = false
  }
}

/* ---------- 数据管理 ---------- */
const fileInput = ref(null)
const importMsg = ref('')
const importOk = ref(false)

function exportData() {
  const blob = new Blob([exportBackup()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `口才训练营备份-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function pickFile() {
  fileInput.value?.click()
}

function onFile(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const merged = importBackup(String(reader.result))
    if (merged) {
      importOk.value = true
      importMsg.value = '导入成功，刷新页面后生效'
    } else {
      importOk.value = false
      importMsg.value = '导入失败：文件格式不正确'
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}

function clearData() {
  if (window.confirm('确定清空全部数据吗？包括打卡、笔记、练习记录、复习卡片（API Key 除外）。此操作不可恢复，建议先导出备份。')) {
    clearAll()
    window.location.reload()
  }
}
</script>

<style scoped>
.card { margin-bottom: var(--space-4); }
.section-title { font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-4); }
.card-hint { font-size: 13px; color: var(--color-text-2); line-height: 1.7; margin-bottom: var(--space-4); }

.theme-row { display: flex; gap: var(--space-3); flex-wrap: wrap; }
.theme-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-4) var(--space-6);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: 13px;
  color: var(--color-text-2);
  transition: all 0.15s ease;
}
.theme-btn:hover { border-color: var(--color-primary); }
.theme-btn.active {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-weight: 500;
}
.theme-icon { font-size: 22px; }

.form-grid { display: grid; gap: var(--space-4); }
.field { display: grid; gap: var(--space-1); }
.field-label { font-size: 13px; color: var(--color-text-2); }

.preset-row { display: flex; align-items: center; gap: var(--space-2); margin-top: var(--space-4); flex-wrap: wrap; }
.preset-label { font-size: 12px; color: var(--color-text-3); }
.chip {
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  font-size: 12px;
  color: var(--color-text-2);
}
.chip:hover { border-color: var(--color-primary); color: var(--color-primary); }

.form-actions { display: flex; gap: var(--space-3); margin-top: var(--space-5); flex-wrap: wrap; }
.btn-danger {
  background: var(--color-surface);
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
}
.btn-danger:hover { background: var(--color-danger-soft); }

.test-result { margin-top: var(--space-3); font-size: 13px; }
.test-result.ok { color: var(--color-success); }
.test-result.bad { color: var(--color-danger); }
</style>
