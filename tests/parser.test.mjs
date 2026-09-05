import test from 'node:test'
import assert from 'node:assert/strict'
import { parseResetPost, twitterSnowflakeTime } from '../scripts/lib/parser.mjs'

test('parses Tibo absolute PST announcement exactly', () => {
  const result = parseResetPost({
    id: '2094144275957350900',
    text: 'Your Codex and ChatGPT Work reset will land at 6pm PST.',
    created_at: '2026-08-30T19:24:37.364Z',
    url: 'https://x.com/thsottiaux/status/2094144275957350900',
  })
  assert.equal(result.resetAt, '2026-08-31T02:00:00.000Z')
  assert.equal(result.confidence, 'high')
})

test('parses relative hours', () => {
  const result = parseResetPost({
    id: '1', text: 'Another Codex rate-limit reset coming today. You have 3 hours.',
    created_at: '2026-08-22T16:00:00Z', url: 'https://x.com/thsottiaux/status/1',
  })
  assert.equal(result.resetAt, '2026-08-22T19:00:00.000Z')
  assert.equal(result.confidence, 'medium')
})

test('does not invent a time for a vague announcement', () => {
  const result = parseResetPost({
    id: '2', text: 'We have reset usage limits across Codex. And another one will come later in the day.',
    created_at: '2026-08-22T16:00:00Z', url: 'https://x.com/thsottiaux/status/2',
  })
  assert.equal(result.resetAt, null)
  assert.equal(result.state, 'announced')
})

test('uses an 8pm eligibility cutoff as a clearly marked temporary estimate', () => {
  const result = parseResetPost({
    id: '2096035437299237298',
    text: 'We will do the full banked reset today too for all Plus, Pro and Business users. Lands end of day. PS: If you create the account or upgrade before 8pm PT you will get it too.',
    created_at: '2026-09-05T00:39:25.364Z',
    url: 'https://x.com/thsottiaux/status/2096035437299237298',
  })
  assert.equal(result.resetAt, '2026-09-05T03:00:00.000Z')
  assert.equal(result.state, 'estimated')
  assert.equal(result.parseMethod, 'eligibility-cutoff-proxy')
  assert.equal(result.confidence, 'low')
})

test('does not treat a standalone eligibility cutoff as a reset time', () => {
  const result = parseResetPost({
    id: '4',
    text: 'Codex banked reset eligibility closes before 8pm PT.',
    created_at: '2026-09-05T00:39:25.364Z',
    url: 'https://x.com/thsottiaux/status/4',
  })
  assert.equal(result.resetAt, null)
  assert.equal(result.state, 'announced')
})

test('ignores unrelated posts', () => {
  assert.equal(parseResetPost({ id: '3', text: 'Codex shipped a new feature.', created_at: '2026-08-22T16:00:00Z' }), null)
})

test('derives post time from a Twitter snowflake', () => {
  assert.equal(twitterSnowflakeTime('2094144275957350900').toISOString(), '2026-08-30T19:24:37.364Z')
})
