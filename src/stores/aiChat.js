import { defineStore } from 'pinia'
import { loadData, saveData } from '../repos/storage'

/**
 * AI 陪练会话 store
 * current: { scenarioId, scenarioName, mode, emoji, messages: [{role, content}], feedback, createdAt }
 * sessions: 已结束会话（上限 20 条，不含 Key）
 */
export const aiChatStore = defineStore('aiChat', {
  state: () => {
    const data = loadData()
    return {
      current: data.aiCurrent || null,
      sessions: data.aiSessions || [],
      allData: data,
    }
  },
  getters: {
    turnCount: (state) =>
      state.current ? state.current.messages.filter((m) => m.role === 'user').length : 0,
  },
  actions: {
    startSession(scenario) {
      this.current = {
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        mode: scenario.mode,
        emoji: scenario.emoji,
        messages: [{ role: 'assistant', content: scenario.opening }],
        feedback: '',
        createdAt: Date.now(),
      }
      this.persist()
    },
    pushMessage(role, content) {
      if (!this.current) return
      this.current.messages.push({ role, content })
      // 上限 60 条，防止 localStorage 膨胀
      if (this.current.messages.length > 60) {
        this.current.messages = this.current.messages.slice(-60)
      }
      this.persist()
    },
    setFeedback(text) {
      if (!this.current) return
      this.current.feedback = text
      this.persist()
    },
    /** 结束当前会话并存档 */
    endSession() {
      if (!this.current) return null
      const ended = { id: `ai-${Date.now()}`, ...this.current, endedAt: Date.now() }
      this.sessions.unshift(ended)
      if (this.sessions.length > 20) this.sessions = this.sessions.slice(0, 20)
      this.current = null
      this.persist()
      return ended
    },
    resetSession() {
      this.current = null
      this.persist()
    },
    removeSession(id) {
      this.sessions = this.sessions.filter((s) => s.id !== id)
      this.persist()
    },
    clearSessions() {
      this.sessions = []
      this.persist()
    },
    persist() {
      this.allData.aiCurrent = this.current
      this.allData.aiSessions = this.sessions
      saveData(this.allData)
    },
  },
})
