import { readFile, writeFile } from 'node:fs/promises'
import { parseResetPost, twitterSnowflakeTime } from './lib/parser.mjs'

const DATA_PATH = new URL('../public/data/reset.json', import.meta.url)
const HISTORY_PATH = new URL('../public/data/history.json', import.meta.url)
const author = 'thsottiaux'

async function fetchJson(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(15000) })
  if (!response.ok) throw new Error(`${response.status} ${url}`)
  return response.json()
}

async function fetchFromXApi(token) {
  if (!token) return []
  const headers = { Authorization: `Bearer ${token}` }
  const user = await fetchJson(`https://api.x.com/2/users/by/username/${author}`, { headers })
  if (!user.data?.id) throw new Error('X user not found')
  const timeline = await fetchJson(`https://api.x.com/2/users/${user.data.id}/tweets?max_results=20&exclude=retweets,replies&tweet.fields=created_at,text`, { headers })
  return (timeline.data || []).map((post) => ({ ...post, url: `https://x.com/${author}/status/${post.id}` }))
}

function decodeXml(value = '') {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
}

async function discoverStatusIds() {
  const urls = []
  if (process.env.PUBLIC_TIMELINE_RSS_URL) urls.push(process.env.PUBLIC_TIMELINE_RSS_URL)
  // Public index used only to discover candidate X post IDs; post text is
  // fetched separately from X-compatible embed APIs before parsing.
  urls.push('https://codex-resets.com/')
  urls.push(`https://www.bing.com/search?format=rss&q=${encodeURIComponent(`site:x.com/${author}/status reset`)}`)
  const ids = new Set()
  for (const url of urls) {
    try {
      const response = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 CodexResetBot/1.0' }, signal: AbortSignal.timeout(15000) })
      if (!response.ok) continue
      const body = decodeXml(await response.text())
      for (const match of body.matchAll(/(?:x\.com|twitter\.com)\/thsottiaux\/status\/(\d+)/gi)) ids.add(match[1])
    } catch (error) {
      console.warn(`Public discovery failed: ${error.message}`)
    }
  }
  return [...ids].sort((a, b) => (BigInt(a) > BigInt(b) ? -1 : BigInt(a) < BigInt(b) ? 1 : 0))
}

async function fetchPublicPost(id) {
  const candidates = [
    `https://api.fxtwitter.com/${author}/status/${id}`,
    `https://api.vxtwitter.com/${author}/status/${id}`,
  ]
  for (const url of candidates) {
    try {
      const json = await fetchJson(url, { headers: { 'user-agent': 'CodexResetBot/1.0' } })
      const tweet = json.tweet || json
      const text = tweet.text || tweet.full_text
      if (!text) continue
      return {
        id,
        text,
        created_at: tweet.created_at || twitterSnowflakeTime(id)?.toISOString(),
        url: `https://x.com/${author}/status/${id}`,
      }
    } catch (error) {
      console.warn(`Post fetch failed for ${id}: ${error.message}`)
    }
  }
  return null
}

function manualPost() {
  if (!process.env.MANUAL_POST_TEXT) return null
  const url = process.env.MANUAL_SOURCE_URL || ''
  const id = url.match(/status\/(\d+)/)?.[1] || `manual-${Date.now()}`
  return {
    id,
    text: process.env.MANUAL_POST_TEXT,
    created_at: process.env.MANUAL_ANNOUNCED_AT || new Date().toISOString(),
    url,
  }
}

async function gatherPosts() {
  const manual = manualPost()
  if (manual) return { posts: [manual], method: 'manual' }
  try {
    const official = await fetchFromXApi(process.env.X_BEARER_TOKEN)
    if (official.length) return { posts: official, method: 'x-api' }
  } catch (error) {
    console.warn(`X API failed: ${error.message}`)
  }
  const ids = await discoverStatusIds()
  const posts = (await Promise.all(ids.slice(0, 12).map(fetchPublicPost))).filter(Boolean)
  return { posts, method: posts.length ? 'public-discovery' : 'unavailable' }
}

function chooseAnnouncement(posts) {
  return posts.map(parseResetPost).filter(Boolean).sort((a, b) => new Date(b.announcedAt) - new Date(a.announcedAt))[0] || null
}

async function main() {
  const checkedAt = new Date()
  const current = JSON.parse(await readFile(DATA_PATH, 'utf8'))
  const history = JSON.parse(await readFile(HISTORY_PATH, 'utf8'))
  const { posts, method } = await gatherPosts()
  const found = chooseAnnouncement(posts)
  let next = current
  let changed = false

  const isNewAnnouncement = found && (
    found.sourceId !== current.sourceId ||
    found.resetAt !== current.resetAt ||
    found.state !== current.state
  ) && (!current.announcedAt || new Date(found.announcedAt) >= new Date(current.announcedAt))

  if (isNewAnnouncement) {
    next = { schemaVersion: 1, ...found, lastCheckedAt: checkedAt.toISOString(), lastCheckMethod: method, lastCheckStatus: 'success' }
    changed = true
    if (found.state === 'scheduled' && found.resetAt && !history.some((item) => item.sourceId === found.sourceId)) {
      history.unshift({ resetAt: found.resetAt, announcedAt: found.announcedAt, sourceUrl: found.sourceUrl, sourceId: found.sourceId })
    }
  } else if (current.state !== 'none' && current.state !== 'estimated' && current.resetAt && checkedAt - new Date(current.resetAt) > 12 * 3600000) {
    next = { ...current, state: 'none', resetAt: null, lastCheckedAt: checkedAt.toISOString(), lastCheckMethod: method, lastCheckStatus: method === 'unavailable' ? 'degraded' : 'success' }
    changed = true
  }

  if (changed) {
    await writeFile(DATA_PATH, `${JSON.stringify(next, null, 2)}\n`)
    await writeFile(HISTORY_PATH, `${JSON.stringify(history.slice(0, 50), null, 2)}\n`)
  }
  console.log(JSON.stringify({ checkedAt: checkedAt.toISOString(), method, candidates: posts.length, selected: found?.sourceId || null, state: next.state, changed }))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
