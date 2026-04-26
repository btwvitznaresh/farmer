import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Camera, CheckCircle2, AlertTriangle, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getScanHistory, clearScanHistory, type ScanHistoryItem } from '@/services/cropDiseaseService';
import { useApp } from '@/contexts/AppContext';

type FilterType = 'all' | 'healthy' | 'diseased';

function ScanCard({ item, onClick }: { item: ScanHistoryItem; onClick: () => void }) {
  const date = new Date(item.timestamp);
  const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  const severityColor = {
    None: '#10b981', Mild: '#f59e0b', Moderate: '#f97316', Severe: '#ef4444'
  }[item.severity] ?? '#6b7280';

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all active:scale-[0.98]"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
        style={{ background: 'rgba(118,185,0,0.1)' }}>
        {item.imageDataUrl
          ? <img src={item.imageDataUrl} alt="scan" className="w-full h-full object-cover" />
          : <Camera size={22} style={{ color: '#76b900' }} />
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm truncate">{item.cropName}</p>
        <p className="text-white/50 text-xs truncate mt-0.5">
          {item.isHealthy ? '✅ Healthy' : item.diseaseName}
        </p>
        <p className="text-white/25 text-[10px] mt-1">{dateStr}</p>
      </div>

      {/* Severity dot + confidence */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="w-2 h-2 rounded-full" style={{ background: severityColor }} />
        <p className="text-[10px] font-bold" style={{ color: severityColor }}>
          {Math.round(item.confidence * 100)}%
        </p>
      </div>
    </button>
  );
}

export default function ScanHistoryPage() {
  const navigate = useNavigate();
  const { language } = useApp();
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    setHistory(getScanHistory());
  }, []);

  const filtered = history.filter(item => {
    if (filter === 'healthy') return item.isHealthy;
    if (filter === 'diseased') return !item.isHealthy;
    return true;
  });

  const diseasedCount = history.filter(h => !h.isHealthy).length;
  const thisMonth = history.filter(h => new Date(h.timestamp).getMonth() === new Date().getMonth()).length;

  const handleClear = () => {
    if (confirm('Clear all scan history?')) {
      clearScanHistory();
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-6"
        style={{ background: 'linear-gradient(to bottom, rgba(10,20,5,0.95), transparent)' }}>
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.08)' }}>
          <ArrowLeft size={18} className="text-white/70" />
        </button>
        <h1 className="font-black text-lg">Scan History</h1>
        <button onClick={handleClear} className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.1)' }}>
          <Trash2 size={16} className="text-red-400" />
        </button>
      </div>

      <div className="px-5 space-y-5 pb-24">
        {/* Stats card */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'This Month', value: thisMonth, color: '#76b900' },
            { label: 'Diseased', value: diseasedCount, color: '#f97316' },
            { label: 'Total Scans', value: history.length, color: '#818cf8' },
          ].map(stat => (
            <div key={stat.label} className="flex flex-col items-center py-4 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-[10px] text-white/40 font-semibold mt-1 text-center">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {(['all', 'diseased', 'healthy'] as FilterType[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all', filter === f ? 'text-black' : 'text-white/40')}
              style={{ background: filter === f ? '#76b900' : 'rgba(255,255,255,0.06)' }}>
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-white/30">
            <Camera size={40} strokeWidth={1} />
            <p className="font-semibold">No scans yet</p>
            <button onClick={() => navigate('/analyze')}
              className="mt-2 px-5 py-2 rounded-xl text-sm font-bold"
              style={{ background: 'rgba(118,185,0,0.15)', color: '#76b900', border: '1px solid rgba(118,185,0,0.3)' }}>
              Start Scanning
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(item => (
              <ScanCard
                key={item.id}
                item={item}
                onClick={() => {
                  // Re-open detail: store item and navigate to analyze
                  sessionStorage.setItem('scan_history_item', JSON.stringify(item));
                  navigate('/analyze');
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
