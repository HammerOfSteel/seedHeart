import * as THREE from 'three'
import { Tween, Easing, update as tweenUpdate } from '@tweenjs/tween.js'
import type { IRenderer } from '@/engine/IRenderer'
import type { MemeTree, NodeId } from '@/graph/types'
import { PALETTE, CAMERA_FOV, CAMERA_NEAR, CAMERA_FAR } from '@/constants'
import { layoutTree } from '@/graph/TreeLayout'

const P = PALETTE.crystal

/**
 * Crystal Geode — 3D renderer.
 *
 * Visual: iridescent octahedral crystal nodes with cone spires; three orbiting
 * coloured point-lights create shifting refraction; nodes crystallise into
 * existence in BFS order on first render.
 */
export class CrystalRenderer implements IRenderer {
  private renderer: THREE.WebGLRenderer | null = null
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private frameId: number | null = null
  private container: HTMLElement | null = null

  private nodeMeshes = new Map<NodeId, THREE.Mesh>()
  private orbitLights: Array<{
    light: THREE.PointLight
    angle: number
    speed: number
    radius: number
  }> = []

  private hoveredId: NodeId | null = null
  private selectedId: NodeId | null = null

  private isPointerDown = false
  private pointerStart = { x: 0, y: 0 }
  private spherical = new THREE.Spherical(28, Math.PI / 4, 0.3)
  private target = new THREE.Vector3(0, -4, 0)

  private boundPointerDown: (e: PointerEvent) => void
  private boundPointerMove: (e: PointerEvent) => void
  private boundPointerUp: () => void
  private boundWheel: (e: WheelEvent) => void

  constructor() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(P.background)
    this.scene.fog = new THREE.FogExp2(P.background, 0.025)

