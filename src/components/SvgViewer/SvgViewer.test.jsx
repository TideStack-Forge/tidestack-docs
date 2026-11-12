import React from 'react'
import {createRoot} from 'react-dom/client'
import {act} from 'react-dom/test-utils'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import Components from '../../theme/MDXComponents'

vi.mock('@theme-original/MDXComponents', () => ({
  default: {
    img: (props) => <img {...props} />,
    a: (props) => <a {...props} />,
  },
}))

const {img: Image, a: Link} = Components
let container
let root

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  // Native focus trapping and Escape are covered in the browser; supply the dialog lifecycle here.
  vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(function () {
    this.setAttribute('open', '')
    this.querySelector('button')?.focus()
  })
  vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function () {
    if (!this.open) return
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  })
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  vi.restoreAllMocks()
})

async function render(element) {
  await act(async () => root.render(element))
}

async function click(element, options) {
  const event = new MouseEvent('click', {bubbles: true, cancelable: true, ...options})
  await act(async () => element.dispatchEvent(event))
  return event
}

describe('SVG images in Markdown', () => {
  it('keeps an external SVG image and opens a modal without navigating', async () => {
    await render(<Image src="/diagram.svg" alt="模型关系" />)
    const trigger = container.querySelector('a')
    expect(trigger.href).toContain('/diagram.svg')
    const event = await click(trigger)
    expect(event.defaultPrevented).toBe(true)
    const dialog = document.querySelector('dialog[open]')
    expect(dialog.getAttribute('aria-label')).toBe('模型关系')
    // Resolve the lazy canvas module without making the whole handbook load it up front.
    await act(async () => { await import('./Canvas') })
    expect(dialog.querySelector('img').getAttribute('src')).toBe('/diagram.svg')
    expect(dialog.querySelector('svg')).toBeNull()
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('closes the viewer and restores focus and scrolling', async () => {
    document.body.style.overflow = 'auto'
    await render(<Image src="/diagram.svg" alt="架构" />)
    const trigger = container.querySelector('a')
    await click(trigger)
    await click(document.querySelector('dialog button'))
    expect(document.querySelector('dialog')).toBeNull()
    expect(document.activeElement).toBe(trigger)
    expect(document.body.style.overflow).toBe('auto')
  })

  it('preserves inferred dimensions for SVG files that only define a viewBox', async () => {
    await render(<Image src="/viewbox-only.svg" width="1440" height="840" alt="概要拓扑" />)
    await click(container.querySelector('a'))
    const image = document.querySelector('dialog img')
    expect(image.width).toBe(1440)
    expect(image.height).toBe(840)
    expect(image.src).toContain('/viewbox-only.svg')
  })

  it('allows modified clicks to open the original file', async () => {
    await render(<Image src="/diagram.svg" />)
    for (const modifier of ['ctrlKey', 'metaKey', 'shiftKey', 'altKey']) {
      const event = await click(container.querySelector('a'), {[modifier]: true})
      expect(event.defaultPrevented).toBe(false)
      expect(document.querySelector('dialog')).toBeNull()
    }
  })

  it('adds no viewer to bitmap images', async () => {
    await render(<Image src="/screenshot.png" alt="操作界面" />)
    expect(container.querySelector('a')).toBeNull()
    expect(container.querySelector('img').alt).toBe('操作界面')
  })

  it('handles an SVG already linked to its original file with one anchor', async () => {
    await render(<Link href="/assets/files/diagram.SVG?v=2"><Image src="/assets/images/diagram.SVG?v=2" alt="拓扑" /></Link>)
    expect(container.querySelectorAll('a')).toHaveLength(1)
    await click(container.querySelector('a'))
    expect(document.querySelector('dialog[open]')).not.toBeNull()
  })

  it('preserves images linked to another page and ordinary text links', async () => {
    await render(<><Link href="/docs/guide"><Image src="/diagram.svg" /></Link><Link href="/docs/next">下一章</Link></>)
    expect(container.querySelectorAll('a')).toHaveLength(2)
    expect(container.querySelector('a').getAttribute('href')).toBe('/docs/guide')
    expect(container.querySelector('[aria-haspopup]')).toBeNull()
  })

  it('offers controls and a recovery link if the image fails to load', async () => {
    await render(<Image src="/missing.svg" />)
    await click(container.querySelector('a'))
    const dialog = document.querySelector('dialog')
    expect(dialog.getAttribute('aria-label')).toBe('查看图表')
    const original = dialog.querySelector('a')
    expect(original.getAttribute('href')).toBe('/missing.svg')
    expect(original.target).toBe('_blank')
    await act(async () => dialog.querySelector('img').dispatchEvent(new Event('error')))
    expect(dialog.querySelector('[role="alert"]').textContent).toContain('加载失败')
    const controls = [...dialog.querySelectorAll('[role="group"] button')]
    expect(controls.map((button) => button.textContent)).toEqual(['−', '＋', '适应窗口', '原始大小'])
    for (const button of controls) await click(button)
    await click(dialog)
    expect(document.querySelector('dialog')).toBeNull()
  })
})
