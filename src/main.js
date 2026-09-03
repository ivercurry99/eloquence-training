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

// 旧数据迁移一次性提示（可见 toast）
if (settings.allData.__migrated) {
  const count =
    (settings.allData.completedDays?.length || 0) +
    Object.keys(settings.allData.checkins || {}).length +
    (settings.allData.top10?.length || 0)
  const toast = document.createElement('div')
  toast.className = 'migration-toast'
  toast.textContent = `已自动导入旧版数据（${count} 条记录）`
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 5000)
}
