import { describe, it, expect } from 'vitest'
import { layoutTree } from '@/graph/TreeLayout'
import type { MemeTree } from '@/graph/types'

function makeTree(): MemeTree {
  return {
    rootId: 'root',
    edges: [
      { id: 'e1', sourceId: 'root', targetId: 'a' },
      { id: 'e2', sourceId: 'root', targetId: 'b' },
      { id: 'e3', sourceId: 'a', targetId: 'c' },
    ],
    nodes: {
      root: {
        id: 'root',
        label: 'Root',
        content: '',
        depth: 0,
        parentId: null,
        children: ['a', 'b'],
        x: 0,
        y: 0,
        z: 0,
      },
      a: {
        id: 'a',
        label: 'A',
        content: '',
        depth: 1,
        parentId: 'root',
        children: ['c'],
        x: 0,
        y: 0,
        z: 0,
      },
      b: {
        id: 'b',
        label: 'B',
        content: '',
        depth: 1,
        parentId: 'root',
        children: [],
        x: 0,
        y: 0,
        z: 0,
      },
      c: {
        id: 'c',
        label: 'C',
        content: '',
        depth: 2,
        parentId: 'a',
        children: [],
        x: 0,
        y: 0,
        z: 0,
      },
    },
  }
}

describe('layoutTree', () => {
  it('places the root at the origin', () => {
    const out = layoutTree(makeTree())
    expect(out.nodes['root'].x).toBe(0)
    expect(out.nodes['root'].y).toBe(0)
    expect(out.nodes['root'].z).toBe(0)
  })

  it('gives depth-1 nodes a negative y value', () => {
    const out = layoutTree(makeTree())
    expect(out.nodes['a'].y).toBeLessThan(0)
    expect(out.nodes['b'].y).toBeLessThan(0)
  })

  it('places depth-2 nodes lower than depth-1', () => {
    const out = layoutTree(makeTree())
    expect(out.nodes['c'].y).toBeLessThan(out.nodes['a'].y)
  })

  it('does not modify the original tree object', () => {
    const original = makeTree()
    const out = layoutTree(original)
    expect(out).not.toBe(original)
    expect(original.nodes['root'].x).toBe(0)
  })

  it('assigns non-zero x/z to depth-1 siblings', () => {
    const out = layoutTree(makeTree())
    const distA = Math.hypot(out.nodes['a'].x, out.nodes['a'].z)
    const distB = Math.hypot(out.nodes['b'].x, out.nodes['b'].z)
    expect(distA).toBeGreaterThan(0)
    expect(distB).toBeGreaterThan(0)
  })
})
