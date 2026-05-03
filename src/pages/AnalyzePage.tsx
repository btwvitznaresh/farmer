import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, History, Zap, Leaf } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { ScanResultPanel } from '@/components/camera/ScanResultPanel';
import diseaseData from '@/data/disease_advice.json';

export default function AnalyzePage() {
  const navigate = useNavigate();
  const { language, setChatMessages, setIsChatMode } = useApp();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);

  // Initialize camera
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      // Mock mode fallback if no camera
      setIsCameraActive(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleCapture = () => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    
    // Simulate TFLite inference time (e.g. MobileNetV2 usually takes ~200-400ms on mobile web)
    setTimeout(() => {
      // Pick a random disease from our dataset to simulate detection
      const diseases = diseaseData.diseases;
      const randomResult = diseases[Math.floor(Math.random() * diseases.length)];
      
      setScanResult(randomResult);
      setIsAnalyzing(false);
    }, 1500); // Extended slightly for UX "processing" feel
  };

  const handleAskAI = () => {
    stopCamera();
    const trans = scanResult.translations[language] || scanResult.translations.en || { crop: scanResult.crop, disease: scanResult.disease };
    
    setChatMessages(prev => [...prev, {
      id: `scan_ctx_${Date.now()}`,
      role: 'user',
      content: `My ${trans.crop} has been detected with ${trans.disease} at ${scanResult.severity} severity. Confidence: 94.2%.\n\nPlease tell me:\n1. What is causing this?\n2. How serious is it?\n3. What should I do immediately?\n4. What spray or treatment should I use?\n5. How to prevent it next season?`,
      timestamp: new Date()
    }]);
    
    setIsChatMode(true);
    navigate('/');
  };

  const handleBookService = () => {
    stopCamera();
    // Navigate to services page (ideally passing the disease context in state/params)
    navigate('/services');
  };

  const resetScanner = () => {
    setScanResult(null);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden">
      
      {/* Top Bar */}
      <div className="absolute top-0 inset-x-0 p-5 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent pt-12 lg:pt-5">
        <button 
          onClick={() => { stopCamera(); navigate(-1); }}
          className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white"
        >
          <X size={20} />
        </button>
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full">
          <Leaf size={14} className="text-primary" />
          <span className="text-xs font-bold text-white uppercase tracking-widest">Point at a leaf</span>
        </div>
        <button 
          onClick={() => navigate('/history')}
          className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white"
        >
          <History size={20} />
        </button>
      </div>

      {/* Video Viewfinder */}
      <div className="relative flex-1 bg-zinc-900 w-full h-full">
        {isCameraActive ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/50 text-sm">Initializing camera...</p>
          </div>
        )}

        {/* Animated Scan Frame */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80">
            {/* Brackets */}
            <div className={`absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 rounded-tl-2xl transition-colors duration-300 ${scanResult ? 'border-primary' : 'border-white/70'}`} />
            <div className={`absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 rounded-tr-2xl transition-colors duration-300 ${scanResult ? 'border-primary' : 'border-white/70'}`} />
            <div className={`absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 rounded-bl-2xl transition-colors duration-300 ${scanResult ? 'border-primary' : 'border-white/70'}`} />
            <div className={`absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 rounded-br-2xl transition-colors duration-300 ${scanResult ? 'border-primary' : 'border-white/70'}`} />
            
            {/* Scanning Line (Only when active and not showing result) */}
            {!scanResult && (
              <div className="absolute left-0 right-0 h-0.5 bg-primary/80 shadow-[0_0_15px_rgba(118,185,0,0.8)] animate-scanline" />
            )}
            
            {/* Processing Overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center rounded-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-3" />
                  <p className="text-white font-bold tracking-widest text-xs uppercase animate-pulse">Running ML Model</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Capture Button Container */}
      {!scanResult && (
        <div className="absolute bottom-10 inset-x-0 flex justify-center z-20">
          <button 
            onClick={handleCapture}
            disabled={isAnalyzing}
            className="w-20 h-20 rounded-full border-4 border-white/50 flex items-center justify-center active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-primary/50"
          >
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
              <Zap size={24} className="text-black" />
            </div>
          </button>
        </div>
      )}

      {/* Scan Result Panel */}
      {scanResult && (
        <ScanResultPanel 
          result={scanResult} 
          onClose={resetScanner} 
          onAskAI={handleAskAI}
          onBookService={handleBookService}
        />
      )}

      {/* Retake Button when result is shown */}
      {scanResult && (
        <div className="absolute top-5 left-5 z-50 pt-12 lg:pt-0">
          <button 
            onClick={resetScanner}
            className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-bold uppercase tracking-widest active:scale-95 transition-transform"
          >
            Retake
          </button>
        </div>
      )}
    </div>
  );
}
