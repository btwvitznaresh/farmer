import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Star, Clock3, IndianRupee, User } from 'lucide-react';
import { SERVICES } from '@/data/services';

// ── Step progress bar ───────────────────────────────────────────────────────
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
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-300 ${
                  done ? 'bg-primary text-white' :
                  active ? 'bg-primary text-white shadow-[0_0_12px_rgba(46,125,50,0.4)]' :
                  'bg-muted/60 text-muted-foreground'
                }`}
              >
                {done ? '✓' : s}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap ${active ? 'text-primary' : 'text-muted-foreground/60'}`}>
                {label}
              </span>
            </div>
            {i < 2 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full transition-colors duration-300 ${done ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ServiceDetailsPage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const service = useMemo(() => SERVICES.find(s => s.id === serviceId), [serviceId]);

  if (!service) return (
    <div className="p-6 text-center">
      <p className="text-muted-foreground">Service not found.</p>
      <button onClick={() => navigate('/services')} className="mt-4 text-primary font-semibold">← Back to Services</button>
    </div>
  );

  return (
    <div className="min-h-screen px-4 pb-32 pt-4 animate-in fade-in duration-300">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[14px] text-primary font-semibold mb-4">
        <ArrowLeft size={16} /> Back
      </button>

      <StepBar step={1} />

      {/* Hero card */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${service.iconBgClass}`}>
            {service.iconEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black leading-tight">{service.name}</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">{service.shortDescription}</p>
          </div>
        </div>
        <p className="text-[14px] text-foreground/80 leading-relaxed">{service.description}</p>
      </div>

      {/* What's included */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm mb-4">
        <h2 className="text-[15px] font-black mb-3">✅ What's Included</h2>
        <ul className="space-y-2.5">
          {service.includes.map(item => (
            <li key={item} className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
              <span className="text-[14px]">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Visiting team */}
      <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm mb-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <User size={18} className="text-primary" />
        </div>
        <div>
          <p className="text-[12px] text-muted-foreground">Visiting Team Member</p>
          <p className="text-[14px] font-bold">{service.teamMember.name}</p>
          <p className="text-[12px] text-primary">{service.teamMember.role}</p>
        </div>
        <div className="ml-auto text-right">
          <div className="flex items-center gap-0.5 justify-end">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={12} className={i <= Math.round(service.rating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'} />
            ))}
          </div>
          <p className="text-[12px] text-muted-foreground">{service.rating} / 5</p>
        </div>
      </div>

      {/* Reviews */}
      {service.reviews.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm mb-4">
          <h2 className="text-[14px] font-black mb-3">Farmer Reviews</h2>
          <div className="space-y-3">
            {service.reviews.map(r => (
              <div key={r.author} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-black text-primary shrink-0">
                  {r.author[0]}
                </div>
                <div>
                  <p className="text-[12px] font-bold">{r.author}</p>
                  <p className="text-[13px] text-muted-foreground leading-snug">{r.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price summary */}
      <div className="rounded-2xl bg-primary/8 border border-primary/20 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] text-muted-foreground mb-1">Price Range</p>
            <p className="text-[22px] font-black flex items-center gap-0.5">
              <IndianRupee size={18} strokeWidth={2.5} />
              {service.priceMin} – ₹{service.priceMax}
            </p>
            <p className="text-[12px] text-muted-foreground mt-0.5">+ ₹200 for urgent visits</p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-muted-foreground mb-1">Duration</p>
            <p className="text-[15px] font-bold flex items-center gap-1 justify-end">
              <Clock3 size={14} className="text-primary" />
              {service.duration}
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate(`/services/book/${service.id}`)}
        className="w-full h-12 rounded-2xl bg-primary text-white font-black text-[15px] shadow-lg shadow-primary/25 active:scale-95 transition-transform"
      >
        Book This Service →
      </button>
    </div>
  );
}
