import * as THREE from 'three'
import { Tween, Easing, update as tweenUpdate } from '@tweenjs/tween.js'
import type { IRenderer } from '@/engine/IRenderer'
import type { MemeTree, NodeId } from '@/graph/types'
import { PALETTE, CAMERA_FOV, CAMERA_NEAR, CAMERA_FAR, CAMERA_DEFAULT_POSITION } from '@/constants'
import { layoutTree } from '@/graph/TreeLayout'

const P = PALETTE.mycelium

/**
 * Mycelium Neural Web — 3D renderer.
 *
 * Visual: bioluminescent nodes connected by bezier tube tendrils; particle
 * streams flow along each tendril; hover triggers a BFS ripple glow.
 */
export class MyceliumRenderer implements IRenderer {
  private renderer: THREE.WebGLRenderer | null = null
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private frameId: number | null = null
  private container: HTMLElement | null = null

  // Object maps keyed by node id
  private nodeMeshes = new Map<NodeId, THREE.Mesh>()
  private tendrilTubes: THREE.Mesh[] = []
  private particles: THREE.Points[] = []

  private hoveredId: NodeId | null = null
  private selectedId: NodeId | null = null

  // Mouse / orbit
  private isPointerDown = false
  private pointerStart = { x: 0, y: 0 }
  private spherical = new THREE.Spherical(25, Math.PI / 4, 0)
  private target = new THREE.Vector3(0, -5, 0)

  private boundPointerDown: (e: PointerEvent) => void
  private boundPointerMove: (e: PointerEvent) => void
  private boundPointerUp: () => void
  private boundWheel: (e: WheelEvent) => void

  constructor() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(P.background)
    this.scene.fog = new THREE.FogExp2(P.background, 0.03)

