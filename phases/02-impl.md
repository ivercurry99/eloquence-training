# Phase 实施记录 · Sprint 0 + Sprint 1（F0 工程地基 + F1 训练计划）

> 开发者产出。测试员见 03-test.md。

## F0 工程地基
- Vite 5 + Vue 3.5 + Pinia 2 + Vue Router 4，base './'，构建产物 dist/（112KB gzip 44KB）
- 设计令牌 tokens.css（vibe-hub 实测色值，亮/暗双主题）+ base.css 通用组件类
- App.vue：毛玻璃吸顶导航 + 移动端汉堡菜单 + 页面切换过渡 + 页脚
- repos/storage.js：统一 localStorage 层（版本号 `__v:2`、旧版自动迁移、导出剔 Key、隐私模式内存兜底）
- 10 个路由全部懒加载（占位页 9 个 + HomeView 完整实现）

## F1 14 天训练计划
- data/training.js：旧版 14 天课程数据转 ES 模块（+phases 阶段定义）
- stores/training.js：完成状态/进度/当前天计算
- stores/checkin.js：自检清单 + 笔记持久化（供详情弹窗与打卡页共用）
- HomeView.vue：hero 进度卡 + 4 阶段分组卡片网格（完成绿/当前紫高亮）
- components/training/DayDetailModal.vue：详情弹窗，覆盖 14 天全部内容结构（公式/话术表/分类话术/对话示例/对比表/救场分组/技巧/清单/笔记/复盘），数据驱动渲染
- components/common/BaseModal.vue：通用弹窗（ESC/点击遮罩关闭、滚动锁定）

## 已知问题
- 训练数据仍是单文件 50KB（可接受，静态打包）
- DayDetailModal 中 materials 的 url 链接渲染使用模板字符串拼接，未做 XSS 消毒（数据源为静态内置，风险可控）
