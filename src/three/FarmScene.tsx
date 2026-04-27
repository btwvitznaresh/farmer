/**
 * FarmScene.tsx
 * ─────────────
 * A self-contained Three.js WebGL canvas that wires together:
 *   • EffectsManager  – bloom, film grain, FXAA post-processing
 *   • ParticleSystem  – GPU firefly particles
 *   • HologramMaterial – optional GLSL hologram on a mesh
 *
 * Usage:
 *   <FarmScene preset="farmScan" showFireflies particleCount={600} />
 *
 * Presets map to effectPresets.ts constants:
 *   'farmScan' | 'soilView' | 'marketChart' | 'agentAvatar' | 'splash'
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectsManager, getEffectsPreset } from '../three/EffectsManager'
import { ParticleSystem, ParticleMode } from '../three/ParticleSystem'
import { createHologramMaterial, updateHologram } from '../three/HologramMaterial'
import {
  FARM_SCAN_PRESET,
  SOIL_VIEW_PRESET,
  MARKET_CHART_PRESET,
  AGENT_AVATAR_PRESET,
  SPLASH_PRESET,
  MATERIAL_PRESETS,
} from '../three/effectPresets'

// ── Types ────────────────────────────────────────────────────────────────────

type ScenePreset = 'farmScan' | 'soilView' | 'marketChart' | 'agentAvatar' | 'splash'

const PRESETS = {
  farmScan:     FARM_SCAN_PRESET,
  soilView:     SOIL_VIEW_PRESET,
  marketChart:  MARKET_CHART_PRESET,
  agentAvatar:  AGENT_AVATAR_PRESET,
  splash:       SPLASH_PRESET,
} as const

interface FarmSceneProps {
  /** Post-processing preset to apply */
  preset?: ScenePreset
  /** Show firefly particles */
  showFireflies?: boolean
  /** Particle count (default 600) */
  particleCount?: number
  /** Particle behaviour mode */
  particleMode?: ParticleMode
  /** Show the Arjun hologram avatar sphere */
  showHologram?: boolean
  /** CSS class added to the wrapping div */
  className?: string
  /** Inline style for the wrapping div */
  style?: React.CSSProperties
}

// ── Component ────────────────────────────────────────────────────────────────

