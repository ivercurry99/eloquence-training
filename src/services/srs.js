/**
 * 间隔重复调度（艾宾浩斯）· 纯函数，可单测
 * 间隔序列：1 / 2 / 4 / 7 / 15 天
 */

export const SRS_INTERVALS = [1, 2, 4, 7, 15]
export const GRADUATE_STREAK = SRS_INTERVALS.length // 连续记住 5 次 = 毕业

export const DAY_MS = 24 * 60 * 60 * 1000

/** 新卡片 */
export function createCard({ text, scene, source = '' }) {
  return {
    id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text,
    scene,
    source,
    stage: 0, // 间隔序号
    streak: 0, // 连续「记住」次数
    due: Date.now(), // 立即可复习
    graduated: false,
    addedAt: Date.now(),
  }
}

/**
 * 自评更新卡片
 * @param card 现有卡片
 * @param result 'good' | 'fuzzy' | 'forgot'
 */
export function gradeCard(card, result) {
  const next = { ...card }
  if (result === 'good') {
    next.streak = card.streak + 1
    next.stage = Math.min(card.stage + 1, SRS_INTERVALS.length - 1)
    if (next.streak >= GRADUATE_STREAK) next.graduated = true
  } else if (result === 'fuzzy') {
    next.streak = 0
    // 间隔减半但不低于当前档的一半
    next.stage = Math.max(0, card.stage - 1)
  } else {
    next.streak = 0
    next.stage = 0
  }
  next.due = Date.now() + SRS_INTERVALS[next.stage] * DAY_MS
  return next
}

/** 是否到期 */
export function isDue(card, now = Date.now()) {
  return !card.graduated && card.due <= now
}

/** 到期数量 */
export function dueCount(cards, now = Date.now()) {
  return cards.filter((c) => isDue(c, now)).length
}

/** 距下次复习的剩余天数（向上取整，0 = 今天） */
export function daysUntilDue(card, now = Date.now()) {
  return Math.max(0, Math.ceil((card.due - now) / DAY_MS))
}
