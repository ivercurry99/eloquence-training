import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { chat, joinUrl, AiError, COACH_RULES, FEEDBACK_RULES } from '../src/services/ai'

function mockFetch(handler) {
  const fn = vi.fn(handler)
  global.fetch = fn
  return fn
}

beforeEach(() => {
  mockFetch(() => Promise.resolve(new Response('{}')))
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('joinUrl', () => {
  it('拼接路径并容忍末尾斜杠', () => {
    expect(joinUrl('https://api.deepseek.com/v1', '/chat/completions')).toBe(
      'https://api.deepseek.com/v1/chat/completions'
    )
    expect(joinUrl('https://api.deepseek.com/v1/', '/chat/completions')).toBe(
      'https://api.deepseek.com/v1/chat/completions'
    )
    expect(joinUrl('https://api.x.com/v1///', '/chat/completions')).toBe(
      'https://api.x.com/v1/chat/completions'
    )
  })

  it('空白值安全', () => {
    expect(joinUrl('', '/x')).toBe('/x')
    expect(joinUrl(undefined, '/x')).toBe('/x')
  })
})

describe('chat', () => {
  it('成功返回助手回复', async () => {
    mockFetch(() =>
      Promise.resolve(
        new Response(JSON.stringify({ choices: [{ message: { content: ' 你好，请讲。 ' } }] }), {
          status: 200,
        })
      )
    )
    const reply = await chat({
      baseUrl: 'https://api.test.com/v1',
      apiKey: 'sk-test',
      model: 'test-model',
      messages: [{ role: 'user', content: 'hi' }],
    })
    expect(reply).toBe('你好，请讲。')
  })

  it('缺少配置时抛出提示', async () => {
    await expect(chat({ baseUrl: '', apiKey: '', messages: [] })).rejects.toThrow(AiError)
    await expect(
      chat({ baseUrl: 'https://x.com/v1', apiKey: '', messages: [] })
    ).rejects.toThrow('请先在设置页')
  })

  it('401 映射为 Key 无效提示', async () => {
    mockFetch(() => Promise.resolve(new Response('unauthorized', { status: 401 })))
    await expect(
      chat({ baseUrl: 'https://x.com/v1', apiKey: 'bad', model: 'm', messages: [] })
    ).rejects.toThrow('API Key 无效或未授权')
  })

  it('404 映射为地址提示', async () => {
    mockFetch(() => Promise.resolve(new Response('not found', { status: 404 })))
    await expect(
      chat({ baseUrl: 'https://x.com/wrong', apiKey: 'k', model: 'm', messages: [] })
    ).rejects.toThrow('Base URL')
  })

  it('网络异常映射为友好提示', async () => {
    mockFetch(() => Promise.reject(new TypeError('fetch failed')))
    await expect(
      chat({ baseUrl: 'https://x.com/v1', apiKey: 'k', model: 'm', messages: [] })
    ).rejects.toThrow('网络请求失败')
  })

  it('空 choices 映射为提示', async () => {
    mockFetch(() => Promise.resolve(new Response(JSON.stringify({ choices: [] }), { status: 200 })))
    await expect(
      chat({ baseUrl: 'https://x.com/v1', apiKey: 'k', model: 'm', messages: [] })
    ).rejects.toThrow('返回内容为空')
  })

  it('请求头携带 Bearer Key 与模型名', async () => {
    const fn = mockFetch(() =>
      Promise.resolve(
        new Response(JSON.stringify({ choices: [{ message: { content: 'ok' } }] }), { status: 200 })
      )
    )
    await chat({
      baseUrl: 'https://x.com/v1',
      apiKey: 'sk-abc',
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: 'hi' }],
    })
    const [, init] = fn.mock.calls[0]
    expect(init.headers.Authorization).toBe('Bearer sk-abc')
    expect(JSON.parse(init.body).model).toBe('deepseek-chat')
  })
})

describe('提示词常量', () => {
  it('陪练规则包含角色约束', () => {
    expect(COACH_RULES).toContain('保持角色')
  })

  it('反馈规则要求结构化输出', () => {
    expect(FEEDBACK_RULES).toContain('亮点')
    expect(FEEDBACK_RULES).toContain('改写示范')
  })
})
