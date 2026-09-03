/**
 * Web Speech API 封装（语音识别）
 * - Chrome / Edge 支持中文识别（zh-CN）
 * - 不支持的浏览器：supported=false，调用方降级提示
 */
import { ref, onUnmounted } from 'vue'

const SR =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null

export function useSpeech(options = {}) {
  const supported = !!SR
  const listening = ref(false)
  const transcript = ref('') // 已确认的识别文本
  const interim = ref('') // 临时识别文本
  const error = ref('')

  let recog = null

  function create() {
    const r = new SR()
    r.lang = options.lang || 'zh-CN'
    r.continuous = true
    r.interimResults = true
    r.onresult = (e) => {
      let finalText = ''
      let interimText = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const seg = e.results[i][0].transcript
        if (e.results[i].isFinal) finalText += seg
        else interimText += seg
      }
      if (finalText) transcript.value += finalText
      interim.value = interimText
    }
    r.onerror = (e) => {
      error.value = friendlyError(e.error)
      listening.value = false
    }
    r.onend = () => {
      listening.value = false
      interim.value = ''
    }
    return r
  }

  /** 开始识别（返回是否成功启动） */
  function start() {
    if (!supported || listening.value) return false
    error.value = ''
    transcript.value = ''
    interim.value = ''
    recog = create()
    try {
      recog.start()
      listening.value = true
      return true
    } catch {
      error.value = '录音启动失败，请重试'
      return false
    }
  }

  /** 停止识别（触发 onend，已确认文本保留在 transcript） */
  function stop() {
    if (recog && listening.value) {
      try {
        recog.stop()
      } catch {
        // 忽略重复 stop
      }
    }
    listening.value = false
  }

  /** 中止并丢弃（组件卸载时调用） */
  function abort() {
    if (recog) {
      try {
        recog.abort()
      } catch {
        // 忽略
      }
      recog = null
    }
    listening.value = false
  }

  onUnmounted(abort)

  return { supported, listening, transcript, interim, error, start, stop, abort }
}

function friendlyError(code) {
  const map = {
    'not-allowed': '麦克风权限被拒绝，请在浏览器地址栏允许麦克风后重试',
    'no-speech': '没有检测到语音，请靠近麦克风再试一次',
    'audio-capture': '未检测到麦克风设备',
    network: '网络异常，识别服务不可用',
  }
  return map[code] || '语音识别出错，请重试'
}
