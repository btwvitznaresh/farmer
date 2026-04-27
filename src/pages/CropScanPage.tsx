import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, RefreshCw, X, Zap, History, AlertTriangle, CheckCircle2, ChevronRight, Leaf, Bug, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import {
  loadDiseaseModel,
  classifyImage,
  captureVideoFrame,
  saveScanToHistory,
  type ScanResult,
} from '@/services/cropDiseaseService';
import { getDiseaseNameInLanguage } from '@/data/diseaseLabels';
import { toast } from 'sonner';

// Lazy-load Three.js scene for background ambience
const FarmScene = lazy(() => import('@/three/FarmScene'));

// ── Severity badge ──────────────────────────────────────────────────────────
function SeverityBadge({ severity }: { severity: string }) {
  const cfg = {
    None:     { bg: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: '✅ Healthy' },
    Mild:     { bg: 'bg-yellow-100  text-yellow-700  border-yellow-200',  label: '⚠️ Mild' },
    Moderate: { bg: 'bg-orange-100  text-orange-700  border-orange-200',  label: '🟠 Moderate' },
    Severe:   { bg: 'bg-red-100     text-red-700     border-red-200',     label: '🔴 Severe' },
  }[severity] ?? { bg: 'bg-gray-100 text-gray-600 border-gray-200', label: severity };

  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border', cfg.bg)}>
      {cfg.label}
    </span>
  );
}

// ── Scan overlay (animated corner brackets) ─────────────────────────────────
function ScanOverlay({ scanning }: { scanning: boolean }) {
  const corner = 'absolute w-8 h-8 border-[#76b900]';
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative w-56 h-56">
        <div className={cn(corner, 'top-0 left-0 border-t-4 border-l-4 rounded-tl-md')} />
        <div className={cn(corner, 'top-0 right-0 border-t-4 border-r-4 rounded-tr-md')} />
        <div className={cn(corner, 'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-md')} />
        <div className={cn(corner, 'bottom-0 right-0 border-b-4 border-r-4 rounded-br-md')} />

        {/* Scanning line */}
        {scanning && (
          <div
            className="absolute left-2 right-2 h-0.5 bg-[#76b900] shadow-[0_0_8px_#76b900]"
            style={{ animation: 'scan-line 2s ease-in-out infinite' }}
          />
        )}
      </div>
    </div>
  );
}

