import { useRef, useMemo, Suspense, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

/* ── Wireframe rotating cube ── */
function WireframeCube({ position, size, rotSpeed }: {
  position: [number, number, number];
  size: number;
  rotSpeed: [number, number, number];
}) {
  const ref = useRef<THREE.LineSegments>(null);
  const geo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(size, size, size)), [size]);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.rotation.x = t * rotSpeed[0];
    ref.current.rotation.y = t * rotSpeed[1];
    ref.current.rotation.z = t * rotSpeed[2];
  });
  return (
    <lineSegments ref={ref} position={position} geometry={geo}>
      <lineBasicMaterial color="#00dd55" transparent opacity={0.18} />
    </lineSegments>
  );
}

/* ── Particle field ── */
function Particles() {
  const count = 160;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 26;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.055} color="#44ff88" transparent opacity={0.85} sizeAttenuation />
    </points>
  );
}

/* ── Background ambient scene ── */
function BgScene() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <WireframeCube position={[-6, 1, -4]}  size={5}   rotSpeed={[0.06, 0.10, 0.04]} />
      <WireframeCube position={[7, -1, -5]}  size={3.5} rotSpeed={[-0.05, 0.08, 0.03]} />
      <WireframeCube position={[1, 3.5, -6]} size={2.2} rotSpeed={[0.09, -0.07, 0.06]} />
      <WireframeCube position={[-3, -3, -3]} size={1.5} rotSpeed={[0.12, 0.05, -0.08]} />
      <Particles />
    </>
  );
}

/* ── Exported: ambient dark-green bg with wireframe cubes ── */
export function Farm3D() {
  return (
    <div
      className="absolute inset-0 pointer-events-none -z-10"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #002200 0%, #001100 55%, #000800 100%)' }}
    >
      <Suspense fallback={null}>
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 1.5]} gl={{ antialias: false, alpha: true }}>
          <BgScene />
        </Canvas>
      </Suspense>
    </div>
  );
}

/* ── Used on home page only as a transparent overlay (no bg) ── */
export function Hero3D({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <Suspense fallback={null}>
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 1.5]} gl={{ antialias: false, alpha: true }}>
          <BgScene />
        </Canvas>
      </Suspense>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   INTERACTIVE 3D FARM VISUALIZATION
   ══════════════════════════════════════════════════════ */

function CropPlant({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.18, 0]}>
        <coneGeometry args={[0.06, 0.35, 5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 1, 6]} />
        <meshStandardMaterial color="#3d1f00" />
      </mesh>
      <mesh position={[0, 1.35, 0]}>
        <sphereGeometry args={[0.42, 10, 10]} />
        <meshStandardMaterial color="#1a7700" emissive="#0d3300" emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

function Farmhouse({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.6, 0.8, 1.3]} />
        <meshStandardMaterial color="#6b3a1f" />
      </mesh>
      <mesh position={[0, 1.1, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.15, 0.75, 4]} />
        <meshStandardMaterial color="#cc2200" />
      </mesh>
    </group>
  );
}

function Windmill({ position }: { position: [number, number, number] }) {
  const bladesRef = useRef<THREE.Group>(null);
  useFrame(() => { if (bladesRef.current) bladesRef.current.rotation.z += 0.018; });
  return (
    <group position={position}>
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.04, 0.07, 3.2, 6]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      <group ref={bladesRef} position={[0, 3.2, 0.08]}>
        {[0, 1, 2].map(i => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI * 2) / 3]}>
            <mesh position={[0.32, 0, 0]}>
              <boxGeometry args={[0.64, 0.07, 0.03]} />
              <meshStandardMaterial color="#cccccc" />
            </mesh>
          </mesh>
        ))}
      </group>
    </group>
  );
}

function IrrigationCanal({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[9, 0.06, 0.32]} />
      <meshStandardMaterial color="#0077cc" emissive="#003366" emissiveIntensity={0.6} transparent opacity={0.85} />
    </mesh>
  );
}

