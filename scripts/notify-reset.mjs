import { readFile } from 'node:fs/promises'

const [beforePath, afterPath] = process.argv.slice(2)
if (!beforePath || !afterPath) {
  console.error('Usage: node scripts/notify-reset.mjs <before.json> <after.json>')
  process.exit(2)
}

const token = process.env.PUSHPLUS_TOKEN
if (!token) {
  throw new Error('Missing PUSHPLUS_TOKEN. Add it in GitHub repository Actions secrets.')
}

const before = JSON.parse(await readFile(beforePath, 'utf8'))
const after = JSON.parse(await readFile(afterPath, 'utf8'))

const forceTest = String(process.env.FORCE_TEST_NOTIFICATION || '').toLowerCase() === 'true'
const timeZone = process.env.NOTIFY_TIME_ZONE || 'Asia/Tokyo'

function signature(item = {}) {
  return JSON.stringify({
    sourceId: item.sourceId || '',
    state: item.state || '',
    resetAt: item.resetAt || null,
    sourceText: item.sourceText || '',
  })
}

const interestingStates = new Set([
  'announced',
  'estimated',
  'scheduled',
  'rolling-out',
  'completed',
])

const changed = signature(before) !== signature(after)
const shouldNotify = forceTest || (changed && interestingStates.has(after.state))

if (!shouldNotify) {
  console.log(`No new reset opportunity. changed=${changed}, state=${after.state}`)
  process.exit(0)
}

function formatTime(value) {
  if (!value) return '时间待定'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('zh-CN', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date)
}

const titleByState = {
  announced: '🚨 Tibo 发布新的重置消息',
  estimated: '⚠️ Codex 重置机会：预计时间',
  scheduled: '🚨 Codex 重置机会：时间已公布',
  'rolling-out': '🔥 Codex 重置正在进行',
  completed: '✅ Codex 全局重置已完成',
}

const stateZh = {
  announced: '已公告，具体时间待定',
  estimated: '预计重置',
  scheduled: '已安排重置',
  'rolling-out': '正在重置',
  completed: '重置已完成',
}

const title = forceTest
  ? '🧪 Tibo 重置监控测试通知'
  : (titleByState[after.state] || '🚨 Codex 重置机会')

const sourceText = String(after.sourceText || '').trim()
const sourceUrl = String(after.sourceUrl || '').trim()
const confidence = String(after.confidence || '').trim()
const method = String(after.parseMethod || '').trim()

const lines = [
  `状态：${forceTest ? '通知通道测试' : (stateZh[after.state] || after.state || '未知')}`,
  `日本时间：${formatTime(after.resetAt)}`,
]

if (confidence) lines.push(`解析置信度：${confidence}`)
if (method) lines.push(`解析方式：${method}`)
if (sourceText) lines.push('', `Tibo 原文：${sourceText.slice(0, 1200)}`)
if (sourceUrl) lines.push('', `来源：${sourceUrl}`)

const content = lines.join('\n')

const response = await fetch('https://www.pushplus.plus/send', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    token,
    title,
    content,
    template: 'txt',
    channel: 'wechat',
  }),
  signal: AbortSignal.timeout(15000),
})

const text = await response.text()
if (!response.ok) {
  throw new Error(`PushPlus HTTP ${response.status}: ${text.slice(0, 300)}`)
}

let data
try {
  data = JSON.parse(text)
} catch {
  data = null
}

if (data && data.code !== 200) {
  throw new Error(`PushPlus send failed: ${text}`)
}

console.log('WeChat notification sent through PushPlus.')
