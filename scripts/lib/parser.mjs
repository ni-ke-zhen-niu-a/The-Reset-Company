const zoneAliases = {
  UTC: { type: 'fixed', minutes: 0 }, GMT: { type: 'fixed', minutes: 0 },
  PST: { type: 'fixed', minutes: -480 }, PDT: { type: 'fixed', minutes: -420 },
  PT: { type: 'iana', name: 'America/Los_Angeles' },
  EST: { type: 'fixed', minutes: -300 }, EDT: { type: 'fixed', minutes: -240 },
  ET: { type: 'iana', name: 'America/New_York' },
  JST: { type: 'fixed', minutes: 540 },
  BST: { type: 'fixed', minutes: 60 },
}

function clean(text) {
  return text.replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim()
}

function datePartsInZone(date, timeZone) {
  return Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(date).filter((part) => part.type !== 'literal').map((part) => [part.type, Number(part.value)]))
}

function localToUtc(parts, timeZone) {
  let guess = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute || 0, 0)
  for (let i = 0; i < 3; i += 1) {
    const rendered = datePartsInZone(new Date(guess), timeZone)
    const renderedAsUtc = Date.UTC(rendered.year, rendered.month - 1, rendered.day, rendered.hour, rendered.minute, rendered.second)
    guess += Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute || 0, 0) - renderedAsUtc
  }
  return new Date(guess)
}

function parseClock(hourRaw, minuteRaw, meridiem) {
  let hour = Number(hourRaw)
  const minute = Number(minuteRaw || 0)
  if (meridiem?.toLowerCase() === 'pm' && hour < 12) hour += 12
  if (meridiem?.toLowerCase() === 'am' && hour === 12) hour = 0
  return { hour, minute }
}

function addCalendarDays(parts, days) {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days))
  return { ...parts, year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() }
}

function parseAbsoluteClock(text, announcedAt) {
  const match = text.match(/(?:\bat\s+|\bland(?:s|ing)?\s+(?:at\s+)?|\blikely\s+at\s+)(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(UTC|GMT|PST|PDT|PT|EST|EDT|ET|JST|BST)\b/i)
  if (!match) return null
  const [, hourRaw, minuteRaw, meridiem, zoneRaw] = match
  const zoneKey = zoneRaw.toUpperCase()
  const zone = zoneAliases[zoneKey]
  if (!zone) return null
  const clock = parseClock(hourRaw, minuteRaw, meridiem)
  const tomorrow = /\btomorrow\b/i.test(text)
  let localParts

  if (zone.type === 'iana') {
    localParts = datePartsInZone(announcedAt, zone.name)
    if (tomorrow) localParts = addCalendarDays(localParts, 1)
    let result = localToUtc({ ...localParts, ...clock }, zone.name)
    if (!tomorrow && result < announcedAt && announcedAt - result > 60 * 60 * 1000) {
      localParts = addCalendarDays(localParts, 1)
      result = localToUtc({ ...localParts, ...clock }, zone.name)
    }
    return { resetAt: result, method: 'absolute-time-with-zone', confidence: 'high' }
  }

  const shifted = new Date(announcedAt.getTime() + zone.minutes * 60000)
  let year = shifted.getUTCFullYear()
  let month = shifted.getUTCMonth()
  let day = shifted.getUTCDate() + (tomorrow ? 1 : 0)
  let result = new Date(Date.UTC(year, month, day, clock.hour, clock.minute) - zone.minutes * 60000)
  if (!tomorrow && result < announcedAt && announcedAt - result > 60 * 60 * 1000) {
    result = new Date(result.getTime() + 86400000)
  }
  return { resetAt: result, method: 'absolute-time-with-zone', confidence: 'high' }
}

function parseIso(text) {
  const match = text.match(/\b(20\d{2}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?Z)\b/)
  if (!match) return null
  return { resetAt: new Date(match[1]), method: 'iso-timestamp', confidence: 'high' }
}

function parseRelative(text, announcedAt) {
  const match = text.match(/(?:\bin\s+(?:the\s+)?(?:next\s+)?|\byou\s+have\s+)(\d+(?:\.\d+)?)\s*(minutes?|mins?|hours?|hrs?)\b/i)
  if (!match) return null
  const count = Number(match[1])
  const multiplier = /^h/i.test(match[2]) ? 3600000 : 60000
  return { resetAt: new Date(announcedAt.getTime() + count * multiplier), method: 'relative-duration', confidence: 'medium' }
}

function parseEligibilityCutoffProxy(text, announcedAt) {
  const match = text.match(/(?:create\s+(?:the\s+)?account|upgrade)[\s\S]{0,80}?before\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*(PT|PST|PDT)\b/i)
  if (!match || !/\blands?\s+end\s+of\s+day\b/i.test(text)) return null

  const [, hourRaw, minuteRaw, meridiem, zoneRaw] = match
  const zoneKey = zoneRaw.toUpperCase()
  const zone = zoneAliases[zoneKey]
  const clock = parseClock(hourRaw, minuteRaw, meridiem)
  let localParts
  let result

  if (zone.type === 'iana') {
    localParts = datePartsInZone(announcedAt, zone.name)
    result = localToUtc({ ...localParts, ...clock }, zone.name)
  } else {
    const shifted = new Date(announcedAt.getTime() + zone.minutes * 60000)
    result = new Date(Date.UTC(
      shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate(),
      clock.hour, clock.minute,
    ) - zone.minutes * 60000)
  }

  return { resetAt: result, method: 'eligibility-cutoff-proxy', confidence: 'low', state: 'estimated' }
}

export function parseResetPost(post) {
  const text = clean(post.text || '')
  const announcedAt = new Date(post.created_at || post.announcedAt)
  if (!text || Number.isNaN(announcedAt.getTime())) return null
  const mentionsReset = /\breset(?:s|ting|ted)?\b/i.test(text)
  const relevantProduct = /\bCodex\b|ChatGPT Work|usage limits?|rate limits?|banked reset/i.test(text)
  if (!mentionsReset || !relevantProduct) return null

  const parsed = parseIso(text) || parseAbsoluteClock(text, announcedAt) || parseRelative(text, announcedAt) || parseEligibilityCutoffProxy(text, announcedAt)
  return {
    state: parsed?.state || (parsed ? 'scheduled' : 'announced'),
    resetAt: parsed?.resetAt?.toISOString() || null,
    announcedAt: announcedAt.toISOString(),
    sourceUrl: post.url,
    sourceText: text,
    sourceId: String(post.id || ''),
    sourceAuthor: 'thsottiaux',
    parseMethod: parsed?.method || 'no-precise-time',
    confidence: parsed?.confidence || 'low',
  }
}

export function twitterSnowflakeTime(id) {
  try {
    return new Date(Number((BigInt(id) >> 22n) + 1288834974657n))
  } catch {
    return null
  }
}