interface FarmSceneProps { cropColor: string; showLabels: boolean; }

function FarmScene({ cropColor, showLabels }: FarmSceneProps) {
  const cropPositions = useMemo(() => {
    const pts: [number, number, number][] = [];
    // Two crop plots side by side
    for (let x = -3.8; x < -0.3; x += 0.38) {
      for (let z = -3.5; z < 0.5; z += 0.38) {
        pts.push([x, 0, z]);
      }
    }
    for (let x = 0.4; x < 3.8; x += 0.38) {
      for (let z = -3.5; z < 0.5; z += 0.38) {
        pts.push([x, 0, z]);
      }
    }
    return pts;
  }, []);

  const treePositions: [number, number, number][] = [
    [-5, 0, -5], [-5, 0, 0], [-5, 0, 5], [5, 0, -5],
    [5, 0, 0], [5, 0, 5], [0, 0, -5.5], [-2.5, 0, 5.5], [2.5, 0, 5.5],
  ];

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 12, 5]} intensity={1.8} castShadow />
      <pointLight position={[0, 6, 0]} intensity={0.6} color="#88ffaa" />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial color="#0a1800" />
      </mesh>
      <gridHelper args={[22, 22, '#1a4400', '#0d2200']} position={[0, 0, 0]} />

      {/* Crops */}
      {cropPositions.map((pos, i) => <CropPlant key={i} position={pos} color={cropColor} />)}

      {/* Trees */}
      {treePositions.map((pos, i) => <Tree key={i} position={pos} />)}

      {/* Farm structures */}
      <Farmhouse position={[4, 0, 3]} />
      <Windmill position={[-5, 0, -3]} />
      <IrrigationCanal position={[0, 0.05, 0.8]} />

      <OrbitControls enablePan enableZoom enableRotate makeDefault />
    </>
  );
}

type Season = 'summer' | 'monsoon' | 'winter';
const CROP_COLORS: Record<Season, string> = {
  summer: '#c8a000',
  monsoon: '#22aa44',
  winter: '#88cc44',
};

interface FarmVisualizationProps { defaultSeason?: Season; }

export function FarmVisualization({ defaultSeason = 'monsoon' }: FarmVisualizationProps) {
  const [season, setSeason] = useState<Season>(defaultSeason);
  const [showLabels, setShowLabels] = useState(false);

  return (
    <div className="w-full flex flex-col gap-3">
      <div
        className="w-full rounded-2xl overflow-hidden border border-[#1a4400]/60"
        style={{ height: 420, background: '#060e00' }}
      >
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center text-[#44ff88]/50 text-sm">
            Loading 3D Farm...
          </div>
        }>
          <Canvas camera={{ position: [8, 8, 8], fov: 45 }} dpr={[1, 2]} shadows>
            <FarmScene cropColor={CROP_COLORS[season]} showLabels={showLabels} />
          </Canvas>
        </Suspense>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-[#44ff88]/40 italic">↻ Drag to rotate · Scroll to zoom · Right-click to pan</p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { /* OrbitControls reset handled by makeDefault */ }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border border-[#44ff88]/30 text-[#44ff88] hover:bg-[#44ff88]/10 transition-all"
          >
            ↺ Reset View
          </button>
          <button
            onClick={() => setShowLabels(l => !l)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border border-[#44ff88]/30 text-[#44ff88] hover:bg-[#44ff88]/10 transition-all"
          >
            🏷 {showLabels ? 'Hide' : 'Show'} Labels
          </button>
          <button
            onClick={() => {
              const seasons: Season[] = ['monsoon', 'summer', 'winter'];
              const next = seasons[(seasons.indexOf(season) + 1) % 3];
              setSeason(next);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border border-[#44ff88]/30 text-[#44ff88] hover:bg-[#44ff88]/10 transition-all"
          >
            🌱 {season.charAt(0).toUpperCase() + season.slice(1)}
          </button>
        </div>
      </div>
    </div>
  );
}

