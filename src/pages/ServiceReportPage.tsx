import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Download, Share2, Info, MessageSquare } from 'lucide-react';
import { getBookingById } from '@/services/db';
import { Booking } from '@/types/services';
import { useApp } from '@/contexts/AppContext';

export default function ServiceReportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setChatMessages, setIsChatMode } = useApp();
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (id) {
      getBookingById(id).then(b => b ? setBooking(b) : null);
    }
  }, [id]);

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <p className="text-muted-foreground">Loading report...</p>
      </div>
    );
  }

  const handleAskAI = () => {
    setChatMessages(prev => [...prev, {
      id: `rep_ctx_${Date.now()}`,
      role: 'user',
      content: `I received my service report for ${booking.serviceName} (Booking ID: ${booking.id}). Can you help me understand the findings?`,
      timestamp: new Date()
    }]);
    setIsChatMode(true);
    navigate('/');
  };

  return (
    <div className="flex flex-col flex-1 pb-24 bg-slate-50 min-h-screen">
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
        
        <div className="mt-12 text-center">
          <div className="w-16 h-16 mx-auto bg-green-400 rounded-full flex items-center justify-center mb-3 shadow-lg">
            <CheckCircle2 size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-black mb-1">Service Completed</h1>
          <p className="text-primary-foreground/80 font-mono text-sm">{booking.id}</p>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-10 space-y-4">
        
        {/* Summary Card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-border">
          <h2 className="text-lg font-bold mb-4 border-b border-border pb-2">{booking.serviceName}</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Date of Visit</span>
              <span className="font-semibold">{new Date(booking.scheduledDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Expert Name</span>
              <span className="font-semibold">{booking.teamMember || 'Ramesh K.'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Location</span>
              <span className="font-semibold truncate max-w-[150px] text-right">{booking.farmLocation}</span>
            </div>
          </div>
        </div>

        {/* Findings Section */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-border">
          <h3 className="text-md font-bold mb-3 flex items-center gap-2">
            <Info size={18} className="text-blue-500" /> Key Findings
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed mb-4">
            The field inspection was conducted successfully. The soil moisture levels are slightly below optimal. Minor pest activity (aphids) detected in the northern quadrant, but no severe crop damage observed.
          </p>

          <h4 className="text-sm font-bold mb-2">Photo Evidence</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-24 bg-slate-200 rounded-xl flex items-center justify-center text-xs text-muted-foreground border border-dashed border-slate-300">
              Field_Shot_1.jpg
            </div>
            <div className="h-24 bg-slate-200 rounded-xl flex items-center justify-center text-xs text-muted-foreground border border-dashed border-slate-300">
              Leaf_Sample.jpg
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-5 shadow-sm border border-green-200">
          <h3 className="text-md font-bold text-green-800 mb-3">AI Recommendations</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-sm text-green-900">
              <div className="w-5 h-5 rounded-full bg-green-200 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">1</div>
              <span>Increase irrigation frequency by 15% for the next two weeks to restore soil moisture.</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-green-900">
              <div className="w-5 h-5 rounded-full bg-green-200 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">2</div>
              <span>Apply neem-based organic pesticide specifically in the northern quadrant to control aphids.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Floating Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent z-40 max-w-[1600px] mx-auto lg:pl-64">
        <button 
          onClick={handleAskAI}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-base shadow-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <MessageSquare size={18} /> Discuss Report with AI
        </button>
      </div>

    </div>
  );
}
