import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, MapPinned, MessageCircle, ArrowLeft, Copy, Phone, Calendar, Clock3, User, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { bookingService, type Booking } from '@/services/bookingService';
import { toast } from 'sonner';

// ── Step bar ────────────────────────────────────────────────────────────────
function StepBar() {
  const steps = ['Details', 'Schedule', 'Confirm'];
  return (
    <div className="flex items-center gap-0 mb-6">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center flex-1">
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black bg-primary text-white">
              ✓
            </div>
            <span className="text-[10px] font-semibold whitespace-nowrap text-primary">{label}</span>
          </div>
          {i < 2 && <div className="flex-1 h-0.5 mx-1 mb-4 rounded-full bg-primary" />}
        </div>
      ))}
    </div>
  );
}

// ── Status banner ────────────────────────────────────────────────────────────
function StatusBanner({ status }: { status: Booking['status'] }) {
  const cfg = {
    pending:       { bg: 'bg-amber-50 border-amber-200', icon: '⏳', title: 'Booking Submitted', subtitle: 'Awaiting team confirmation' },
    confirmed:     { bg: 'bg-green-50 border-green-200', icon: '✅', title: 'Booking Confirmed', subtitle: 'Team member has been assigned' },
    'in-progress': { bg: 'bg-blue-50 border-blue-200',   icon: '🚗', title: 'Team On The Way',   subtitle: 'Your visit is in progress' },
    completed:     { bg: 'bg-purple-50 border-purple-200', icon: '📋', title: 'Service Complete',  subtitle: 'Your report is ready to view' },
  }[status];

  return (
    <div className={cn('rounded-2xl border p-5 text-center mb-4', cfg.bg)}>
      <div className="text-5xl mb-3 animate-in zoom-in duration-500">{cfg.icon}</div>
      <h1 className="text-2xl font-black">{cfg.title}</h1>
      <p className="text-[14px] text-muted-foreground mt-1">{cfg.subtitle}</p>
    </div>
  );
}

export default function ServiceConfirmedPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    bookingService.getBooking(bookingId).then(setBooking).catch(console.error);
  }, [bookingId]);

  if (!booking) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">Loading booking…</p>
      </div>
    </div>
  );

  const copyId = () => {
    navigator.clipboard.writeText(booking.id);
    toast.success('Booking ID copied!');
  };

  const totalMin = booking.priceMin + booking.urgencySurcharge;
  const totalMax = booking.priceMax + booking.urgencySurcharge;

  return (
    <div className="min-h-screen px-4 pb-32 pt-4 animate-in fade-in duration-300">
      <button onClick={() => navigate('/services')} className="flex items-center gap-1.5 text-[14px] text-primary font-semibold mb-4">
        <ArrowLeft size={16} /> Services
      </button>

      <StepBar />
      <StatusBanner status={booking.status} />

      {/* Booking ID */}
      <div className="rounded-2xl border border-border bg-card px-4 py-3 mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">Booking ID</p>
          <p className="text-[15px] font-black font-mono">{booking.id}</p>
        </div>
        <button onClick={copyId} className="w-9 h-9 rounded-full bg-muted/40 flex items-center justify-center">
          <Copy size={15} className="text-muted-foreground" />
        </button>
      </div>

      {/* Details card */}
      <div className="rounded-2xl border border-border bg-card p-4 mb-4 space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{booking.serviceEmoji}</span>
          <div>
            <p className="text-[15px] font-black">{booking.serviceName}</p>
            {booking.urgency === 'urgent' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold mt-0.5">⚡ Urgent</span>
            )}
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <User size={14} className="text-primary shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Assigned</p>
              <p className="text-[13px] font-bold">{booking.assignedMember}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-primary shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Date</p>
              <p className="text-[13px] font-bold">{booking.scheduleDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock3 size={14} className="text-primary shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Time</p>
              <p className="text-[13px] font-bold capitalize">{booking.timeSlot}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <IndianRupee size={14} className="text-primary shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Est. Price</p>
              <p className="text-[13px] font-bold">₹{totalMin}–₹{totalMax}</p>
            </div>
          </div>
        </div>

        {booking.attachedScanDisease && (
          <>
            <div className="h-px bg-border" />
            <div className="flex items-center gap-2 p-2 rounded-xl bg-orange-50 border border-orange-200">
              <span className="text-lg">🔍</span>
              <div>
                <p className="text-[11px] text-orange-700 font-bold">AI Scan Attached</p>
                <p className="text-[12px] text-orange-600">{booking.attachedScanDisease} ({booking.attachedScanSeverity})</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="space-y-3">
        <button
          onClick={() => {
            const msg = `I booked ${booking.serviceName} (ID: ${booking.id}) scheduled for ${booking.scheduleDate}. How should I prepare before the team arrives? What should I expect?`;
            sessionStorage.setItem('arjun_prefill', msg);
            navigate('/call-agent');
          }}
          className="w-full h-12 rounded-2xl bg-primary text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-transform"
        >
          <MessageCircle size={16} />
          Ask Arjun AI — What to Prepare
        </button>

        {booking.status === 'completed' && (
          <button
            onClick={() => navigate(`/services/report/${booking.id}`)}
            className="w-full h-12 rounded-2xl border border-border bg-card font-bold text-[14px] flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            📋 View Service Report
          </button>
        )}

        <button
          className="w-full h-12 rounded-2xl border border-border bg-card font-bold text-[14px] flex items-center justify-center gap-2 text-muted-foreground active:scale-95 transition-transform"
          onClick={() => toast.info('Map tracking coming soon!')}
        >
          <MapPinned size={16} />
          Track on Map
        </button>
      </div>
    </div>
  );
}
