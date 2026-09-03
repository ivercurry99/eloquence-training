<script setup>
import { computed, ref } from 'vue'
import { phraseGroups, allPhrases } from '../data/phrases'
import { reviewStore } from '../stores/review'

const review = reviewStore()
const keyword = ref('')

const filteredGroups = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return phraseGroups
  return phraseGroups
    .map((g) => ({
      ...g,
      items: g.items.filter(
        (item) =>
          item.text.toLowerCase().includes(kw) ||
          item.scene.toLowerCase().includes(kw) ||
          (item.tip || '').toLowerCase().includes(kw)
      ),
    }))
    .filter((g) => g.items.length > 0)
})

const matchCount = computed(() =>
  filteredGroups.value.reduce((sum, g) => sum + g.items.length, 0)
)

const justAdded = ref('')
function addToReview(item) {
  if (review.addCard({ text: item.text, scene: item.scene, source: item.group })) {
    justAdded.value = item.id
    setTimeout(() => (justAdded.value = ''), 1200)
  }
}
</script>

<template>
  <section class="page fade-in">
    <div class="page-header">
      <h1 class="page-title">🃏 话术速查</h1>
      <p class="page-subtitle">每天 2 分钟过一遍，用哪句看哪句</p>
    </div>

    <div class="search-bar">
      <input
        v-model="keyword"
        class="input"
        type="search"
        placeholder="搜索话术 / 场景，如「拒绝」「汇报」…"
      />
      <span v-if="keyword" class="match-count">{{ matchCount }} 条结果</span>
    </div>

    <div v-for="group in filteredGroups" :key="group.id" class="group">
      <h2 class="group-name">{{ group.name }}</h2>
      <div class="phrase-grid">
        <div v-for="item in group.items" :key="item.id" class="card phrase-card">
          <div class="phrase-top">
            <span class="tag tag-primary">{{ item.scene }}</span>
            <button
              class="add-review-btn"
              :class="{ added: review.hasCard(item.text) || justAdded === item.id }"
              :title="review.hasCard(item.text) ? '已在复习计划中' : '加入间隔复习'"
              @click="addToReview(item)"
            >
              {{ review.hasCard(item.text) || justAdded === item.id ? '✓ 已加入' : '+ 复习' }}
            </button>
          </div>
          <p class="phrase-text">{{ item.text }}</p>
          <p v-if="item.tip" class="phrase-tip">💡 {{ item.tip }}</p>
        </div>
      </div>
    </div>

    <div v-if="keyword && matchCount === 0" class="card">
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <p>没有找到「{{ keyword }}」相关话术</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.search-bar .input {
  max-width: 420px;
}

.match-count {
  font-size: 13px;
  color: var(--color-text-3);
  white-space: nowrap;
}

.group {
  margin-bottom: var(--space-8);
}

.group-name {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: var(--space-4);
}

.phrase-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}

.phrase-card {
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.phrase-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.add-review-btn {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  color: var(--color-text-2);
  transition: all 0.15s ease;
  white-space: nowrap;
}

.add-review-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.add-review-btn.added {
  border-color: var(--color-success);
  color: var(--color-success);
  background: var(--color-success-soft);
  cursor: default;
}

.phrase-text {
  font-size: 15px;
  font-weight: 500;
  line-height: 1.6;
}

.phrase-tip {
  font-size: 13px;
  color: var(--color-text-3);
  line-height: 1.5;
}
</style>
