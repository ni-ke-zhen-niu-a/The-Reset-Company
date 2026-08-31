import assert from 'node:assert/strict'
import test from 'node:test'
import { resetProgress } from '../src/time.js'

const start = new Date('2026-08-30T18:00:00Z')
const target = new Date('2026-08-31T02:00:00Z')

test('reset progress begins at the announcement', () => {
  assert.equal(resetProgress(target, start, start), 0)
})

test('reset progress follows elapsed announcement time', () => {
  assert.equal(resetProgress(target, start, new Date('2026-08-30T22:00:00Z')), 0.5)
})

test('reset progress clamps when the reset arrives', () => {
  assert.equal(resetProgress(target, start, new Date('2026-08-31T04:00:00Z')), 1)
})
