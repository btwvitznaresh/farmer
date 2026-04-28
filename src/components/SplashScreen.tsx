import { useEffect, useRef, useState, lazy, Suspense } from 'react';

// Lazy-load Three.js 3D scene for premium splash background
const FarmScene = lazy(() => import('@/three/FarmScene'));

/* ──────────────────────────────────────────────────────
   AgroTalk 3D Splash Screen
   Inspired by modern 3D intro animations (Pinterest ref)
   Colour palette: deep black-green → neon #76b900 green
────────────────────────────────────────────────────── */

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  opacity: number;
  color: string;
}

const GREENS = ['#3aff6a', '#2be75c', '#35f866', '#1fd04d', '#4caf50'];

function useParticleCanvas(active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Spawn particles
    particles.current = Array.from({ length: 120 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      z: Math.random() * 400 + 100,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      vz: (Math.random() - 0.5) * 0.6,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.6 + 0.2,
      color: GREENS[Math.floor(Math.random() * GREENS.length)],
    }));

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const fov = 300;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        if (p.z < 50) p.z = 500;
        if (p.z > 600) p.z = 60;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const scale = fov / p.z;
        const sx = (p.x - cx) * scale + cx;
        const sy = (p.y - cy) * scale + cy;
        const r = p.size * scale;
        const alpha = p.opacity * (fov / p.z) * 0.8;

        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(0.3, r), 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [active]);

  return canvasRef;
}

/* ── Inline SVG logo (uses our /public/logo.svg) ── */
function AgroTalkLogo({ size = 80 }: { size?: number }) {
  return (
    <img
      src="/logo.svg"
      alt="AgroTalk"
      width={size}
      height={size}
      style={{ filter: 'drop-shadow(0 0 18px rgba(118,185,0,0.8))' }}
    />
  );
}

/* ── 3D rotating leaf geometry (pure CSS) ── */
function Cube3D() {
  return (
    <div className="splash-cube-scene">
      <div className="splash-cube">
        <div className="splash-cube__face splash-cube__face--front" />
        <div className="splash-cube__face splash-cube__face--back" />
        <div className="splash-cube__face splash-cube__face--right" />
        <div className="splash-cube__face splash-cube__face--left" />
        <div className="splash-cube__face splash-cube__face--top" />
        <div className="splash-cube__face splash-cube__face--bottom" />
      </div>
    </div>
  );
}

