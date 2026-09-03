/** 即兴演讲题库：每题附结构提示，帮助快速搭框架 */

export const impromptuTopics = [
  // 生活观察
  {
    id: 'im-1',
    category: '生活观察',
    title: '介绍一种你离不开的东西，说清它为什么重要',
    structure: '是什么 → 一个具体场景 → 它改变了什么 → 一句总结',
  },
  {
    id: 'im-2',
    category: '生活观察',
    title: '描述你最近一次"决定对了"的瞬间',
    structure: '背景一句带过 → 决策时刻 → 结果 → 你悟到的原则',
  },
  {
    id: 'im-3',
    category: '生活观察',
    title: '推荐一部你看过的作品，60 秒说服别人去看',
    structure: '一句话亮点 → 一个不剧透的片段 → 适合谁看 → 行动号召',
  },
  {
    id: 'im-4',
    category: '生活观察',
    title: '你童年最难忘的一个夏天',
    structure: '画面感开场 → 一件事 → 当时的感受 → 现在回头看',
  },
  {
    id: 'im-5',
    category: '生活观察',
    title: '如果每天多出一小时，你会拿来做什么？',
    structure: '选择 → 为什么是这个 → 具体怎么用 → 一年后的想象',
  },
  // 职场表达
  {
    id: 'im-6',
    category: '职场表达',
    title: '在团队会议上，用一分钟介绍你最近的工作价值',
    structure: '结论先行 → 两个关键产出 → 对团队的意义 → 下一步',
  },
  {
    id: 'im-7',
    category: '职场表达',
    title: '领导问"这事你怎么看"，就最近一个热点行业新闻发表观点',
    structure: '亮观点 → 一个论据 → 一个让步（另一方面）→ 收回立场',
  },
  {
    id: 'im-8',
    category: '职场表达',
    title: '向新同事介绍"在我们团队做事最重要的一条心法"',
    structure: '心法一句话 → 一个真实案例 → 反面教材 → 总结',
  },
  {
    id: 'im-9',
    category: '职场表达',
    title: '你负责的项目延期了，向领导做两分钟说明',
    structure: '现状结论 → 原因（不甩锅）→ 补救方案+时间表 → 需要的支持',
  },
  {
    id: 'im-10',
    category: '职场表达',
    title: '一分钟说服大家支持你的新想法',
    structure: '痛点 → 方案一句话 → 预期收益 → 请求最小支持',
  },
  // 观点交锋
  {
    id: 'im-11',
    category: '观点交锋',
    title: '"会说"比"会做"更重要，你同意吗？',
    structure: '先站队 → 两个理由 → 承认对方合理处 → 强化自己立场',
  },
  {
    id: 'im-12',
    category: '观点交锋',
    title: '年轻人应该先攒钱还是先投资自己？',
    structure: '亮观点 → 拆解概念 → 用自己或身边例子 → 给出平衡建议',
  },
  {
    id: 'im-13',
    category: '观点交锋',
    title: 'AI 时代，普通人最该培养什么能力？',
    structure: '给出能力 → 为什么是它 → 怎么培养 → 一句金句收尾',
  },
  {
    id: 'im-14',
    category: '观点交锋',
    title: '"选择大于努力"，谈谈你的看法',
    structure: '观点 → 承认努力的底线价值 → 选择改变的是概率 → 总结',
  },
  {
    id: 'im-15',
    category: '观点交锋',
    title: '完美主义是优点还是缺点？',
    structure: '先定义 → 优点场景 → 缺点场景 → 你的取舍标准',
  },
  // 临场应变
  {
    id: 'im-16',
    category: '临场应变',
    title: '婚礼上司仪突然请你上台说两句祝福',
    structure: '感谢+身份 → 和新人有关的一个细节 → 祝福 → 举杯收尾',
  },
  {
    id: 'im-17',
    category: '临场应变',
    title: '会议上你的方案被领导当众否定，请现场回应',
    structure: '接住不防御 → 认可合理部分 → 澄清关键信息 → 提议会后细聊',
  },
  {
    id: 'im-18',
    category: '临场应变',
    title: '朋友聚会有人问"你工资多少"，化解这个尴尬问题',
    structure: '轻松接住 → 幽默或模糊化处理 → 转移话题 → 保持关系热度',
  },
  {
    id: 'im-19',
    category: '临场应变',
    title: '面试官说"你和这个岗位好像不太匹配"，扭转局面',
    structure: '不慌 → 承认表面差异 → 指出可迁移能力 → 表达学习意愿+例证',
  },
  {
    id: 'im-20',
    category: '临场应变',
    title: '活动开场前 5 分钟才知道要你代替领导致开场词',
    structure: '稳住 → 简短问候+感谢 → 点出活动意义 → 预祝成功（万能公式）',
  },
]

export const topicCategories = ['全部', ...new Set(impromptuTopics.map((t) => t.category))]

/** 随机抽一题（可按分类过滤） */
export function randomTopic(category = '全部') {
  const pool =
    category === '全部' ? impromptuTopics : impromptuTopics.filter((t) => t.category === category)
  return pool[Math.floor(Math.random() * pool.length)]
}
