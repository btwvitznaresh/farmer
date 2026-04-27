import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock3, ChevronRight, Inbox, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { bookingService, type Booking } from '@/services/bookingService';
import { toast } from 'sonner';

function statusBadge(status: Booking['status']) {
  switch (status) {
    case 'in-progress': return { cls: 'bg-green-100 text-green-700 border-green-200', label: '🚗 In Progress' };
    case 'confirmed':   return { cls: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: '✅ Confirmed' };
    case 'completed':   return { cls: 'bg-blue-100 text-blue-700 border-blue-200', label: '📋 Completed' };
    default:            return { cls: 'bg-zinc-100 text-zinc-600 border-zinc-200', label: '⏳ Pending' };
  }
}

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    bookingService.listBookings()
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { reload(); }, []);

  const shown = useMemo(
    () => bookings.filter(b =>
      tab === 'upcoming' ? b.status !== 'completed' : b.status === 'completed'
    ),
    [bookings, tab]
  );

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this booking?')) return;
    await bookingService.cancelBooking(id);
    toast.success('Booking cancelled');
    reload();
  };

  return (
    <div className="min-h-screen px-4 pb-32 pt-4 animate-in fade-in duration-300">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[14px] text-primary font-semibold mb-4">
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="text-2xl font-black mb-1">My Bookings</h1>
      <p className="text-[14px] text-muted-foreground mb-4">{bookings.length} total bookings</p>

      {/* Tab toggle */}
      <div className="p-1 rounded-full bg-muted/40 border border-border flex mb-5">
        {(['upcoming', 'past'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 h-10 rounded-full text-[13px] font-bold transition-all duration-200',
              tab === t ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground'
            )}
          >
            {t === 'upcoming' ? `Upcoming (${bookings.filter(b => b.status !== 'completed').length})` : `Past (${bookings.filter(b => b.status === 'completed').length})`}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : shown.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center mb-4">
            <Inbox size={32} className="text-muted-foreground/40" />
          </div>
          <p className="text-[15px] font-bold text-muted-foreground mb-1">
            {tab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
          </p>
          <p className="text-[13px] text-muted-foreground/60 mb-4">
            {tab === 'upcoming' ? 'Book a service to get started!' : 'Completed bookings will appear here'}
          </p>
          {tab === 'upcoming' && (
            <button
              onClick={() => navigate('/services')}
              className="h-10 px-6 rounded-xl bg-primary text-white text-[13px] font-bold"
            >
              Browse Services
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map(b => {
            const badge = statusBadge(b.status);
            return (
              <div key={b.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{b.serviceEmoji}</span>
                    <div>
                      <p className="text-[14px] font-black leading-tight">{b.serviceName}</p>
                      <p className="text-[11px] font-mono text-muted-foreground">{b.id}</p>
                    </div>
                  </div>
                  <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold border', badge.cls)}>
                    {badge.label}
                  </span>
                </div>

                {/* Details row */}
                <div className="flex items-center gap-4 text-[12px] text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {b.scheduleDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock3 size={12} /> {b.timeSlot}
                  </span>
                  {b.urgency === 'urgent' && (
                    <span className="text-red-500 font-bold">⚡ Urgent</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/services/confirmed/${b.id}`)}
                    className="flex-1 h-9 rounded-xl border border-border bg-card text-[13px] font-semibold flex items-center justify-center gap-1"
                  >
                    Details <ChevronRight size={13} />
                  </button>
                  {b.status === 'completed' && (
                    <button
                      onClick={() => navigate(`/services/report/${b.id}`)}
                      className="flex-1 h-9 rounded-xl bg-primary text-white text-[13px] font-bold"
                    >
                      View Report
                    </button>
                  )}
                  {b.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(b.id)}
                      className="h-9 w-9 rounded-xl border border-red-200 bg-red-50 flex items-center justify-center"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
