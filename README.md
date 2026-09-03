# 口才训练营 · Eloquence Training

14 天口才蜕变训练应用：从话术速查、语音评分到 AI 对战陪练，一个纯前端应用完成完整训练闭环。数据全部保存在本地浏览器，无需注册登录。

A 14-day eloquence training SPA: flashcards with spaced repetition, voice-scoring drills, AI role-play debates, and progress analytics — all data stays in your browser.

## 功能 · Features

| 模块 | 说明 |
|---|---|
| 📅 训练计划 | 14 天课程（社交破冰 → 职场表达 → 灵活应变 → 高阶进阶），每日公式、话术、练习步骤 |
| 🗂 话术速查 | 分类话术卡库，一键加入复习 |
| 🧠 间隔复习 | 艾宾浩斯调度（1/2/4/7/15 天），翻卡自评，到期提醒 |
| 📋 每日打卡 | 训练清单勾选 + 笔记，旧版数据自动迁移 |
| 🎙 语音练习 | Web Speech 识别，编辑距离评分（准确率/完整度/流利度）+ 语速 + 填充词统计 |
| 🎭 AI 陪练 | 6 个角色扮演场景 + 4 个辩题，OpenAI 兼容接口，结束后教练结构化点评 |
| 📖 朗读训练 | 绕口令（初级→高级）+ 美文朗读，咬字与语感评分 |
| ⚡ 即兴演讲 | 20 题库，30 秒准备倒计时 → 计时开讲 → 三维自评 + AI 点评 |
| 📊 学习进度 | SVG 手写图表：得分趋势 / 16 周热力图 / 六维能力雷达 |

## 技术栈 · Tech Stack

- **Vite 5 + Vue 3**（Composition API + `<script setup>`）
- **Pinia** 状态管理 · **Vue Router 4**（Hash 路由，静态托管零配置）
- 原生 CSS 设计令牌（vibe-hub 风格，亮/暗双主题），不引 UI 库
- 图表全部手写 SVG，不引图表库
- **Vitest** 单测覆盖评分与 AI 封装（28 个用例）

## 快速开始 · Quick Start

```bash
npm install
npm run dev      # 开发
npm test         # 单元测试
npm run build    # 构建产物 dist/
```

### AI 陪练配置

进入「设置」页，填入任意 OpenAI 兼容接口（内置 DeepSeek / 智谱 / Kimi / OpenAI 快速填充）：

- 接口地址（Base URL，通常以 `/v1` 结尾）
- API Key
- 模型名称

Key 仅保存在你本地浏览器的 localStorage，导出备份时自动剔除，绝不上传。

## 数据与隐私 · Data & Privacy

- 打卡、笔记、练习记录、复习卡片、会话全部存于 localStorage，无后端、无埋点
- 设置页支持导出/导入 JSON 备份（不含 API Key）
- 语音识别使用浏览器原生 Web Speech API（推荐 Chrome / Edge）

## 部署 · Deploy

任意静态托管可用。Vercel 示例：导入仓库后 Framework Preset 选 **Vite**，构建命令 `npm run build`，输出目录 `dist`，无需额外配置。

## 工程方法 · Methodology

按 [everyone-can-projects](https://github.com/ivercurry99/everyone-can-projects) 工作流开发：五角色分工（架构/开发/测试/审查/调度）、五道门禁（Gate0-4）、`PROGRESS.md` 进度记忆。立项文档见 `docs/planning/`，交接记录见 `phases/`。

## License

MIT
