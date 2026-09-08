import { readFile, writeFile } from 'node:fs/promises'

const LOCAL_PATH = new URL('../public/data/reset.json', import.meta.url)
const UPSTREAM_URL =
  'https://raw.githubusercontent.com/yuanlang12/The-Reset-Company/main/public/data/reset.json'

const stateRank = {
  none: 0,
  announced: 1,
  estimated: 2,
  scheduled: 2,
  'rolling-out': 3,
  completed: 4,
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'TiboResetMonitor/1.0',
      'cache-control': 'no-cache',
    },
    signal: AbortSignal.timeout(15000),
  })

  if (!response.ok) {
    throw new Error(`${response.status} ${url}`)
  }

  return response.json()
}

function ts(value) {
  if (!value) return 0
  const ms = new Date(value).getTime()
  return Number.isFinite(ms) ? ms : 0
}

const local = JSON.parse(await readFile(LOCAL_PATH, 'utf8'))

let upstream
try {
  upstream = await fetchJson(`${UPSTREAM_URL}?t=${Date.now()}`)
} catch (error) {
  console.warn(`Upstream Reset Company fetch failed: ${error.message}`)
  process.exit(0)
}

let shouldAdopt = false
let reason = ''

if (
  upstream.sourceId &&
  upstream.sourceId !== local.sourceId &&
  ts(upstream.announcedAt) > ts(local.announcedAt)
) {
  shouldAdopt = true
  reason = 'newer upstream announcement'
} else if (upstream.sourceId && upstream.sourceId === local.sourceId) {
  const localRank = stateRank[local.state] ?? 0
  const upstreamRank = stateRank[upstream.state] ?? 0

  if (upstreamRank > localRank) {
    shouldAdopt = true
    reason = `upstream state progressed ${local.state} -> ${upstream.state}`
  } else if (
    upstream.resetAt &&
    upstream.resetAt !== local.resetAt &&
    ts(upstream.lastCheckedAt) >= ts(local.lastCheckedAt)
  ) {
    shouldAdopt = true
    reason = 'upstream reset time was refined'
  }
}

if (!shouldAdopt) {
  console.log('Local reset state is already as new as upstream.')
  process.exit(0)
}

await writeFile(LOCAL_PATH, JSON.stringify(upstream, null, 2) + '\n', 'utf8')
console.log(`Adopted upstream reset state: ${reason}`)
