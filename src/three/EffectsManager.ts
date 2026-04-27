import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass'
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass'
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'

export interface EffectsConfig {
  bloom: boolean
  bloomStrength: number      // 0.5 – 2.0 (default 1.2)
  bloomRadius: number        // 0.1 – 1.0 (default 0.4)
  bloomThreshold: number     // 0.0 – 1.0 (default 0.8)
  motionTrails: boolean
  trailDamp: number          // 0.85 – 0.98 (default 0.88)
  depthOfField: boolean
  focusDistance: number      // world units (default 8.0)
  aperture: number           // 0.001 – 0.05 (default 0.025)
  filmGrain: boolean
  antiAlias: boolean
}

export const DEFAULT_CONFIG: EffectsConfig = {
  bloom: true,
  bloomStrength: 1.2,
  bloomRadius: 0.4,
  bloomThreshold: 0.8,
  motionTrails: false,
  trailDamp: 0.88,
  depthOfField: false,
  focusDistance: 8.0,
  aperture: 0.025,
  filmGrain: false,
  antiAlias: true,
}

export class EffectsManager {
  composer: EffectComposer
  private bloomPass: UnrealBloomPass
  private afterimagePass: AfterimagePass
  private bokehPass: BokehPass
  private filmPass: FilmPass
  private fxaaPass: ShaderPass
  private config: EffectsConfig

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    width: number,
    height: number,
    config: Partial<EffectsConfig> = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.composer = new EffectComposer(renderer)
    this.composer.addPass(new RenderPass(scene, camera))

    // 1. Bloom
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      this.config.bloomStrength,
      this.config.bloomRadius,
      this.config.bloomThreshold
    )
    this.bloomPass.enabled = this.config.bloom
    this.composer.addPass(this.bloomPass)

    // 2. Motion trails / afterimage
    this.afterimagePass = new AfterimagePass(this.config.trailDamp)
    this.afterimagePass.enabled = this.config.motionTrails
    this.composer.addPass(this.afterimagePass)

    // 3. Depth of field
    this.bokehPass = new BokehPass(scene, camera, {
      focus: this.config.focusDistance,
      aperture: this.config.aperture,
      maxblur: 0.012,
      width,
      height,
    })
    this.bokehPass.enabled = this.config.depthOfField
    this.composer.addPass(this.bokehPass)

    // 4. Film grain (subtle — makes it feel cinematic)
    this.filmPass = new FilmPass(0.15, 0.025, 648, 0)
    this.filmPass.enabled = this.config.filmGrain
    this.composer.addPass(this.filmPass)

    // 5. FXAA anti-aliasing (always last)
    this.fxaaPass = new ShaderPass(FXAAShader)
    this.fxaaPass.uniforms['resolution'].value.set(1 / width, 1 / height)
    this.fxaaPass.enabled = this.config.antiAlias
    this.composer.addPass(this.fxaaPass)
  }

  // Toggle individual effects at runtime
  setBloom(enabled: boolean, strength?: number) {
    this.bloomPass.enabled = enabled
    if (strength !== undefined) this.bloomPass.strength = strength
  }

  setMotionTrails(enabled: boolean, damp?: number) {
    this.afterimagePass.enabled = enabled
    if (damp !== undefined) this.afterimagePass.uniforms['damp'].value = damp
  }

  setDepthOfField(enabled: boolean, focus?: number) {
    this.bokehPass.enabled = enabled
    if (focus !== undefined) (this.bokehPass as any).uniforms['focus'].value = focus
  }

  setFilmGrain(enabled: boolean) {
    this.filmPass.enabled = enabled
  }

  /** Call in render loop instead of renderer.render() */
  render() {
    this.composer.render()
  }

  /** Call on window resize */
  resize(width: number, height: number) {
    this.composer.setSize(width, height)
    this.fxaaPass.uniforms['resolution'].value.set(1 / width, 1 / height)
    this.bloomPass.resolution.set(width, height)
  }

  dispose() {
    this.composer.dispose()
  }
}

/**
 * Detect device capability and return a sensible EffectsConfig preset.
 * High-end devices get all effects; low-end mobile gets a lighter set.
 */
export function getEffectsPreset(renderer: THREE.WebGLRenderer): Partial<EffectsConfig> {
  const gl = renderer.getContext()
  const dbgInfo = gl.getExtension('WEBGL_debug_renderer_info')
  const gpu = dbgInfo
    ? gl.getParameter(dbgInfo.UNMASKED_RENDERER_WEBGL) as string
    : ''
  const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent)
  const isLowEnd =
    isMobile &&
    !gpu.includes('Adreno 6') &&
    !gpu.includes('Mali-G7')

  if (isLowEnd) {
    return {
      bloom: true,
      bloomStrength: 0.8,
      motionTrails: false,
      depthOfField: false,
      filmGrain: false,
      antiAlias: false,
    }
  }

  return {
    bloom: true,
    bloomStrength: 1.4,
    motionTrails: true,
    depthOfField: true,
    filmGrain: true,
    antiAlias: true,
  }
}
