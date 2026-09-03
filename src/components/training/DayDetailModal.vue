<script setup>
import { computed } from 'vue'
import BaseModal from '../common/BaseModal.vue'
import { trainingStore } from '../../stores/training'
import { checkinStore } from '../../stores/checkin'

const props = defineProps({ day: { type: Number, required: true } })
const emit = defineEmits(['close'])

const training = trainingStore()
const checkin = checkinStore()

const data = computed(() => training.days[props.day])

const categoryLabels = {
  appearance: '🎨 外貌类',
  ability: '🧠 能力类',
  personality: '❤️ 性格类',
  leader: '👔 敬领导',
  peer: '🤝 敬平级',
  elder: '🍵 敬长辈',
}

const groupLabels = {
  pullBack: '组 1：话题拉回（跑偏时）',
  perspective: '组 2：视角切换（卡壳时）',
  resolve: '组 3：推进决议（拖太久时）',
}

function toggleComplete() {
  training.toggleComplete(props.day)
  emit('close')
}
</script>

<template>
  <BaseModal :title="data.title" wide @close="emit('close')">
    <div class="day-detail">
      <!-- 今日目标 -->
      <div class="goal-box">
        <h3>🎯 今日目标</h3>
        <p>{{ data.goal }}</p>
      </div>

      <!-- 话术公式 -->
      <div v-if="data.formula" class="section">
        <h3>📝 话术模板</h3>
        <div class="formula-box">{{ data.formula }}</div>
      </div>

      <!-- 核心话术表 -->
      <div v-if="data.phrases" class="section">
        <h3>💬 核心话术</h3>
        <table class="table">
          <thead>
            <tr>
              <th>话术</th><th>适用场景</th>
              <th v-if="data.phrases.some(p => p.tip || p.subtext || p.principle)">要点</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in data.phrases" :key="i">
              <td>{{ p.text }}</td>
              <td class="muted">{{ p.scenario }}</td>
              <td v-if="data.phrases.some(x => x.tip || x.subtext || x.principle)" class="muted">
                {{ p.tip || p.subtext || p.principle }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分类话术（赞美三维 / 敬酒三类） -->
      <div v-if="data.categories" class="section">
        <h3>📋 分类话术</h3>
        <div v-for="(items, key) in data.categories" :key="key" class="category-block">
          <h4>{{ categoryLabels[key] || key }}</h4>
          <table class="table">
            <thead>
              <tr><th>话术</th><th>{{ key === 'leader' || key === 'peer' || key === 'elder' ? '要点' : '适用场景' }}</th></tr>
            </thead>
            <tbody>
              <tr v-for="(c, i) in items" :key="i">
                <td>{{ c.text }}</td>
                <td class="muted">{{ c.scenario || c.key }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 完整示例 -->
      <div v-if="data.examples" class="section">
        <h3>💬 完整话术示例</h3>
        <div v-for="(e, i) in data.examples" :key="i" class="example-item">
          <strong>{{ e.title || e.scene }}</strong>
          <p class="muted">{{ e.content }}</p>
        </div>
      </div>

      <!-- 正式 vs 口语 -->
      <div v-if="data.variants" class="section">
        <h3>💡 进阶变体（跟熟人用口语版更自然）</h3>
        <table class="table">
          <thead><tr><th>正式版</th><th>口语版</th></tr></thead>
          <tbody>
            <tr v-for="(v, i) in data.variants" :key="i">
              <td>{{ v.formal }}</td><td class="muted">{{ v.casual }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 命令式 vs 合作型 -->
      <div v-if="data.comparisons" class="section">
        <h3>💬 5 句合作型表达</h3>
        <table class="table">
          <thead><tr><th>❌ 命令式</th><th>✅ 合作型</th><th>效果</th></tr></thead>
          <tbody>
            <tr v-for="(c, i) in data.comparisons" :key="i">
              <td class="danger-text">{{ c.command }}</td>
              <td class="success-text">{{ c.cooperative }}</td>
              <td class="muted">{{ c.difference }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 3 组救场话术 -->
      <div v-if="data.groups" class="section">
        <h3>🛟 3 组救场话术</h3>
        <div v-for="(items, key) in data.groups" :key="key" class="category-block">
          <h4>{{ groupLabels[key] || key }}</h4>
          <table class="table">
            <thead><tr><th>话术</th><th>适用场景</th></tr></thead>
            <tbody>
              <tr v-for="(g, i) in items" :key="i">
                <td>{{ g.text }}</td><td class="muted">{{ g.scenario }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 单个场景对话 -->
      <div v-if="data.conversation" class="section">
        <h3>💬 场景对话示例</h3>
        <div class="dialog-box">
          <strong>{{ data.conversation.scene }}</strong>
          <div v-if="data.conversation.dialog" class="dialog-list">
            <p v-for="(d, i) in data.conversation.dialog" :key="i">
              <strong>{{ d.speaker }}：</strong>{{ d.text }}
            </p>
          </div>
          <p v-if="data.conversation.response" style="margin-top: 8px">{{ data.conversation.response }}</p>
        </div>
        <p v-if="data.conversation.keyPoint" class="key-point">💡 {{ data.conversation.keyPoint }}</p>
      </div>

      <!-- 多场景对话 -->
      <div v-if="data.conversations" class="section">
        <h3>💬 场景对话示例</h3>
        <div v-for="(c, i) in data.conversations" :key="i" class="example-item">
          <template v-if="c.dialog">
            <strong>{{ c.scene }}</strong>
            <div class="dialog-list">
              <p v-for="(d, j) in c.dialog" :key="j">
                <strong>{{ d.speaker }}：</strong>{{ d.text }}
              </p>
            </div>
          </template>
          <template v-else>
            <strong>{{ c.scene }}</strong>
            <p class="danger-text">❌ {{ c.wrong }}</p>
            <p class="success-text">✅ {{ c.right }}</p>
          </template>
        </div>
      </div>

      <!-- 技巧（字符串或 bad/good） -->
      <div v-if="data.tips" class="section">
        <h3>💡 技巧要点</h3>
        <table v-if="data.tips.some(t => typeof t === 'object')" class="table">
          <thead><tr><th>❌ 不要</th><th>✅ 要</th></tr></thead>
          <tbody>
            <tr v-for="(t, i) in data.tips" :key="i">
              <td class="danger-text">{{ t.bad }}</td><td class="success-text">{{ t.good }}</td>
            </tr>
          </tbody>
        </table>
        <ul v-else class="plain-list">
          <li v-for="(t, i) in data.tips" :key="i">{{ t }}</li>
        </ul>
      </div>

      <!-- 规则 -->
      <div v-if="data.rules" class="section">
        <h3>💡 黄金法则</h3>
        <ul class="plain-list">
          <li v-for="(r, i) in data.rules" :key="i">{{ r }}</li>
        </ul>
      </div>

      <!-- 站位 -->
      <div v-if="data.positioning" class="section">
        <h3>💡 请示的黄金站位</h3>
        <table class="table">
          <thead><tr><th>错误站位</th><th>正确站位</th></tr></thead>
          <tbody>
            <tr v-for="(p, i) in data.positioning" :key="i">
              <td class="danger-text">{{ p.wrong }}</td><td class="success-text">{{ p.right }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 时机 -->
      <div v-if="data.timing" class="section">
        <h3>💡 救场的 3 个时机</h3>
        <table class="table">
          <thead><tr><th>时机</th><th>动作</th></tr></thead>
          <tbody>
            <tr v-for="(t, i) in data.timing" :key="i">
              <td>{{ t.condition }}</td><td class="muted">{{ t.action }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 天坑 -->
      <div v-if="data.pitfalls" class="section">
        <h3>💡 3 个天坑</h3>
        <table class="table">
          <thead><tr><th>❌ 坑</th><th>✅ 怎么避</th></tr></thead>
          <tbody>
            <tr v-for="(p, i) in data.pitfalls" :key="i">
              <td class="danger-text">{{ p.pit }}</td><td class="success-text">{{ p.avoid }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 黄金 5 秒 -->
      <div v-if="data.goldenSeconds" class="section">
        <h3>💡 冲突处理的黄金 5 秒</h3>
        <ol class="plain-list ol">
          <li v-for="(s, i) in data.goldenSeconds" :key="i">{{ s }}</li>
        </ol>
      </div>

      <!-- 模仿素材 -->
      <div v-if="data.materials" class="section">
        <h3>🎬 推荐模仿素材</h3>
        <table class="table">
          <thead><tr><th>类型</th><th>推荐</th><th>为什么适合</th></tr></thead>
          <tbody>
            <tr v-for="(m, i) in data.materials" :key="i">
              <td>{{ m.type }}</td>
              <td>{{ m.url ? `<a href="${m.url}" target="_blank" rel="noopener">${m.name}</a>` : m.name }}</td>
              <td class="muted">{{ m.reason }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 模仿三步法 -->
      <div v-if="data.method" class="section">
        <h3>📝 模仿三步法</h3>
        <table class="table">
          <thead><tr><th>步骤</th><th>动作</th><th>要点</th></tr></thead>
          <tbody>
            <tr v-for="(m, i) in data.method" :key="i">
              <td>{{ m.step }}</td><td>{{ m.action }}</td><td class="muted">{{ m.key }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 标注示例 -->
      <div v-if="data.example" class="section">
        <h3>🎯 模仿标注示例</h3>
        <div class="formula-box">
          <p>{{ data.example.original }}</p>
          <p class="annotation">{{ data.example.annotation }}</p>
        </div>
      </div>

      <!-- 金句选择指南 -->
      <div v-if="data.selectionGuide" class="section">
        <h3>💎 怎么选你的 10 句</h3>
        <table class="table">
          <thead><tr><th>维度</th><th>问自己</th></tr></thead>
          <tbody>
            <tr v-for="(s, i) in data.selectionGuide" :key="i">
              <td>{{ s.dimension }}</td><td class="muted">{{ s.question }}</td>
            </tr>
          </tbody>
        </table>
        <p class="key-point">💡 {{ data.selectionTip }}</p>
      </div>

      <!-- 场景模拟 -->
      <div v-if="data.scenarios" class="section">
        <h3>🎭 场景模拟设置</h3>
        <table class="table">
          <thead><tr><th>场景</th><th>涉及话术</th></tr></thead>
          <tbody>
            <tr v-for="(s, i) in data.scenarios" :key="i">
              <td>{{ s.name }}</td><td class="muted">{{ s.days.join(' + ') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 模拟流程 -->
      <div v-if="data.flow" class="section">
        <h3>🎬 完整模拟流程</h3>
        <div v-for="(f, i) in data.flow" :key="i" class="example-item">
          <strong>{{ f.stage }}</strong>
          <p class="muted">{{ f.content }}</p>
          <p v-if="f.prompt" class="prompt-text">{{ f.prompt }}</p>
          <p v-for="(p, j) in f.prompts || []" :key="j" class="prompt-text">{{ p }}</p>
        </div>
      </div>

      <!-- 练习流程 -->
      <div v-if="data.exercises" class="section">
        <h3>🏋️ 今日练习流程</h3>
        <ol class="exercise-list">
          <li v-for="(e, i) in data.exercises" :key="i">
            <strong>{{ e.action }}</strong>
            <span class="duration">{{ e.duration }}</span>
            <span v-if="e.note" class="note">{{ e.note }}</span>
          </li>
        </ol>
      </div>

      <!-- 自检清单 -->
      <div v-if="data.checklist" class="section">
        <h3>✅ 自检清单</h3>
        <label v-for="(item, i) in data.checklist" :key="i" class="check-item">
          <input
            type="checkbox"
            :checked="checkin.isChecked(day, `m-${i}`)"
            @change="checkin.setCheck(day, `m-${i}`, $event.target.checked)"
          />
          <span>{{ item }}</span>
        </label>
      </div>

      <!-- 笔记 -->
      <div v-if="data.notes && data.notes.length" class="section">
        <h3>📓 我的笔记</h3>
        <div v-for="(n, i) in data.notes.filter(n => n.label)" :key="i" class="note-field">
          <label>{{ n.label }}</label>
          <textarea
            class="textarea"
            :value="checkin.getNote(`${day}-${i}`)"
            placeholder="随时记录，自动保存"
            @input="checkin.setNote(`${day}-${i}`, $event.target.value)"
          ></textarea>
        </div>
      </div>

      <!-- 14 天复盘 -->
      <div v-if="data.finalReview" class="section">
        <h3>🏆 14 天复盘</h3>
        <ol class="plain-list ol">
          <li v-for="(q, i) in data.finalReview" :key="i">{{ q }}</li>
        </ol>
      </div>

      <!-- 完成按钮 -->
      <div class="complete-area">
        <button class="btn btn-primary" @click="toggleComplete">
          {{ training.isCompleted(day) ? '↩️ 取消完成' : '✅ 标记完成' }}
        </button>
        <button class="btn btn-ghost" @click="emit('close')">关闭</button>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.day-detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.goal-box {
  background: var(--color-primary-soft);
  border-radius: var(--radius-md);
  padding: var(--space-5);
}

.goal-box h3 {
  font-size: 15px;
  color: var(--color-primary);
  margin-bottom: var(--space-2);
}

.section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--space-3);
}

.formula-box {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-md);
  padding: var(--space-4) var(--space-5);
  font-size: 15px;
  font-weight: 500;
  line-height: 1.7;
}

.annotation {
  margin-top: var(--space-2);
  font-size: 12px;
  color: var(--color-text-3);
  font-weight: 400;
}

.category-block {
  margin-bottom: var(--space-4);
}

.category-block h4 {
  font-size: 14px;
  color: var(--color-primary);
  margin-bottom: var(--space-2);
}

.example-item {
  padding-left: var(--space-4);
  border-left: 3px solid var(--color-primary);
  margin-bottom: var(--space-4);
}

.example-item strong {
  font-size: 14px;
}

.example-item p {
  font-size: 14px;
  margin-top: var(--space-1);
}

.dialog-box {
  background: var(--color-surface-2);
  border-radius: var(--radius-md);
  padding: var(--space-4) var(--space-5);
}

.dialog-list p {
  margin-top: var(--space-2);
  font-size: 14px;
}

.key-point {
  margin-top: var(--space-2);
  color: var(--color-success);
  font-weight: 500;
  font-size: 14px;
}

.prompt-text {
  color: var(--color-primary);
  font-size: 14px;
  margin-top: var(--space-1);
}

.muted {
  color: var(--color-text-2);
}

.danger-text {
  color: var(--color-danger);
}

.success-text {
  color: var(--color-success);
}

.plain-list {
  margin-left: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-size: 14px;
}

.plain-list.ol {
  list-style: decimal;
}

.exercise-list {
  margin-left: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  font-size: 14px;
}

.duration {
  margin-left: var(--space-2);
  color: var(--color-text-3);
  font-size: 13px;
  font-family: var(--font-mono);
}

.note {
  display: block;
  color: var(--color-text-3);
  font-size: 13px;
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
  margin-bottom: var(--space-3);
}

.note-field label {
  display: block;
  font-size: 13px;
  color: var(--color-text-2);
  margin-bottom: var(--space-1);
}

.complete-area {
  display: flex;
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}
</style>
