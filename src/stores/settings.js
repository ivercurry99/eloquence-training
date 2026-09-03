import { defineStore } from 'pinia'
import { loadData, saveData } from '../repos/storage'

export const settingsStore = defineStore('settings', {
  state: () => {
    const data = loadData()
    return {
      // theme: 'light' | 'dark' | 'auto'
      theme: data.settings?.theme || 'auto',
      apiBase: data.settings?.apiBase || '',
      apiKey: data.settings?.apiKey || '',
      apiModel: data.settings?.apiModel || '',
      allData: data,
    }
  },
  getters: {
    resolvedTheme: (state) => {
      if (state.theme !== 'auto') return state.theme
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    },
    aiConfigured: (state) => Boolean(state.apiBase && state.apiKey),
  },
  actions: {
    setTheme(theme) {
      this.theme = theme
      this.persistSettings()
      this.applyTheme()
    },
    setAiConfig({ apiBase, apiKey, apiModel }) {
      this.apiBase = apiBase.trim()
      this.apiKey = apiKey.trim()
      this.apiModel = apiModel.trim()
      this.persistSettings()
    },
    persistSettings() {
      this.allData.settings = {
        theme: this.theme,
        apiBase: this.apiBase,
        apiKey: this.apiKey,
        apiModel: this.apiModel,
      }
      saveData(this.allData)
    },
    applyTheme() {
      document.documentElement.setAttribute('data-theme', this.resolvedTheme)
    },
  },
})
