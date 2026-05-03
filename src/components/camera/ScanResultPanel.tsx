import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MessageSquare, Wrench, ChevronRight, AlertTriangle, CheckCircle, Info, FileText } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface ScanResultPanelProps {
  result: any;
  onClose: () => void;
  onAskAI: () => void;
  onBookService: () => void;
}

export function ScanResultPanel({ result, onClose, onAskAI, onBookService }: ScanResultPanelProps) {
  const { language } = useApp();
  const navigate = useNavigate();

  // Get translated names
  const trans = result.translations[language] || result.translations.en || { crop: result.crop, disease: result.disease };
  const cropName = trans.crop;
  const diseaseName = trans.disease;

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'severe':
        return <span className="bg-red-100 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1"><AlertTriangle size={12} /> Severe</span>;
      case 'moderate':
        return <span className="bg-yellow-100 text-yellow-700 border border-yellow-200 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1"><Info size={12} /> Moderate</span>;
      case 'mild':
        return <span className="bg-green-100 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1"><CheckCircle size={12} /> Mild</span>;
      default:
        return null;
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] animate-in slide-in-from-bottom-full duration-300 z-50">
      <div className="p-6">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5" />
        
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">{cropName}</p>
            <h2 className="text-2xl font-black text-foreground leading-tight">{diseaseName}</h2>
          </div>
          {getSeverityBadge(result.severity)}
        </div>

        <div className="bg-slate-50 border border-border rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">AI Confidence</p>
            <p className="text-lg font-black text-primary">94.2%</p>
          </div>
          <div className="h-10 w-px bg-border mx-4" />
          <div className="flex-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">Detection Time</p>
            <p className="text-sm font-bold text-foreground text-right mt-1">280ms (On-Device)</p>
          </div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={() => navigate(`/disease-report/${result.id}`)}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            <FileText size={18} /> View Full Report
          </button>
          
          <button 
            onClick={onAskAI}
            className="w-full bg-slate-100 text-slate-800 py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <MessageSquare size={18} /> Ask AI About This
          </button>
          
          <button 
            onClick={onBookService}
            className="w-full bg-white text-slate-800 border border-slate-200 py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Wrench size={18} /> Book Inspection Service
          </button>
        </div>
      </div>
    </div>
  );
}
