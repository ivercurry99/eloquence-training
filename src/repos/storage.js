/**
 * localStorage 统一读写层
 * - 所有用户数据集中在键 `et-data-v2`，带版本号 `__v`
 * - 旧版数据（键 `eloquence-training-data`）首启动自动迁移
 * - 隐私模式等写入失败场景静默降级为内存模式
 */

const DATA_KEY = 'et-data-v2'
const LEGACY_KEY = 'eloquence-training-data'

// 当前数据结构版本
const CURRENT_VERSION = 2

// 空数据骨架
function emptyData() {
  return {
    __v: CURRENT_VERSION,
    completedDays: [],       // 已完成的天：[1..14]
    checkins: {},            // { [day]: { [itemId]: bool } }
    notes: {},               // { [day]: string }
    top10: [],               // 金句 [{phrase, day, scene, version}]
    ratings: {},             // 总评 {fluency, nervousness, reaction, satisfaction}
    feedback: {},            // {gain, next}
    reviewCards: [],         // SRS 卡片 [{id, text, scene, phase, interval, due, streak, addedAt}]
    practiceHistory: [],     // 语音/朗读/即兴练习记录
    aiCurrent: null,         // 进行中的 AI 陪练会话
    aiSessions: [],          // 已结束的 AI 陪练会话（不含 Key）
    settings: {},            // {theme, apiBase, apiKey, apiModel}
  }
}

// 内存兜底（localStorage 不可用时）
let memoryFallback = null
let memoryEnabled = false

function storageAvailable() {
  if (memoryEnabled) return false
  try {
    const k = '__et_probe__'
    localStorage.setItem(k, '1')
    localStorage.removeItem(k)
    return true
  } catch {
    memoryEnabled = true
    return false
  }
}

/** 读取全部数据（含旧版迁移，幂等） */
export function loadData() {
  if (!storageAvailable()) {
    if (!memoryFallback) memoryFallback = emptyData()
    return memoryFallback
  }
  try {
    const raw = localStorage.getItem(DATA_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.__v === CURRENT_VERSION) return parsed
      // 未来版本升级在此处追加迁移分支
      return { ...emptyData(), ...parsed, __v: CURRENT_VERSION }
    }
  } catch {
    // 损坏数据 → 走迁移/重建
  }
  // 无新数据 → 尝试迁移旧版
  const migrated = migrateLegacy()
  if (migrated) {
    saveData(migrated)
    migrated.__migrated = true // 一次性提示用，不落盘
    return migrated
  }
  return emptyData()
}

/** 旧版 eloquence-training-data → v2 结构 */
function migrateLegacy() {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return null
    const old = JSON.parse(raw)
    const next = emptyData()
    if (Array.isArray(old.completedDays)) next.completedDays = old.completedDays
    if (old.checkins && typeof old.checkins === 'object') next.checkins = old.checkins
    if (old.notes && typeof old.notes === 'object') next.notes = old.notes
    if (Array.isArray(old.top10)) next.top10 = old.top10
    if (old.ratings && typeof old.ratings === 'object') next.ratings = old.ratings
    if (old.feedback && typeof old.feedback === 'object') next.feedback = old.feedback
    if (Array.isArray(old.practiceHistory)) next.practiceHistory = old.practiceHistory
    return next
  } catch {
    return null
  }
}

/** 全量写入（失败静默转内存模式） */
export function saveData(data) {
  if (!storageAvailable()) {
    memoryFallback = data
    return false
  }
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data))
    return true
  } catch {
    memoryEnabled = true
    memoryFallback = data
    return false
  }
}

/** 导出备份 JSON（剔除 API Key） */
export function exportBackup() {
  const data = { ...loadData() }
  if (data.settings) {
    data.settings = { ...data.settings }
    delete data.settings.apiKey
  }
  return JSON.stringify(data, null, 2)
}

/** 导入备份（校验结构，失败返回 null） */
export function importBackup(jsonText) {
  try {
    const parsed = JSON.parse(jsonText)
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.completedDays)) return null
    const merged = { ...emptyData(), ...parsed, __v: CURRENT_VERSION }
    if (merged.settings) delete merged.settings.apiKey // 不接受外部 Key
    saveData(merged)
    return merged
  } catch {
    return null
  }
}

/** 清空全部数据 */
export function clearAll() {
  memoryFallback = emptyData()
  if (storageAvailable()) {
    try {
      localStorage.removeItem(DATA_KEY)
    } catch {
      // 忽略
    }
  }
}
