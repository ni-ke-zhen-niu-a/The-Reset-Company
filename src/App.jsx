import { useEffect, useMemo, useState } from 'react'
import { detectLanguage, getCopy, languages } from './i18n.js'
import { allZones, countdownParts, eventLabel, featuredZones, getLocalZone, relativeTime, resetProgress, zoneOffset, zoneShort } from './time.js'

const DATA_URL = './data/reset.json'

function Icon({ name, size = 20 }) {
  const paths = {
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    link: <><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2"/></>,
    calendar: <><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M18.2 9A7 7 0 0 0 6 6.4L4 9m2 6a7 7 0 0 0 12 2.6l2-2.6"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></>,
    chevron: <path d="m8 10 4 4 4-4"/>,
    external: <><path d="M14 5h5v5M19 5l-8 8"/><path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
  }
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function Mark() {
  return <span className="mark" aria-hidden="true"><Icon name="clock" size={27}/><svg className="mark-arrow" viewBox="0 0 12 12"><path d="M1 10 10 1M5 1h5v5"/></svg></span>
}

function SelectControl({ icon, label, value, onChange, children }) {
  return <label className="select-control" aria-label={label}>
    <Icon name={icon} size={18}/>
    <select value={value} onChange={(event) => onChange(event.target.value)}>{children}</select>
    <Icon name="chevron" size={15}/>
  </label>
}

function Header({ locale, setLocale, timeZone, setTimeZone, t }) {
  const [open, setOpen] = useState(false)
  return <header>
    <a className="brand" href="./" aria-label="The Reset Company home"><Mark/><span>The Reset Company</span></a>
    <button className="menu-button" onClick={() => setOpen(!open)} aria-label={open ? t.close : t.openMenu}><Icon name={open ? 'close' : 'menu'} size={26}/></button>
    <div className={`controls ${open ? 'open' : ''}`}>
      <SelectControl icon="globe" label={t.language} value={locale} onChange={setLocale}>
        {Object.entries(languages).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
      </SelectControl>
      <span className="control-rule"/>
      <SelectControl icon="clock" label={t.timezone} value={timeZone} onChange={setTimeZone}>
        <option value={getLocalZone()}>{t.auto} · {getLocalZone()}</option>
        {allZones.filter((zone) => zone !== getLocalZone()).map((zone) => <option key={zone} value={zone}>{zone}</option>)}
      </SelectControl>
    </div>
  </header>
}

function Countdown({ target, now, t }) {
  const parts = countdownParts(target, now)
  const units = parts.days > 0
    ? [['days', t.days], ['hours', t.hours], ['minutes', t.minutes], ['seconds', t.seconds]]
    : [['hours', t.hours], ['minutes', t.minutes], ['seconds', t.seconds]]
  return <div className={`countdown ${parts.days > 0 ? 'has-days' : ''}`} aria-live="polite" aria-label={`${parts.hours} ${t.hours}, ${parts.minutes} ${t.minutes}, ${parts.seconds} ${t.seconds}`}>
    {units.map(([key, label], index) => <div className="count-unit-wrap" key={key}>
      {index > 0 && <span className="colon">:</span>}
      <div className="count-unit"><strong>{String(parts[key]).padStart(2, '0')}</strong><span>{label}</span></div>
    </div>)}
    <div className="meridians" aria-hidden="true"><span>−12</span><span>−8</span><span>−4</span><span>0</span><span>+4</span><span>+8</span><span>+12</span></div>
  </div>
}

function FrescoStage({ approach, pressed, t }) {
  const [feedback, setFeedback] = useState('')

  const handleButton = () => {
    setFeedback('')
    window.requestAnimationFrame(() => setFeedback(pressed ? 'pressed' : 'not-yet'))
  }

  useEffect(() => {
    if (!feedback) return undefined
    const timer = window.setTimeout(() => setFeedback(''), 1300)
    return () => window.clearTimeout(timer)
  }, [feedback])

  return <div
    className={`fresco-stage ${pressed ? 'is-pressed' : ''} ${feedback ? `feedback-${feedback}` : ''}`}
    style={{ '--travel-x': `${approach * 190}px`, '--travel-y': `${approach * 3}px` }}
  >
    <img className="tibo-figure" src="./assets/tibo-fresco-reclining.webp" alt={t.tiboAlt}/>
    <button className="reset-assembly" type="button" onClick={handleButton} aria-label={pressed ? t.resetPressed : t.resetNotYet}>
      <img className="reset-button" src="./assets/fresco-reset-button.webp" alt=""/>
      <span className="contact-spark"/>
      <span className="reset-feedback" aria-live="polite">{feedback === 'not-yet' ? t.resetNotYet : pressed ? t.resetPressed : ''}</span>
    </button>
  </div>
}

function WorldTimes({ target, locale, t }) {
  if (!target) return null
  return <section className="world-section">
    <h2>{t.aroundWorld}</h2>
    <div className="world-list">
      {featuredZones.map(([city, zone]) => <div className="world-time" key={zone}>
        <span>{city}</span>
        <strong>{new Intl.DateTimeFormat(locale, { timeZone: zone, hour: 'numeric', minute: '2-digit', hour12: locale === 'en' }).format(target)}</strong>
        <small>{zoneShort(target, zone)} ({zoneOffset(target, zone)})</small>
      </div>)}
    </div>
  </section>
}

function Source({ data, locale, t }) {
  const checked = data.lastCheckedAt ? new Date(data.lastCheckedAt) : null
  const detected = data.announcedAt ? new Date(data.announcedAt) : null
  return <section className="source-section">
    <h2>{t.source}</h2>
    <div className="source-grid">
      <blockquote>{data.sourceText || t.awaitingBody}<cite>— Tibo (@thsottiaux)</cite></blockquote>
      <div className="source-meta">
        {data.sourceUrl && <a href={data.sourceUrl} target="_blank" rel="noreferrer"><Icon name="link"/>{t.viewSource}<Icon name="external" size={15}/></a>}
        <p><Icon name="calendar"/>{t.detected}: {detected ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(detected) : '—'}</p>
        <p><Icon name="refresh"/>{t.lastChecked}: <span className="relative-check">{relativeTime(checked, locale, t)}</span></p>
      </div>
    </div>
  </section>
}

function App() {
  const [locale, setLocaleState] = useState(detectLanguage)
  const [timeZone, setTimeZoneState] = useState(() => localStorage.getItem('codex-reset-timezone') || getLocalZone())
  const [data, setData] = useState({ state: 'none' })
  const [howOpen, setHowOpen] = useState(false)
  const [now, setNow] = useState(new Date())
  const t = getCopy(locale)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    fetch(`${DATA_URL}?v=${Date.now()}`, { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('data unavailable')))
      .then(setData)
      .catch(() => setData({ state: 'none' }))
  }, [])

  const setLocale = (value) => { setLocaleState(value); localStorage.setItem('codex-reset-language', value); document.documentElement.lang = value }
  const setTimeZone = (value) => { setTimeZoneState(value); localStorage.setItem('codex-reset-timezone', value) }
  const target = useMemo(() => data.resetAt ? new Date(data.resetAt) : null, [data.resetAt])
  const announcedAt = useMemo(() => data.announcedAt ? new Date(data.announcedAt) : null, [data.announcedAt])
  const expired = Boolean(target && (data.state === 'completed' || target.getTime() <= now.getTime()))
  const estimated = data.state === 'estimated' || data.parseMethod === 'eligibility-cutoff-proxy'
  const approach = useMemo(() => resetProgress(target, announcedAt, now), [announcedAt, now, target])

  return <div className="page-shell">
    <Header locale={locale} setLocale={setLocale} timeZone={timeZone} setTimeZone={setTimeZone} t={t}/>
    <main>
      <section className={`hero ${expired ? 'hero-live' : ''}`}>
        <div className="hero-copy">
          {data.state === 'announced' && !target
            ? <div className="state-message"><h1>{t.announced}</h1><p>{t.announcedBody}</p></div>
            : !target
              ? <div className="state-message"><h1>{t.awaiting}</h1><p>{t.awaitingBody}</p></div>
              : expired
                ? <div className="state-message live"><span className="live-mark"><Icon name="refresh" size={30}/></span><h1>{estimated ? t.estimatedLive : t.live}</h1><p>{estimated ? t.estimatedLiveBody : t.liveBody}</p></div>
                : <Countdown target={target} now={now} t={t}/>
          }
          {target && <p className="confidence-joke"><Icon name="info" size={17}/>{t.confidenceJoke}</p>}
          {target && <div className="event-time">
            <div className="event-primary"><Icon name="clock" size={29}/><h1>{eventLabel(target, locale, timeZone)}</h1></div>
            <p>{timeZone} ({zoneOffset(target, timeZone)})</p>
            <div className="status-line"><span/>{estimated ? t.estimated : expired ? t.live : t.scheduled} · {t.detectedFrom}</div>
          </div>}
        </div>
        <FrescoStage approach={approach} pressed={expired} t={t}/>
      </section>
      <Source data={data} locale={locale} t={t}/>
      <WorldTimes target={target} locale={locale} t={t}/>
      <section className={`how-section ${howOpen ? 'open' : ''}`}>
        <button onClick={() => setHowOpen(!howOpen)} aria-expanded={howOpen}><Icon name="info"/><span>{t.how}</span><Icon name="chevron" size={15}/></button>
        <div className="footer-meta">
          <p className="local-note">{t.localNote}</p>
        </div>
        {howOpen && <div className="how-detail"><strong>{t.updateTitle}</strong><p>{t.updateBody}</p><p className="disclaimer">{t.disclaimer}</p></div>}
      </section>
    </main>
  </div>
}

export default App
