import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, UserCircle2, IndianRupee, Clock3, ChevronRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { SERVICES, SERVICE_CATEGORIES } from '@/data/services';
import type { ServiceCategory } from '@/types/services';
import { bookingService, type Booking } from '@/services/bookingService';
import { getTranslation } from '@/lib/translations';

// ── Status dot helper ───────────────────────────────────────────────────────
function statusStyle(status: Booking['status']) {
  switch (status) {
    case 'in-progress': return { dot: 'bg-green-500 animate-pulse', text: 'Team on the way', badge: 'bg-green-50 text-green-700 border-green-200' };
    case 'confirmed':   return { dot: 'bg-yellow-400',              text: 'Confirmed',       badge: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
    case 'completed':   return { dot: 'bg-blue-500',                text: 'Report ready',    badge: 'bg-blue-50 text-blue-700 border-blue-200' };
    default:            return { dot: 'bg-zinc-400',                text: 'Pending',         badge: 'bg-zinc-50 text-zinc-600 border-zinc-200' };
  }
}

export default function ServicesPage() {
  const navigate = useNavigate();
  const { language } = useApp();
  const t = getTranslation('services', language) as any;

  const [category, setCategory] = useState<ServiceCategory>('all');
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    bookingService.listBookings().then(setBookings).catch(console.error);
  }, []);

  // Show the most relevant active booking in the strip
  const activeBooking = useMemo(() => {
    const active = bookings.find(b => b.status !== 'completed');
    return active ?? null;
  }, [bookings]);

  const visibleServices = useMemo(
    () => SERVICES.filter(s => category === 'all' || s.category === category),
    [category]
  );

  const village = localStorage.getItem('agro_farm_location') || 'Village not set';

  // Check for pre-fill from scan
  const prefillDisease = sessionStorage.getItem('service_prefill_disease');
  const prefillSeverity = sessionStorage.getItem('service_prefill_severity');
  const showScanBanner = !!prefillDisease && (prefillSeverity === 'Moderate' || prefillSeverity === 'Severe');

  return (
    <div className="min-h-screen px-4 pb-32 pt-4 animate-in fade-in duration-400">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">{t.ourServices ?? 'Our Services'}</h1>
          <p className="text-[14px] text-muted-foreground">{t.weCome ?? 'We come to your farm'}</p>
          <p className="text-[14px] font-semibold text-foreground flex items-center gap-1 mt-1">
            <MapPin size={13} className="text-primary shrink-0" />
            {village}
          </p>
        </div>
        <button
          onClick={() => navigate('/services/bookings')}
          className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center shadow-sm"
          aria-label="My bookings"
        >
          <UserCircle2 size={20} className="text-primary" />
        </button>
      </div>

      {/* ── Scan → Booking Banner ── */}
      {showScanBanner && (
        <div
          className="mb-4 rounded-2xl border border-orange-200 bg-orange-50 p-3 flex items-center justify-between cursor-pointer"
          onClick={() => {
            navigate('/services/service/pest-disease-scan');
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🔍</span>
            <div>
              <p className="text-[13px] font-bold text-orange-800">
                AI detected {prefillDisease} ({prefillSeverity})
              </p>
              <p className="text-[12px] text-orange-600">Our team can inspect this in person</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-orange-500 shrink-0" />
        </div>
      )}

      {/* ── Active Booking Strip ── */}
      {activeBooking && (
        <button
          onClick={() => navigate(`/services/confirmed/${activeBooking.id}`)}
          className="w-full mb-4 rounded-2xl border border-border bg-card px-4 py-3 flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{activeBooking.serviceEmoji}</span>
            <div className="text-left">
              <p className="text-[14px] font-bold leading-tight">{activeBooking.serviceName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={cn('w-2 h-2 rounded-full', statusStyle(activeBooking.status).dot)} />
                <p className="text-[12px] text-muted-foreground">{statusStyle(activeBooking.status).text}</p>
                <span className="text-[12px] text-muted-foreground">· {activeBooking.scheduleDate}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[13px] text-primary font-semibold">{t.view ?? 'View'}</span>
            <ChevronRight size={14} className="text-primary" />
          </div>
        </button>
      )}

      {/* ── Category Pills ── */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
        {SERVICE_CATEGORIES.map(c => {
          const label = language === 'hi' ? c.labelHi :
                        language === 'ta' ? c.labelTa :
                        language === 'te' ? c.labelTe :
                        language === 'mr' ? c.labelMr : c.label;
          return (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap border transition-all duration-200',
                category === c.id
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-card text-foreground border-border hover:border-primary/40'
              )}
            >
              {label ?? c.label}
            </button>
          );
        })}
      </div>

      {/* ── Service Grid ── */}
      <div className="grid grid-cols-2 gap-3">
        {visibleServices.map(service => (
          <div
            key={service.id}
            className="rounded-2xl border border-border bg-card p-3.5 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            {/* Icon */}
            <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-2xl', service.iconBgClass)}>
              {service.iconEmoji}
            </div>

            {/* Name + desc */}
            <div className="flex-1">
              <h3 className="text-[13px] font-black leading-tight text-foreground">{service.name}</h3>
              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{service.shortDescription}</p>
            </div>

            {/* Price + Duration */}
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold flex items-center gap-0.5">
                <IndianRupee size={10} strokeWidth={2.5} />
                {service.priceMin}–{service.priceMax}
              </span>
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock3 size={10} />
                {service.duration}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold">
              {'★'.repeat(Math.round(service.rating))}
              <span className="text-muted-foreground font-normal">{service.rating}</span>
            </div>

            {/* CTA */}
            <button
              onClick={() => navigate(`/services/service/${service.id}`)}
              className="mt-1 h-9 rounded-xl bg-primary text-white text-[12px] font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
            >
              <Zap size={12} />
              {t.bookNow ?? 'Book Now'}
            </button>
          </div>
        ))}
      </div>

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
}