    this.camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, CAMERA_NEAR, CAMERA_FAR)
    this.camera.position.set(0, 8, 28)
    this.camera.lookAt(this.target)

    // Dim ambient
    this.scene.add(new THREE.AmbientLight(0x08060f, 1.5))

    // Three orbiting coloured point lights
    const lightDefs: Array<{ color: number; radius: number; speed: number; y: number }> = [
      { color: 0xc0a0ff, radius: 12, speed: 0.0007, y: 5 },
      { color: 0xff60c8, radius: 8, speed: -0.0011, y: -2 },
      { color: 0x40d0ff, radius: 15, speed: 0.0005, y: 8 },
    ]
    for (const def of lightDefs) {
      const light = new THREE.PointLight(def.color, 6, 50)
      light.position.set(def.radius, def.y, 0)
      this.scene.add(light)
      this.orbitLights.push({
        light,
        angle: Math.random() * Math.PI * 2,
        speed: def.speed,
        radius: def.radius,
      })
    }

    this.boundPointerDown = this.onPointerDown.bind(this)
    this.boundPointerMove = this.onPointerMove.bind(this)
    this.boundPointerUp = this.onPointerUp.bind(this)
    this.boundWheel = this.onWheel.bind(this)
  }

  mount(container: HTMLElement): void {
    this.container = container

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(
      container.clientWidth || window.innerWidth,
      container.clientHeight || window.innerHeight,
    )
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.4
    container.appendChild(renderer.domElement)
    this.renderer = renderer

    container.addEventListener('pointerdown', this.boundPointerDown)
    container.addEventListener('pointermove', this.boundPointerMove)
    container.addEventListener('pointerup', this.boundPointerUp)
    container.addEventListener('wheel', this.boundWheel, { passive: true })

    this.loop()
  }

  render(tree: MemeTree): void {
    this.clearScene()
    const laid = layoutTree(tree)

    // BFS order for staggered crystallisation
    const bfsOrder: string[] = []
    const queue = [laid.rootId]
    while (queue.length > 0) {
      const id = queue.shift()!
      bfsOrder.push(id)
      const node = laid.nodes[id]
      if (node) queue.push(...node.children)
    }

    bfsOrder.forEach((id, i) => {
      const node = laid.nodes[id]
      if (!node) return
      setTimeout(() => {
        if (!this.nodeMeshes.has(id)) {
          this.addCrystalNode(id, node.x, node.y, node.z, node.depth)
        }
      }, i * 80)
    })

    // Add edges immediately
    for (const edge of laid.edges) {
      const src = laid.nodes[edge.sourceId]
      const tgt = laid.nodes[edge.targetId]
      if (src && tgt)
        this.addEdge(new THREE.Vector3(src.x, src.y, src.z), new THREE.Vector3(tgt.x, tgt.y, tgt.z))
    }
  }

  onHover(id: NodeId | null): void {
    if (this.hoveredId) {
      const mesh = this.nodeMeshes.get(this.hoveredId)
      if (mesh) (mesh.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.3
    }
    this.hoveredId = id
    if (id) {
      const mesh = this.nodeMeshes.get(id)
      if (mesh) (mesh.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 2
    }
  }

  onSelect(id: NodeId | null): void {
    this.selectedId = id
    if (id) {
      const mesh = this.nodeMeshes.get(id)
      if (mesh) {
        ;(mesh.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 4
        this.tweenCameraTo(mesh.position)
      }
    }
  }

  dispose(): void {
    if (this.frameId !== null) cancelAnimationFrame(this.frameId)
    this.clearScene()

    if (this.renderer && this.container) {
      this.container.removeChild(this.renderer.domElement)
      this.renderer.dispose()
    }

    this.container?.removeEventListener('pointerdown', this.boundPointerDown)
    this.container?.removeEventListener('pointermove', this.boundPointerMove)
    this.container?.removeEventListener('pointerup', this.boundPointerUp)
    this.container?.removeEventListener('wheel', this.boundWheel)

    this.renderer = null
    this.container = null
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private addCrystalNode(id: NodeId, x: number, y: number, z: number, depth: number): void {
    const group = new THREE.Group()
    group.position.set(x, y, z)
    group.scale.set(0, 0, 0) // Start tiny — tween to full size

    const size = Math.max(0.2, 0.8 - depth * 0.1)

    // Main octahedron
    const octGeo = new THREE.OctahedronGeometry(size)
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(P.node),
      emissive: new THREE.Color(P.node),
      emissiveIntensity: 0.3,
      roughness: 0,
      metalness: 0.1,
      transmission: 0.9,
      ior: 2.4,
      iridescence: 1.0,
      iridescenceIOR: 1.8,
      thickness: 0.5,
    })
    const oct = new THREE.Mesh(octGeo, mat)
    oct.userData.nodeId = id
    group.add(oct)

    // Spire above
    const spireGeo = new THREE.ConeGeometry(size * 0.3, size * 1.4, 5)
    const spireMat = mat.clone()
    spireMat.iridescence = 0.7
    const spire = new THREE.Mesh(spireGeo, spireMat)
    spire.position.y = size * 0.9
    group.add(spire)

    this.scene.add(group)
    this.nodeMeshes.set(id, oct) // Track the octahedron as the "primary" mesh

    // Crystallise tween
    const scale = { s: 0 }
    new Tween(scale)
      .to({ s: 1 }, 400)
      .easing(Easing.Back.Out)
      .onUpdate(() => group.scale.setScalar(scale.s))
      .start()
  }

  private addEdge(from: THREE.Vector3, to: THREE.Vector3): void {
    const dir = to.clone().sub(from)
    const len = dir.length()
    const mid = from.clone().add(to).multiplyScalar(0.5)

    const geo = new THREE.CylinderGeometry(0.015, 0.015, len, 4)
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(P.edge),
      emissive: new THREE.Color(P.edge),
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.5,
    })
    const cyl = new THREE.Mesh(geo, mat)
    cyl.position.copy(mid)
    cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())
    this.scene.add(cyl)
  }

  private clearScene(): void {
    for (const mesh of this.nodeMeshes.values()) {
      const parent = mesh.parent
      if (parent) {
        this.scene.remove(parent)
        parent.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose()
            ;(child.material as THREE.Material).dispose()
          }
        })
      }
    }
    this.nodeMeshes.clear()

    // Remove edge cylinders (everything that's not a light or in nodeMeshes)
    const toRemove: THREE.Object3D[] = []
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && !obj.userData.nodeId) toRemove.push(obj)
    })
    for (const obj of toRemove) {
      this.scene.remove(obj)
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose()
        ;(obj.material as THREE.Material).dispose()
      }
    }
  }

  private tweenCameraTo(target: THREE.Vector3): void {
    const from = { x: this.target.x, y: this.target.y, z: this.target.z }
    new Tween(from)
      .to({ x: target.x, y: target.y, z: target.z }, 700)
      .easing(Easing.Cubic.InOut)
      .onUpdate(() => this.target.set(from.x, from.y, from.z))
      .start()
  }

  private loop(): void {
    this.frameId = requestAnimationFrame(() => this.loop())

    tweenUpdate()

    // Orbit lights
    for (const ol of this.orbitLights) {
      ol.angle += ol.speed * 16 // ~60fps
      ol.light.position.x = Math.cos(ol.angle) * ol.radius
      ol.light.position.z = Math.sin(ol.angle) * ol.radius
    }

    // Pulse selected node
    if (this.selectedId) {
      const mesh = this.nodeMeshes.get(this.selectedId)
      if (mesh) {
        const t = performance.now() * 0.003
        ;(mesh.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 3 + Math.sin(t) * 1
      }
    }

    const pos = new THREE.Vector3().setFromSpherical(this.spherical).add(this.target)
    this.camera.position.copy(pos)
    this.camera.lookAt(this.target)

    if (this.renderer && this.container) {
      const w = this.container.clientWidth || window.innerWidth
      const h = this.container.clientHeight || window.innerHeight
      if (this.renderer.domElement.width !== w * window.devicePixelRatio) {
        this.renderer.setSize(w, h)
        this.camera.aspect = w / h
        this.camera.updateProjectionMatrix()
      }
    }

    this.renderer?.render(this.scene, this.camera)
  }

  private onPointerDown(e: PointerEvent): void {
    this.isPointerDown = true
    this.pointerStart = { x: e.clientX, y: e.clientY }
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.isPointerDown) return
    const dx = (e.clientX - this.pointerStart.x) * 0.01
    const dy = (e.clientY - this.pointerStart.y) * 0.01
    this.spherical.theta -= dx
    this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.spherical.phi + dy))
    this.pointerStart = { x: e.clientX, y: e.clientY }
  }

  private onPointerUp(): void {
    this.isPointerDown = false
  }

  private onWheel(e: WheelEvent): void {
    this.spherical.radius = Math.max(5, Math.min(80, this.spherical.radius + e.deltaY * 0.05))
  }
}
