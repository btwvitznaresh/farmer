import * as THREE from 'three'

/**
 * Creates a hologram ShaderMaterial with:
 *   - Horizontal scan lines
 *   - Edge fresnel glow
 *   - Flicker noise
 *   - Rare horizontal glitch
 *
 * Usage:
 *   const mat = createHologramMaterial(0x00ffcc)
 *   mesh.material = mat
 *
 *   // In render loop (dt ≈ 0.016 at 60fps):
 *   mat.uniforms.time.value += dt
 */
export function createHologramMaterial(
  color: THREE.ColorRepresentation = 0x00ffcc,
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      time:    { value: 0 },
      color:   { value: new THREE.Color(color) },
      opacity: { value: 0.75 },
    },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;

      void main() {
        vUv       = uv;
        vPosition = position;
        vNormal   = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform float time;
      uniform vec3  color;
      uniform float opacity;

      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;

      void main() {
        // Horizontal scan lines scrolling upward
        float scan = sin(vPosition.y * 18.0 - time * 4.0) * 0.5 + 0.5;
        scan = pow(scan, 1.4);

        // Edge fresnel glow
        vec3  viewDir = normalize(cameraPosition - vPosition);
        float fresnel = 1.0 - max(dot(vNormal, viewDir), 0.0);
        fresnel = pow(fresnel, 2.0);

        // High-frequency flicker noise
        float flicker = 0.92
          + sin(time * 80.0) * 0.04
          + sin(time * 13.0) * 0.04;

        // Rare horizontal glitch band
        float glitch = step(0.97, sin(time * 2.3))
                     * step(0.5,  sin(vPosition.y * 5.0));

        float alpha = opacity
          * (scan * 0.6 + fresnel * 0.4)
          * flicker
          * (1.0 - glitch * 0.5);

        gl_FragColor = vec4(color + fresnel * 0.3, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
}

/**
 * Convenience helper: advance the hologram material's time uniform.
 * Call this each frame with the delta time (seconds).
 */
export function updateHologram(mat: THREE.ShaderMaterial, dt: number) {
  mat.uniforms.time.value += dt
}
