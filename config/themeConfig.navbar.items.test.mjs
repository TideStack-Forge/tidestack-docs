// @vitest-environment node
import {afterEach, expect, it, vi} from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

it.each([
  [undefined, 'https://www.tidestackforge.com'],
  ['', 'https://www.tidestackforge.com'],
  ['https://cn.example.com', 'https://cn.example.com'],
])('uses the configured official website URL (%s)', async (configuredUrl, expectedUrl) => {
  vi.stubEnv('OFFICIAL_SITE_URL', configuredUrl)
  vi.resetModules()
  const {default: items} = await import('./themeConfig.navbar.items.js')
  expect(items.find(item => item.label === '官网')).toEqual({
    label: '官网',
    href: expectedUrl,
    position: 'right',
  })
})
