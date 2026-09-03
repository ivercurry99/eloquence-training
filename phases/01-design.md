# Phase 设计文档 · Sprint 0 · F0 工程地基

> 架构师产出。开发者按此实现，测试员按「测试要点」验收。

## 目标
搭起可运行的 Vite + Vue 3 骨架 + vibe-hub 风格设计令牌 + 布局，让后续 10 个 feature 只填页面。

## 完成标准（Gate0）
1. `npm run dev` 可启动；`npm run build` 产出 dist/ 纯静态
2. 毛玻璃吸顶导航 + 10 个路由占位页可切换
3. 亮/暗主题可切换并持久化（跟随系统默认）
4. 设计令牌全走 CSS 变量，无写死色值

## 技术要点
- create-vite 手动搭（vue 模板），依赖：vue, vue-router, pinia
- vite.config.js：base './'（静态托管相对路径）
- tokens.css：亮/暗两套 `:root` / `[data-theme="dark"]` 变量
- App.vue：NavBar（毛玻璃）+ main 容器（max-width 1080px 居中）
- settings store：主题状态（localStorage 持久化）
- main.js：启动时读主题并设 `data-theme`

## 测试要点（Gate3，测试员执行）
- [ ] dev 启动无报错
- [ ] 10 个路由全部可达（hash 路由）
- [ ] 切暗色 → 刷新 → 仍是暗色
- [ ] 375px 宽度导航不溢出
