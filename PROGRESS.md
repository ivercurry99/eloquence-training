# 口才训练营 · 进度索引

> 本文件 = 项目的唯一事实来源。任何 Agent、任何会话，先读本文件再干活。

## 当前里程碑
- [x] M0 · 立项文档齐全（docs/planning/ 7 份，Gate0 已过）
- [x] M1 · Harness + 记忆初始化（五角色单会话串行执行；PROGRESS.md 就位）
- [ ] M2 · Features 迭代（顺序见 docs/planning/04-roadmap.md）

## 已确认的关键决定
1. 立项意图：14 天口才蜕变训练应用，完整训练闭环，数据本地保存
2. 技术栈：Vite + Vue 3 + Pinia + Vue Router + 原生 CSS 令牌；不引 UI 库/图表库/AI SDK
3. UI 风格：vibe-hub.org 实测令牌（主色 #4B3FE3、白卡片、毛玻璃吸顶导航、12-18px 圆角、暗色模式支持）
4. 路由：Hash 模式（静态托管零配置）
5. 数据：内容静态打包 + 用户数据 localStorage（storage.js 统一封装，版本号迁移）
6. 旧版迁移：首启动检测键 `eloquence-training-data`，自动迁移打卡/笔记/金句/进度
7. AI 陪练：OpenAI 兼容接口 fetch 直调，用户自配 地址/Key/模型；Key 不进导出文件
8. 部署：GitHub 仓库 + Vercel（构建 `npm run build` → dist/）
9. 旧版源码归档在 `legacy/`（只读参考）

## 当前进行中
- 阶段 3 · Sprint 0：F0 工程地基（Vite 脚手架 + 设计令牌 + 布局骨架）

## 下一步（具体）
1. F0 完成 → Gate2（build 通过）→ 提交 git
2. F1 14 天训练计划（数据沿用 legacy/data.js 迁为 JSON 模块）

## 失败方案 & 证据
- git clone github.com 直连被重置（Connection was reset）→ 改用 GitHub MCP 下载文件，仓库文件用 run_mcp 获取。

## 未解决的风险
- 本机网络无法直连 GitHub：推送阶段可能需要代理或用 gh API 上传（记录在案，届时处理）。
