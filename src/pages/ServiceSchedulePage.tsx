import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Zap, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SERVICES } from '@/data/services';
import type { TimeSlot, Urgency } from '@/types/services';
import { bookingService } from '@/services/bookingService';
import { useApp } from '@/contexts/AppContext';

// ── Step bar ────────────────────────────────────────────────────────────────
function StepBar({ step }: { step: 1 | 2 | 3 }) {
  const steps = ['Details', 'Schedule', 'Confirm'];
  return (
    <div className="flex items-center gap-0 mb-6">
      {steps.map((label, i) => {
        const s = i + 1;
        const done = step > s;
        const active = step === s;
        return (
          <div key={label} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-300 ${done ? 'bg-primary text-white' : active ? 'bg-primary text-white shadow-[0_0_12px_rgba(46,125,50,0.4)]' : 'bg-muted/60 text-muted-foreground'}`}>
                {done ? '✓' : s}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap ${active ? 'text-primary' : 'text-muted-foreground/60'}`}>{label}</span>
            </div>
            {i < 2 && <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full transition-colors duration-300 ${done ? 'bg-primary' : 'bg-border'}`} />}
          </div>
        );
      })}
    </div>
  );
}

// ── Time slots ───────────────────────────────────────────────────────────────
const TIME_SLOTS: { id: TimeSlot; emoji: string; label: string; hours: string }[] = [
  { id: 'morning',   emoji: '🌅', label: 'Morning',   hours: '6am – 12pm' },
  { id: 'afternoon', emoji: '☀️', label: 'Afternoon', hours: '12pm – 4pm' },
  { id: 'evening',   emoji: '🌆', label: 'Evening',   hours: '4pm – 7pm' },
];

// ── Next 7 days ──────────────────────────────────────────────────────────────
function getNext7Days() {
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

function fmtDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function fmtDayLabel(d: Date, i: number): string {
  if (i === 0) return 'Today';
  if (i === 1) return 'Tomorrow';
  return d.toLocaleDateString('en-IN', { weekday: 'short' });
}

function fmtDayNum(d: Date): string {
  return d.getDate().toString();
}

function fmtMonth(d: Date): string {
  return d.toLocaleDateString('en-IN', { month: 'short' });
}

export default function ServiceSchedulePage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { language } = useApp();

  const service = useMemo(() => SERVICES.find(s => s.id === serviceId), [serviceId]);

  const days = useMemo(getNext7Days, []);
  const [date, setDate]           = useState<Date>(days[0]);
  const [slot, setSlot]           = useState<TimeSlot>('morning');
  const [urgency, setUrgency]     = useState<Urgency>('normal');
  const [location, setLocation]   = useState(localStorage.getItem('agro_farm_location') || '');
  const [name, setName]           = useState(localStorage.getItem('agro_farmer_name') || '');
  const [notes, setNotes]         = useState(() => {
    // Pre-fill notes from scan
    const disease  = sessionStorage.getItem('service_prefill_disease');
    const severity = sessionStorage.getItem('service_prefill_severity');
    if (disease && severity) return `AI detected ${disease} with ${severity} severity on the crop.`;
    return '';
  });
  const [loading, setLoading]     = useState(false);

  if (!service) return (
    <div className="p-6 text-center">
      <p className="text-muted-foreground">Service not found.</p>
      <button onClick={() => navigate('/services')} className="mt-4 text-primary font-semibold">← Back</button>
    </div>
  );

  const urgencySurcharge = urgency === 'urgent' ? 200 : 0;
  const totalMin = service.priceMin + urgencySurcharge;
  const totalMax = service.priceMax + urgencySurcharge;

  // Get prefill values from scan if available
  const prefillDisease  = sessionStorage.getItem('service_prefill_disease') || undefined;
  const prefillSeverity = sessionStorage.getItem('service_prefill_severity') || undefined;

  const confirm = async () => {
    if (!location.trim()) {
      alert('Please enter your farm location.');
      return;
    }
    setLoading(true);
    try {
      const booking = await bookingService.createBooking(service, {
        farmerName:           name || 'Farmer',
        farmLocation:         location,
        village:              location,
        specialInstructions:  notes,
        scheduleDate:         fmtDate(date),
        timeSlot:             slot,
        urgency,
        language:             localStorage.getItem('agro_language') || language || 'en',
        attachedScanDisease:  prefillDisease,
        attachedScanSeverity: prefillSeverity,
      });
      // Clear scan prefill
      sessionStorage.removeItem('service_prefill_disease');
      sessionStorage.removeItem('service_prefill_severity');
      navigate(`/services/confirmed/${booking.id}`);
    } catch (err) {
      console.error('Booking failed:', err);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 pb-32 pt-4 animate-in fade-in duration-300">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[14px] text-primary font-semibold mb-4">
        <ArrowLeft size={16} /> Back
      </button>

      <StepBar step={2} />

      {/* Service mini-header */}
      <div className="flex items-center gap-3 mb-5 rounded-2xl border border-border bg-card px-4 py-3">
        <span className="text-2xl">{service.iconEmoji}</span>
        <div>
          <p className="text-[14px] font-black">{service.name}</p>
          <p className="text-[12px] text-primary font-semibold">₹{totalMin}–₹{totalMax}{urgency === 'urgent' ? ' (incl. urgent)' : ''}</p>
        </div>
      </div>

      {/* ── Date Picker ── */}
      <p className="text-[13px] font-black text-foreground mb-2">Select Date</p>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
        {days.map((d, i) => {
          const selected = fmtDate(d) === fmtDate(date);
          return (
            <button
              key={i}
              onClick={() => setDate(d)}
              className={cn(
                'flex flex-col items-center min-w-[58px] py-2.5 px-1 rounded-2xl border transition-all duration-200',
                selected ? 'bg-primary text-white border-primary shadow-md' : 'bg-card border-border text-foreground hover:border-primary/40'
              )}
            >
              <span className={cn('text-[10px] font-semibold', selected ? 'text-white/70' : 'text-muted-foreground')}>
                {fmtDayLabel(d, i)}
              </span>
              <span className="text-[20px] font-black leading-tight">{fmtDayNum(d)}</span>
              <span className={cn('text-[10px]', selected ? 'text-white/70' : 'text-muted-foreground')}>
                {fmtMonth(d)}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Time Slot ── */}
      <p className="text-[13px] font-black text-foreground mb-2">Select Time</p>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {TIME_SLOTS.map(s => (
          <button
            key={s.id}
            onClick={() => setSlot(s.id)}
            className={cn(
              'flex flex-col items-center py-3 rounded-2xl border transition-all duration-200',
              slot === s.id ? 'bg-primary text-white border-primary shadow-sm' : 'bg-card border-border text-foreground hover:border-primary/40'
            )}
          >
            <span className="text-xl mb-1">{s.emoji}</span>
            <span className="text-[12px] font-bold">{s.label}</span>
            <span className={cn('text-[10px]', slot === s.id ? 'text-white/70' : 'text-muted-foreground')}>{s.hours}</span>
          </button>
        ))}
      </div>

      {/* ── Urgency Toggle ── */}
      <p className="text-[13px] font-black text-foreground mb-2">Priority</p>
      <div className="grid grid-cols-2 gap-2 mb-5">
        {(['normal', 'urgent'] as const).map(u => (
          <button
            key={u}
            onClick={() => setUrgency(u)}
            className={cn(
              'h-12 rounded-2xl border font-bold text-[13px] flex items-center justify-center gap-2 transition-all duration-200',
              urgency === u
                ? u === 'urgent'
                  ? 'bg-red-500 text-white border-red-500 shadow-sm'
                  : 'bg-primary text-white border-primary shadow-sm'
                : 'bg-card border-border text-foreground hover:border-primary/40'
            )}
          >
            {u === 'urgent' ? <Zap size={15} /> : null}
            {u === 'normal' ? 'Normal' : 'Urgent (+₹200)'}
          </button>
        ))}
      </div>
      {urgency === 'urgent' && (
        <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-red-50 border border-red-200">
          <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-[12px] text-red-700">Urgent visit scheduled within 24 hours. Surcharge of ₹200 applies.</p>
        </div>
      )}

      {/* ── Farm Details ── */}
      <p className="text-[13px] font-black text-foreground mb-2">Your Details</p>
      <div className="space-y-3 mb-5">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
          className="w-full h-11 px-4 rounded-xl border border-border bg-card text-[14px] focus:outline-none focus:border-primary"
        />
        <div className="relative">
          <MapPin size={15} className="absolute left-3 top-3.5 text-muted-foreground" />
          <input
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Farm location / village"
            className="w-full h-11 pl-9 pr-4 rounded-xl border border-border bg-card text-[14px] focus:outline-none focus:border-primary"
          />
        </div>
        {localStorage.getItem('agro_farm_location') && location !== localStorage.getItem('agro_farm_location') && (
          <button
            onClick={() => setLocation(localStorage.getItem('agro_farm_location') || '')}
            className="text-[12px] text-primary font-semibold"
          >
            Use saved location: {localStorage.getItem('agro_farm_location')}
          </button>
        )}
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Special instructions (optional)"
          className="w-full min-h-[80px] p-3 rounded-xl border border-border bg-card text-[14px] focus:outline-none focus:border-primary resize-none"
        />
      </div>

      {/* ── Confirm CTA ── */}
      <button
        disabled={loading}
        onClick={confirm}
        className="w-full h-12 rounded-2xl bg-primary text-white font-black text-[15px] shadow-lg shadow-primary/25 disabled:opacity-60 active:scale-95 transition-all"
      >
        {loading ? 'Confirming…' : 'Confirm Booking →'}
      </button>

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}
