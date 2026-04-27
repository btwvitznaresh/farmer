import * as THREE from 'three'

export type ParticleMode =
  | 'fireflies'
  | 'rain'
  | 'pollen'
  | 'dust'
  | 'sparkles'

interface ParticleVelocity {
  vx: number
  vy: number
  vz: number
  life: number
}

const COLORS: Record<ParticleMode, number> = {
  fireflies: 0xaaff44,
  rain:      0x88ccff,
  pollen:    0xffee88,
  dust:      0xccaa88,
  sparkles:  0xffffff,
}

const SIZES: Record<ParticleMode, number> = {
  fireflies: 0.08,
  rain:      0.04,
  pollen:    0.06,
  dust:      0.05,
  sparkles:  0.07,
}

export class ParticleSystem {
  /** The Three.js Points mesh — add this to your scene */
  mesh: THREE.Points
  private geo: THREE.BufferGeometry
  private positions: Float32Array
  private velocities: ParticleVelocity[]
  private count: number
  private mode: ParticleMode

  constructor(count = 800, mode: ParticleMode = 'fireflies') {
    this.count = count
    this.mode = mode
    this.positions = new Float32Array(count * 3)
    this.velocities = []
    this.geo = new THREE.BufferGeometry()

    for (let i = 0; i < count; i++) {
      this.positions[i * 3]     = (Math.random() - 0.5) * 14
      this.positions[i * 3 + 1] = Math.random() * 7
      this.positions[i * 3 + 2] = (Math.random() - 0.5) * 14
      this.velocities.push(this.newVelocity())
    }

    this.geo.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(this.positions, 3),
    )

    this.mesh = new THREE.Points(
      this.geo,
      new THREE.PointsMaterial({
        color: COLORS[mode],
        size: SIZES[mode],
        transparent: true,
        opacity: mode === 'fireflies' ? 0.85 : 0.6,
        sizeAttenuation: true,
      }),
    )
  }

  private newVelocity(): ParticleVelocity {
    const m = this.mode
    if (m === 'rain') {
      return { vx: 0.002, vy: -0.08, vz: 0.001, life: Math.random() }
    }
    if (m === 'fireflies') {
      return {
        vx: (Math.random() - 0.5) * 0.012,
        vy: (Math.random() - 0.5) * 0.008,
        vz: (Math.random() - 0.5) * 0.012,
        life: Math.random(),
      }
    }
    return {
      vx: (Math.random() - 0.5) * 0.008,
      vy: 0.01 + Math.random() * 0.015,
      vz: (Math.random() - 0.5) * 0.008,
      life: Math.random(),
    }
  }

  /**
   * Call every frame in your render loop.
   * @param t  Elapsed time in seconds (e.g. clock.getElapsedTime())
   */
  update(t: number) {
    const pa = this.geo.attributes.position.array as Float32Array

    for (let i = 0; i < this.count; i++) {
      const v = this.velocities[i]
      pa[i * 3]     += v.vx
      pa[i * 3 + 1] += v.vy
      pa[i * 3 + 2] += v.vz

      // Firefly organic wobble
      if (this.mode === 'fireflies') {
        pa[i * 3]     += Math.sin(t * 0.8 + i) * 0.003
        pa[i * 3 + 1] += Math.cos(t * 0.6 + i) * 0.002
      }

      // Reset when particle escapes bounds
      const y = pa[i * 3 + 1]
      if (
        y > 8 || y < -1 ||
        Math.abs(pa[i * 3]) > 8 ||
        Math.abs(pa[i * 3 + 2]) > 8
      ) {
        pa[i * 3]     = (Math.random() - 0.5) * 14
        pa[i * 3 + 1] = this.mode === 'rain' ? 7 : 0
        pa[i * 3 + 2] = (Math.random() - 0.5) * 14
        this.velocities[i] = this.newVelocity()
      }
    }

    this.geo.attributes.position.needsUpdate = true

    // Firefly pulsing opacity
    if (this.mode === 'fireflies') {
      const mat = this.mesh.material as THREE.PointsMaterial
      mat.opacity = 0.7 + Math.sin(t * 1.5) * 0.15
    }
  }

  dispose() {
    this.geo.dispose()
    ;(this.mesh.material as THREE.Material).dispose()
  }
}
