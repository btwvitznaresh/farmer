import type { EffectsConfig } from './EffectsManager'

/**
 * Drone scan view — cinematic, focused, with motion trails.
 * Use when the drone is actively scanning fields.
 */
export const FARM_SCAN_PRESET: Partial<EffectsConfig> = {
  bloom: true,
  bloomStrength: 1.4,
  bloomRadius: 0.45,
  bloomThreshold: 0.78,
  motionTrails: true,
  trailDamp: 0.88,
  depthOfField: true,
  focusDistance: 6,
  aperture: 0.025,
  filmGrain: true,
  antiAlias: true,
}

/**
 * Underground / soil analysis view — moody, subtle glow.
 */
export const SOIL_VIEW_PRESET: Partial<EffectsConfig> = {
  bloom: true,
  bloomStrength: 0.9,
  bloomRadius: 0.3,
  bloomThreshold: 0.85,
  motionTrails: false,
  depthOfField: false,
  filmGrain: true,
  antiAlias: true,
}

/**
 * Market price data-viz — bright, clean, no grain.
 * High bloom to make chart lines pop.
 */
export const MARKET_CHART_PRESET: Partial<EffectsConfig> = {
  bloom: true,
  bloomStrength: 1.8,
  bloomRadius: 0.5,
  bloomThreshold: 0.7,
  motionTrails: false,
  depthOfField: false,
  filmGrain: false,
  antiAlias: true,
}

/**
 * Arjun AI avatar hologram — sci-fi maximum bloom.
 * Pair with HologramMaterial for full effect.
 */
export const AGENT_AVATAR_PRESET: Partial<EffectsConfig> = {
  bloom: true,
  bloomStrength: 2.0,
  bloomRadius: 0.6,
  bloomThreshold: 0.65,
  motionTrails: false,
  depthOfField: false,
  filmGrain: false,
  antiAlias: true,
}

/**
 * Splash / loading screen — balanced, visually impressive.
 */
export const SPLASH_PRESET: Partial<EffectsConfig> = {
  bloom: true,
  bloomStrength: 1.2,
  bloomRadius: 0.4,
  bloomThreshold: 0.8,
  motionTrails: false,
  depthOfField: false,
  filmGrain: false,
  antiAlias: true,
}

/**
 * Bloom-ready emissive materials for common AgroTalk objects.
 * Import these values when constructing MeshPhongMaterial.
 */
export const MATERIAL_PRESETS = {
  /** Healthy crop rows */
  healthyCrop: {
    color:             0x2d6b0a,
    emissive:          0x0d2200,
    emissiveIntensity: 0.4,
    shininess:         60,
    specular:          0x224400,
  },
  /** Drone rotors — bright blue glow */
  droneRotor: {
    color:             0x0088ff,
    emissive:          0x003366,
    emissiveIntensity: 0.9,
    shininess:         200,
  },
  /** Diseased plant — red warning glow */
  diseasedPlant: {
    color:             0xc0392b,
    emissive:          0x3a0000,
    emissiveIntensity: 0.6,
    shininess:         30,
  },
  /** Scan beam overlay — pure emissive = maximum bloom */
  scanBeam: {
    color:             0x00ffaa,
    emissive:          0x00ffaa,
    emissiveIntensity: 1.0,
    transparent:       true,
    opacity:           0.15,
  },
} as const