// ── Result panel (slides up from bottom) ───────────────────────────────────
function ResultPanel({
  result,
  language,
  onRetake,
  onAskAI,
  onBookService,
}: {
  result: ScanResult;
  language: string;
  onRetake: () => void;
  onAskAI: () => void;
  onBookService: () => void;
}) {
  const { label, confidence } = result;
  const localName = getDiseaseNameInLanguage(label, language);
  const pct = Math.round(confidence * 100);

  return (
    <div
      className="absolute bottom-0 left-0 right-0 rounded-t-3xl animate-in slide-in-from-bottom duration-400"
      style={{ background: 'rgba(10,20,5,0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(118,185,0,0.2)', borderBottom: 'none' }}
    >
      {/* Handle */}
      <div className="flex justify-center pt-3 pb-2">
        <div className="w-10 h-1 rounded-full bg-white/20" />
      </div>

      <div className="px-6 pb-8 space-y-4">
        {/* Crop + disease */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-xs text-white/40 font-semibold uppercase tracking-widest mb-1">{label.crop}</p>
            <h2 className="text-xl font-black text-white leading-tight">
              {label.isHealthy ? '🌿 Healthy Plant' : label.disease}
            </h2>
            {!label.isHealthy && language !== 'en' && (
              <p className="text-sm text-white/50 mt-0.5">{localName}</p>
            )}
          </div>
          <SeverityBadge severity={label.severity} />
        </div>

        {/* Confidence bar */}
        {pct >= 60 && (
          <div>
            <div className="flex justify-between text-xs text-white/40 mb-1.5">
              <span>Confidence</span>
              <span className="font-bold" style={{ color: pct > 80 ? '#76b900' : pct > 65 ? '#facc15' : '#f97316' }}>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: pct > 80 ? '#76b900' : pct > 65 ? '#facc15' : '#f97316' }}
              />
            </div>
          </div>
        )}

        {/* Cause snippet */}
        {label.causes && (
          <p className="text-sm text-white/55 leading-relaxed">
            <span className="text-white/30 font-semibold">Cause: </span>{label.causes}
          </p>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={onAskAI}
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95"
            style={{ background: 'rgba(118,185,0,0.15)', border: '1px solid rgba(118,185,0,0.35)', color: '#76b900' }}
          >
            <Leaf size={16} />
            Ask Arjun AI
          </button>

          <button
            onClick={onBookService}
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', color: '#818cf8' }}
          >
            <Bug size={16} />
            Book Inspection
          </button>
        </div>

        {/* Retake */}
        <button
          onClick={onRetake}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white/40 text-sm font-semibold transition-all hover:text-white/70 active:scale-95"
        >
          <RefreshCw size={14} />
          Scan Again
        </button>
      </div>
    </div>
  );
}

// ── Main CropScanPage ───────────────────────────────────────────────────────
export default function CropScanPage() {
  const navigate = useNavigate();
  const { language } = useApp();

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [lowConfidence, setLowConfidence] = useState(false);
  const [modelReady, setModelReady] = useState(false);

  // Pre-load model
  useEffect(() => {
    loadDiseaseModel().then(m => { if (m) setModelReady(true); });
  }, []);

  // Camera init
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current!.play();
          setCameraReady(true);
        };
      }
    } catch (e) {
      toast.error('Camera access denied. Please allow camera permission.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  const handleScan = useCallback(async () => {
    if (!videoRef.current || !cameraReady || scanning) return;

    setScanning(true);
    setResult(null);
    setLowConfidence(false);

    try {
      const canvas = captureVideoFrame(videoRef.current);
      let scanResult = await classifyImage(canvas);

      if (!scanResult) {
        // Fallback: use backend vision API
        canvas.toBlob(async (blob) => {
          if (!blob) { setScanning(false); return; }
          try {
            const form = new FormData();
            form.append('image', blob, 'scan.jpg');
            const res = await fetch('http://localhost:3001/analyze-image', { method: 'POST', body: form });
            const data = await res.json();
            if (data.success && data.data) {
              // Map backend response to a pseudo ScanResult
              toast.info('Used cloud analysis (model not loaded)');
            }
          } catch { }
          setScanning(false);
        }, 'image/jpeg', 0.85);
        return;
      }

      if (scanResult.confidence < 0.60) {
        setLowConfidence(true);
        setScanning(false);
        return;
      }

      // Save to history
      const thumbnail = captureVideoFrame(videoRef.current);
      saveScanToHistory({
        id: `scan_${Date.now()}`,
        timestamp: Date.now(),
        cropName: scanResult.label.crop,
        diseaseName: scanResult.label.disease,
        severity: scanResult.label.severity,
        confidence: scanResult.confidence,
        isHealthy: scanResult.label.isHealthy,
        imageDataUrl: thumbnail.toDataURL('image/jpeg', 0.4),
        language,
      });

      setResult(scanResult);
    } catch (e) {
      console.error('[Scan] Error:', e);
      toast.error('Scan failed. Please try again.');
    } finally {
      setScanning(false);
    }
  }, [cameraReady, scanning, language]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setResult(null);
    setLowConfidence(false);

    try {
      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => { img.onload = resolve; });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);

      let scanResult = await classifyImage(canvas);

      if (!scanResult) {
        // Fallback: use backend vision API
        const form = new FormData();
        form.append('image', file, 'scan.jpg');
        const res = await fetch('http://localhost:3001/analyze-image', { method: 'POST', body: form });
        const data = await res.json();
        if (data.success && data.data) {
          toast.info('Used cloud analysis (model not loaded)');
        }
        setScanning(false);
        return;
      }

      if (scanResult.confidence < 0.60) {
        setLowConfidence(true);
        setScanning(false);
        return;
      }

      // Save to history
      saveScanToHistory({
        id: `scan_${Date.now()}`,
        timestamp: Date.now(),
        cropName: scanResult.label.crop,
        diseaseName: scanResult.label.disease,
        severity: scanResult.label.severity,
        confidence: scanResult.confidence,
        isHealthy: scanResult.label.isHealthy,
        imageDataUrl: canvas.toDataURL('image/jpeg', 0.4),
        language,
      });

      setResult(scanResult);
    } catch (e) {
      console.error('[Upload] Error:', e);
      toast.error('Image analysis failed. Please try again.');
    } finally {
      setScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRetake = () => {
    setResult(null);
    setLowConfidence(false);
  };

  const handleAskAI = () => {
    if (!result) return;
    const { label, confidence } = result;
    const msg = `My ${label.crop} has been detected with ${label.isHealthy ? 'no disease — it looks healthy' : label.disease} at ${label.severity} severity. Confidence: ${Math.round(confidence * 100)}%. Please tell me what is causing this, how serious it is, what I should do immediately, and what treatment to use.`;
    // Store the pre-filled message and navigate to home (chat)
    sessionStorage.setItem('arjun_prefill', msg);
    navigate('/call-agent');
  };

  const handleBookService = () => {
    if (!result) return;
    const { label } = result;
    sessionStorage.setItem('service_prefill_disease', label.disease);
    sessionStorage.setItem('service_prefill_severity', label.severity);
    navigate('/services');
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Farm scene background (visible behind camera + during loading) */}
      <Suspense fallback={null}>
        <FarmScene
          preset="farmScan"
          showFireflies={true}
          particleCount={300}
          particleMode="fireflies"
          showHologram={false}
          className="absolute inset-0 z-0"
          style={{ opacity: 0.35 }}
        />
      </Suspense>

      {/* Camera feed */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover z-[1]"
        playsInline
        muted
      />

      {/* Dark vignette overlay */}
      <div className="absolute inset-0 pointer-events-none z-[2]"
        style={{ background: 'radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.6) 100%)' }} />

      {/* Scan frame overlay */}
      {!result && <ScanOverlay scanning={scanning} />}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 pt-12 pb-4"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }}>
        <button onClick={() => navigate('/')}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.12)' }}>
          <X size={18} className="text-white" />
        </button>

        <div className="flex flex-col items-center">
          <p className="text-white font-bold text-sm">Crop Disease Scan</p>
          <p className="text-white/40 text-xs">
            {!result && !scanning && 'Point camera at a leaf'}
            {scanning && 'Analyzing...'}
            {result && (result.label.isHealthy ? 'Plant looks healthy!' : 'Disease detected')}
          </p>
        </div>

        <button onClick={() => navigate('/scan-history')}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.12)' }}>
          <History size={18} className="text-white" />
        </button>
      </div>

      {/* Model status pill */}
      <div className="absolute top-28 left-0 right-0 flex justify-center z-10 pointer-events-none">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: modelReady ? '#76b900' : '#ffffff60' }}>
          <div className={cn('w-1.5 h-1.5 rounded-full', modelReady ? 'bg-[#76b900] animate-pulse' : 'bg-white/30')} />
          {modelReady ? 'AI Ready — Offline' : 'Using Cloud Analysis'}
        </div>
      </div>

      {/* Low confidence feedback */}
      {lowConfidence && !result && (
        <div className="absolute inset-x-6 bottom-40 z-20">
          <div className="flex items-start gap-3 p-4 rounded-2xl"
            style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)' }}>
            <AlertTriangle size={18} className="text-orange-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-orange-300 font-bold text-sm">Unclear Image</p>
              <p className="text-orange-300/70 text-xs mt-0.5">Move closer to the leaf and try in better light.</p>
            </div>
          </div>
        </div>
      )}

      {/* Capture and Upload buttons — shown when no result */}
      {!result && (
        <div className="absolute bottom-16 left-0 right-0 flex justify-center z-20 items-end gap-8">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={scanning}
            className="flex flex-col items-center transition-all active:scale-95 disabled:opacity-50 mb-2"
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white/10 border border-white/20 backdrop-blur-md">
              <Upload size={24} className="text-white" />
            </div>
            <p className="text-center text-white/50 text-xs mt-2 font-semibold">
              Upload
            </p>
          </button>

          <button
            onClick={handleScan}
            disabled={!cameraReady || scanning}
            className="relative transition-all active:scale-95 disabled:opacity-50"
          >
            {/* Outer ring */}
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ border: '3px solid rgba(118,185,0,0.5)', boxShadow: '0 0 24px rgba(118,185,0,0.25)' }}>
              {/* Inner circle */}
              <div
                className={cn('w-14 h-14 rounded-full flex items-center justify-center transition-all', scanning && 'animate-pulse')}
                style={{ background: scanning ? 'rgba(118,185,0,0.4)' : '#76b900', boxShadow: '0 0 16px rgba(118,185,0,0.4)' }}>
                {scanning
                  ? <Zap size={24} className="text-white" />
                  : <Camera size={24} className="text-white" />
                }
              </div>
            </div>
            <p className="text-center text-white/50 text-xs mt-2 font-semibold">
              {scanning ? 'Scanning...' : 'Tap to Scan'}
            </p>
          </button>
          
          {/* Spacer to balance layout */}
          <div className="w-14 h-14 mb-2 opacity-0 pointer-events-none" />
        </div>
      )}

      {/* Result panel */}
      {result && (
        <ResultPanel
          result={result}
          language={language}
          onRetake={handleRetake}
          onAskAI={handleAskAI}
          onBookService={handleBookService}
        />
      )}

      {/* CSS */}
      <style>{`
        @keyframes scan-line {
          0% { top: 10%; opacity: 1; }
          50% { top: 85%; opacity: 0.6; }
          100% { top: 10%; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