export default function FarmScene({
  preset = 'farmScan',
  showFireflies = true,
  particleCount = 600,
  particleMode = 'fireflies',
  showHologram = false,
  className = '',
  style,
}: FarmSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const W = mount.clientWidth  || window.innerWidth
    const H = mount.clientHeight || window.innerHeight

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias: false,    // FXAA handles AA via post-process
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    mount.appendChild(renderer.domElement)

    // ── Scene & Camera ────────────────────────────────────────────────────
    const scene  = new THREE.Scene()
    scene.background = new THREE.Color(0x030a02)
    scene.fog = new THREE.FogExp2(0x030a02, 0.06)

    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100)
    camera.position.set(0, 4, 10)
    camera.lookAt(0, 0, 0)

    // ── Lighting ──────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0x223300, 0.6)
    scene.add(ambient)

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2)
    sunLight.position.set(10, 20, 10)
    scene.add(sunLight)

    const fillLight = new THREE.PointLight(0x76b900, 0.8, 30)
    fillLight.position.set(-5, 5, 5)
    scene.add(fillLight)

    // ── Ground plane ──────────────────────────────────────────────────────
    const groundGeo = new THREE.PlaneGeometry(20, 20, 32, 32)
    const groundMat = new THREE.MeshPhongMaterial({
      color:             0x1a3a0a,
      emissive:          0x040e02,
      emissiveIntensity: 0.3,
      shininess:         10,
    })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    scene.add(ground)

    // ── Crop rows ─────────────────────────────────────────────────────────
    const cropMat = new THREE.MeshPhongMaterial({
      color:             MATERIAL_PRESETS.healthyCrop.color,
      emissive:          MATERIAL_PRESETS.healthyCrop.emissive,
      emissiveIntensity: MATERIAL_PRESETS.healthyCrop.emissiveIntensity,
      shininess:         MATERIAL_PRESETS.healthyCrop.shininess,
      specular:          MATERIAL_PRESETS.healthyCrop.specular,
    })

    const cropGeo = new THREE.ConeGeometry(0.12, 0.5, 5)
    for (let row = -3; row <= 3; row += 1.4) {
      for (let col = -4; col <= 4; col += 0.7) {
        const crop = new THREE.Mesh(cropGeo, cropMat)
        crop.position.set(col, 0.25, row)
        crop.rotation.y = Math.random() * Math.PI
        scene.add(crop)
      }
    }

    // ── Diseased plant (warning glow) ─────────────────────────────────────
    const diseasedMat = new THREE.MeshPhongMaterial({
      color:             MATERIAL_PRESETS.diseasedPlant.color,
      emissive:          MATERIAL_PRESETS.diseasedPlant.emissive,
      emissiveIntensity: MATERIAL_PRESETS.diseasedPlant.emissiveIntensity,
      shininess:         MATERIAL_PRESETS.diseasedPlant.shininess,
    })
    const diseased = new THREE.Mesh(cropGeo, diseasedMat)
    diseased.position.set(1.4, 0.25, 0)
    scene.add(diseased)

    // ── Scan beam ─────────────────────────────────────────────────────────
    const beamGeo = new THREE.CylinderGeometry(0.05, 0.05, 8, 8, 1, true)
    const beamMat = new THREE.MeshPhongMaterial({
      color:             MATERIAL_PRESETS.scanBeam.color,
      emissive:          MATERIAL_PRESETS.scanBeam.emissive,
      emissiveIntensity: MATERIAL_PRESETS.scanBeam.emissiveIntensity,
      transparent:       MATERIAL_PRESETS.scanBeam.transparent,
      opacity:           MATERIAL_PRESETS.scanBeam.opacity,
    })
    const beam = new THREE.Mesh(beamGeo, beamMat)
    beam.position.set(1.4, 4, 0)
    scene.add(beam)

    // ── Drone (box + rotors) ──────────────────────────────────────────────
    const droneBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.1, 0.4),
      new THREE.MeshPhongMaterial({ color: 0x222222, emissive: 0x111111, emissiveIntensity: 0.3 }),
    )
    droneBody.position.set(1.4, 5.5, 0)
    scene.add(droneBody)

    const rotorMat = new THREE.MeshPhongMaterial({
      color:             MATERIAL_PRESETS.droneRotor.color,
      emissive:          MATERIAL_PRESETS.droneRotor.emissive,
      emissiveIntensity: MATERIAL_PRESETS.droneRotor.emissiveIntensity,
      shininess:         MATERIAL_PRESETS.droneRotor.shininess,
    })
    const rotorGeo = new THREE.TorusGeometry(0.18, 0.03, 6, 20)
    const rotorOffsets = [[-0.22, 0, -0.22], [0.22, 0, -0.22], [-0.22, 0, 0.22], [0.22, 0, 0.22]]
    const rotors: THREE.Mesh[] = rotorOffsets.map(([x, y, z]) => {
      const r = new THREE.Mesh(rotorGeo, rotorMat)
      r.position.set(1.4 + x, 5.6 + y, z)
      r.rotation.x = Math.PI / 2
      scene.add(r)
      return r
    })

    // ── Hologram avatar sphere (optional) ─────────────────────────────────
    let holoMat: THREE.ShaderMaterial | null = null
    if (showHologram) {
      holoMat = createHologramMaterial(0x00ffcc)
      const holoGeo = new THREE.SphereGeometry(1.2, 32, 32)
      const holo = new THREE.Mesh(holoGeo, holoMat)
      holo.position.set(-3, 1.5, 0)
      scene.add(holo)
    }

    // ── Particles ─────────────────────────────────────────────────────────
    let particles: ParticleSystem | null = null
    if (showFireflies) {
      particles = new ParticleSystem(particleCount, particleMode)
      scene.add(particles.mesh)
    }

    // ── Post-processing ───────────────────────────────────────────────────
    const devicePreset  = getEffectsPreset(renderer)
    const selectedPreset = PRESETS[preset]
    const mergedConfig   = { ...devicePreset, ...selectedPreset }

    const effects = new EffectsManager(renderer, scene, camera, W, H, mergedConfig)

    // ── Resize handler ────────────────────────────────────────────────────
    const onResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      effects.resize(w, h)
    }
    window.addEventListener('resize', onResize)

    // ── Render loop ───────────────────────────────────────────────────────
    const clock = new THREE.Clock()
    let rafId: number

    const animate = () => {
      rafId = requestAnimationFrame(animate)
      const t  = clock.getElapsedTime()
      const dt = clock.getDelta ? clock.getDelta() : 0.016

      // Rotate rotors
      rotors.forEach(r => { r.rotation.z += 0.3 })

      // Drone hover
      droneBody.position.y = 5.5 + Math.sin(t * 1.2) * 0.2
      beam.position.y      = 4   + Math.sin(t * 1.2) * 0.2

      // Particles
      if (particles) particles.update(t)

      // Hologram
      if (holoMat) updateHologram(holoMat, dt)

      // Fill light pulse
      fillLight.intensity = 0.8 + Math.sin(t * 2) * 0.15

      // ✅ Post-processed render (replaces renderer.render(scene, camera))
      effects.render()
    }

    animate()

    // ── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      effects.dispose()
      particles?.dispose()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [preset, showFireflies, particleCount, particleMode, showHologram])

  return (
    <div
      ref={mountRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '400px',
        background: '#030a02',
        ...style,
      }}
    />
  )
}
