/**
 * OpenAI 兼容 Chat Completions 封装（fetch 直调，不引 SDK）
 * 适用于 DeepSeek / 智谱 / Kimi / OpenAI 等兼容接口
 */

export class AiError extends Error {
  constructor(message) {
    super(message)
    this.name = 'AiError'
  }
}

/** 拼接 Base URL 与路径（容忍末尾斜杠差异） */
export function joinUrl(base, path) {
  return (base || '').trim().replace(/\/+$/, '') + path
}

/**
 * 发起一次对话补全
 * @param {{baseUrl: string, apiKey: string, model: string, messages: Array, temperature?: number}} opts
 * @returns {Promise<string>} 助手回复文本
 */
export async function chat(opts) {
  const { baseUrl, apiKey, model, messages, temperature = 0.7 } = opts
  if (!baseUrl || !apiKey) throw new AiError('请先在设置页配置 API 地址和 Key')

  let resp
  try {
    resp = await fetch(joinUrl(baseUrl, '/chat/completions'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: model || 'deepseek-chat', messages, temperature }),
    })
  } catch {
    throw new AiError('网络请求失败：请检查地址拼写、网络连接或代理设置')
  }

  if (!resp.ok) {
    throw new AiError(mapHttpError(resp.status))
  }

  let data
  try {
    data = await resp.json()
  } catch {
    throw new AiError('返回内容无法解析：请确认地址是 OpenAI 兼容接口（通常以 /v1 结尾）')
  }

  const content = data?.choices?.[0]?.message?.content
  if (!content) throw new AiError('返回内容为空：请稍后重试，或换一个模型名称')
  return content.trim()
}

function mapHttpError(status) {
  if (status === 401) return 'API Key 无效或未授权（401），请检查 Key'
  if (status === 403) return '没有访问权限（403），请确认 Key 的可用范围'
  if (status === 404) return '接口不存在（404），请检查 Base URL 是否以 /v1 结尾'
  if (status === 429) return '请求过于频繁或额度不足（429），请稍后再试'
  return `请求失败（${status}），请稍后重试`
}

/** 陪练通用前缀指令：约束 AI 保持角色、口语化、短回复 */
export const COACH_RULES =
  '你是一个口才陪练对手。规则：' +
  '1) 严格保持角色设定，不要出戏，不要说自己是AI；' +
  '2) 用口语化中文，一次回复不超过3句话，给对方留出说话空间；' +
  '3) 认真回应对方刚说的话，再推进对话（追问或给新信息）；' +
  '4) 不需要任何前缀说明，直接说角色该说的话。'

/** 教练反馈指令：用于会话结束后的结构化点评 */
export const FEEDBACK_RULES =
  '你是一位资深的口才教练。请根据以下对话记录，对"用户"（非陪练角色）的表现给出反馈。' +
  '格式要求：' +
  '【亮点】1-2条，引用用户原话中的具体表达；' +
  '【待改进】1-2条，指出表达中最大的问题（如结构、语气、填充词、说服力）；' +
  '【改写示范】把用户说得最生硬的一句改写成更自然的版本；' +
  '【下一步】一条具体的练习建议。' +
  '用中文，简洁具体，不超过250字，不要客套话。'

/** 即兴演讲点评指令 */
export const IMPROMPTU_FEEDBACK_RULES =
  '你是一位演讲教练。用户刚完成一次即兴演讲，请针对演讲文字稿给出点评。' +
  '格式要求：' +
  '【开头】第一句是否有钩子，直接点评；' +
  '【结构】是否有清晰的框架（如观点-论据-收尾），指出缺失环节；' +
  '【语言】填充词、口语赘述、金句亮点各点一句；' +
  '【结尾】收束是否有力，给出改写示范；' +
  '【一句话建议】最该优先改进的一点。' +
  '用中文，简洁具体，不超过250字，不要客套话。注意：语音识别可能有错别字，评价时忽略明显识别错误。'
