import { describe, it, expect } from 'vitest'
import {
  normalize,
  levenshtein,
  scorePhrase,
  speechRate,
  countFillers,
  scoreFeedback,
} from '../src/services/scoring'

describe('normalize', () => {
  it('去除标点和空格', () => {
    expect(normalize('你好，世界！')).toBe('你好世界')
    expect(normalize('  说 的 话  ')).toBe('说的话')
  })

  it('空值安全', () => {
    expect(normalize(undefined)).toBe('')
    expect(normalize(null)).toBe('')
  })
})

describe('levenshtein', () => {
  it('相同文本距离为 0', () => {
    expect(levenshtein('abc', 'abc')).toBe(0)
  })

  it('单字差异距离为 1', () => {
    expect(levenshtein('abc', 'abd')).toBe(1)
  })

  it('空串与 n 长文本距离为 n', () => {
    expect(levenshtein('', 'abc')).toBe(3)
    expect(levenshtein('abc', '')).toBe(3)
  })
})

describe('scorePhrase', () => {
  it('完全一致得满分', () => {
    const r = scorePhrase('这个角度我还真没想过', '这个角度我还真没想过')
    expect(r.score).toBe(100)
    expect(r.accuracy).toBe(100)
    expect(r.completeness).toBe(100)
    expect(r.fluency).toBe(100)
  })

  it('标点不计入评分', () => {
    const r = scorePhrase('挺有意思的。', '挺有意思的')
    expect(r.score).toBe(100)
  })

  it('空目标返回全 0', () => {
    const r = scorePhrase('', '随便说的')
    expect(r.score).toBe(0)
    expect(r.accuracy).toBe(0)
  })

  it('说漏一半：完整度 50%，准确率也被拉低', () => {
    const r = scorePhrase('一二三四五六七八', '一二三四')
    expect(r.completeness).toBe(50)
    expect(r.accuracy).toBe(50)
    expect(r.score).toBeLessThan(100)
  })

  it('乱说不得分', () => {
    const r = scorePhrase('今天天气真好', '完全不同的内容啊')
    expect(r.score).toBeLessThan(40)
  })
})

describe('speechRate', () => {
  it('按字/分钟计算语速', () => {
    // 10 个字，3 秒 → 200 字/分
    expect(speechRate('一二三四五六七八九十', 3000)).toBe(200)
    // 10 个字，30 秒 → 20 字/分
    expect(speechRate('一二三四五六七八九十', 30000)).toBe(20)
  })

  it('零时长返回 0', () => {
    expect(speechRate('你好', 0)).toBe(0)
  })
})

describe('countFillers', () => {
  it('统计填充词出现次数', () => {
    const r = countFillers('嗯，我觉得，嗯，就是说这样')
    expect(r.count).toBeGreaterThanOrEqual(3)
    expect(r.detail).toContain('嗯')
    expect(r.detail).toContain('就是说')
  })

  it('无填充词返回 0', () => {
    const r = countFillers('观点明确表达流畅')
    expect(r.count).toBe(0)
    expect(r.detail).toBe('')
  })
})

describe('scoreFeedback', () => {
  it('80 分以上正面反馈', () => {
    expect(scoreFeedback(85).type).toBe('positive')
  })

  it('60-79 分中性反馈', () => {
    expect(scoreFeedback(70).type).toBe('neutral')
  })

  it('60 分以下鼓励重试', () => {
    expect(scoreFeedback(40).type).toBe('negative')
  })
})
