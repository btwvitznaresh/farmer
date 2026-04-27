import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertTriangle, MessageCircle } from 'lucide-react';
import { bookingService, type Booking } from '@/services/bookingService';

export default function ServiceReportPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    bookingService.getBooking(bookingId).then(setBooking).catch(console.error);
  }, [bookingId]);

  if (!booking) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Generate a sample report when none exists yet
  const summary = booking.reportSummary || `The ${booking.serviceName} was completed successfully on ${booking.scheduleDate}. Our team member ${booking.assignedMember} conducted a thorough assessment of your farm.`;
  const recommendations = booking.reportRecommendations || [
    'Follow the prescribed schedule for optimal results',
    'Monitor progress over the next 7–14 days',
    'Contact support if any issues arise',
  ];

  return (
    <div className="min-h-screen px-4 pb-32 pt-4 animate-in fade-in duration-300">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[14px] text-primary font-semibold mb-4">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Title */}
      <div className="mb-5">
        <h1 className="text-2xl font-black">Service Report</h1>
        <p className="text-[14px] text-muted-foreground">{booking.serviceName} · {booking.scheduleDate}</p>
        <p className="text-[12px] font-mono text-muted-foreground mt-0.5">{booking.id}</p>
      </div>

      {/* Summary card */}
      <div className="rounded-2xl border border-border bg-card p-4 mb-4 shadow-sm">
        <h2 className="text-[14px] font-black mb-2 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-primary" />
          Summary
        </h2>
        <p className="text-[14px] text-foreground/80 leading-relaxed">{summary}</p>
      </div>

      {/* Recommendations */}
      <div className="rounded-2xl border border-border bg-card p-4 mb-4 shadow-sm">
        <h2 className="text-[14px] font-black mb-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-500" />
          Recommendations
        </h2>
        <ul className="space-y-2.5">
          {recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-[14px]">{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Scan attachment info */}
      {booking.attachedScanDisease && (
        <div className="rounded-2xl bg-orange-50 border border-orange-200 p-4 mb-4">
          <p className="text-[12px] font-bold text-orange-800 mb-1">🔍 Linked AI Scan</p>
          <p className="text-[14px] text-orange-700">
            {booking.attachedScanDisease} — {booking.attachedScanSeverity} severity
          </p>
        </div>
      )}

      {/* Ask AI */}
      <button
        onClick={() => {
          const msg = `I just received my ${booking.serviceName} report (ID: ${booking.id}). ${summary}. Based on these findings and recommendations, what specific steps should I take this week? What products should I buy?`;
          sessionStorage.setItem('arjun_prefill', msg);
          navigate('/call-agent');
        }}
        className="w-full h-12 rounded-2xl bg-primary text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-transform"
      >
        <MessageCircle size={16} />
        Ask Arjun AI About This Report
      </button>
    </div>
  );
}
