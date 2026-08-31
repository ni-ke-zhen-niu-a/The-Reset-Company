export const featuredZones = [
  ['San Francisco', 'America/Los_Angeles'],
  ['New York', 'America/New_York'],
  ['London', 'Europe/London'],
  ['Shanghai', 'Asia/Shanghai'],
  ['Tokyo', 'Asia/Tokyo'],
]

export const allZones = typeof Intl.supportedValuesOf === 'function'
  ? Intl.supportedValuesOf('timeZone')
  : featuredZones.map(([, zone]) => zone)

export function getLocalZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

export function zoneOffset(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, timeZoneName: 'longOffset', hour: '2-digit',
  }).formatToParts(date)
  const value = parts.find((part) => part.type === 'timeZoneName')?.value || 'GMT'
  return value.replace('GMT', 'UTC').replace(':00', '')
}

export function zoneShort(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, timeZoneName: 'short', hour: '2-digit',
  }).formatToParts(date)
  return parts.find((part) => part.type === 'timeZoneName')?.value || ''
}

export function eventLabel(date, locale, timeZone) {
  const now = new Date()
  const dayValue = (value) => {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(value).filter((part) => part.type !== 'literal').map((part) => [part.type, Number(part.value)]))
    return Date.UTC(parts.year, parts.month - 1, parts.day)
  }
  const delta = Math.round((dayValue(date) - dayValue(now)) / 86400000)
  const relative = delta === 0
    ? new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(0, 'day')
    : delta === 1
      ? new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(1, 'day')
      : new Intl.DateTimeFormat(locale, { timeZone, month: 'short', day: 'numeric' }).format(date)
  const clock = new Intl.DateTimeFormat(locale, {
    timeZone, hour: 'numeric', minute: '2-digit', hour12: locale === 'en',
  }).format(date)
  return `${relative} · ${clock}`
}

export function countdownParts(target, now = new Date()) {
  const ms = Math.max(0, target.getTime() - now.getTime())
  const totalSeconds = Math.floor(ms / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    expired: target.getTime() <= now.getTime(),
  }
}

export function resetProgress(target, announcedAt, now = new Date()) {
  if (!target) return 0
  const end = target.getTime()
  const start = announcedAt?.getTime?.() ?? end - 6 * 60 * 60 * 1000
  if (!Number.isFinite(end) || !Number.isFinite(start) || end <= start) {
    return now.getTime() >= end ? 1 : 0
  }
  return Math.min(1, Math.max(0, (now.getTime() - start) / (end - start)))
}

export function relativeTime(date, locale, t) {
  if (!date) return '—'
  const delta = Date.now() - date.getTime()
  if (Math.abs(delta) < 45000) return t.justNow
  const units = [
    ['day', 86400000], ['hour', 3600000], ['minute', 60000], ['second', 1000],
  ]
  const [unit, size] = units.find(([, value]) => Math.abs(delta) >= value) || units.at(-1)
  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-Math.round(delta / size), unit)
}
