# 06 · 项目架构（Architecture）

## 总体形态
纯前端 SPA（Hash 路由，静态托管友好），无后端。数据分两类：
1. **内容数据**（14 天课程、话术库、题库、朗读素材）→ 静态 JSON/JS 模块，随构建打包
2. **用户数据**（进度/打卡/笔记/复习/练习历史/设置）→ localStorage，经 repository 层统一读写

## 目录结构
```
口才训练/
├── index.html
├── vite.config.js
├── src/
│   ├── main.js                 # 入口：挂载 + 数据迁移 + 主题初始化
│   ├── App.vue                 # 布局骨架（毛玻璃导航 + <router-view>）
│   ├── router/
│   │   └── index.js            # 路由表（懒加载）
│   ├── stores/                 # Pinia stores（业务层）
│   │   ├── training.js         # 14 天进度
│   │   ├── checkin.js          # 打卡+笔记
│   │   ├── review.js           # SRS 复习调度
│   │   ├── practice.js         # 语音/朗读/即兴练习记录
│   │   ├── aiChat.js           # AI 陪练会话
│   │   └── settings.js         # 主题/API Key
│   ├── repos/
│   │   └── storage.js          # localStorage 读写 + 版本迁移 + 导出导入
│   ├── data/                   # 内容数据（静态）
│   │   ├── training.js         # 14 天课程（沿用 legacy/data.js）
│   │   ├── phrases.js          # 话术速查卡库
│   │   ├── topics.js           # 即兴演讲题库
│   │   └── readings.js         # 朗读素材（绕口令/美文）
│   ├── services/               # 纯逻辑（可单测）
│   │   ├── scoring.js          # 评分（准确率/编辑距离/语速/填充词）
│   │   ├── srs.js              # 艾宾浩斯调度
│   │   └── ai.js               # OpenAI 兼容 fetch 封装
│   ├── composables/
│   │   └── useSpeech.js        # Web Speech API 封装
│   ├── components/
│   │   ├── layout/             # NavBar / 页面容器
│   │   ├── common/             # BaseModal / BaseButton / EmptyState / ProgressBar
│   │   └── charts/             # HeatmapChart / TrendChart / RadarChart（SVG）
│   ├── views/                  # 页面（接口层）
│   │   ├── HomeView.vue        # 14 天计划
│   │   ├── FlashcardView.vue   # 话术速查
│   │   ├── ReviewView.vue      # SRS 复习
│   │   ├── CheckinView.vue     # 打卡记录
│   │   ├── PracticeView.vue    # 语音练习
│   │   ├── CoachView.vue       # AI 陪练（角色扮演+辩论）
│   │   ├── ReadingView.vue     # 朗读训练
│   │   ├── ImpromptuView.vue   # 即兴挑战
│   │   ├── ProgressView.vue    # 统计
│   │   └── SettingsView.vue    # 设置
│   └── styles/
│       ├── tokens.css          # 设计令牌（vibe-hub 色板/圆角/阴影，亮暗双主题）
│       └── base.css            # 重置 + 排版 + 通用工具类
├── tests/                      # Vitest（services 层为主）
├── docs/planning/              # 7 份立项文档
├── phases/                     # Harness 五角色交接
├── legacy/                     # 旧版源码（只读参考 + 数据迁移依据）
└── PROGRESS.md
```

## 分层原则（强制）
1. **视图层（views/components）**：只做展示与交互，不写业务；数据从 store 取。
2. **业务层（stores/services）**：Pinia store 编排状态；scoring/srs/ai 为纯函数或纯类，可单测。
3. **数据层（repos + data）**：storage.js 屏蔽 localStorage 细节（键名/版本/迁移）；data/ 为静态内容。
4. **公共层（composables/utils）**：无业务副作用。

## 关键设计决策
| 决策 | 理由 |
|---|---|
| Hash 路由 | 静态托管免配置 rewrite，Vercel/GitHub Pages 均零成本 |
| 数据版本号 `__v` | localStorage 结构升级时幂等迁移 |
| 旧数据迁移放 main.js 启动时 | 一次性、先于任何 store 初始化 |
| AI Key 只存 localStorage 不进导出文件 | 安全红线 |
| 图表手写 SVG | 包体积 + 可完全套用设计令牌 |

## UI 设计令牌（来自 vibe-hub.org 实测）
- 主色 `#4B3FE3`，链接/强调 `#3759D8`，辅助紫 `#6A6FFF`
- 背景 `#FAFAFA`，卡片 `#FFFFFF`，边框 `#E4E4E7`
- 文字：主 `#171717` / 次 `#525253` / 弱 `#A1A1AA`
- 状态：成功 `#2CB07F`、警告 `#C46F0B`、危险 `#C9382F`
- 卡片圆角 12-18px、按钮 8-11px；阴影 `0 2px 8px rgba(12,16,36,.06), 0 20px 55px rgba(12,16,36,.16)`
- 导航：吸顶 + `backdrop-filter: blur(12px)` 半透明白
- 字体栈：`-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif`；数字/代码 `"JetBrains Mono", monospace`
