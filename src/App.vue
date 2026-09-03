<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { settingsStore } from './stores/settings'

const router = useRouter()
const route = useRoute()
const settings = settingsStore()

const menuOpen = ref(false)

const navItems = [
  { to: '/', label: '训练计划' },
  { to: '/flashcard', label: '话术速查' },
  { to: '/review', label: '复习' },
  { to: '/checkin', label: '打卡' },
  { to: '/practice', label: '语音练习' },
  { to: '/reading', label: '朗读' },
  { to: '/impromptu', label: '即兴挑战' },
  { to: '/coach', label: 'AI 陪练' },
  { to: '/progress', label: '进度' },
]

function go(to) {
  menuOpen.value = false
  router.push(to)
}

function toggleTheme() {
  settings.setTheme(settings.resolvedTheme === 'dark' ? 'light' : 'dark')
}
</script>

<template>
  <header class="nav">
    <div class="nav-inner">
      <button class="nav-logo" @click="go('/')">
        <span class="logo-mark">🎤</span>
        <span class="logo-text">口才训练营</span>
      </button>

      <nav class="nav-menu" :class="{ open: menuOpen }">
        <button
          v-for="item in navItems"
          :key="item.to"
          class="nav-btn"
          :class="{ active: route.path === item.to }"
          @click="go(item.to)"
        >
          {{ item.label }}
        </button>
      </nav>

      <div class="nav-actions">
        <button class="icon-btn" :title="settings.resolvedTheme === 'dark' ? '切到亮色' : '切到暗色'" @click="toggleTheme">
          {{ settings.resolvedTheme === 'dark' ? '☀️' : '🌙' }}
        </button>
        <button class="icon-btn" title="设置" @click="go('/settings')">⚙️</button>
        <button class="icon-btn menu-toggle" title="菜单" @click="menuOpen = !menuOpen">☰</button>
      </div>
    </div>
  </header>

  <main class="main">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>

  <footer class="footer">
    <p>口才训练营 · 数据保存在本地浏览器 · <a href="https://github.com/ivercurry99" target="_blank" rel="noopener">GitHub</a></p>
  </footer>
</template>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--nav-height);
  background: var(--color-overlay);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
}

.nav-inner {
  max-width: var(--content-width);
  margin: 0 auto;
  height: 100%;
  padding: 0 var(--space-5);
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-1);
}

.logo-mark {
  font-size: 20px;
}

.nav-menu {
  display: flex;
  gap: var(--space-1);
  flex: 1;
  overflow-x: auto;
}

.nav-btn {
  padding: 7px 14px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--color-text-2);
  transition: all 0.15s ease;
  white-space: nowrap;
}

.nav-btn:hover {
  color: var(--color-text-1);
  background: var(--color-surface-3);
}

.nav-btn.active {
  color: var(--color-accent);
  background: var(--color-primary-soft);
  font-weight: 500;
}

.nav-actions {
  display: flex;
  gap: var(--space-1);
  margin-left: auto;
}

.icon-btn {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-size: 16px;
  transition: background 0.15s ease;
}

.icon-btn:hover {
  background: var(--color-surface-3);
}

.menu-toggle {
  display: none;
}

.main {
  max-width: var(--content-width);
  margin: 0 auto;
  padding: var(--space-8) var(--space-5) var(--space-10);
  min-height: calc(100vh - var(--nav-height) - 60px);
}

.footer {
  border-top: 1px solid var(--color-border);
  padding: var(--space-5);
  text-align: center;
  font-size: 13px;
  color: var(--color-text-3);
  background: linear-gradient(var(--color-surface), var(--color-bg));
}

/* 页面切换过渡 */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.page-leave-to {
  opacity: 0;
}

/* 移动端 */
@media (max-width: 720px) {
  .menu-toggle {
    display: inline-flex;
  }

  .nav-menu {
    position: absolute;
    top: var(--nav-height);
    left: 0;
    right: 0;
    flex-direction: column;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    padding: var(--space-3);
    gap: var(--space-1);
    display: none;
    box-shadow: var(--shadow-lg);
  }

  .nav-menu.open {
    display: flex;
  }

  .nav-btn {
    text-align: left;
    padding: 11px 14px;
  }

  .main {
    padding: var(--space-5) var(--space-4) var(--space-8);
  }
}
</style>
