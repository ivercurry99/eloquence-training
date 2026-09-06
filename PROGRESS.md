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
- 无 · 项目已上线 🎉

## 上线信息
- GitHub 仓库：https://github.com/ivercurry99/eloquence-training（公开，10 个 topics，README 双语）
- 线上地址：https://eloquence-training-v2.vercel.app（Vercel 自动识别 Vite，零配置）
- 后续推送 main 分支会自动触发 Vercel 重新部署

## 已完成 Features（均过 Gate2 build + Gate3 测试）
- [x] F0 工程地基：Vite+Vue3+Pinia 骨架 / vibe-hub 设计令牌 / 毛玻璃导航
- [x] F1 14 天训练计划页 + 每日详情弹窗（commit f59451e）
- [x] F2 话术速查卡 + SRS 间隔复习：phrases.js 分类卡库 / srs.js 艾宾浩斯调度 / 翻卡自评（commit 8269aa6）
- [x] F3 打卡记录+笔记：checkinLists.js 每日清单 / 旧版数据自动迁移+toast 提示（commit 8018610）
- [x] F4 语音练习评分：useSpeech.js 识别封装 / scoring.js 编辑距离评分+语速+填充词 / practice store 历史 / 17 单测全过（commit 87f4cef）
- [x] F5 AI 对话陪练：ai.js OpenAI 兼容 fetch 封装 / 6 角色扮演 + 4 辩题 / 教练结构化点评 / 会话存档（commit 045e37e）
- [x] F6 朗读训练+即兴演讲：绕口令/美文评分 / 20 题库 30 秒准备倒计时 / 三维自评 / AI 演讲点评（commit 5ddb418）
- [x] F7 进度统计+设置页：SVG 趋势/热力/六维雷达 / 主题切换 / AI 接口配置与连接测试 / 备份导入导出（commit ca53044）

## 阶段 4 门禁验收记录（2026-09-04）
- [x] Gate0 需求：7 份立项文档 + F1-F7 完成标准均落 phases/ 与 docs/planning/
- [x] Gate1 设计：架构分层（views→stores→repos）落地无违例；设计令牌全量应用
- [x] Gate2 构建：`npm run build` 通过（79 modules，gzip 后首包 45.7KB）
- [x] Gate3 测试：Vitest 28/28 通过（scoring 17 + ai 11）
- [x] Gate4 审查：浏览器冒烟测试 10/10 页面渲染正常、console 零错误；导航补齐 9 入口
- 修复记录：review.js 残留 TS 注解 `(): number` 导致生产构建失败 → 已移除

## 失败方案 & 证据
- git clone github.com 直连被重置（Connection was reset）→ 改用 GitHub MCP 下载文件，仓库文件用 run_mcp 获取。

## 未解决的风险
- 本机网络无法直连 GitHub：推送阶段可能需要代理或用 gh API 上传（记录在案，届时处理）。
