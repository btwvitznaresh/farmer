import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Calendar, ChevronRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import diseaseData from '@/data/disease_advice.json';

export default function ScanHistoryPage() {
  const navigate = useNavigate();
  const { language } = useApp();

  // Mock scan history
  const history = [
    { id: '1', date: new Date().toISOString(), result: diseaseData.diseases[0], confidence: 94.2 },
    { id: '2', date: new Date(Date.now() - 86400000 * 2).toISOString(), result: diseaseData.diseases[1], confidence: 88.5 },
  ];

  return (
    <div className="flex flex-col flex-1 pb-24 bg-slate-50 min-h-screen">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="flex items-center px-4 py-4 gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black flex-1">Scan History</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search past scans..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
          />
        </div>

        {/* List */}
        <div className="space-y-3">
          {history.map((scan) => {
            const trans = scan.result.translations[language] || scan.result.translations.en || { crop: scan.result.crop, disease: scan.result.disease };
            
            return (
              <div 
                key={scan.id} 
                onClick={() => navigate(`/disease-report/${scan.result.id}`)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-border flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                  <img src="/placeholder_leaf.jpg" alt="Scan" className="w-full h-full object-cover opacity-50 mix-blend-multiply" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{trans.crop}</p>
                    <span className="text-xs font-bold text-primary">{scan.confidence}% Match</span>
                  </div>
                  <h3 className="text-sm font-black text-foreground truncate mb-2">{trans.disease}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <Calendar size={12} />
                    {new Date(scan.date).toLocaleDateString()}
                  </div>
                </div>
                <ChevronRight size={20} className="text-muted-foreground shrink-0" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
