import { defineStore } from 'pinia'
import { loadData, saveData } from '../repos/storage'

/**
 * 练习记录 store：语音 / 朗读 / 即兴三类练习共用
 * 记录结构：{ id, type, scene, target, transcript, score, accuracy,
 *            completeness, fluency, rate, fillerCount, durationMs, createdAt }
 */
export const practiceStore = defineStore('practice', {
  state: () => {
    const data = loadData()
    return {
      history: data.practiceHistory || [],
      allData: data,
    }
  },
  getters: {
    total: (state) => state.history.length,
    avgScore(state) {
      if (!state.history.length) return 0
      const sum = state.history.reduce((a, r) => a + (r.score || 0), 0)
      return Math.round(sum / state.history.length)
    },
    recent(state) {
      return [...state.history].sort((a, b) => b.createdAt - a.createdAt).slice(0, 10)
    },
  },
  actions: {
    addRecord(record) {
      this.history.push({ id: `pr-${Date.now()}`, createdAt: Date.now(), ...record })
      // 上限 200 条，避免 localStorage 膨胀
      if (this.history.length > 200) this.history = this.history.slice(-200)
      this.persist()
    },
    removeRecord(id) {
      this.history = this.history.filter((r) => r.id !== id)
      this.persist()
    },
    clearHistory() {
      this.history = []
      this.persist()
    },
    persist() {
      this.allData.practiceHistory = this.history
      saveData(this.allData)
    },
  },
})
