# 07 · 项目级工程规范（Engineering Norms）

> 适用于：口才训练营。如与宿主级 AGENTS.md 冲突，以更具体/更安全的一条为准。

## 代码
- 单一职责；函数 ≤ 60 行；超过就拆成「可命名」的小函数。
- 默认不可变更新；不 mutate 输入参数。
- 错误显式处理；不静默吞错；catch 后必须给用户可见反馈或明确日志。
- 所有用户输入（API Key/笔记内容）在使用前 trim；localStorage 写入前 try-catch（隐私模式会抛错）。

## 前端专项
- 组件命名：PascalCase；文件与组件同名；通用组件放 `components/common/`。
- 样式只用设计令牌 CSS 变量（`var(--color-primary)` 等），禁止组件内写死色值。
- 视图组件不直接摸 localStorage，一律走 store → repos。
- 评分/调度等纯逻辑必须放 `services/` 并有对应单测，禁止写在组件里。
- 移动端优先检查：每个页面在 375px 宽度下可用。

## 安全红线
- API Key 只存 localStorage；导出数据文件绝不包含 Key。
- 不引入任何远程统计/埋点脚本。

## 门禁（Feature 完成时必须逐项确认）
- [ ] Gate0：需求清楚，本 feature 的"完成标准"已写进 phases/01-design。
- [ ] Gate1：设计文档齐全，调度员已签字确认。
- [ ] Gate2：代码可编译 / 可运行，开发者自测 smoke case。
- [ ] Gate3：测试员写并跑过单测/集成用例，全部通过。
- [ ] Gate4：审查员检查架构合规，无明显坏味道。

## 提交
- 提交信息：`feat/fix/refactor/test/docs/chore: <一句话>`。
- 每完成一个 feature 且过门禁 → 至少 1 次提交。
- 提交前跑：格式 → 类型 → 单测（如有）。