/* ── Main splash ── */
interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<'in' | 'logo' | 'text' | 'out'>('in');
  const canvasRef = useParticleCanvas(true);

  useEffect(() => {
    // Phase timeline
    const t1 = setTimeout(() => setPhase('logo'), 400);
    const t2 = setTimeout(() => setPhase('text'), 1200);
    const t3 = setTimeout(() => setPhase('out'), 2800);
    const t4 = setTimeout(() => onComplete(), 3500);
    return () => { [t1, t2, t3, t4].forEach(clearTimeout); };
  }, [onComplete]);

  return (
    <div
      className="splash-root"
      style={{ opacity: phase === 'out' ? 0 : 1, transition: phase === 'out' ? 'opacity 0.7s cubic-bezier(0.4,0,0.2,1)' : 'none' }}
    >
      {/* 3D WebGL background scene (lowest layer) */}
      <Suspense fallback={null}>
        <FarmScene
          preset="splash"
          showFireflies={true}
          particleCount={400}
          particleMode="pollen"
          showHologram={false}
          className="absolute inset-0 z-0"
          style={{ opacity: 0.4 }}
        />
      </Suspense>

      {/* Particle canvas (2D overlay on top of 3D) */}
      <canvas ref={canvasRef} className="splash-canvas" style={{ position: 'absolute', zIndex: 1 }} />

      {/* Gradient BG */}
      <div className="splash-bg" style={{ zIndex: 2 }} />

      {/* Animated grid lines */}
      <div className="splash-grid" />

      {/* Glowing orbs */}
      <div className="splash-orb splash-orb-1" />
      <div className="splash-orb splash-orb-2" />
      <div className="splash-orb splash-orb-3" />

      {/* Center content */}
      <div className="splash-center">
        {/* Cube behind logo */}
        <div className="splash-cube-behind">
          <Cube3D />
        </div>

        {/* Ring pulse */}
        <div className="splash-ring splash-ring-1" />
        <div className="splash-ring splash-ring-2" />
        <div className="splash-ring splash-ring-3" />

        {/* Logo */}
        <div
          className="splash-logo-wrap"
          style={{
            transform: phase === 'in' ? 'scale(0.2) translateY(40px)' : 'scale(1) translateY(0)',
            opacity: phase === 'in' ? 0 : 1,
            transition: 'all 0.7s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          <AgroTalkLogo size={96} />
        </div>

        {/* Text reveal */}
        <div
          className="splash-text-wrap"
          style={{
            opacity: phase === 'text' || phase === 'out' ? 1 : 0,
            transform: phase === 'text' || phase === 'out' ? 'translateY(0)' : 'translateY(16px)',
            transition: 'all 0.55s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <h1 className="splash-title">
            {'AgroTalk'.split('').map((ch, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  animation: `splash-letter 0.5s ${0.05 * i}s both`,
                }}
              >
                {ch}
              </span>
            ))}
          </h1>
          <p className="splash-subtitle">AI Assistant for Farmers</p>

          {/* Loading bar */}
          <div className="splash-bar-bg">
            <div
              className="splash-bar-fill"
              style={{ animation: 'splash-bar-grow 1.8s 1.2s both cubic-bezier(0.4,0,0.2,1)' }}
            />
          </div>
        </div>
      </div>

      <style>{`
        .splash-root {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #020a02;
        }
        .splash-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .splash-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 50% at 50% 50%, rgba(118,185,0,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 100% 80% at 50% 100%, rgba(30,60,0,0.5) 0%, transparent 60%);
        }
        /* Perspective grid */
        .splash-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(58,255,106,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(58,255,106,0.06) 1px, transparent 1px);
          background-size: 60px 60px;
          transform: perspective(600px) rotateX(55deg) translateY(30%);
          transform-origin: center bottom;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 100%, black, transparent);
        }
        /* Glowing orbs */
        .splash-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
        }
        .splash-orb-1 {
          width: 400px; height: 400px;
          background: rgba(58,255,106,0.12);
          top: -100px; left: -100px;
          animation: orb-float 7s ease-in-out infinite;
        }
        .splash-orb-2 {
          width: 300px; height: 300px;
          background: rgba(58,255,106,0.10);
          bottom: -80px; right: -80px;
          animation: orb-float 9s 2s ease-in-out infinite reverse;
        }
        .splash-orb-3 {
          width: 200px; height: 200px;
          background: rgba(58,255,106,0.15);
          top: 40%; right: 15%;
          animation: orb-float 6s 1s ease-in-out infinite;
        }
        @keyframes orb-float {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-30px) scale(1.1); }
        }

        /* ── 3D cube ── */
        .splash-cube-behind {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 0;
          opacity: 0.85;
          transform: translateY(-6px);
        }
        .splash-cube-scene {
          width: 260px; height: 260px;
          perspective: 800px;
        }
        .splash-cube {
          width: 100%; height: 100%;
          position: relative;
          transform-style: preserve-3d;
          animation: cube-spin 12s linear infinite;
        }
        @keyframes cube-spin {
          0%   { transform: rotateX(20deg) rotateY(0deg)   rotateZ(5deg); }
          100% { transform: rotateX(20deg) rotateY(360deg) rotateZ(5deg); }
        }
        .splash-cube__face {
          position: absolute;
          width: 260px; height: 260px;
          border: 1.5px solid rgba(58,255,106,0.18);
          background: rgba(58,255,106,0.025);
          backdrop-filter: blur(2px);
        }
        .splash-cube__face--front  { transform: rotateY(  0deg) translateZ(130px); }
        .splash-cube__face--back   { transform: rotateY(180deg) translateZ(130px); }
        .splash-cube__face--right  { transform: rotateY( 90deg) translateZ(130px); }
        .splash-cube__face--left   { transform: rotateY(-90deg) translateZ(130px); }
        .splash-cube__face--top    { transform: rotateX( 90deg) translateZ(130px); }
        .splash-cube__face--bottom { transform: rotateX(-90deg) translateZ(130px); }

        /* ── Center ── */
        .splash-center {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }

        /* Pulse rings */
        .splash-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(58,255,106,0.3);
          pointer-events: none;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1;
        }
        .splash-ring-1 { width: 140px; height: 140px; animation: ring-pulse 2.5s 0.0s ease-out infinite; }
        .splash-ring-2 { width: 180px; height: 180px; animation: ring-pulse 2.5s 0.5s ease-out infinite; }
        .splash-ring-3 { width: 220px; height: 220px; animation: ring-pulse 2.5s 1.0s ease-out infinite; }
        @keyframes ring-pulse {
          0%   { opacity: 0.8; transform: translate(-50%,-50%) scale(0.8); }
          100% { opacity: 0;   transform: translate(-50%,-50%) scale(1.5); }
        }

        .splash-logo-wrap {
          position: relative;
          z-index: 2;
          width: 96px; height: 96px;
          display: flex; align-items: center; justify-content: center;
        }

        /* Text */
        .splash-text-wrap {
          text-align: center;
          margin-top: 20px;
        }
        .splash-title {
          font-family: 'Inter', 'SF Pro Display', system-ui, sans-serif;
          font-size: 2.6rem;
          font-weight: 900;
          letter-spacing: 0.04em;
          color: #fff;
          text-shadow: 0 0 32px rgba(58,255,106,0.5), 0 0 8px rgba(58,255,106,0.3);
          margin: 0;
          line-height: 1;
        }
        .splash-title span { display: inline-block; }
        @keyframes splash-letter {
          from { opacity: 0; transform: translateY(18px) scale(0.8); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .splash-subtitle {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          color: #3aff6a;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin: 8px 0 0;
          position: relative;
          font-family: 'SF Mono', 'Courier New', monospace;
          

        }

        /* Loading bar */
        .splash-bar-bg {
          width: 160px;
          height: 2px;
          background: rgba(255,255,255,0.08);
          border-radius: 99px;
          margin: 18px auto 0;
          overflow: hidden;
        }
        .splash-bar-fill {
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, #4caf50, #76b900, #a3d900);
          border-radius: 99px;
          box-shadow: 0 0 8px #76b900;
        }
        @keyframes splash-bar-grow {
          0%   { width: 0%; }
          60%  { width: 85%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
