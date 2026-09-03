/**
 * 语音练习评分 · 纯函数，可单测
 */

/** 去标点，只留文字 */
const PUNCT = /[，。！？、；：""''…—\s,!?;:'"]/g

export function normalize(text) {
  return (text || '').replace(PUNCT, '')
}

/** 编辑距离（Levenshtein） */
export function levenshtein(a, b) {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  let prev = Array.from({ length: n + 1 }, (_, j) => j)
  let curr = new Array(n + 1)
  for (let i = 1; i <= m; i++) {
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(prev[j - 1] + cost, prev[j] + 1, curr[j - 1] + 1)
    }
    ;[prev, curr] = [curr, prev]
  }
  return prev[n]
}

/**
 * 逐字对比评分
 * @returns {{score, accuracy, completeness, fluency}} 0-100
 */
export function scorePhrase(targetText, actualText) {
  const target = normalize(targetText)
  const actual = normalize(actualText)
  if (!target) return { score: 0, accuracy: 0, completeness: 0, fluency: 0 }

  const dist = levenshtein(target, actual)
  const maxLen = Math.max(target.length, actual.length) || 1

  // 准确率：1 - 编辑距离/目标长度（识别得对不对）
  const accuracy = clamp(Math.round((1 - dist / target.length) * 100))
  // 完整度：实际长度/目标长度（说全了没有）
  const completeness = clamp(Math.round((actual.length / target.length) * 100))
  // 流利度：1 - 编辑距离/最大长度（整体相似度）
  const fluency = clamp(Math.round((1 - dist / maxLen) * 100))

  const score = Math.round(accuracy * 0.4 + completeness * 0.3 + fluency * 0.3)
  return { score, accuracy, completeness, fluency }
}

/**
 * 语速统计（字/分钟）
 */
export function speechRate(actualText, durationMs) {
  const chars = normalize(actualText).length
  if (durationMs <= 0) return 0
  return Math.round((chars / (durationMs / 60000)) * 10) / 10
}

/** 中文填充词统计 */
const FILLERS = ['嗯', '啊', '呃', '然后', '就是说', '这个那个', '反正']

export function countFillers(actualText) {
  let count = 0
  const found = []
  for (const w of FILLERS) {
    const matches = (actualText || '').split(w).length - 1
    if (matches > 0) {
      count += matches
      found.push(`${w}×${matches}`)
    }
  }
  return { count, detail: found.join('、') }
}

function clamp(v) {
  return Math.max(0, Math.min(100, v))
}

/** 评分文案 */
export function scoreFeedback(score) {
  if (score >= 80) return { type: 'positive', text: '太棒了！表达准确流畅，继续保持！' }
  if (score >= 60) return { type: 'neutral', text: '不错！多练几遍，注意准确性和完整性。' }
  return { type: 'negative', text: '再来一遍！放慢语速，逐字说清楚。' }
}
