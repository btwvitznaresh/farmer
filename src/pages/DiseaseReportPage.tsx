import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Download, AlertTriangle, Info, CheckCircle, ArrowRight, MessageSquare, Wrench, ShieldCheck, Zap } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import diseaseData from '@/data/disease_advice.json';

export default function DiseaseReportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, setChatMessages, setIsChatMode } = useApp();
  
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    // In a real app we'd fetch this from IDB/backend
    // For now, load from JSON by ID
    const found = diseaseData.diseases.find(d => d.id === id);
    if (found) setReport(found);
    else if (diseaseData.diseases.length > 0) setReport(diseaseData.diseases[0]); // fallback
  }, [id]);

  if (!report) {
    return <div className="flex items-center justify-center h-screen">Loading report...</div>;
  }

  const trans = report.translations[language] || report.translations.en || { crop: report.crop, disease: report.disease };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'severe': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1"><AlertTriangle size={14} /> Severe</span>;
      case 'moderate': return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1"><Info size={14} /> Moderate</span>;
      case 'mild': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1"><CheckCircle size={14} /> Mild</span>;
      default: return null;
    }
  };

  const handleAskAI = () => {
    setChatMessages(prev => [...prev, {
      id: `rep_ctx_${Date.now()}`,
      role: 'user',
      content: `I'm viewing the detailed report for ${trans.crop} ${trans.disease}. Can you explain more about the treatment?`,
      timestamp: new Date()
    }]);
    setIsChatMode(true);
    navigate('/');
  };

  return (
    <div className="flex flex-col flex-1 pb-32 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-primary px-4 pt-6 pb-12 text-white relative rounded-b-[40px]">
        <button onClick={() => navigate(-1)} className="p-2 bg-black/20 rounded-full backdrop-blur-md absolute top-4 left-4">
          <ArrowLeft size={20} />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="p-2 bg-black/20 rounded-full backdrop-blur-md">
            <Share2 size={18} />
          </button>
          <button className="p-2 bg-black/20 rounded-full backdrop-blur-md">
            <Download size={18} />
          </button>
        </div>
        
        <div className="mt-12">
          <div className="flex justify-between items-end mb-2">
            <p className="text-primary-foreground/80 font-bold tracking-widest uppercase text-xs">{trans.crop}</p>
            {getSeverityBadge(report.severity)}
          </div>
          <h1 className="text-3xl font-black leading-tight mb-2">{trans.disease}</h1>
          <p className="text-sm font-medium opacity-80">{report.disease} (English)</p>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-10 space-y-4">
        
        {/* Symptoms Section */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-border">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Info size={20} className="text-blue-500" /> What is this?
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed mb-4">
            Detected with 94.2% confidence. Causes include {report.causes.join(' and ')}.
          </p>
          <h4 className="text-sm font-bold mb-2">Symptoms</h4>
          <ul className="space-y-2">
            {report.symptoms.map((s: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Immediate Action Plan */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-5 shadow-sm border border-red-100">
          <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center gap-2">
            <Zap size={20} /> Immediate Action Plan
          </h3>
          <ul className="space-y-3">
            {report.treatment.map((t: string, i: number) => (
              <li key={i} className="flex items-start gap-3 bg-white/50 p-3 rounded-xl border border-red-100/50">
                <div className="w-6 h-6 rounded-full bg-red-200 text-red-700 flex items-center justify-center shrink-0 font-black text-xs">
                  {i + 1}
                </div>
                <span className="text-sm text-red-900 font-medium">{t}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-red-200 flex justify-between items-center text-sm font-bold text-red-900">
            <span>Estimated Treatment Cost:</span>
            <span>{report.costEstimate}</span>
          </div>
        </div>

        {/* Prevention Tips */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-5 shadow-sm border border-green-200">
          <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center gap-2">
            <ShieldCheck size={20} /> Prevention Next Season
          </h3>
          <ul className="space-y-2">
            {report.prevention.map((p: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-green-900">
                <CheckCircle size={16} className="shrink-0 mt-0.5 text-green-600" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Floating Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent z-40 max-w-[1600px] mx-auto lg:pl-64 flex flex-col gap-2">
        <button 
          onClick={handleAskAI}
          className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <MessageSquare size={18} /> Ask AI for More Help
        </button>
        <button 
          onClick={() => navigate('/services')}
          className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-primary/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <Wrench size={18} /> Book Expert Visit
        </button>
      </div>
    </div>
  );
}
