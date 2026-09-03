import { defineStore } from 'pinia'
import { loadData, saveData } from '../repos/storage'
import { createCard, gradeCard, isDue, dueCount, daysUntilDue } from '../services/srs'

export const reviewStore = defineStore('review', {
  state: () => {
    const data = loadData()
    return {
      cards: data.reviewCards || [],
      allData: data,
    }
  },
  getters: {
    dueCards: (state) => state.cards.filter((c) => isDue(c)),
    dueCount() {
      return dueCount(this.cards)
    },
    totalActive: (state) => state.cards.filter((c) => !c.graduated).length,
    graduatedCount: (state) => state.cards.filter((c) => c.graduated).length,
  },
  actions: {
    hasCard(text) {
      return this.cards.some((c) => c.text === text)
    },
    addCard({ text, scene, source }) {
      if (this.hasCard(text)) return false
      this.cards.push(createCard({ text, scene, source }))
      this.persist()
      return true
    },
    removeCard(id) {
      this.cards = this.cards.filter((c) => c.id !== id)
      this.persist()
    },
    grade(id, result) {
      const idx = this.cards.findIndex((c) => c.id === id)
      if (idx < 0) return
      this.cards[idx] = gradeCard(this.cards[idx], result)
      this.persist()
    },
    remainingDays(card) {
      return daysUntilDue(card)
    },
    persist() {
      this.allData.reviewCards = this.cards
      saveData(this.allData)
    },
  },
})
