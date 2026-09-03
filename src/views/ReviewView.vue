<script setup>
import { computed, ref } from 'vue'
import { reviewStore } from '../stores/review'

const review = reviewStore()

const currentIndex = ref(0)
const flipped = ref(false)

const currentCard = computed(() => review.dueCards[currentIndex.value] || null)
const finished = computed(() => review.dueCards.length > 0 && currentIndex.value >= review.dueCards.length)

function grade(result) {
  if (!currentCard.value) return
  review.grade(currentCard.value.id, result)
  flipped.value = false
  currentIndex.value++
}

function restart() {
  currentIndex.value = 0
  flipped.value = false
}

const stageTexts = ['明天再来', '2 天后', '4 天后', '7 天后', '15 天后']
</script>

<template>
  <section class="page fade-in">
    <div class="page-header">
      <h1 class="page-title">🧠 间隔复习</h1>
      <p class="page-subtitle">按遗忘曲线安排，到期才复习，学过的不忘</p>
    </div>

    <!-- 复习区 -->
    <div v-if="review.dueCount > 0 && !finished" class="review-area">
      <div class="review-meta">
        <span class="tag tag-primary">今日待复习 {{ review.dueCount - currentIndex }} 张</span>
        <span class="tag">{{ currentCard.scene }}</span>
      </div>

      <div class="card flip-card" @click="flipped = !flipped">
        <div v-if="!flipped" class="flip-front">
          <p class="flip-label">想一下，这个场景你会怎么说？</p>
          <h2 class="flip-scene">{{ currentCard.scene }}</h2>
          <p class="flip-hint">点击卡片翻面看参考话术</p>
        </div>
        <div v-else class="flip-back">
          <p class="flip-label">参考话术</p>
          <p class="flip-text">{{ currentCard.text }}</p>
          <p v-if="currentCard.source" class="flip-source">来自：{{ currentCard.source }}</p>
        </div>
      </div>

      <div v-if="flipped" class="grade-area">
        <p class="grade-q">想起来了吗？</p>
        <div class="grade-btns">
          <button class="btn grade-btn forgot" @click="grade('forgot')">😶 忘了<span>明天再来</span></button>
          <button class="btn grade-btn fuzzy" @click="grade('fuzzy')">🤔 模糊<span>{{ stageTexts[Math.max(0, currentCard.stage - 1)] }}</span></button>
          <button class="btn grade-btn good" @click="grade('good')">😄 记住了<span>{{ stageTexts[Math.min(currentCard.stage + 1, 4)] }}</span></button>
        </div>
      </div>
      <p v-else class="tap-hint">先在心里默念你的版本，再翻面对比</p>
    </div>

    <!-- 完成今日复习 -->
    <div v-else-if="finished || review.dueCount === 0" class="card">
      <div class="empty-state">
        <div class="empty-icon">🎉</div>
        <p v-if="finished">今日复习全部完成！</p>
        <p v-else>今天没有到期的卡片</p>
        <p class="next-info">
          复习计划共 {{ review.totalActive }} 张进行中 · {{ review.graduatedCount }} 张已毕业
        </p>
        <button v-if="finished" class="btn btn-ghost" style="margin-top: 12px" @click="restart">再过一轮</button>
      </div>
    </div>

    <!-- 卡片管理 -->
    <div v-if="review.cards.length > 0" class="manage-area">
      <h2 class="manage-title">我的复习卡片（{{ review.cards.length }}）</h2>
      <div v-for="card in review.cards" :key="card.id" class="card manage-card">
        <div class="manage-info">
          <span class="tag" :class="card.graduated ? 'tag-success' : 'tag-primary'">
            {{ card.graduated ? '🎓 已毕业' : card.due <= Date.now() ? '⏰ 待复习' : `${review.remainingDays(card)} 天后` }}
          </span>
          <span class="manage-scene">{{ card.scene }}</span>
        </div>
        <p class="manage-text">{{ card.text }}</p>
        <button class="remove-btn" title="移出复习" @click="review.removeCard(card.id)">删除</button>
      </div>
    </div>

    <div v-else class="card">
      <div class="empty-state">
        <div class="empty-icon">🃏</div>
        <p>还没有复习卡片</p>
        <p class="next-info">去「话术速查」页，点「+ 复习」把话术加入间隔复习</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.review-area {
  margin-bottom: var(--space-8);
}

.review-meta {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.flip-card {
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.flip-card:hover {
  border-color: var(--color-primary);
}

.flip-front,
.flip-back {
  text-align: center;
  padding: var(--space-4);
}

.flip-label {
  font-size: 13px;
  color: var(--color-text-3);
  margin-bottom: var(--space-3);
}

.flip-scene {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary);
}

.flip-hint {
  margin-top: var(--space-4);
  font-size: 13px;
  color: var(--color-text-3);
}

.flip-text {
  font-size: 18px;
  font-weight: 500;
  line-height: 1.7;
}

.flip-source {
  margin-top: var(--space-3);
  font-size: 13px;
  color: var(--color-text-3);
}

.grade-area {
  margin-top: var(--space-5);
  text-align: center;
}

.grade-q {
  font-size: 14px;
  color: var(--color-text-2);
  margin-bottom: var(--space-3);
}

.grade-btns {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  flex-wrap: wrap;
}

.grade-btn {
  flex-direction: column;
  gap: 2px;
  padding: 12px 24px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  font-weight: 600;
}

.grade-btn span {
  font-size: 11px;
  font-weight: 400;
  color: var(--color-text-3);
}

.grade-btn.forgot:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.grade-btn.fuzzy:hover {
  border-color: var(--color-warning);
  color: var(--color-warning);
}

.grade-btn.good:hover {
  border-color: var(--color-success);
  color: var(--color-success);
}

.tap-hint {
  text-align: center;
  margin-top: var(--space-4);
  font-size: 13px;
  color: var(--color-text-3);
}

.next-info {
  margin-top: var(--space-2);
  font-size: 13px;
  color: var(--color-text-3);
}

.manage-area {
  margin-top: var(--space-8);
}

.manage-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--space-4);
}

.manage-card {
  padding: var(--space-4) var(--space-5);
  margin-bottom: var(--space-3);
  position: relative;
}

.manage-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.manage-scene {
  font-size: 13px;
  color: var(--color-text-2);
}

.manage-text {
  font-size: 14px;
  padding-right: var(--space-6);
}

.remove-btn {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  font-size: 12px;
  color: var(--color-text-3);
  padding: 2px 8px;
  border-radius: var(--radius-xs);
}

.remove-btn:hover {
  color: var(--color-danger);
  background: var(--color-danger-soft);
}
</style>
