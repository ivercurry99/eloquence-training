# 05 · 技术栈选型（Tech Stack）

> 用户确认「选最适合的」。本项目为纯前端静态应用（无后端），选型如下。

| 层 | 选型 | 理由 |
|---|---|---|
| 构建 | Vite 5+ | 秒级冷启动；构建产物纯静态，Vercel 零配置 |
| 框架 | Vue 3（Composition API + `<script setup>`） | 组件化清晰；中文生态最好；渐进式 |
| 状态 | Pinia | Vue 官方推荐；store 分模块（训练/打卡/复习/练习/设置） |
| 路由 | Vue Router 4 | 页面级路由；支持代码分割 |
| 图表 | 手写 SVG（热力图/趋势/雷达） | 3 张图不值得引 ECharts，控制包体积 |
| 语音 | Web Speech API（原生） | 免费免 Key；Chrome/Edge 支持中文；不支持时降级提示 |
| AI 陪练 | OpenAI 兼容 Chat Completions（fetch 直调） | 用户自配地址/Key/模型（DeepSeek/智谱等均兼容）；不引 SDK |
| 持久化 | localStorage（统一 repository 封装） | 无后端；旧版数据自动迁移 |
| 样式 | 原生 CSS（设计令牌 CSS 变量） | 不引 UI 库，还原 vibe-hub 风格；包体积最小 |
| 测试 | Vitest + Vue Test Utils | 与 Vite 同生态；store 与纯函数单测为主 |
| 部署 | GitHub 仓库 + Vercel（静态） | 用户指定；构建命令 `npm run build`，产物 `dist/` |

## 不引入的东西（明确决策）
- ❌ UI 组件库（Element/Naive 等）：为还原 vibe-hub 定制风格，手写组件更可控
- ❌ ECharts：三张图手写 SVG 足够
- ❌ 后端/数据库：数据全本地，AI 走用户自配 API

## 降级策略
- 浏览器不支持 Web Speech API → 功能入口置灰 + 提示推荐浏览器
- 未配置 AI Key → 陪练页展示配置引导，不影响其他功能
- 宿主无网络 → 跳过开源复用，按本地常识实现
