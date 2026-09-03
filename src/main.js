import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { settingsStore } from './stores/settings'
import './styles/tokens.css'
import './styles/base.css'

const app = createApp(App)
app.use(createPinia())

// 主题初始化（先于渲染，避免闪白）
const settings = settingsStore()
settings.applyTheme()

// 系统主题变化时联动（auto 模式）
window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (settings.theme === 'auto') settings.applyTheme()
})

app.use(router)
app.mount('#app')

// 旧数据迁移一次性提示
if (settings.allData.__migrated) {
  const count =
    (settings.allData.completedDays?.length || 0) +
    Object.keys(settings.allData.checkins || {}).length +
    (settings.allData.top10?.length || 0)
  console.info(`[口才训练营] 已从旧版迁移数据（${count} 条记录）`)
}
