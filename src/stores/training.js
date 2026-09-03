import { defineStore } from 'pinia'
import { trainingData, phases } from '../data/training'
import { loadData, saveData } from '../repos/storage'

export const trainingStore = defineStore('training', {
  state: () => {
    const data = loadData()
    return {
      days: trainingData,
      phases,
      completedDays: data.completedDays || [],
      allData: data,
    }
  },
  getters: {
    totalDays: (state) => Object.keys(state.days).length,
    completedCount: (state) => state.completedDays.length,
    progressPercent() {
      return Math.round((this.completedCount / this.totalDays) * 100)
    },
    phaseProgress: (state) =>
      state.phases.map((p) => {
        const done = p.days.filter((d) => state.completedDays.includes(d)).length
        return { ...p, done, total: p.days.length, percent: Math.round((done / p.days.length) * 100) }
      }),
    currentDay() {
      for (let i = 1; i <= this.totalDays; i++) {
        if (!this.completedDays.includes(i)) return i
      }
      return null
    },
  },
  actions: {
    isCompleted(day) {
      return this.completedDays.includes(day)
    },
    isCurrent(day) {
      return day === this.currentDay
    },
    toggleComplete(day) {
      const idx = this.completedDays.indexOf(day)
      if (idx >= 0) {
        this.completedDays.splice(idx, 1)
      } else {
        this.completedDays.push(day)
        this.completedDays.sort((a, b) => a - b)
      }
      this.persist()
    },
    persist() {
      this.allData.completedDays = this.completedDays
      saveData(this.allData)
    },
  },
})
