import { defineStore } from 'pinia'
import { loadData, saveData } from '../repos/storage'

export const checkinStore = defineStore('checkin', {
  state: () => {
    const data = loadData()
    return {
      checkins: data.checkins || {},
      notes: data.notes || {},
      allData: data,
    }
  },
  actions: {
    isChecked(day, itemId) {
      return Boolean(this.checkins[day]?.[itemId])
    },
    setCheck(day, itemId, value) {
      if (!this.checkins[day]) this.checkins[day] = {}
      this.checkins[day][itemId] = value
      this.persist()
    },
    getNote(day) {
      return this.notes[day] || ''
    },
    setNote(day, text) {
      this.notes[day] = text
      this.persist()
    },
    persist() {
      this.allData.checkins = this.checkins
      this.allData.notes = this.notes
      saveData(this.allData)
    },
  },
})