    this.camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, CAMERA_NEAR, CAMERA_FAR)
    this.camera.position.set(
      CAMERA_DEFAULT_POSITION.x,
      CAMERA_DEFAULT_POSITION.y,
      CAMERA_DEFAULT_POSITION.z,
    )
    this.camera.lookAt(this.target)

    // Ambient fill
    const ambient = new THREE.AmbientLight(0x0a0a1a, 2)
    this.scene.add(ambient)

    // Pulsing point light at origin
    const centerLight = new THREE.PointLight(new THREE.Color(P.nodeHover), 3, 40)
    this.scene.add(centerLight)

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
    renderer.toneMappingExposure = 1.2
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

    for (const node of Object.values(laid.nodes)) {
      this.addNode(node.id, node.x, node.y, node.z, node.depth)
    }

    for (const edge of laid.edges) {
      const src = laid.nodes[edge.sourceId]
      const tgt = laid.nodes[edge.targetId]
      if (src && tgt) {
        this.addTendril(
          new THREE.Vector3(src.x, src.y, src.z),
          new THREE.Vector3(tgt.x, tgt.y, tgt.z),
        )
      }
    }
  }

  onHover(id: NodeId | null): void {
    // Restore previous
    if (this.hoveredId) {
      const mesh = this.nodeMeshes.get(this.hoveredId)
      if (mesh) (mesh.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.4
    }
    this.hoveredId = id
    if (id) {
      const mesh = this.nodeMeshes.get(id)
      if (mesh) (mesh.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 2.5
    }
  }

  onSelect(id: NodeId | null): void {
    if (this.selectedId) {
      const mesh = this.nodeMeshes.get(this.selectedId)
      if (mesh) {
        const mat = mesh.material as THREE.MeshPhysicalMaterial
        mat.color.set(P.node)
        mat.emissiveIntensity = 0.4
      }
    }
    this.selectedId = id
    if (id) {
      const mesh = this.nodeMeshes.get(id)
      if (mesh) {
        const mat = mesh.material as THREE.MeshPhysicalMaterial
        mat.color.set(P.nodeHover)
        mat.emissiveIntensity = 3
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

  private addNode(id: NodeId, x: number, y: number, z: number, depth: number): void {
    const radius = Math.max(0.15, 0.6 - depth * 0.1)
    const geo = new THREE.SphereGeometry(radius, 16, 16)
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(P.node),
      emissive: new THREE.Color(P.node),
      emissiveIntensity: 0.4,
      roughness: 0.1,
      metalness: 0.3,
      transmission: 0.2,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(x, y, z)
    mesh.userData.nodeId = id
    this.scene.add(mesh)
    this.nodeMeshes.set(id, mesh)
  }

  private addTendril(from: THREE.Vector3, to: THREE.Vector3): void {
    const mid = from
      .clone()
      .lerp(to, 0.5)
      .add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 4,
        ),
      )
    const curve = new THREE.QuadraticBezierCurve3(from, mid, to)
    const tube = new THREE.TubeGeometry(curve, 20, 0.03, 6, false)
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(P.edge),
      emissive: new THREE.Color(P.edge),
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.6,
    })
    const mesh = new THREE.Mesh(tube, mat)
    this.scene.add(mesh)
    this.tendrilTubes.push(mesh)

    // Particle stream
    this.addParticleStream(curve)
  }

  private addParticleStream(curve: THREE.QuadraticBezierCurve3): void {
    const count = 8
    const positions = new Float32Array(count * 3)
    const offsets = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      offsets[i] = i / count
      const pt = curve.getPoint(offsets[i])
      positions[i * 3] = pt.x
      positions[i * 3 + 1] = pt.y
      positions[i * 3 + 2] = pt.z
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.userData.curve = curve
    geo.userData.offsets = offsets
    const mat = new THREE.PointsMaterial({
      color: P.particle,
      size: 0.08,
      transparent: true,
      opacity: 0.85,
    })
    const pts = new THREE.Points(geo, mat)
    this.scene.add(pts)
    this.particles.push(pts)
  }

  private clearScene(): void {
    for (const mesh of this.nodeMeshes.values()) {
      this.scene.remove(mesh)
      mesh.geometry.dispose()
      ;(mesh.material as THREE.Material).dispose()
    }
    this.nodeMeshes.clear()

    for (const mesh of this.tendrilTubes) {
      this.scene.remove(mesh)
      mesh.geometry.dispose()
      ;(mesh.material as THREE.Material).dispose()
    }
    this.tendrilTubes = []

    for (const pts of this.particles) {
      this.scene.remove(pts)
      pts.geometry.dispose()
      ;(pts.material as THREE.Material).dispose()
    }
    this.particles = []
  }

  private tweenCameraTo(target: THREE.Vector3): void {
    const from = { x: this.target.x, y: this.target.y, z: this.target.z }
    new Tween(from)
      .to({ x: target.x, y: target.y, z: target.z }, 600)
      .easing(Easing.Cubic.InOut)
      .onUpdate(() => this.target.set(from.x, from.y, from.z))
      .start()
  }

  private loop(): void {
    this.frameId = requestAnimationFrame(() => this.loop())
    const t = performance.now() * 0.001

    tweenUpdate()

    // Animate particle streams
    for (const pts of this.particles) {
      const geo = pts.geometry
      const curve = geo.userData.curve as THREE.QuadraticBezierCurve3
      const offsets = geo.userData.offsets as Float32Array
      const positions = geo.attributes.position.array as Float32Array
      for (let i = 0; i < offsets.length; i++) {
        offsets[i] = (offsets[i] + 0.002) % 1
        const pt = curve.getPoint(offsets[i])
        positions[i * 3] = pt.x
        positions[i * 3 + 1] = pt.y
        positions[i * 3 + 2] = pt.z
      }
      geo.attributes.position.needsUpdate = true
    }

    // Gentle node pulse
    for (const mesh of this.nodeMeshes.values()) {
      const mat = mesh.material as THREE.MeshPhysicalMaterial
      if (mesh.userData.nodeId !== this.hoveredId && mesh.userData.nodeId !== this.selectedId) {
        mat.emissiveIntensity = 0.3 + 0.15 * Math.sin(t * 1.2 + mesh.position.x)
      }
    }

    // Orbit camera
    const pos = new THREE.Vector3().setFromSpherical(this.spherical).add(this.target)
    this.camera.position.copy(pos)
    this.camera.lookAt(this.target)

    // Resize if needed
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

  // ─── Orbit controls ──────────────────────────────────────────────────────────

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
