import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RendererManager } from '@/engine/RendererManager'
import type { IRenderer } from '@/engine/IRenderer'
import type { MemeTree } from '@/graph/types'

function makeMockRenderer(): IRenderer {
  return {
    mount: vi.fn(),
    render: vi.fn(),
    onHover: vi.fn(),
    onSelect: vi.fn(),
    dispose: vi.fn(),
  }
}

function makeContainer(): HTMLElement {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return el
}

const MINIMAL_TREE: MemeTree = {
  rootId: 'root',
  edges: [],
  nodes: {
    root: {
      id: 'root',
      label: 'Root',
      content: '',
      depth: 0,
      parentId: null,
      children: [],
      x: 0,
      y: 0,
      z: 0,
    },
  },
}

describe('RendererManager', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = makeContainer()
  })

  it('mounts the renderer when switching to a registered mode', async () => {
    const mock = makeMockRenderer()
    const manager = new RendererManager(container)
    manager.register('mycelium', () => mock)

    await manager.switchTo('mycelium')

    expect(mock.mount).toHaveBeenCalledWith(container)
    expect(manager.activeMode).toBe('mycelium')
  })

  it('calls render with the last tree on mode switch', async () => {
    const mock = makeMockRenderer()
    const manager = new RendererManager(container)
    manager.register('mycelium', () => mock)
    manager.renderTree(MINIMAL_TREE)
    await manager.switchTo('mycelium')

    expect(mock.render).toHaveBeenCalledWith(MINIMAL_TREE)
  })

  it('disposes the previous renderer before mounting a new one', async () => {
    const firstMock = makeMockRenderer()
    const secondMock = makeMockRenderer()
    const manager = new RendererManager(container)
    manager.register('mycelium', () => firstMock)
    manager.register('crystal', () => secondMock)

    await manager.switchTo('mycelium')
    await manager.switchTo('crystal')

    expect(firstMock.dispose).toHaveBeenCalledOnce()
    expect(secondMock.mount).toHaveBeenCalledWith(container)
  })

  it('is a no-op when switching to the already active mode', async () => {
    const mock = makeMockRenderer()
    const manager = new RendererManager(container)
    manager.register('mycelium', () => mock)

    await manager.switchTo('mycelium')
    await manager.switchTo('mycelium')

    expect(mock.mount).toHaveBeenCalledOnce()
  })

  it('throws when switching to an unregistered mode', async () => {
    const manager = new RendererManager(container)
    await expect(manager.switchTo('crystal')).rejects.toThrow()
  })

  it('forwards onHover to the active renderer', async () => {
    const mock = makeMockRenderer()
    const manager = new RendererManager(container)
    manager.register('mycelium', () => mock)
    await manager.switchTo('mycelium')

    manager.onHover('node-1')
    expect(mock.onHover).toHaveBeenCalledWith('node-1')
  })

  it('forwards onSelect to the active renderer', async () => {
    const mock = makeMockRenderer()
    const manager = new RendererManager(container)
    manager.register('mycelium', () => mock)
    await manager.switchTo('mycelium')

    manager.onSelect('node-2')
    expect(mock.onSelect).toHaveBeenCalledWith('node-2')
  })

  it('calls dispose on the active renderer when manager is disposed', async () => {
    const mock = makeMockRenderer()
    const manager = new RendererManager(container)
    manager.register('mycelium', () => mock)
    await manager.switchTo('mycelium')

    manager.dispose()
    expect(mock.dispose).toHaveBeenCalledOnce()
    expect(manager.activeMode).toBeNull()
  })
})
