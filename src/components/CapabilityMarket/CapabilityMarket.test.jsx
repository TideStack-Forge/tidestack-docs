import React from 'react'
import {createRoot} from 'react-dom/client'
import {act} from 'react-dom/test-utils'
import {afterEach, beforeEach, expect, it, vi} from 'vitest'
import CapabilityMarket from './index'

vi.mock('@docusaurus/Link', () => ({default: ({to, children}) => <a href={to}>{children}</a>}))
vi.mock('@docusaurus/useBaseUrl', () => ({default: path => `/dev-docs${path}`}))
vi.mock('@docusaurus/useBrokenLinks', () => ({default: () => ({collectAnchor() {}})}))

let container
let root
beforeEach(async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  await act(async () => root.render(<CapabilityMarket />))
})
afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
})
const cards = () => [...container.querySelectorAll('article')]
async function select(index, value) {
  const element = container.querySelectorAll('select')[index]
  await act(async () => {
    element.value = value
    element.dispatchEvent(new Event('change', {bubbles: true}))
  })
}
async function search(value) {
  const element = container.querySelector('input')
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(element, value)
    element.dispatchEvent(new Event('input', {bubbles: true}))
  })
}

it('keeps runtime conditions, source evidence and deployment-base links available', () => {
  const delayed = container.querySelector('[id="be.integration.delayed"]')
  expect(delayed.textContent).toContain('Scheduler.scheduleOnce')
  expect(delayed.textContent).toContain('取消、实例重启')
  expect(delayed.querySelector('details details').textContent).toContain('Scheduler.java')
  expect(delayed.querySelector('a[href*="scheduled-tasks"]').getAttribute('href'))
    .toBe('/dev-docs/docs/fusion-development/backend-development/scheduled-tasks')
  expect(container.querySelector('a[download]').getAttribute('href')).toBe('/dev-docs/capabilities/catalog.json')
  const related = container.querySelector('[id="be.ai.invocation"]')
  expect(related.querySelector('a[href*="ai-assisted"]').textContent).toContain('相关说明')
})

it('combines side, domain and integration-form filters', async () => {
  await select(0, 'frontend')
  expect(cards().some(card => card.id === 'fe.auth')).toBe(true)
  expect(cards().every(card => card.id.startsWith('fe.'))).toBe(true)
  await select(1, 'identity')
  await select(2, 'sdk')
  expect(cards().map(card => card.id)).toEqual(['fe.auth', 'fe.external-login'])
  expect(container.querySelector('[role="status"]').textContent).toContain('找到 2 /')
})

it('searches API names case-insensitively and combines words', async () => {
  await search('STOMP 初始')
  expect(cards().map(card => card.id)).toEqual(['fe.stomp'])
  await search('本地互斥')
  expect(cards().map(card => card.id)).toEqual(['be.foundation.lock'])
})

it('shows empty results and clears all active filters', async () => {
  await select(0, 'backend')
  await select(1, 'data')
  await select(2, 'spi')
  await search('完全不存在的能力-000')
  expect(cards()).toHaveLength(0)
  expect(container.textContent).toContain('没有匹配的能力')
  await act(async () => container.querySelector('button').click())
  expect(container.querySelector('input').value).toBe('')
  expect([...container.querySelectorAll('select')].every(select => select.value === 'all')).toBe(true)
  expect(cards().some(card => card.id === 'be.integration.delayed')).toBe(true)
  expect(cards().some(card => card.id === 'fe.stomp')).toBe(true)
  expect(container.textContent).not.toContain('没有匹配的能力')
})
